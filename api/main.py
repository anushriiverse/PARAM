import os
from pathlib import Path
from typing import List
import numpy as np
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AgroMet Downscaling API",
    description="High-resolution lookup API for downscaled JJAS weather and crop water variables across the Western Ghats",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "village_serving.csv"
if not DATA_PATH.exists():
    DATA_PATH = Path("api/data/village_serving.csv")
if not DATA_PATH.exists():
    DATA_PATH = Path("release/api/data/village_serving.csv")

if not DATA_PATH.exists():
    raise FileNotFoundError(f"Serving table not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
df["village_id"] = df["village_id"].astype(str)
df["name"] = df["name"].astype(str)
df["name_lower"] = df["name"].str.lower()
df["state"] = df["state"].astype(str)
df["inside_validated_band"] = df["inside_validated_band"].astype(bool)

# Serving configuration flag: set to False for instant 1-line mid-demo revert to physics-only
SERVE_ML_TEMPERATURE: bool = True

if SERVE_ML_TEMPERATURE:
    DAILY_DATA_PATH = BASE_DIR / "data" / "village_daily_ml.csv"
else:
    DAILY_DATA_PATH = BASE_DIR / "data" / "village_daily_physics.csv"

if not DAILY_DATA_PATH.exists():
    DAILY_DATA_PATH = BASE_DIR / "data" / "village_daily_physics.csv"
if not DAILY_DATA_PATH.exists():
    DAILY_DATA_PATH = Path("outputs/village_daily_20260917.csv")
if not DAILY_DATA_PATH.exists():
    DAILY_DATA_PATH = BASE_DIR.parent / "outputs" / "village_daily_20260917.csv"

if DAILY_DATA_PATH.exists():
    df_daily = pd.read_csv(DAILY_DATA_PATH)
    df_daily["village_id"] = df_daily["village_id"].astype(str)
    df_daily["name"] = df_daily["name"].astype(str)
    df_daily["state"] = df_daily["state"].astype(str)
    df_daily["inside_validated_band"] = df_daily["inside_validated_band"].astype(bool)
else:
    df_daily = None

FORECAST_7DAY_PATH = BASE_DIR / "data" / "village_forecast_7day.csv"
if not FORECAST_7DAY_PATH.exists():
    FORECAST_7DAY_PATH = BASE_DIR.parent / "outputs" / "village_forecast_7day.csv"
if not FORECAST_7DAY_PATH.exists():
    FORECAST_7DAY_PATH = Path("outputs/village_forecast_7day.csv")

if FORECAST_7DAY_PATH.exists():
    df_7day = pd.read_csv(FORECAST_7DAY_PATH)
    df_7day["village_id"] = df_7day["village_id"].astype(str)
else:
    df_7day = None

VILLAGE_LATS = df["lat"].to_numpy(dtype=np.float64)
VILLAGE_LONS = df["lon"].to_numpy(dtype=np.float64)
VILLAGE_LATS_RAD = np.radians(VILLAGE_LATS)
VILLAGE_LONS_RAD = np.radians(VILLAGE_LONS)

DOMAIN_LAT_MIN = 12.948
DOMAIN_LAT_MAX = 17.550
DOMAIN_LON_MIN = 73.448
DOMAIN_LON_MAX = 76.552

# Load optional gauge transect data if present on disk
GAUGE_PATH = BASE_DIR / "data" / "rain_stations_transect.csv"
if not GAUGE_PATH.exists():
    GAUGE_PATH = Path("outputs/rain_stations_transect.csv")
if not GAUGE_PATH.exists():
    GAUGE_PATH = BASE_DIR.parent / "outputs" / "rain_stations_transect.csv"

GAUGES_LIST = []
if GAUGE_PATH.exists():
    gdf = pd.read_csv(GAUGE_PATH)
    if "name" in gdf.columns and "latitude" in gdf.columns and "longitude" in gdf.columns:
        for _, r in gdf.iterrows():
            GAUGES_LIST.append({
                "village_id": str(r.get("id", "")),
                "name": str(r["name"]).strip(),
                "state": str(r.get("zone", "")),
                "lat": round(float(r["latitude"]), 5),
                "lon": round(float(r["longitude"]), 5),
                "type": "gauge"
            })


def haversine_vectorized(query_lat: float, query_lon: float) -> np.ndarray:
    r = 6371.0
    query_lat_rad = np.radians(query_lat)
    query_lon_rad = np.radians(query_lon)

    dlat = VILLAGE_LATS_RAD - query_lat_rad
    dlon = VILLAGE_LONS_RAD - query_lon_rad

    a = np.sin(dlat / 2.0) ** 2 + np.cos(query_lat_rad) * np.cos(VILLAGE_LATS_RAD) * np.sin(dlon / 2.0) ** 2
    a = np.clip(a, 0.0, 1.0)
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return r * c


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/predict")
def predict(
    lat: float = Query(..., description="Latitude of query location"),
    lon: float = Query(..., description="Longitude of query location")
):
    distances = haversine_vectorized(lat, lon)
    min_idx = int(np.argmin(distances))
    distance_km = round(float(distances[min_idx]), 2)

    row = df.iloc[min_idx]
    in_domain = bool(
        DOMAIN_LAT_MIN <= lat <= DOMAIN_LAT_MAX and
        DOMAIN_LON_MIN <= lon <= DOMAIN_LON_MAX
    )

    v_name = str(row["name"])
    v_state = str(row["state"])
    v_lat = round(float(row["lat"]), 5)
    v_lon = round(float(row["lon"]), 5)
    v_elev = round(float(row["elevation_m"]), 1)
    v_temp = round(float(row["temp_c"]), 2)
    v_eto = round(float(row["eto_mm_day"]), 2)
    v_rain = round(float(row["rainfall_jjas_mm"]), 1)
    v_val_band = bool(row["inside_validated_band"])

    sentences = [
        "Seasonal JJAS values downscaled from ERA5 0.25 degree reanalysis using 30 m SRTM terrain; rainfall calibrated against 19 NOAA GHCN gauges."
    ]
    if v_val_band:
        sentences.append("Rainfall estimate lies within the 12.8-15.3N gauge-validated band (19-gauge calibrated).")
    else:
        sentences.append("Rainfall estimate lies outside the 12.8-15.3N gauge-validated band and represents uncalibrated spatial extrapolation.")

    if distance_km > 20.0:
        sentences.append(f"Warning: Nearest village ({v_name}) is {distance_km:.1f} km away; local microclimate and terrain effects may differ.")
    else:
        sentences.append(f"Nearest village is {v_name} at a distance of {distance_km:.1f} km.")

    note = " ".join(sentences)

    return {
        "village_id": str(row["village_id"]),
        "name": v_name,
        "village_name": v_name,
        "state": v_state,
        "lat": v_lat,
        "lon": v_lon,
        "elevation_m": v_elev,
        "temp_c": v_temp,
        "eto_mm_day": v_eto,
        "rainfall_jjas_mm": v_rain,
        "inside_validated_band": v_val_band,
        "distance_km": distance_km,
        "in_domain": in_domain,
        "note": note
    }


@app.get("/api/daily")
def daily(
    lat: float = Query(..., description="Latitude of query location"),
    lon: float = Query(..., description="Longitude of query location")
):
    if df_daily is None:
        return {"error": "Daily forecast table not loaded"}

    distances = haversine_vectorized(lat, lon)
    min_idx = int(np.argmin(distances))
    distance_km = round(float(distances[min_idx]), 2)

    row = df_daily.iloc[min_idx]
    in_domain = bool(
        DOMAIN_LAT_MIN <= lat <= DOMAIN_LAT_MAX and
        DOMAIN_LON_MIN <= lon <= DOMAIN_LON_MAX
    )

    return {
        "village_id": str(row["village_id"]),
        "name": str(row["name"]),
        "state": str(row["state"]),
        "lat": round(float(row["lat"]), 5),
        "lon": round(float(row["lon"]), 5),
        "elevation_m": round(float(row["elevation_m"]), 1),
        "forecast_date": str(row["forecast_date"]),
        "cell_precip_sum_mm": round(float(row["cell_precip_sum_mm"]), 2),
        "rain_ratio": round(float(row["rain_ratio"]), 4),
        "wind_dir_deg": int(row["wind_dir_deg"]),
        "wind_speed_max_kmh": round(float(row["wind_speed_max_kmh"]), 1),
        "gate_g": round(float(row["gate_g"]), 4),
        "effective_ratio": round(float(row["effective_ratio"]), 4),
        "rain_mm": round(float(row["rain_mm"]), 2),
        "cell_tmax_c": round(float(row["cell_tmax_c"]), 2),
        "cell_tmin_c": round(float(row["cell_tmin_c"]), 2),
        "temp_offset_c": round(float(row["temp_offset_c"]), 2),
        "tmax_c": round(float(row["tmax_c"]), 2),
        "tmin_c": round(float(row["tmin_c"]), 2),
        "tmean_c": round(float(row["tmean_c"]), 2),
        "eto_mm_day": round(float(row["eto_mm_day"]), 2),
        "tmax_source": str(row["tmax_source"]) if "tmax_source" in row else ("ml_corrected" if SERVE_ML_TEMPERATURE else "physics"),
        "ml_offset_tmax_c": round(float(row["ml_offset_tmax_c"]), 2) if "ml_offset_tmax_c" in row else 0.0,
        "ml_model_version": str(row["ml_model_version"]) if "ml_model_version" in row else ("v2" if SERVE_ML_TEMPERATURE else "none"),
        "ml_applied_to": str(row["ml_applied_to"]) if "ml_applied_to" in row else ("tmax_only" if SERVE_ML_TEMPERATURE else "none"),
        "clamp_limit_c": 2.0,
        "inside_validated_band": bool(row["inside_validated_band"]),
        "distance_km": distance_km,
        "in_domain": in_domain,
        "driver_model": "ecmwf_ifs025",
        "driver_source": "Open-Meteo ECMWF IFS (0.25 deg)"
    }


@app.get("/api/forecast7")
def forecast7(
    lat: float = Query(..., description="Latitude of query location"),
    lon: float = Query(..., description="Longitude of query location")
):
    if df_7day is None:
        return {"error": "7-day forecast table not loaded"}

    distances = haversine_vectorized(lat, lon)
    min_idx = int(np.argmin(distances))
    distance_km = round(float(distances[min_idx]), 2)
    v_id = str(df.iloc[min_idx]["village_id"])

    in_domain = bool(
        DOMAIN_LAT_MIN <= lat <= DOMAIN_LAT_MAX and
        DOMAIN_LON_MIN <= lon <= DOMAIN_LON_MAX
    )

    v_rows = df_7day[df_7day["village_id"] == v_id].sort_values("forecast_date")
    records = []
    for _, r in v_rows.iterrows():
        records.append({
            "forecast_date": str(r["forecast_date"]),
            "lead_day": int(r["lead_day"]) if "lead_day" in r and not pd.isna(r["lead_day"]) else None,
            "rain_mm": round(float(r["rain_mm"]), 2),
            "cell_precip_sum_mm": round(float(r["cell_precip_sum_mm"]), 2),
            "tmax_c": round(float(r["tmax_c"]), 2),
            "tmin_c": round(float(r["tmin_c"]), 2),
            "tmean_c": round(float(r["tmean_c"]), 2),
            "eto_mm_day": round(float(r["eto_mm_day"]), 2),
            "wind_speed_max_kmh": round(float(r["wind_speed_max_kmh"]), 1),
            "wind_dir_deg": int(r["wind_dir_deg"]),
            "gate_g": round(float(r["gate_g"]), 4),
            "effective_ratio": round(float(r["effective_ratio"]), 4),
            "inside_validated_band": bool(r["inside_validated_band"]),
            "tmax_source": str(r["tmax_source"]) if "tmax_source" in r and not pd.isna(r["tmax_source"]) else ("physics" if not SERVE_ML_TEMPERATURE else "ml_corrected"),
            "ml_offset_tmax_c": round(float(r["ml_offset_tmax_c"]), 2) if "ml_offset_tmax_c" in r and not pd.isna(r["ml_offset_tmax_c"]) else 0.0
        })

    return {
        "village_id": v_id,
        "name": str(df.iloc[min_idx]["name"]),
        "state": str(df.iloc[min_idx]["state"]),
        "lat": round(float(df.iloc[min_idx]["lat"]), 5),
        "lon": round(float(df.iloc[min_idx]["lon"]), 5),
        "elevation_m": round(float(df.iloc[min_idx]["elevation_m"]), 1),
        "distance_km": distance_km,
        "in_domain": in_domain,
        "forecast_days": records,
        "records": records
    }


@app.get("/api/search")
def search(q: str = Query("", description="Search query")):
    query = q.strip().lower()
    if not query:
        return []

    results = []
    # Search gauge stations from file if available
    for g in GAUGES_LIST:
        if query in g["name"].lower():
            results.append(g)

    # Search village table
    matches = df[df["name_lower"].str.contains(query, regex=False)]
    for _, row in matches.iterrows():
        if len(results) >= 8:
            break
        results.append({
            "village_id": str(row["village_id"]),
            "name": str(row["name"]),
            "state": str(row["state"]),
            "lat": round(float(row["lat"]), 5),
            "lon": round(float(row["lon"]), 5),
            "type": "village"
        })

    return results[:8]


@app.get("/api/model_info")
def model_info():
    return {
        "rainfall": {
            "canonical_median_ape_pct": 12.35,
            "windward_median_ape_pct": 7.57,
            "leeward_median_ape_pct": 19.92,
            "n_gauges": 17,
            "domain_band": "12.8-15.3N",
            "n_villages_in_band": 8634,
            "n_villages_total": 16943,
            "per_station_spread_ape_pct": {
                "Chickmagalur": 61.44,
                "Hulikal": 53.13,
                "Sagar": 41.46
            },
            "cell_mass_conservation_worst_error": 0.5277
        },
        "temperature": {
            "tmax_serving_method": "XGBoost diurnal residual correction (v2) applied to lapse-rate base with hard +/-2.0 C clamp" if SERVE_ML_TEMPERATURE else "physics-only lapse-rate (6.5 C/km) on 30 m SRTM terrain",
            "tmin_serving_method": "physics-only lapse-rate (6.5 C/km); ML disabled (-14.4% negative transfer on Tmin)",
            "served_tmax_source": "ml_corrected" if SERVE_ML_TEMPERATURE else "physics",
            "clamp_rule": "hard +/-2.0 C ceiling applied to hourly residuals and daily offsets",
            "revert_command": "Set SERVE_ML_TEMPERATURE = False in release/api/main.py",
            "disclaimer": "Tmax: physics lapse-rate correction plus XGBoost diurnal residual (clamped +/-2.0 C); Tmin: physics only; ML offsets derived per date from hourly ECMWF IFS (0.25 deg) forecast; 1-7 day operational forecast error is not yet measured.",
            "note": "Offsets are derived from hourly ECMWF IFS (0.25 deg) forecasts evaluated per date via XGBoost residual model v2 with hard +/-2.0 C clamp; 1-7 day operational forecast error is not yet measured."
        }
    }
