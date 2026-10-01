import os
import sys
import time
import math
import json
import urllib.request
from datetime import datetime, date
from pathlib import Path
import numpy as np
import pandas as pd
import rasterio

# Project roots
ROOT = Path(r"C:\Users\VISHAL\Desktop\SIH, Prototype\sih074-downscale-poc")
sys.path.insert(0, str(ROOT))
from engine.deterministic.agronomic import calc_eto_hargreaves

# Start timing steps 2-4
t_start_steps_2_4 = time.time()

# ---------------------------------------------------------------------------
# STEP 2: Renormalize Transfer Table
# ---------------------------------------------------------------------------
print("=== [STEP 2] Renormalizing Transfer Stencil ===")
TRANSFER_CSV = ROOT / "outputs" / "village_transfer.csv"
TIF_PATH = ROOT / "outputs" / "rainfall_downscaled_250m.tif"
CORR_CSV = ROOT / "outputs" / "village_corrections.csv"

df_transfer = pd.read_csv(TRANSFER_CSV)
df_corr = pd.read_csv(CORR_CSV, low_memory=False)

with rasterio.open(TIF_PATH) as src:
    r250 = src.read(1)
    bounds = src.bounds
    res_x = src.transform.a
    res_y = abs(src.transform.e)

unique_nodes = df_transfer[['node_lat', 'node_lon']].drop_duplicates().values
rescaling_factors = {}
renorm_errors = {}

for n_lat, n_lon in unique_nodes:
    lat_min, lat_max = n_lat - 0.125, n_lat + 0.125
    lon_min, lon_max = n_lon - 0.125, n_lon + 0.125
    
    r_min = int(np.clip((bounds.top - lat_max) / res_y, 0, r250.shape[0]))
    r_max = int(np.clip((bounds.top - lat_min) / res_y, 0, r250.shape[0]))
    c_min = int(np.clip((lon_min - bounds.left) / res_x, 0, r250.shape[1]))
    c_max = int(np.clip((lon_max - bounds.left) / res_x, 0, r250.shape[1]))
    
    box = r250[r_min:r_max, c_min:c_max]
    box_mean = float(np.mean(box)) if box.size > 0 else 1.0
    raw_ratios = box / box_mean
    clipped_ratios = np.clip(raw_ratios, 0.15, 5.0)
    w_c = float(np.mean(clipped_ratios))
    rescaling_factors[(n_lat, n_lon)] = w_c
    
    renorm_box_ratios = clipped_ratios / w_c
    renorm_errors[(n_lat, n_lon)] = abs(float(np.mean(renorm_box_ratios)) - 1.0)

# Rescale village ratios by cell w_c
rescaled_village_ratios = []
for _, row in df_transfer.iterrows():
    n_key = (row['node_lat'], row['node_lon'])
    w_c = rescaling_factors[n_key]
    r_clip = min(5.0, max(0.15, row['rain_ratio']))
    rescaled_village_ratios.append(r_clip / w_c)

df_transfer['rain_ratio'] = np.round(rescaled_village_ratios, 4)

# Save back to village_transfer.csv
df_transfer.to_csv(TRANSFER_CSV, index=False)
rel_transfer = ROOT / "release" / "outputs" / "village_transfer.csv"
if rel_transfer.parent.exists():
    df_transfer.to_csv(rel_transfer, index=False)

worst_node, worst_err = max(renorm_errors.items(), key=lambda x: x[1])
print(f"Renormalized village_transfer.csv written. Worst cell error: {worst_err*100:.6f}% at node {worst_node}")

# Radhanagari within-cell ratio spread
radha_node_lat, radha_node_lon = 16.5, 74.0
cell_radha = df_transfer[(df_transfer['node_lat'] == radha_node_lat) & (df_transfer['node_lon'] == radha_node_lon)]
min_idx = cell_radha['rain_ratio'].idxmin()
max_idx = cell_radha['rain_ratio'].idxmax()
min_v = cell_radha.loc[min_idx]
max_v = cell_radha.loc[max_idx]
radha_v = cell_radha[cell_radha['name'].str.contains('Radhanagari', case=False, na=False)].iloc[0]

print(f"\nWithin-cell ratio spread for cell ({radha_node_lat}, {radha_node_lon}) [N={len(cell_radha)} villages]:")
print(f"  Min:    {min_v['rain_ratio']:.4f} ({min_v['name']}, elev {min_v['elev_m']:.1f} m)")
print(f"  Median: {cell_radha['rain_ratio'].median():.4f}")
print(f"  Max:    {max_v['rain_ratio']:.4f} ({max_v['name']}, elev {max_v['elev_m']:.1f} m)")
print(f"  Radhanagari itself: {radha_v['rain_ratio']:.4f} (elev {radha_v['elev_m']:.1f} m)")

# ---------------------------------------------------------------------------
# STEP 3: Fetch Live Forecast (Open-Meteo ECMWF IFS)
# ---------------------------------------------------------------------------
print("\n=== [STEP 3] Fetching Live Forecast from Open-Meteo ECMWF IFS ===")
t0_s3 = time.time()

# 0.25 deg lattice points
lats_arr = np.arange(13.0, 17.51, 0.25)
lons_arr = np.arange(73.5, 76.51, 0.25)
grid_lats, grid_lons = [], []
for la in lats_arr:
    for lo in lons_arr:
        grid_lats.append(round(float(la), 2))
        grid_lons.append(round(float(lo), 2))

lats_str = ','.join(map(str, grid_lats))
lons_str = ','.join(map(str, grid_lons))
api_url = f"https://api.open-meteo.com/v1/forecast?latitude={lats_str}&longitude={lons_str}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&models=ecmwf_ifs025&forecast_days=7&timezone=auto"

fetch_ts = datetime.utcnow().isoformat() + "Z"
req = urllib.request.Request(api_url, headers={'User-Agent': 'AgroMet-LiveDriver/1.0'})

with urllib.request.urlopen(req, timeout=25) as resp:
    http_status = resp.status
    raw_text = resp.read().decode('utf-8')
    data_list = json.loads(raw_text)

t_s3 = time.time() - t0_s3

# Extract forecast metadata
sample_point = data_list[0]
model_name = "ecmwf_ifs025"
forecast_date = sample_point['daily']['time'][0]  # First forecast date (Day 1)
generation_time_ms = sample_point.get('generationtime_ms', None)
date_tag = forecast_date.replace('-', '')

# Cache raw response to data/forecast_<YYYYMMDD>.json
cache_file = ROOT / "data" / f"forecast_{date_tag}.json"
cache_file.parent.mkdir(parents=True, exist_ok=True)
with open(cache_file, "w", encoding="utf-8") as f:
    json.dump(data_list, f)

# Write data/forecast_provenance.json
provenance_file = ROOT / "data" / "forecast_provenance.json"
provenance_info = {
    "source_url": "https://api.open-meteo.com/v1/forecast",
    "model": model_name,
    "description": "ECMWF Integrated Forecasting System (IFS 0.25°)",
    "forecast_date": forecast_date,
    "point_count": len(data_list),
    "api_http_status": http_status,
    "api_generation_time_ms": generation_time_ms,
    "fetch_timestamp_utc": fetch_ts,
    "lattice_bounds": {
        "lat_min": 13.0, "lat_max": 17.5, "dlat": 0.25,
        "lon_min": 73.5, "lon_max": 76.5, "dlon": 0.25
    },
    "variables": ["precipitation_sum", "temperature_2m_max", "temperature_2m_min", "elevation"]
}
with open(provenance_file, "w", encoding="utf-8") as f:
    json.dump(provenance_info, f, indent=2)

print(f"Step 3 fetched {len(data_list)} lattice points in {t_s3:.2f}s (HTTP {http_status}).")
print(f"Forecast Date: {forecast_date}, Model: {model_name}")

# Build lookup map for the lattice: (round(lat, 2), round(lon, 2)) -> {precip, tmax, tmin, elev}
cell_forecast_map = {}
for p in data_list:
    la = round(float(p['latitude']), 2)
    lo = round(float(p['longitude']), 2)
    cell_forecast_map[(la, lo)] = {
        'precip_sum': float(p['daily']['precipitation_sum'][1]), # Tomorrow
        'tmax': float(p['daily']['temperature_2m_max'][1]),
        'tmin': float(p['daily']['temperature_2m_min'][1]),
        'elevation': float(p.get('elevation', 0.0))
    }

# ---------------------------------------------------------------------------
# STEP 4: Apply Stencil (Spatial Disaggregation onto Villages)
# ---------------------------------------------------------------------------
print("\n=== [STEP 4] Applying Stencil onto All 16,943 Villages ===")
t0_s4 = time.time()

# 1. FAO-56 Extraterrestrial Radiation Ra for tomorrow's DOY
d_obj = datetime.strptime(forecast_date, "%Y-%m-%d").date()
doy = d_obj.timetuple().tm_yday

def compute_ra_vector(lats_deg, day_of_year):
    lats_rad = np.radians(lats_deg)
    Gsc = 0.0820 # MJ / m^2 / min
    dr = 1.0 + 0.033 * np.cos(2.0 * np.pi * day_of_year / 365.0)
    delta = 0.409 * np.sin((2.0 * np.pi * day_of_year / 365.0) - 1.39)
    tan_prod = -np.tan(lats_rad) * np.tan(delta)
    tan_prod = np.clip(tan_prod, -1.0, 1.0)
    ws = np.arccos(tan_prod)
    ra = (24.0 * 60.0 / np.pi) * Gsc * dr * (
        ws * np.sin(lats_rad) * np.sin(delta) + np.cos(lats_rad) * np.cos(delta) * np.sin(ws)
    )
    return ra

v_lats = df_transfer['lat'].values
ra_vector = compute_ra_vector(v_lats, doy)

# Find Ra for Radhanagari
radha_row_idx = df_transfer[df_transfer['name'].str.contains('Radhanagari', case=False, na=False)].index[0]
radha_ra = ra_vector[radha_row_idx]
print(f"Radhanagari DOY: {doy}, Latitude: {v_lats[radha_row_idx]:.5f}°N -> Extraterrestrial Radiation Ra: {radha_ra:.2f} MJ/m²/day")

# 2. Extract parent cell forecast values for each village
cell_precip_v = np.zeros(len(df_transfer), dtype=np.float32)
cell_tmax_v = np.zeros(len(df_transfer), dtype=np.float32)
cell_tmin_v = np.zeros(len(df_transfer), dtype=np.float32)

for i, (_, row) in enumerate(df_transfer.iterrows()):
    n_key = (round(float(row['node_lat']), 2), round(float(row['node_lon']), 2))
    fc = cell_forecast_map.get(n_key, None)
    if fc is None:
        # Fallback to nearest
        n_key_nearest = min(cell_forecast_map.keys(), key=lambda k: (k[0]-n_key[0])**2 + (k[1]-n_key[1])**2)
        fc = cell_forecast_map[n_key_nearest]
    cell_precip_v[i] = fc['precip_sum']
    cell_tmax_v[i] = fc['tmax']
    cell_tmin_v[i] = fc['tmin']

# 3. Disaggregate
rain_disagg = cell_precip_v * df_transfer['rain_ratio'].values
tmax_disagg = cell_tmax_v + df_transfer['temp_offset_c'].values
tmin_disagg = cell_tmin_v + df_transfer['temp_offset_c'].values
tmean_disagg = (tmax_disagg + tmin_disagg) / 2.0

# 4. Compute ETo via calc_eto_hargreaves
eto_disagg = calc_eto_hargreaves(
    t_min=tmin_disagg,
    t_max=tmax_disagg,
    t_mean=tmean_disagg,
    ra_mj_m2_day=ra_vector
)

# 5. Build daily DataFrame
df_daily = pd.DataFrame({
    'village_id': df_transfer['village_id'],
    'name': df_transfer['name'],
    'state': df_transfer['state'],
    'lat': df_transfer['lat'],
    'lon': df_transfer['lon'],
    'elevation_m': df_transfer['elev_m'],
    'forecast_date': forecast_date,
    'cell_precip_sum_mm': np.round(cell_precip_v, 2),
    'rain_ratio': df_transfer['rain_ratio'],
    'rain_mm': np.round(rain_disagg, 2),
    'cell_tmax_c': np.round(cell_tmax_v, 2),
    'cell_tmin_c': np.round(cell_tmin_v, 2),
    'temp_offset_c': df_transfer['temp_offset_c'],
    'tmax_c': np.round(tmax_disagg, 2),
    'tmin_c': np.round(tmin_disagg, 2),
    'tmean_c': np.round(tmean_disagg, 2),
    'eto_mm_day': np.round(eto_disagg, 2),
    'inside_validated_band': df_transfer['inside_validated_band']
})

DAILY_CSV = ROOT / "outputs" / f"village_daily_{date_tag}.csv"
df_daily.to_csv(DAILY_CSV, index=False)
rel_daily = ROOT / "release" / "outputs" / f"village_daily_{date_tag}.csv"
if rel_daily.parent.exists():
    df_daily.to_csv(rel_daily, index=False)

# Also copy to api/data/village_daily.csv for the serving endpoint
API_DAILY_CSV = ROOT / "api" / "data" / "village_daily.csv"
API_DAILY_CSV.parent.mkdir(parents=True, exist_ok=True)
df_daily.to_csv(API_DAILY_CSV, index=False)
rel_api_daily = ROOT / "release" / "api" / "data" / "village_daily.csv"
if rel_api_daily.parent.exists():
    df_daily.to_csv(rel_api_daily, index=False)

t_s4 = time.time() - t0_s4
t_total_2_4 = time.time() - t_start_total if 't_start_total' in locals() else time.time() - t_start_steps_2_4

print(f"Step 4 complete. Wrote {DAILY_CSV} in {t_s4:.2f}s.")
print(f"Row count: {len(df_daily)}, Null counts: {df_daily.isnull().sum().to_dict()}")

# 3 villages sample
# 1. Radhanagari
radha_sample = df_daily[df_daily['name'].str.contains('Radhanagari', case=False, na=False)].iloc[0]
# 2. Coastal near Karwar (Karwar rural or nearest village)
karwar_sample = df_daily[(df_daily['lat'] >= 14.75) & (df_daily['lat'] <= 14.85) & (df_daily['lon'] <= 74.20)].iloc[0]
# 3. Interior rain-shadow near Chitradurga
chitra_sample = df_daily[(df_daily['lat'] >= 14.15) & (df_daily['lat'] <= 14.30) & (df_daily['lon'] >= 76.35)].iloc[0]

print("\n--- Village 1: Radhanagari (Ghats Crest / Western Slopes) ---")
print(radha_sample.to_dict())

print("\n--- Village 2: Coastal near Karwar ---")
print(karwar_sample.to_dict())

print("\n--- Village 3: Interior Rain Shadow near Chitradurga ---")
print(chitra_sample.to_dict())

print(f"\nTotal wall-clock time for Steps 2-4: {t_total_2_4:.2f} seconds.")
