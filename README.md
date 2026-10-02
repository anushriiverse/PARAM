# Prototype of PARAM (SIH 2026, Team Kaminari)

Live, orographic weather downscaling engine delivering daily and 7-day panchayat-level agro-meteorological forecasts across Karnataka, Maharashtra, and Goa (16,943 villages).

## Live Deployments

- **Frontend Application**: [https://agromet-app.vercel.app](https://agromet-app.vercel.app)
- **Backend API**: [https://agromet-api.vercel.app/docs](https://agromet-api.vercel.app/docs)

---

## Architecture & Production Scope

| Subsystem | Methodology | Live Serving Scope | Offline Benchmark Scope (Committed Scripts) | Unmeasured / Disclaimed |
| :--- | :--- | :--- | :--- | :--- |
| **Rainfall** | BCSD orographic disaggregation ($0.25^\circ \rightarrow 0.05^\circ$) with mass conservation | 7-day leads ($N=16,943$ villages) served via `/api/daily` & `/api/forecast7` | Median APE 12.35% across 17 served-village gauges (`validation/run_gauge_validation.py`) | Gauges outside validated Western Ghats domain band ($12.8^\circ\text{–}15.3^\circ\text{N}$) |
| **Temperature ($T_{\text{max}}$)** | Physics lapse rate ($6.5^\circ\text{C}/\text{km}$ on 30 m SRTM) + XGBoost v2 residual ($\pm 2.0^\circ\text{C}$ clamped) | Served via `/api/daily` (`tmax_source: ml_corrected`) | Physics baseline MAE: $1.840^\circ\text{C}$ (ERA5, $N=1,500$), $2.122^\circ\text{C}$ (IFS, $N=605$); ML: $1.555^\circ\text{C}$ (ERA5), $1.531^\circ\text{C}$ (IFS) (`validation/run_ml_validation.py`) | Operational 1–7 day forecast error not yet measured; ML offset applied as one diurnal offset per village |
| **Temperature ($T_{\text{min}}$)** | Environmental lapse rate ($6.5^\circ\text{C}/\text{km}$) on 30 m SRTM | Byte-identical physics baseline across all leads | Physics baseline MAE: $1.055^\circ\text{C}$ (ERA5, $N=1,500$), $1.188^\circ\text{C}$ (IFS, $N=605$) (`validation/run_temperature_validation.py`) | Nocturnal valley drainage inversion remains unparameterized; ML degrades Tmin |
| **Evapotranspiration ($ET_0$)** | Hargreaves FAO-56 radiation-temperature model | Precomputed daily $ET_0$ (mm/day) per village | Self-contained vectorized extraterrestrial solar radiation ($R_a$) | Direct lysimeter validation |

---

## Production design (submitted PPT) vs this prototype

| Feature / Component | Status | Prototype Implementation Details & Citations |
| :--- | :--- | :--- |
| **7-day forecast** | Implemented | Live 7-day panchayat forecasts served at [`/api/forecast7`](https://agromet-api.vercel.app/docs) from [`api/data/village_forecast_7day.csv`](api/data/village_forecast_7day.csv) |
| **hourly 168-hour output** | Substituted | 7 days of hourly ECMWF IFS used in the bake; the API serves daily values |
| **village forecasts** | Implemented | Daily weather served for 16,943 panchayats across KA, MH, GA at [`/api/daily`](https://agromet-api.vercel.app/docs) from [`api/data/village_daily.csv`](api/data/village_daily.csv) |
| **ML residual correction** | Implemented | XGBoost v2 diurnal residual model ([`ml/models/residual_temp_v2.json`](ml/models/residual_temp_v2.json)) applied to $T_{\text{max}}$ with $\pm 2.0^\circ\text{C}$ clamp in [`engine/application/bake_daily_forecast.py`](engine/application/bake_daily_forecast.py); served via [`/api/daily`](https://agromet-api.vercel.app/docs) |
| **physics-only fallback** | Implemented | Physics lapse-rate table [`api/data/village_daily_physics.csv`](api/data/village_daily_physics.csv); instant 1-line switch `SERVE_ML_TEMPERATURE=False` in [`api/main.py`](api/main.py) |
| **ET0** | Implemented | Hargreaves-Samani potential evapotranspiration computed in [`engine/application/bake_daily_forecast.py`](engine/application/bake_daily_forecast.py) and served in [`api/data/village_daily.csv`](api/data/village_daily.csv) (`et0_hs_mm`) |
| **humidity and pressure** | Production design (not in prototype) | Planned for operational production deployment; not served by prototype `/api/daily` or `village_daily.csv` |
| **PostgreSQL/TimescaleDB** | Substituted | High-performance in-memory Pandas/CSV tables loaded at cold start ($<10\text{ ms}$) in [`api/main.py`](api/main.py) rather than external relational database cluster |
| **NDVI/satellite** | Production design (not in prototype) | Planned high-resolution Sentinel-2 / MODIS vegetative index ingestion pipeline for operational deployment |
| **IMD API** | Not used in the prototype | ECMWF IFS via Open-Meteo is the driver; IMD gauges are used for validation only. |
| **irrigation/crop advisory and alerts** | Production design (not in prototype) | Agronomic advisory engine, crop growth stages, and threshold alert logic planned for production deployment |
| **SMS/WhatsApp/IVRS** | Production design (not in prototype) | Multi-channel farmer alert gateway planned for production integration |
| **Android** | Substituted | Mobile-first responsive React 19 PWA deployed at [`https://agromet-app.vercel.app`](https://agromet-app.vercel.app) (installable on Android homescreen); native Android APK planned for production |

---

## Forecast Data Refresh Policy

Forecasts in this prototype update only when the offline bake (`engine/application/bake_daily_forecast.py`) is re-run and the backend API is manually redeployed with updated precomputed CSVs. The `forecast_date` field in API responses reflects the cycle date of the last manual bake. There is no scheduled cron job or automated background ingestion pipeline.

---

## Canonical Performance Metrics (Script-Verified Only)

Every metric below is generated by a committed validation script against ground-truth station observations:

```
========================================================================================
CANONICAL PERFORMANCE METRICS (VERIFIED BY COMMITTED SCRIPTS)
========================================================================================
1. RAINFALL DOWNSCALING (Script: validation/run_gauge_validation.py)
   - Truth Source: 19 historical IMD rain gauges (JJAS seasonal normals; most records stopped ~1970).
     Exclusions: Chitradurga excluded from headline (used to fit asymptotic P_inf); Agumbe (IN009181800) and
     Agumbe Obsy (IN009183600) merged to single village ka.geojson:5921 (mean obs: 6,911.6 mm) -> Headline N=17.
   - Headline Metrics (Chitradurga Excluded, Agumbe Merged, N=17):
     * Windward / Crest (N=10):
       - σ=0 km (Base):  Median APE = 7.57%, Mean MAE = 642.5 mm | Count >25%: 1/10
       - σ=20 km (Disp): Median APE = 7.57%, Mean MAE = 642.5 mm | Count >25%: 1/10
     * Lee Side (N=7):
       - σ=0 km (Base):  Median APE = 28.04%, Mean MAE = 560.9 mm | Count >25%: 5/7
       - σ=20 km (Disp): Median APE = 19.92%, Mean MAE = 466.8 mm | Count >25%: 3/7
     * Pooled (N=17):
       - σ=0 km (Base):  Median APE = 12.35%, Mean MAE = 608.9 mm | Count >25%: 6/17
       - σ=20 km (Disp): Median APE = 12.35%, Mean MAE = 570.1 mm | Count >25%: 4/17
     * Lateral Dispersion Transition (σ=0 -> σ=20 km): Improved = 6, Unchanged = 10, Degraded = 1 (Thirthahalli 0.50% -> 19.81%)
   - Note on Spread: Medians hide wide gauge-level spread:
     Underpredicted crest/lee stations include Chickmagalur (61.44% APE at σ=20 km), Hulikal (53.13%), Sagar (41.46%), and Hosanagar (33.05%).
   - Mass Conservation:
     * Algorithm Level (Exact): Theoretical area-weighted conservation Δ = 0.0 mm/cell across all cells when ratios normalized.
     * Served Rounded Values: Worst-cell deviation is 0.5273 mm (unrounded) and 0.5277 mm (served 2-decimal rounded) at cell (15.0°N, 75.25°E) on 2026-10-05 due to unnormalized village transfer ratios.

2. TEMPERATURE PHYSICS BASELINE (Script: validation/run_temperature_validation.py)
   - Truth Source: NOAA GHCN daily surface stations (Karwar, Honavar, Chitradurga; 100% spatial holdouts)
   - Aggregation Window: 12:00 UTC (day-1) to 12:00 UTC (day-0) for observation matching; operational serving groups by IST calendar day (00:00 to 23:59 IST).
   - Physics Baseline MAE (ERA5, N=1,500): 1.840 °C (Tmax), 1.055 °C (Tmin)
   - Physics Baseline MAE (ECMWF IFS, N=605): 2.122 °C (Tmax), 1.188 °C (Tmin)

3. ML RESIDUAL TEMPERATURE CORRECTION (Script: validation/run_ml_validation.py)
   - Truth Source: NOAA GHCN daily surface stations (Karwar, Honavar, Chitradurga; 100% spatial holdouts)
   - Aggregation Window: 12:00 UTC (day-1) to 12:00 UTC (day-0) for observation matching; operational serving groups by IST calendar day (00:00 to 23:59 IST).
   - Tmax Benchmark (N=1,500 ERA5, N=605 ECMWF IFS):
     * ERA5 (N=1,500):      Physics MAE = 1.840 °C | Physics+ML (v2) MAE = 1.555 °C | Paired Diff: -0.285 °C (95% CI: [-0.338, -0.231])
     * ECMWF IFS (N=605):  Physics MAE = 2.122 °C | Physics+ML (v2) MAE = 1.531 °C | Paired Diff: -0.591 °C (95% CI: [-0.677, -0.504])
   - Tmin Benchmark (Justifying Pure-Physics Serving Policy):
     * ERA5 (N=1,500):      Physics MAE = 1.055 °C | Physics+ML (v2) MAE = 1.139 °C | Paired Diff: +0.084 °C (95% CI: [+0.002, +0.165])
     * ECMWF IFS (N=605):  Physics MAE = 1.188 °C | Physics+ML (v2) MAE = 1.350 °C | Paired Diff: +0.162 °C (95% CI: [+0.056, +0.266])
   - Operational Serving Policy: Applied to Tmax only with hard ±2.0 °C clamp; Tmin stays pure physics (ML degrades Tmin by +0.084 to +0.162 °C).
     Operational 1–7 day forecast error is not yet measured.
========================================================================================
```

---

## Quickstart: Running Locally

### 1. Backend API (`api/`)

Runs fully offline using in-memory precomputed tables (~11 MB, committed in repository).

```bash
# Clone and enter api directory
cd api

# Create and activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate
# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies and launch
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Visit `http://localhost:8000/api/daily?lat=15.56&lon=74.37` or `http://localhost:8000/docs`.

### 2. Frontend Application (`app/`)

React 19 + TypeScript + Vite + MapLibre GL mobile-first PWA.

```bash
# Enter app directory
cd app

# Install dependencies
npm install

# Connect to local API (or leave unset to default to http://localhost:8000)
# Windows (PowerShell):
Set-Content -Path .env.local -Value "VITE_API_BASE=http://localhost:8000"
# macOS / Linux:
echo "VITE_API_BASE=http://localhost:8000" > .env.local

# Run development server
npm run dev

# Build production bundle
npm run build
```

---

## Data Sources

- **Open-Meteo**: Weather forecast and historical reanalysis APIs ([CC BY 4.0](https://open-meteo.com/)).
- **ECMWF IFS & ERA5**: Coarse meteorological drivers obtained via Open-Meteo API.
- **NOAA GHCN-Daily**: In-situ daily temperature and precipitation observations (Public Domain).
- **SRTM 30m DEM**: NASA / USGS Shuttle Radar Topography Mission elevation model (Public Domain).
- **Rain Gauges**: KSNDMC & IMD daily monsoon rainfall records across Western Ghats transects.
- **Maharashtra AWS Station Data** (`data/cache/ml_temp/clean_training_data.csv`): Maharashtra NWDP AWS network (National Water Development Programme, Agriculture Dept., Govt. of Maharashtra; stations: Aurangpur [2023], Bhatsanagar_1 [2024], Natuwadi Dam_1 [2024]).

---

## Model Disclaimer

> Tmax: physics lapse-rate correction plus XGBoost diurnal residual (clamped +/-2.0 C); Tmin: physics only; ML offsets derived per date from hourly ECMWF IFS (0.25 deg) forecast; 1-7 day operational forecast error is not yet measured.

