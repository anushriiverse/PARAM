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
   rather than an uncorrected coarse grid cell or an un-disaggregated point raster pixel.
2. Independent Out-of-Sample Verification:
   Lapse rate Gamma = -6.5 C/km is standard atmospheric physics (ISA tropospheric standard)
   and Delta z is strictly derived from NASA SRTM 30 m DEM relative to ECMWF geopotential.
   Zero parameters were tuned or calibrated on GHCN temperature stations.
3. Both Drivers Reported:
   - ERA5 Reanalysis Reference (1,500 station-days, 2023-01 to 2024-12): measures downscaling
     error given reanalysis inputs (isolating downscaling from forecast error).
   - ECMWF IFS 0.25 deg Operational Forecast (605 station-days, 2024-03 to 2024-12): measures
     served operational forecast error under the live driver.
4. Robust Uncertainty Quantification:
   Block bootstrap 95% confidence intervals resampled over station-weeks (preserving
   synoptic-scale temporal autocorrelation).
"""

import sys
import os
import json
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


def find_file(candidates):
    for c in candidates:
        if os.path.exists(c):
            return Path(c)
    raise FileNotFoundError(f"Could not find any of: {candidates}")


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


def bootstrap_ci_pooled(df_sub, n_boot=2000, seed=42):
    rng = np.random.default_rng(seed)
    blocks = df_sub['year_week'].unique()
    if len(blocks) == 0:
        return np.nan, np.nan
    block_groups = [
        np.concatenate([
            df_sub[df_sub['year_week'] == b][['village_tmax', 'obs_tmax']].to_numpy(),
            df_sub[df_sub['year_week'] == b][['village_tmin', 'obs_tmin']].to_numpy()
        ])
        for b in blocks
    ]
    n_blocks = len(blocks)
    boot_maes = []
    for _ in range(n_boot):
        sample_indices = rng.integers(0, n_blocks, size=n_blocks)
        sampled_data = np.vstack([block_groups[idx] for idx in sample_indices])
        boot_maes.append(np.mean(np.abs(sampled_data[:, 0] - sampled_data[:, 1])))
    return float(np.percentile(boot_maes, 2.5)), float(np.percentile(boot_maes, 97.5))


def process_dataset(raw_data, date_range, stations, ghcn_dir):
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
            tmax_start = d_ts - pd.Timedelta(days=1) + pd.Timedelta(hours=12)
            tmax_end = d_ts + pd.Timedelta(hours=12)
            tmax_slice = ts_df[(ts_df.index > tmax_start) & (ts_df.index <= tmax_end)]
            tmin_start = d_ts - pd.Timedelta(days=1) + pd.Timedelta(hours=3)
            tmin_end = d_ts + pd.Timedelta(hours=3)
            tmin_slice = ts_df[(ts_df.index > tmin_start) & (ts_df.index <= tmin_end)]
            
            if len(tmax_slice) >= 20 and len(tmin_slice) >= 20:
                records.append({
                    'date': d,
                    'coarse_tmax': tmax_slice['coarse_t'].max(),
                    'coarse_tmin': tmin_slice['coarse_t'].min(),
                    'village_tmax': tmax_slice['village_t'].max(),
                    'village_tmin': tmin_slice['village_t'].min(),
                    'raster_tmax': tmax_slice['raster_t'].max(),
                    'raster_tmin': tmin_slice['raster_t'].min(),
                })
        daily_df = pd.DataFrame(records)
        
        # Load GHCN ground truth
        st_file = find_file([
            ghcn_dir / f"{sid}_parsed.csv",
            Path("data/cache/ghcn_daily") / f"{sid}_parsed.csv",
            Path("../data/cache/ghcn_daily") / f"{sid}_parsed.csv",
            Path("../../data/cache/ghcn_daily") / f"{sid}_parsed.csv"
        ])
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
    print("=" * 96)
    print("CANONICAL TEMPERATURE VALIDATION: SERVED PHYSICS-DOWNSCALING SKILL")
    print(f"Git Commit Hash: {commit_hash}")
    print("=" * 96)

    # 1. Locate data files
    era5_file = find_file([
        "data/cache/ml_temp/era5_hourly_imd_2022-12-30_2024-12-31.json",
        "../data/cache/ml_temp/era5_hourly_imd_2022-12-30_2024-12-31.json",
        "../../data/cache/ml_temp/era5_hourly_imd_2022-12-30_2024-12-31.json"
    ])
    ifs_file = find_file([
        "data/cache/ml_temp/ifs_hourly_ghcn_2024-03-01_2024-12-31.json",
        "../data/cache/ml_temp/ifs_hourly_ghcn_2024-03-01_2024-12-31.json",
        "../../data/cache/ml_temp/ifs_hourly_ghcn_2024-03-01_2024-12-31.json"
    ])
    ghcn_dir = era5_file.parent.parent / "ghcn_daily"

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

    with open(era5_file, 'r', encoding='utf-8') as f:
        era5_raw = json.load(f)
    with open(ifs_file, 'r', encoding='utf-8') as f:
        ifs_raw = json.load(f)

    df_era5 = process_dataset(era5_raw, pd.date_range('2023-01-01', '2024-12-31').date, stations, ghcn_dir)
    df_ifs = process_dataset(ifs_raw, pd.date_range('2024-03-01', '2024-12-31').date, stations, ghcn_dir)

    print(f"\nEvaluated Sample Sizes:")
    print(f"  ERA5 Reanalysis (2023-01 to 2024-12): {len(df_era5)} station-days across 3 stations")
    print(f"  ECMWF IFS Forecast (2024-03 to 2024-12): {len(df_ifs)} station-days across 3 stations")

    table_rows = []

    configs = [
        ('ERA5 Reanalysis Reference', df_era5),
        ('ECMWF IFS Forecast Served', df_ifs)
    ]

    for ds_label, df_curr in configs:
        print(f"\n" + "=" * 96)
        print(f"DATASET: {ds_label.upper()} (N = {len(df_curr)} station-days)")
        print("=" * 96)
        print(f"{'Station':12s} | {'Variable':7s} | {'N':4s} | {'Coarse MAE':10s} | {'Served MAE':10s} | {'Net Diff':8s} | {'95% CI':16s} | {'Bias(C/S)':13s} | {'RMSE(C/S)':13s}")
        print("-" * 96)

        # Per station rows
        for st in stations:
            sname = st['name']
            sid = st['ghcn_id']
            vid = st['village_id']
            vname = st['village_name']
            sub = df_curr[df_curr['station_name'] == sname]
            n_sub = len(sub)

            for var in ['Tmax', 'Tmin', 'Pooled']:
                if var == 'Tmax':
                    obs = sub['obs_tmax'].values
                    c_pred = sub['coarse_tmax'].values
                    p_pred = sub['village_tmax'].values
                    ci_l, ci_u = bootstrap_ci(sub, 'village_tmax', 'obs_tmax')
                elif var == 'Tmin':
                    obs = sub['obs_tmin'].values
                    c_pred = sub['coarse_tmin'].values
                    p_pred = sub['village_tmin'].values
                    ci_l, ci_u = bootstrap_ci(sub, 'village_tmin', 'obs_tmin')
                else:
                    obs = np.concatenate([sub['obs_tmax'].values, sub['obs_tmin'].values])
                    c_pred = np.concatenate([sub['coarse_tmax'].values, sub['coarse_tmin'].values])
                    p_pred = np.concatenate([sub['village_tmax'].values, sub['village_tmin'].values])
                    ci_l, ci_u = bootstrap_ci_pooled(sub)

                c_mae = mean_absolute_error(obs, c_pred)
                c_bias = np.mean(c_pred - obs)
                c_rmse = np.sqrt(mean_squared_error(obs, c_pred))

                p_mae = mean_absolute_error(obs, p_pred)
                p_bias = np.mean(p_pred - obs)
                p_rmse = np.sqrt(mean_squared_error(obs, p_pred))

                net_diff = p_mae - c_mae

                print(f"{sname:12s} | {var:7s} | {n_sub:4d} | {c_mae:8.3f} C | {p_mae:8.3f} C | {net_diff:+7.3f} C | [{ci_l:6.3f}, {ci_u:6.3f}] | {c_bias:+.2f}/{p_bias:+.2f} C | {c_rmse:.2f}/{p_rmse:.2f} C")

                table_rows.append({
                    'dataset': ds_label,
                    'evaluation_target': 'served_village_polygon',
                    'station_name': sname,
                    'station_id': sid,
                    'prompt_id': st['prompt_id'],
                    'village_id': vid,
                    'village_name': vname,
                    'variable': var,
                    'n_station_days': n_sub,
                    'coarse_mae_c': round(c_mae, 4),
                    'coarse_bias_c': round(c_bias, 4),
                    'coarse_rmse_c': round(c_rmse, 4),
                    'served_physics_mae_c': round(p_mae, 4),
                    'served_physics_bias_c': round(p_bias, 4),
                    'served_physics_rmse_c': round(p_rmse, 4),
                    'net_effect_mae_c': round(net_diff, 4),
                    'ci_95_lower_c': round(ci_l, 4),
                    'ci_95_upper_c': round(ci_u, 4)
                })

        # Pooled rows (across all 3 stations)
        print("-" * 96)
        n_tot = len(df_curr)
        for var in ['Tmax', 'Tmin', 'Pooled']:
            if var == 'Tmax':
                obs = df_curr['obs_tmax'].values
                c_pred = df_curr['coarse_tmax'].values
                p_pred = df_curr['village_tmax'].values
                ci_l, ci_u = bootstrap_ci(df_curr, 'village_tmax', 'obs_tmax')
            elif var == 'Tmin':
                obs = df_curr['obs_tmin'].values
                c_pred = df_curr['coarse_tmin'].values
                p_pred = df_curr['village_tmin'].values
                ci_l, ci_u = bootstrap_ci(df_curr, 'village_tmin', 'obs_tmin')
            else:
                obs = np.concatenate([df_curr['obs_tmax'].values, df_curr['obs_tmin'].values])
                c_pred = np.concatenate([df_curr['coarse_tmax'].values, df_curr['coarse_tmin'].values])
                p_pred = np.concatenate([df_curr['village_tmax'].values, df_curr['village_tmin'].values])
                ci_l, ci_u = bootstrap_ci_pooled(df_curr)

            c_mae = mean_absolute_error(obs, c_pred)
            c_bias = np.mean(c_pred - obs)
            c_rmse = np.sqrt(mean_squared_error(obs, c_pred))

            p_mae = mean_absolute_error(obs, p_pred)
            p_bias = np.mean(p_pred - obs)
            p_rmse = np.sqrt(mean_squared_error(obs, p_pred))

            net_diff = p_mae - c_mae

            print(f"{'POOLED (ALL)':12s} | {var:7s} | {n_tot:4d} | {c_mae:8.3f} C | {p_mae:8.3f} C | {net_diff:+7.3f} C | [{ci_l:6.3f}, {ci_u:6.3f}] | {c_bias:+.2f}/{p_bias:+.2f} C | {c_rmse:.2f}/{p_rmse:.2f} C")

            table_rows.append({
                'dataset': ds_label,
                'evaluation_target': 'served_village_polygon',
                'station_name': 'Pooled (All 3)',
                'station_id': 'ALL_3',
                'prompt_id': 'ALL_3',
                'village_id': 'VARIOUS',
                'village_name': 'Karwar, Honavar, Chitradurga Polygons',
                'variable': var,
                'n_station_days': n_tot,
                'coarse_mae_c': round(c_mae, 4),
                'coarse_bias_c': round(c_bias, 4),
                'coarse_rmse_c': round(c_rmse, 4),
                'served_physics_mae_c': round(p_mae, 4),
                'served_physics_bias_c': round(p_bias, 4),
                'served_physics_rmse_c': round(p_rmse, 4),
                'net_effect_mae_c': round(net_diff, 4),
                'ci_95_lower_c': round(ci_l, 4),
                'ci_95_upper_c': round(ci_u, 4)
            })

    # Save to temperature_table.csv
    out_table = Path(__file__).resolve().parent / "temperature_table.csv"
    df_out = pd.DataFrame(table_rows)
    df_out.to_csv(out_table, index=False)
    print("\n" + "=" * 96)
    print(f"Validation results saved to: {out_table}")
    print("=" * 96)


if __name__ == "__main__":
    main()
