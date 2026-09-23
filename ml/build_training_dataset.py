"""
build_training_dataset.py
=========================
Build a multi-variable weather downscaling training dataset by merging
hourly telemetry observations from Maharashtra stations with ERA5 reanalysis.

Steps:
  1. Load telemetry CSVs for 4 variables, filter to selected stations & year 2024
  2. Keep only exact-hour timestamps (discard sub-hourly 15/30/45-min readings)
  3. Merge all 4 variables per station on exact hourly timestamps
     - Inner join on temp × humidity × wind_speed × wind_direction
  4. Fetch ERA5 hourly data via CDS API for each station's grid point (2024)
  5. Derive ERA5 relative humidity, wind speed, wind direction
  6. Inner-join telemetry backbone with ERA5 on (station, hourly timestamp)
  7. Write data/processed/training_dataset.csv

Usage:
    python ml/build_training_dataset.py

Requires:
    pip install cdsapi xarray netcdf4 pandas numpy
"""

from __future__ import annotations

import sys
import math
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO = Path(__file__).resolve().parent.parent
DATA_RAW = REPO / "data" / "raw"
DATA_PROCESSED = REPO / "data" / "processed"
ERA5_CACHE = REPO / "data" / "cache" / "era5_2024"

OUT_CSV = DATA_PROCESSED / "training_dataset.csv"

TARGET_YEAR = 2024
TIME_FMT = "%d-%m-%Y %H:%M"  # DD-MM-YYYY HH:MM

# ---------------------------------------------------------------------------
# Station definitions (selected from coverage analysis)
# ---------------------------------------------------------------------------

STATIONS = [
    {"id": "BHATSANAGAR_1", "name": "Bhatsanagar_1", "lat": 19.5195, "lon": 73.4093},
    {"id": "SUKSALE",       "name": "Suksale",       "lat": 19.7994, "lon": 73.1178},
    {"id": "PAUD_1",        "name": "Paud_1",        "lat": 18.5335, "lon": 73.6072},
    {"id": "SONGE_BANGE",   "name": "Songe_Bange",   "lat": 16.4200, "lon": 74.2600},
    {"id": "JALNA_2",       "name": "Jalna_2",       "lat": 19.8333, "lon": 75.8000},
    {"id": "YELDARI_DAM_1", "name": "Yeldari dam_1", "lat": 19.7153, "lon": 76.7208},
]

# ---------------------------------------------------------------------------
# File configuration per variable
# ---------------------------------------------------------------------------

VARIABLE_CONFIG = {
    "temperature": {
        "paths": [DATA_RAW / "temperature" / "temperature_telemetry.csv"],
        "value_col": "Air Temperature Telemetry Hourly (AoC)",
        "out_col": "temperature_obs",
    },
    "humidity": {
        "paths": [
            DATA_RAW / "humidity" / "relative_humidity_tel_2023.csv",
            DATA_RAW / "humidity" / "relative_humidity_tel_2024.csv",
            DATA_RAW / "humidity" / "relative_humidity_tel_2025.csv",
        ],
        "value_col": "Telemetry Hourly Relative Humidity (%)",
        "out_col": "humidity_obs",
    },
    "wind_speed": {
        "paths": [DATA_RAW / "wind speed" / "wind_speed_telemetry.csv"],
        "value_col": "Telemetry Hourly Wind Speed (Km/Hr)",
        "out_col": "wind_speed_obs",
    },
    "wind_direction": {
        "paths": [DATA_RAW / "wind direction" / "wind_direction_telemetry.csv"],
        "value_col": "Telemetry Hourly Wind Direction (Degree)",
        "out_col": "wind_direction_obs",
    },
}

# Common column names in the raw CSVs
COL_STATION = "Station"
COL_TIME = "Data Acquisition Time"
COL_LAT = "Latitude"
COL_LON = "Longitude"


# ===================================================================
# STEP 1 & 2: Load telemetry — hourly-only, exact on-the-hour
# ===================================================================

def load_telemetry_variable(
    var_name: str,
    station_names: list[str],
) -> pd.DataFrame:
    """Load one telemetry variable for selected stations, keeping only
    exact-hour timestamps (minute == 0). Returns DataFrame with columns:
      [Station, datetime, <out_col>]
    """
    cfg = VARIABLE_CONFIG[var_name]
    out_col = cfg["out_col"]
    value_col = cfg["value_col"]

    frames = []
    for p in cfg["paths"]:
        if not p.exists():
            print(f"  WARNING: {p} not found, skipping")
            continue

        print(f"  Reading {p.name} ...", end=" ", flush=True)

        # Determine which columns exist — temperature CSV has different schema
        # Read just the header to decide
        header = pd.read_csv(p, nrows=0).columns.tolist()

        usecols = [COL_STATION, COL_TIME, value_col]
        # Add lat/lon if present (for reference, but we use predefined coords)
        for c in [COL_LAT, COL_LON]:
            if c in header:
                usecols.append(c)

        df = pd.read_csv(p, usecols=usecols, dtype={COL_STATION: str, value_col: str})

        # Filter to selected stations
        df = df[df[COL_STATION].isin(station_names)].copy()
        print(f"{len(df):,} rows after station filter", flush=True)

        if df.empty:
            continue

        # Parse timestamps
        df["datetime"] = pd.to_datetime(df[COL_TIME], format=TIME_FMT, errors="coerce")

        # KEEP ONLY EXACT-HOUR timestamps (minute == 0, second == 0)
        df = df[df["datetime"].dt.minute == 0].copy()

        # Filter to target year
        df = df[df["datetime"].dt.year == TARGET_YEAR].copy()

        # Parse numeric value
        df[out_col] = pd.to_numeric(df[value_col], errors="coerce")

        # Drop rows where value is NaN
        df = df.dropna(subset=[out_col])

        # Keep only needed columns
        df = df[[COL_STATION, "datetime", out_col]].copy()

        # Drop duplicates — if multiple readings at same station+hour, keep first
        df = df.drop_duplicates(subset=[COL_STATION, "datetime"], keep="first")

        frames.append(df)
        print(f"    -> {len(df):,} hourly rows for {TARGET_YEAR}", flush=True)

    if not frames:
        return pd.DataFrame(columns=[COL_STATION, "datetime", out_col])

    result = pd.concat(frames, ignore_index=True)
    result = result.drop_duplicates(subset=[COL_STATION, "datetime"], keep="first")
    return result


# ===================================================================
# STEP 3: Merge telemetry variables per station
# ===================================================================

def build_telemetry_backbone(station_names: list[str]) -> pd.DataFrame:
    """Load all 4 variables, merge into a single DataFrame per station.

    Strategy:
    - Inner join temperature x humidity x wind_speed x wind_direction
      (only keep hours present in ALL four)
    """
    print("\n" + "=" * 70)
    print("LOADING TELEMETRY")
    print("=" * 70)

    dfs = {}
    for var_name in VARIABLE_CONFIG:
        print(f"\n--- {var_name} ---")
        dfs[var_name] = load_telemetry_variable(var_name, station_names)
        print(f"  Total: {len(dfs[var_name]):,} rows")

    # Inner join the 4 continuous variables
    print("\n--- Merging variables (inner join) ---")
    continuous = ["temperature", "humidity", "wind_speed", "wind_direction"]
    backbone = dfs[continuous[0]]
    for var in continuous[1:]:
        backbone = backbone.merge(
            dfs[var],
            on=[COL_STATION, "datetime"],
            how="inner",
        )
        print(f"  After joining {var}: {len(backbone):,} rows")

    backbone = backbone.sort_values([COL_STATION, "datetime"]).reset_index(drop=True)
    return backbone


# ===================================================================
# STEP 4: Fetch ERA5 via CDS API
# ===================================================================

# Target NetCDF inside ZIPs returned by the CDS API.  The instant file
# contains temperature, dewpoint, and wind components.
_ZIP_INSTANT_NC = "data_stream-oper_stepType-instant.nc"


def _resolve_cds_download(download_path: Path, target_nc: Path) -> None:
    """Resolve a CDS download that may be a ZIP archive or a raw NetCDF.

    If *download_path* is a ZIP, extract the instant-type NetCDF
    (``data_stream-oper_stepType-instant.nc``) and save it as
    *target_nc*.  If it is already a plain NetCDF, simply rename it.
    The temporary *download_path* is removed afterwards.
    """
    import zipfile

    if zipfile.is_zipfile(download_path):
        with zipfile.ZipFile(download_path, "r") as zf:
            names = zf.namelist()
            if _ZIP_INSTANT_NC not in names:
                raise ValueError(
                    f"ZIP does not contain '{_ZIP_INSTANT_NC}'. "
                    f"Contents: {names}"
                )
            # Extract the instant NetCDF directly to the target path
            with zf.open(_ZIP_INSTANT_NC) as src, open(target_nc, "wb") as dst:
                dst.write(src.read())
        download_path.unlink()
    else:
        # Plain NetCDF — just rename
        download_path.rename(target_nc)


def fetch_era5_cds(
    lat: float, lon: float, station_id: str, year: int = 2024
) -> Optional[Path]:
    """Download ERA5 hourly single-level data for the grid cell nearest to
    (lat, lon) for the given year. Downloads month-by-month to stay within
    CDS API cost limits, then merges into a single NetCDF.

    Variables requested:
      - 2m_temperature
      - 2m_dewpoint_temperature
      - 10m_u_component_of_wind
      - 10m_v_component_of_wind
    """
    import cdsapi
    import xarray as xr

    ERA5_CACHE.mkdir(parents=True, exist_ok=True)
    out_file = ERA5_CACHE / f"era5_{station_id}_{year}.nc"

    if out_file.exists():
        print(f"  ERA5 cache hit: {out_file.name}")
        return out_file

    print(f"  Downloading ERA5 for ({lat:.4f}, {lon:.4f}) year {year} ...")

    # ERA5 grid is 0.25 deg. Request a small area around the station.
    era5_lat = round(lat * 4) / 4
    era5_lon = round(lon * 4) / 4

    # Request area: [N, W, S, E] with a small buffer
    buf = 0.25
    area = [era5_lat + buf, era5_lon - buf, era5_lat - buf, era5_lon + buf]

    client = cdsapi.Client()
    days = [f"{d:02d}" for d in range(1, 32)]
    hours = [f"{h:02d}:00" for h in range(24)]

    variables = [
        "2m_temperature",
        "2m_dewpoint_temperature",
        "10m_u_component_of_wind",
        "10m_v_component_of_wind",
    ]

    # Download month-by-month to stay within CDS cost limits
    monthly_files = []
    for month in range(1, 13):
        month_file = ERA5_CACHE / f"era5_{station_id}_{year}_{month:02d}.nc"
        monthly_files.append(month_file)

        if month_file.exists():
            # Guard: the file might be a ZIP left over from a prior run.
            import zipfile
            if zipfile.is_zipfile(month_file):
                print(f"    Month {month:02d}: cached file is ZIP, resolving ...", end=" ", flush=True)
                tmp = month_file.with_suffix(".nc.tmp")
                month_file.rename(tmp)
                _resolve_cds_download(tmp, month_file)
                print("OK", flush=True)
            else:
                print(f"    Month {month:02d}: cache hit", flush=True)
            continue

        print(f"    Month {month:02d}: downloading ...", end=" ", flush=True)
        # CDS may return a ZIP even when .nc is requested; download to a
        # temporary path first, then resolve to a proper NetCDF.
        download_path = ERA5_CACHE / f"era5_{station_id}_{year}_{month:02d}_raw"
        try:
            client.retrieve(
                "reanalysis-era5-single-levels",
                {
                    "product_type": "reanalysis",
                    "variable": variables,
                    "year": str(year),
                    "month": f"{month:02d}",
                    "day": days,
                    "time": hours,
                    "area": area,
                    "data_format": "netcdf",
                },
                str(download_path),
            )
            # --- Handle ZIP vs raw NetCDF ---
            _resolve_cds_download(download_path, month_file)
            print(f"{month_file.stat().st_size / 1e6:.1f} MB", flush=True)
        except Exception as e:
            print(f"FAILED: {e}", flush=True)
            # Remove partial files if they exist
            for p in (download_path, month_file):
                if p.exists():
                    p.unlink()
            return None

    # Merge monthly files into a single NetCDF
    print(f"  Merging 12 monthly files ...", end=" ", flush=True)
    datasets = [xr.open_dataset(f) for f in monthly_files if f.exists()]
    if not datasets:
        print("No monthly files found!")
        return None

    merged = xr.concat(datasets, dim="valid_time")
    merged.to_netcdf(out_file)
    for ds in datasets:
        ds.close()

    # Clean up monthly files
    for f in monthly_files:
        if f.exists():
            f.unlink()

    print(f"done ({out_file.stat().st_size / 1e6:.1f} MB)", flush=True)
    return out_file


def load_era5_netcdf(nc_path: Path, lat: float, lon: float) -> pd.DataFrame:
    """Load ERA5 NetCDF, select nearest grid point, return hourly DataFrame.

    Columns: [datetime, era5_temperature, era5_dewpoint_temperature,
              era5_u10, era5_v10,
              era5_relative_humidity, era5_wind_speed, era5_wind_direction]
    """
    import xarray as xr

    ds = xr.open_dataset(nc_path)

    # Variable names may use short names in the NetCDF
    # ERA5 NetCDF from CDS uses: t2m, d2m, u10, v10
    # or long names. Let's check what's available.
    var_map = {}
    for vname in ds.data_vars:
        vname_lower = vname.lower()
        if "2t" in vname_lower or "t2m" in vname_lower or "2m_temperature" in vname_lower:
            var_map["t2m"] = vname
        elif "2d" in vname_lower or "d2m" in vname_lower or "dewpoint" in vname_lower:
            var_map["d2m"] = vname
        elif "u10" in vname_lower or "10u" in vname_lower or "u_component" in vname_lower:
            var_map["u10"] = vname
        elif "v10" in vname_lower or "10v" in vname_lower or "v_component" in vname_lower:
            var_map["v10"] = vname

    if len(var_map) < 4:
        # Fallback: try standard short names
        print(f"  Available vars: {list(ds.data_vars)}")
        print(f"  Mapped vars: {var_map}")
        for short in ["t2m", "d2m", "u10", "v10"]:
            if short not in var_map and short in ds.data_vars:
                var_map[short] = short

    print(f"  ERA5 variable mapping: {var_map}")

    # Select nearest grid point
    # Handle different dimension names (latitude/lat, longitude/lon, valid_time/time)
    lat_dim = "latitude" if "latitude" in ds.dims else "lat"
    lon_dim = "longitude" if "longitude" in ds.dims else "lon"
    time_dim = "valid_time" if "valid_time" in ds.dims else "time"

    point = ds.sel(**{lat_dim: lat, lon_dim: lon}, method="nearest")
    era5_lat = float(point[lat_dim].values)
    era5_lon = float(point[lon_dim].values)
    print(f"  Nearest ERA5 grid point: ({era5_lat:.2f}, {era5_lon:.2f})")

    # Extract time series
    times = pd.to_datetime(point[time_dim].values)

    # Build DataFrame
    era5_df = pd.DataFrame({"datetime": times})

    # Temperature: K -> C
    if "t2m" in var_map:
        era5_df["era5_temperature"] = point[var_map["t2m"]].values - 273.15
    if "d2m" in var_map:
        era5_df["era5_dewpoint_temperature"] = point[var_map["d2m"]].values - 273.15
    # Wind components: already in m/s
    if "u10" in var_map:
        era5_df["era5_u10"] = point[var_map["u10"]].values.astype(float)
    if "v10" in var_map:
        era5_df["era5_v10"] = point[var_map["v10"]].values.astype(float)

    ds.close()

    # --- Derived variables ---

    # ERA5 Relative Humidity from T and Td (Magnus formula)
    if "era5_temperature" in era5_df.columns and "era5_dewpoint_temperature" in era5_df.columns:
        T = era5_df["era5_temperature"].values
        Td = era5_df["era5_dewpoint_temperature"].values
        # Magnus formula constants (Alduchov & Eskridge, 1996)
        a, b = 17.625, 243.04
        rh = 100.0 * np.exp((a * Td) / (b + Td)) / np.exp((a * T) / (b + T))
        era5_df["era5_relative_humidity"] = np.clip(rh, 0, 100)

    # Wind speed and direction from u10, v10
    if "era5_u10" in era5_df.columns and "era5_v10" in era5_df.columns:
        u = era5_df["era5_u10"].values
        v = era5_df["era5_v10"].values
        era5_df["era5_wind_speed"] = np.sqrt(u**2 + v**2)
        # Meteorological wind direction (direction wind is coming FROM)
        era5_df["era5_wind_direction"] = (270 - np.degrees(np.arctan2(v, u))) % 360

    return era5_df


# ===================================================================
# STEP 5-7: Merge and output
# ===================================================================

def build_dataset():
    """Main pipeline: build the training dataset."""
    station_names = [s["name"] for s in STATIONS]

    # --- Step 1-3: Telemetry backbone ---
    backbone = build_telemetry_backbone(station_names)

    if backbone.empty:
        print("ERROR: No telemetry data after merging. Exiting.")
        sys.exit(1)

    # Report per-station counts
    print("\n" + "=" * 70)
    print("TELEMETRY BACKBONE SUMMARY")
    print("=" * 70)
    for station_name, grp in backbone.groupby(COL_STATION):
        print(f"  {station_name:25s}: {len(grp):,} hours, "
              f"range {grp['datetime'].min()} to {grp['datetime'].max()}")

    # --- Step 4: Fetch ERA5 ---
    print("\n" + "=" * 70)
    print("FETCHING ERA5 DATA")
    print("=" * 70)

    all_merged = []

    for station in STATIONS:
        print(f"\n--- {station['name']} ({station['lat']:.4f}, {station['lon']:.4f}) ---")

        # Get telemetry for this station
        tel = backbone[backbone[COL_STATION] == station["name"]].copy()
        if tel.empty:
            print(f"  No telemetry data for {station['name']}, skipping")
            continue

        # Download ERA5
        nc_path = fetch_era5_cds(station["lat"], station["lon"], station["id"])
        if nc_path is None:
            print(f"  ERA5 download failed for {station['name']}, skipping")
            continue

        # Load ERA5
        era5_df = load_era5_netcdf(nc_path, station["lat"], station["lon"])
        print(f"  ERA5 rows: {len(era5_df):,}")

        # --- Step 6: Merge on timestamp ---
        merged = tel.merge(era5_df, on="datetime", how="inner")
        print(f"  Matched rows: {len(merged):,}")

        if merged.empty:
            print(f"  WARNING: No timestamp overlap for {station['name']}")
            continue

        # Add station metadata
        merged.insert(0, "station_id", station["id"])
        merged.insert(1, "station_name", station["name"])
        merged.insert(2, "latitude", station["lat"])
        merged.insert(3, "longitude", station["lon"])

        # Drop the raw Station column
        merged = merged.drop(columns=[COL_STATION], errors="ignore")

        all_merged.append(merged)

    if not all_merged:
        print("\nERROR: No matched data for any station. Exiting.")
        sys.exit(1)

    # --- Step 7: Combine and write ---
    final = pd.concat(all_merged, ignore_index=True)
    final = final.sort_values(["station_id", "datetime"]).reset_index(drop=True)

    # Ensure column order
    col_order = [
        "station_id", "station_name", "latitude", "longitude", "datetime",
        "temperature_obs", "humidity_obs",
        "wind_speed_obs", "wind_direction_obs",
        "era5_temperature", "era5_dewpoint_temperature",
        "era5_u10", "era5_v10",
        "era5_relative_humidity", "era5_wind_speed", "era5_wind_direction",
    ]
    # Only include columns that exist
    col_order = [c for c in col_order if c in final.columns]
    final = final[col_order]

    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    final.to_csv(OUT_CSV, index=False)

    # --- Verification ---
    print("\n" + "=" * 70)
    print(f"OUTPUT: {OUT_CSV}")
    print("=" * 70)
    print(f"Total rows: {len(final):,}")
    print(f"Stations: {final['station_id'].nunique()}")
    print(f"Date range: {final['datetime'].min()} to {final['datetime'].max()}")
    print(f"Columns: {list(final.columns)}")

    # Duplicates check
    dupes = final.duplicated(subset=["station_id", "datetime"]).sum()
    print(f"\nDuplicate (station, datetime) pairs: {dupes}")

    # Per-station stats
    print("\nPer-station row counts:")
    for sid, grp in final.groupby("station_id"):
        sname = grp["station_name"].iloc[0]
        print(f"  {sname:25s} ({sid}): {len(grp):,} rows")

    # Physical plausibility checks
    print("\nPhysical range checks:")
    checks = {
        "temperature_obs": (-10, 55, "C"),
        "humidity_obs": (0, 100, "%"),
        "wind_speed_obs": (0, 200, "km/h"),
        "wind_direction_obs": (0, 360, "deg"),
        "era5_temperature": (-10, 55, "C"),
        "era5_relative_humidity": (0, 100, "%"),
        "era5_wind_speed": (0, 50, "m/s"),
    }
    for col, (lo, hi, unit) in checks.items():
        if col in final.columns:
            vals = final[col].dropna()
            oob = ((vals < lo) | (vals > hi)).sum()
            print(f"  {col:30s}: [{vals.min():.1f}, {vals.max():.1f}] {unit}  "
                  f"(out-of-range: {oob})")

    # Sanity: correlation between obs and ERA5 temperature
    if "temperature_obs" in final.columns and "era5_temperature" in final.columns:
        corr = final[["temperature_obs", "era5_temperature"]].corr().iloc[0, 1]
        bias = (final["era5_temperature"] - final["temperature_obs"]).mean()
        print(f"\nTemperature correlation (obs vs ERA5): {corr:.4f}")
        print(f"Temperature bias (ERA5 - obs): {bias:+.2f} C")

    print("\nFirst 5 rows:")
    print(final.head().to_string(index=False))
    print("\nLast 5 rows:")
    print(final.tail().to_string(index=False))

    print(f"\n Done! Dataset saved to {OUT_CSV}")
    print(f"  File size: {OUT_CSV.stat().st_size / 1e6:.1f} MB")


# ===================================================================
# Main
# ===================================================================

if __name__ == "__main__":
    build_dataset()
