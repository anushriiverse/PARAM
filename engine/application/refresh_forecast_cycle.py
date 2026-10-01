import os
import sys
import time
import math
import json
import urllib.request
from datetime import datetime
from pathlib import Path
import numpy as np
import pandas as pd
import rasterio

ROOT = Path(r"C:\Users\VISHAL\Desktop\SIH, Prototype\sih074-downscale-poc")
sys.path.insert(0, str(ROOT))
from engine.deterministic.agronomic import calc_eto_hargreaves

# 1. Prepare 247 lattice coordinates
lats_arr = np.arange(13.0, 17.51, 0.25)
lons_arr = np.arange(73.5, 76.51, 0.25)
grid_coords = [(round(float(la), 2), round(float(lo), 2)) for la in lats_arr for lo in lons_arr]

lats_str = ','.join(str(c[0]) for c in grid_coords)
lons_str = ','.join(str(c[1]) for c in grid_coords)

url = (
    f"https://api.open-meteo.com/v1/forecast?latitude={lats_str}&longitude={lons_str}"
    f"&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,wind_direction_10m_dominant,wind_speed_10m_max"
    f"&models=ecmwf_ifs025&forecast_days=7&timezone=auto"
)

fetch_ts = datetime.utcnow().isoformat() + "Z"
req = urllib.request.Request(url, headers={'User-Agent': 'AgroMet-LiveDriver/1.0'})

print("Fetching fresh forecast from Open-Meteo ECMWF IFS...")
t0 = time.time()
with urllib.request.urlopen(req, timeout=30) as resp:
    http_status = resp.status
    raw_text = resp.read().decode('utf-8')
    data_list = json.loads(raw_text)

fetch_duration = time.time() - t0
print(f"Fetched {len(data_list)} points in {fetch_duration:.2f}s (HTTP {http_status}).")

# Day 1 is first forecast date (index 0)
sample = data_list[0]
forecast_date = sample['daily']['time'][0]
gen_time_ms = sample.get('generationtime_ms')
date_tag = forecast_date.replace('-', '')

# Update forecast_<date>.json
cache_file = ROOT / "data" / f"forecast_{date_tag}.json"
cache_file.parent.mkdir(parents=True, exist_ok=True)
with open(cache_file, "w", encoding="utf-8") as f:
    json.dump(data_list, f)

# Update forecast_provenance.json
prov_file = ROOT / "data" / "forecast_provenance.json"
provenance = {
    "source_url": "https://api.open-meteo.com/v1/forecast",
    "model": "ecmwf_ifs025",
    "description": "ECMWF Integrated Forecasting System (IFS 0.25°)",
    "forecast_date": forecast_date,
    "point_count": len(data_list),
    "api_http_status": http_status,
    "api_generation_time_ms": gen_time_ms,
    "fetch_timestamp_utc": fetch_ts,
    "lattice_bounds": {
        "lat_min": 13.0, "lat_max": 17.5, "dlat": 0.25,
        "lon_min": 73.5, "lon_max": 76.5, "dlon": 0.25
    },
    "variables": ["precipitation_sum", "temperature_2m_max", "temperature_2m_min", "wind_direction_10m_dominant", "wind_speed_10m_max", "elevation"]
}
with open(prov_file, "w", encoding="utf-8") as f:
    json.dump(provenance, f, indent=2)

# Also mirror provenance to release/data
rel_prov = ROOT / "release" / "data" / "forecast_provenance.json"
rel_prov.parent.mkdir(parents=True, exist_ok=True)
with open(rel_prov, "w", encoding="utf-8") as f:
    json.dump(provenance, f, indent=2)

print(f"Updated {prov_file} and {rel_prov}")

# Map each grid_coord to its forecast
cell_forecast_map = {}
for i, coord in enumerate(grid_coords):
    p = data_list[i]
    d = p['daily']
    wdir = d['wind_direction_10m_dominant'][1]
    cos_val = np.cos(np.radians(wdir - 250.0))
    gate_g = max(0.0, float(cos_val))
    cell_forecast_map[coord] = {
        'precip_sum': float(d['precipitation_sum'][1]),
        'tmax': float(d['temperature_2m_max'][1]),
        'tmin': float(d['temperature_2m_min'][1]),
        'wdir': int(wdir),
        'wspd': round(float(d['wind_speed_max_kmh' if 'wind_speed_max_kmh' in d else 'wind_speed_10m_max'][1]), 1),
        'gate_g': round(gate_g, 4),
        'elevation': float(p.get('elevation', 0.0))
    }

# 2. Load transfer table and apply to all 16,943 villages
df_transfer = pd.read_csv(ROOT / "outputs" / "village_transfer.csv")
d_obj = datetime.strptime(forecast_date, "%Y-%m-%d").date()
doy = d_obj.timetuple().tm_yday

dr = 1.0 + 0.033 * math.cos(2.0 * math.pi * doy / 365.0)
delta = 0.409 * math.sin((2.0 * math.pi * doy / 365.0) - 1.39)

def calc_ra(lat_deg):
    phi = math.radians(lat_deg)
    cos_omega_s = -math.tan(phi) * math.tan(delta)
    cos_omega_s = max(-1.0, min(1.0, cos_omega_s))
    omega_s = math.acos(cos_omega_s)
    Gsc = 0.0820
    Ra = (24.0 * 60.0 / math.pi) * Gsc * dr * (
        omega_s * math.sin(phi) * math.sin(delta) +
        math.cos(phi) * math.cos(delta) * math.sin(omega_s)
    )
    return max(0.0, Ra)

cell_precips = []
rain_mm_list = []
cell_tmax_list = []
cell_tmin_list = []
tmax_list = []
tmin_list = []
tmean_list = []
eto_list = []
w_dir_list = []
w_spd_list = []
gate_g_list = []
eff_ratio_list = []

for _, row in df_transfer.iterrows():
    coord = (round(float(row['node_lat']), 2), round(float(row['node_lon']), 2))
    fc = cell_forecast_map[coord]
    
    g = fc['gate_g']
    eff_ratio = 1.0 + g * (row['rain_ratio'] - 1.0)
    
    # Precipitation
    p_cell = fc['precip_sum']
    p_village = round(p_cell * eff_ratio, 2)
    
    # Temperature
    dt = row['temp_offset_c']
    tmax = round(fc['tmax'] + dt, 2)
    tmin = round(fc['tmin'] + dt, 2)
    tmean = round((tmax + tmin) / 2.0, 2)
    
    # ETo
    ra_val = calc_ra(row['lat'])
    eto = round(calc_eto_hargreaves(tmin, tmax, tmean, ra_val), 2)
    
    cell_precips.append(p_cell)
    rain_mm_list.append(p_village)
    cell_tmax_list.append(fc['tmax'])
    cell_tmin_list.append(fc['tmin'])
    tmax_list.append(tmax)
    tmin_list.append(tmin)
    tmean_list.append(tmean)
    eto_list.append(eto)
    w_dir_list.append(fc['wdir'])
    w_spd_list.append(fc['wspd'])
    gate_g_list.append(g)
    eff_ratio_list.append(round(eff_ratio, 4))

df_daily = pd.DataFrame({
    'village_id': df_transfer['village_id'],
    'name': df_transfer['name'],
    'state': df_transfer['state'],
    'lat': df_transfer['lat'],
    'lon': df_transfer['lon'],
    'elevation_m': df_transfer['elev_m'],
    'forecast_date': forecast_date,
    'cell_precip_sum_mm': cell_precips,
    'rain_ratio': df_transfer['rain_ratio'],
    'wind_dir_deg': w_dir_list,
    'wind_speed_max_kmh': w_spd_list,
    'gate_g': gate_g_list,
    'effective_ratio': eff_ratio_list,
    'rain_mm': rain_mm_list,
    'cell_tmax_c': cell_tmax_list,
    'cell_tmin_c': cell_tmin_list,
    'temp_offset_c': df_transfer['temp_offset_c'],
    'tmax_c': tmax_list,
    'tmin_c': tmin_list,
    'tmean_c': tmean_list,
    'eto_mm_day': eto_list,
    'inside_validated_band': df_transfer['inside_validated_band']
})

out_csv = ROOT / "outputs" / f"village_daily_{date_tag}.csv"
df_daily.to_csv(out_csv, index=False)
df_daily.to_csv(ROOT / "api" / "data" / "village_daily.csv", index=False)

rel_out = ROOT / "release" / "outputs" / f"village_daily_{date_tag}.csv"
if rel_out.parent.exists():
    df_daily.to_csv(rel_out, index=False)
rel_api = ROOT / "release" / "api" / "data" / "village_daily.csv"
if rel_api.parent.exists():
    df_daily.to_csv(rel_api, index=False)

print(f"Wrote refreshed tables to {out_csv} and mirrors.")

# Extract Radhanagari row
rad_row = df_daily[df_daily['name'].str.contains('Radhanagari', case=False, na=False)].iloc[0]
print("\nUpdated Radhanagari Row:")
print(rad_row.to_dict())
