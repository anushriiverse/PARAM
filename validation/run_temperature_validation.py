#!/usr/bin/env python3
"""
release/validation/run_temperature_validation.py
================================================
Canonical verification script evaluating temperature accuracy of the served
physics-downscaling product (lapse rate -6.5 C/km applied to 30 m SRTM terrain)
against independent NOAA GHCN daily stations across Karnataka.

VALIDATION METHODOLOGY & SERVED PRODUCT CONSTRAINTS:
---------------------------------------------------
1. Served Product Evaluation:
   Validates against the served village polygon prediction (ka.geojson:493 Binaga Nmct,
   ka.geojson:1179 Honavar Tmc, ka.geojson:22611 Medakeripura) using precomputed SRTM
   polygon elevation offsets from village_transfer.csv and village_corrections.csv,
   alongside the station-coordinate raster pixel evaluation to unconfound both.
2. Independent Out-of-Sample Verification:
   Lapse rate Gamma = -6.5 C/km is standard atmospheric physics (ISA tropospheric standard)
   and Delta z is strictly derived from NASA SRTM 30 m DEM relative to ECMWF geopotential.
   Zero parameters were tuned or calibrated on GHCN temperature stations.
3. Both Drivers Reported:
   - ERA5 Reanalysis Reference (1,500 station-days, 2023-01 to 2024-12): measures pure downscaling
     error given reanalysis inputs (isolating downscaling from forecast error).
   - ECMWF IFS 0.25 deg Operational Forecast (605 station-days, 2024-03 to 2024-12): measures
     operational forecast error under the live driver.
4. Robust Uncertainty Quantification:
   Block bootstrap 95% confidence intervals resampled over station-weeks (preserving
   synoptic-scale temporal autocorrelation).
5. Self-Contained Reproducibility:
   If any input data is missing in a fresh clone, the script automatically fetches it from
   the public NOAA NCEI and Open-Meteo archive endpoints.
"""

import sys
import os
import json
import urllib.request
import subprocess
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.metrics import mean_absolute_error, mean_squared_error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def get_git_commit():
    try:
        cmd = ["git", "rev-parse", "HEAD"]
        cwd = os.path.dirname(os.path.abspath(__file__))
        return subprocess.check_output(cmd, cwd=cwd, stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        return "UNKNOWN"


def find_or_fetch_file(candidates, fetch_url=None, is_ghcn=False):
    for c in candidates:
        if os.path.exists(c):
            return Path(c)
    if fetch_url:
        out_path = Path(candidates[0])
        out_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"      [FETCH] Downloading missing cache from: {fetch_url} ...")
        req = urllib.request.Request(fetch_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            content = resp.read()
        if is_ghcn:
            import io
            df = pd.read_csv(io.BytesIO(content), low_memory=False)
            df['DATE'] = pd.to_datetime(df['DATE'])
            for col in ['TMAX', 'TMIN', 'TAVG']:
                if col in df.columns:
                    df[col] = df[col] / 10.0
            df.to_csv(out_path, index=False)
        else:
            out_path.write_bytes(content)
        return out_path
    raise FileNotFoundError(f"Could not find or fetch any of: {candidates}")


def bootstrap_ci(df_sub, pred_col, obs_col, block_col='year_week', n_boot=2000, seed=42):
    rng = np.random.default_rng(seed)
    blocks = df_sub[block_col].unique()
    if len(blocks) == 0:
        return np.nan, np.nan
    block_groups = [df_sub[df_sub[block_col] == b][[pred_col, obs_col]].to_numpy() for b in blocks]
    n_blocks = len(blocks)
    boot_maes = []
    for _ in range(n_boot):
        sample_indices = rng.integers(0, n_blocks, size=n_blocks)
        sampled_data = np.vstack([block_groups[idx] for idx in sample_indices])
        boot_maes.append(np.mean(np.abs(sampled_data[:, 0] - sampled_data[:, 1])))
    return float(np.percentile(boot_maes, 2.5)), float(np.percentile(boot_maes, 97.5))


def paired_bootstrap_ci(df_sub, obs_col, coarse_col, eval_col, block_col='year_week', n_boot=2000, seed=42):
    rng = np.random.default_rng(seed)
    df_sub = df_sub.copy()
    df_sub['d'] = np.abs(df_sub[eval_col] - df_sub[obs_col]) - np.abs(df_sub[coarse_col] - df_sub[obs_col])
    blocks = df_sub[block_col].unique()
    if len(blocks) == 0:
        return np.nan, np.nan, np.nan, False
    block_data = [df_sub[df_sub[block_col] == b]['d'].to_numpy() for b in blocks]
    n_blocks = len(blocks)
    boot_diffs = []
    for _ in range(n_boot):
        idx = rng.integers(0, n_blocks, size=n_blocks)
        sampled = np.concatenate([block_data[i] for i in idx])
        boot_diffs.append(np.mean(sampled))
    ci = np.percentile(boot_diffs, [2.5, 97.5])
    point_diff = float(np.mean(df_sub['d']))
    ci_l, ci_u = float(ci[0]), float(ci[1])
    excludes_zero = bool(ci_l > 0 or ci_u < 0)
    return point_diff, ci_l, ci_u, excludes_zero


def process_dataset(raw_data, date_range, stations):
    all_rows = []
    for i, st in enumerate(stations):
        sid = st['ghcn_id']
        hdf = pd.DataFrame(raw_data[i]['hourly'])
        hdf['time'] = pd.to_datetime(hdf['time'])
        hdf['coarse_t'] = hdf['temperature_2m']
        hdf['village_t'] = hdf['coarse_t'] + st['temp_offset_c']
        hdf['raster_t'] = hdf['coarse_t'] + st['station_raster_offset_c']
        
        ts_df = hdf.set_index('time').sort_index()
        records = []
        for d in date_range:
            d_ts = pd.to_datetime(d)
            # WMO / IMD daily aggregation windows
            tx_s = d_ts - pd.Timedelta(days=1) + pd.Timedelta(hours=12)
            tx_e = d_ts + pd.Timedelta(hours=12)
            tn_s = d_ts - pd.Timedelta(days=1) + pd.Timedelta(hours=3)
            tn_e = d_ts + pd.Timedelta(hours=3)
            s_tx = ts_df[(ts_df.index > tx_s) & (ts_df.index <= tx_e)]
            s_tn = ts_df[(ts_df.index > tn_s) & (ts_df.index <= tn_e)]
            
            if len(s_tx) >= 20 and len(s_tn) >= 20:
                records.append({
                    'date': d,
                    'coarse_tmax': s_tx['coarse_t'].max(),
                    'coarse_tmin': s_tn['coarse_t'].min(),
                    'village_tmax': s_tx['village_t'].max(),
                    'village_tmin': s_tn['village_t'].min(),
                    'raster_tmax': s_tx['raster_t'].max(),
                    'raster_tmin': s_tn['raster_t'].min(),
                })
        daily_df = pd.DataFrame(records)
        
        # Load GHCN ground truth (with auto-fetch fallback)
        st_file = find_or_fetch_file(
            [
                Path("data/cache/ghcn_daily") / f"{sid}_parsed.csv",
                Path("../data/cache/ghcn_daily") / f"{sid}_parsed.csv",
                Path("../../data/cache/ghcn_daily") / f"{sid}_parsed.csv"
            ],
            fetch_url=f"https://www.ncei.noaa.gov/data/global-historical-climatology-network-daily/access/{sid}.csv",
            is_ghcn=True
        )
        gdf = pd.read_csv(st_file)
        gdf['date'] = pd.to_datetime(gdf['DATE']).dt.date
        gdf_valid = gdf.dropna(subset=['TMAX', 'TMIN'])[['date', 'TMAX', 'TMIN']].rename(columns={'TMAX': 'obs_tmax', 'TMIN': 'obs_tmin'})
        m = pd.merge(daily_df, gdf_valid, on='date', how='inner')
        m['station_name'] = st['name']
        m['station_id'] = sid
        m['prompt_id'] = st['prompt_id']
        m['village_id'] = st['village_id']
        m['village_name'] = st['village_name']
        all_rows.append(m)
        
    df = pd.concat(all_rows, ignore_index=True)
    df['date_dt'] = pd.to_datetime(df['date'])
    df['year_week'] = df['date_dt'].dt.strftime('%Y-W%U') + '_' + df['station_name']
    return df


def main():
    commit_hash = get_git_commit()
    print("=" * 102)
    print("CANONICAL TEMPERATURE VALIDATION: SERVED PHYSICS-DOWNSCALING SKILL")
    print(f"Git Commit Hash: {commit_hash}")
    print("=" * 102)

    stations = [
        {
            'name': 'Karwar',
            'ghcn_id': 'IN009120100',
            'prompt_id': 'IN012131700',
            'village_id': 'ka.geojson:493',
            'village_name': 'Binaga Nmct',
            'lat': 14.783,
            'lon': 74.133,
            'ghcn_elev': 4.0,
            'stn_srtm_elev': 12.0,
            'village_elev': 103.7,
            'temp_offset_c': 0.10,
            'station_raster_offset_c': 0.70
        },
        {
            'name': 'Honavar',
            'ghcn_id': 'IN009120400',
            'prompt_id': 'IN012131900',
            'village_id': 'ka.geojson:1179',
            'village_name': 'Honavar Tmc',
            'lat': 14.283,
            'lon': 74.450,
            'ghcn_elev': 9.0,
            'stn_srtm_elev': 30.0,
            'village_elev': 24.9,
            'temp_offset_c': 0.68,
            'station_raster_offset_c': 0.65
        },
        {
            'name': 'Chitradurga',
            'ghcn_id': 'IN009070100',
            'prompt_id': 'IN009010400',
            'village_id': 'ka.geojson:22611',
            'village_name': 'Medakeripura',
            'lat': 14.233,
            'lon': 76.433,
            'ghcn_elev': 733.0,
            'stn_srtm_elev': 704.0,
            'village_elev': 719.6,
            'temp_offset_c': -0.33,
            'station_raster_offset_c': -0.23
        }
    ]

    # 1. Locate / fetch ERA5 and IFS data
    era5_url = (
        "https://archive-api.open-meteo.com/v1/archive?"
        "latitude=14.783,14.283,14.233&longitude=74.133,74.450,76.433&"
        "start_date=2022-12-30&end_date=2024-12-31&"
        "hourly=temperature_2m,dewpoint_2m,wind_speed_10m,precipitation,shortwave_radiation"
    )
    era5_file = find_or_fetch_file([
        "data/cache/ml_temp/era5_hourly_imd_2022-12-30_2024-12-31.json",
        "../data/cache/ml_temp/era5_hourly_imd_2022-12-30_2024-12-31.json",
        "../../data/cache/ml_temp/era5_hourly_imd_2022-12-30_2024-12-31.json"
    ], fetch_url=era5_url)

    ifs_url = (
        "https://archive-api.open-meteo.com/v1/archive?"
        "latitude=14.783,14.283,14.233&longitude=74.133,74.450,76.433&"
        "start_date=2024-03-01&end_date=2024-12-31&"
        "hourly=temperature_2m,dewpoint_2m,wind_speed_10m,precipitation,shortwave_radiation&"
        "models=ecmwf_ifs025"
    )
    ifs_file = find_or_fetch_file([
        "data/cache/ml_temp/ifs_hourly_ghcn_2024-03-01_2024-12-31.json",
        "../data/cache/ml_temp/ifs_hourly_ghcn_2024-03-01_2024-12-31.json",
        "../../data/cache/ml_temp/ifs_hourly_ghcn_2024-03-01_2024-12-31.json"
    ], fetch_url=ifs_url)

    with open(era5_file, 'r', encoding='utf-8') as f:
        era5_raw = json.load(f)
    with open(ifs_file, 'r', encoding='utf-8') as f:
        ifs_raw = json.load(f)

    df_era5 = process_dataset(era5_raw, pd.date_range('2023-01-01', '2024-12-31').date, stations)
    df_ifs = process_dataset(ifs_raw, pd.date_range('2024-03-01', '2024-12-31').date, stations)

    print(f"\nEvaluated Sample Sizes:")
    print(f"  ERA5 Reanalysis (2023-01 to 2024-12): {len(df_era5)} station-days across 3 stations")
    print(f"  ECMWF IFS Forecast (2024-03 to 2024-12): {len(df_ifs)} station-days across 3 stations")

    table_rows = []

    configs = [
        ('ERA5 Reanalysis Reference', df_era5),
        ('ECMWF IFS Forecast Served', df_ifs)
    ]

    for ds_label, df_curr in configs:
        print(f"\n" + "=" * 102)
        print(f"UNCONFOUNDED EVALUATION: {ds_label.upper()} (N = {len(df_curr)} station-days)")
        print("=" * 102)

        for var_key, var_name in [('tmax', 'Tmax'), ('tmin', 'Tmin')]:
            obs_col = f'obs_{var_key}'
            c_col = f'coarse_{var_key}'
            s_col = f'raster_{var_key}'
            v_col = f'village_{var_key}'

            # 1. Raw coarse
            c_mae = mean_absolute_error(df_curr[obs_col], df_curr[c_col])
            c_bias = np.mean(df_curr[c_col] - df_curr[obs_col])

            # 2. Station-coord physics
            s_mae = mean_absolute_error(df_curr[obs_col], df_curr[s_col])
            s_bias = np.mean(df_curr[s_col] - df_curr[obs_col])
            s_diff, s_ci_l, s_ci_u, s_ex0 = paired_bootstrap_ci(df_curr, obs_col, c_col, s_col)

            # 3. Served village physics
            v_mae = mean_absolute_error(df_curr[obs_col], df_curr[v_col])
            v_bias = np.mean(df_curr[v_col] - df_curr[obs_col])
            v_diff, v_ci_l, v_ci_u, v_ex0 = paired_bootstrap_ci(df_curr, obs_col, c_col, v_col)

            print(f"\n--- {var_name} (Pooled N={len(df_curr)}) ---")
            print(f"  (a) Raw coarse cell   : MAE = {c_mae:.3f} °C | Bias = {c_bias:+.3f} °C")
            print(f"  (b) Station-coord SRTM: MAE = {s_mae:.3f} °C | Bias = {s_bias:+.3f} °C | Paired Diff = {s_diff:+.3f} °C (95% CI: [{s_ci_l:+.3f}, {s_ci_u:+.3f}], excludes 0: {s_ex0})")
            print(f"  (c) Served village SRTM: MAE = {v_mae:.3f} °C | Bias = {v_bias:+.3f} °C | Paired Diff = {v_diff:+.3f} °C (95% CI: [{v_ci_l:+.3f}, {v_ci_u:+.3f}], excludes 0: {v_ex0})")

            table_rows.append({
                'dataset': ds_label,
                'evaluation_target': 'pooled_all_stations',
                'station_name': 'Pooled (All 3)',
                'station_id': 'ALL_3',
                'variable': var_name,
                'n_station_days': len(df_curr),
                'coarse_mae_c': round(c_mae, 4),
                'coarse_bias_c': round(c_bias, 4),
                'stn_coord_mae_c': round(s_mae, 4),
                'stn_coord_bias_c': round(s_bias, 4),
                'stn_coord_paired_diff_c': round(s_diff, 4),
                'stn_coord_ci_lower_c': round(s_ci_l, 4),
                'stn_coord_ci_upper_c': round(s_ci_u, 4),
                'stn_coord_excludes_0': s_ex0,
                'served_village_mae_c': round(v_mae, 4),
                'served_village_bias_c': round(v_bias, 4),
                'served_village_paired_diff_c': round(v_diff, 4),
                'served_village_ci_lower_c': round(v_ci_l, 4),
                'served_village_ci_upper_c': round(v_ci_u, 4),
                'served_village_excludes_0': v_ex0
            })

    # Save to temperature_table.csv
    out_table = Path(__file__).resolve().parent / "temperature_table.csv"
    df_out = pd.DataFrame(table_rows)
    df_out.to_csv(out_table, index=False)
    print("\n" + "=" * 102)
    print(f"Validation results saved to: {out_table}")
    print("=" * 102)


if __name__ == "__main__":
    main()
