# Prototype of PARAM (SIH 2026, Team Kaminari)
## Engineering Handoff & Architecture Guide

Live deployments:
- **Frontend App**: [https://agromet-app.vercel.app](https://agromet-app.vercel.app)
- **Backend API**: [https://agromet-api.vercel.app/docs](https://agromet-api.vercel.app/docs)

---

## 1. System Architecture

```
                  Client Layer (agromet-app.vercel.app)
               React 19 + TypeScript + Vite + MapLibre GL
                                   │
                                   ▼ HTTP (JSON)
                  Server Layer (agromet-api.vercel.app)
                  FastAPI on Python 3.12 Serverless
                                   │
                                   ▼
             In-Memory Precomputed Tables (api/data/*.csv)
          16,943 Panchayats | 7 Leads | 100% Offline Serving
```

### Served Components:
1. **Frontend (`app/`)**: Client PWA displaying live downscaled weather, orographic precipitation bands, temperature extremes, and interactive radar/map overlays.
2. **Backend (`api/`)**: High-performance FastAPI server delivering nearest-neighbor geospatial lookups in $< 10\text{ ms}$ cold start from committed CSV tables.
3. **Data (`api/data/`)**: Self-contained tables (`village_serving.csv`, `village_daily.csv`, `village_daily_ml.csv`, `village_daily_physics.csv`, `village_forecast_7day.csv`). Contains pure meteorological columns with zero unverified agronomic fields.

---

## 2. Temperature Serving Configuration & Mid-Demo Revert

The served maximum temperature ($T_{\text{max}}$) is ML-corrected by default, while minimum temperature ($T_{\text{min}}$) remains pure lapse-rate physics:

```python
# api/main.py:41
SERVE_ML_TEMPERATURE: bool = True
```

### How ML Tmax is Applied:
- A diurnal temperature residual offset (`ml_offset_tmax_c`) is computed per village per lead from hourly IFS forecasts (using UTC hour/doy features and IST calendar day grouping) using XGBoost v2 (`residual_temp_v2.json`).
- The offset is bounded by a hard ceiling of $\pm 2.0^\circ\text{C}$ (`clamp_limit_c = 2.0`).
- Applied operationally as: $T_{\text{max, served}} = T_{\text{max, physics}} + \Delta_{\text{ML}}$.
- Operational 1–7 day decay error is unmeasured prior to continuous multi-season operational tracking.

### 1-Line Revert to Pure Physics:
Set `SERVE_ML_TEMPERATURE = False` in `api/main.py` and restart/redeploy. The backend will instantly serve `village_daily_physics.csv` with zero ML adjustments.

---

## 3. Production Scope vs Offline Benchmarks

| Feature | Production Status | Source of Truth / Verification |
| :--- | :--- | :--- |
| **Orographic Rain (7-day)** | Live on `/api/daily` & `/api/forecast7` | 13.27% median APE (mean MAE 582.4 mm) via `validation/run_gauge_validation.py` |
| **Physics Lapse Rate** | Live fallback for $T_{\text{max}}$, active for $T_{\text{min}}$ | $1.840^\circ\text{C}$ ERA5 / $2.122^\circ\text{C}$ IFS via `validation/run_temperature_validation.py` |
| **ML $T_{\text{max}}$ Correction** | Live on `/api/daily` & `/api/forecast7` (clamped $\pm 2.0^\circ\text{C}$) | $1.555^\circ\text{C}$ ERA5 ($N=1,500$) / $1.531^\circ\text{C}$ IFS ($N=605$) via `validation/run_ml_validation.py`; 1–7 day operational error unmeasured |

---

## 4. Verified Numbers Block (Committed Scripts Only)

```
========================================================================================
CANONICAL MEASUREMENTS (FROM COMMITTED SCRIPTS)
========================================================================================
- Rainfall Accuracy:      13.27 % Median APE (N=17 served-village rain gauges; windward 5.84%, lee 22.92%)
                          Script: validation/run_gauge_validation.py
- Physics Tmax MAE:       1.840 °C (ERA5, N=1,500) | 2.122 °C (ECMWF IFS, N=605)
                          Script: validation/run_temperature_validation.py
- Physics Tmin MAE:       1.055 °C (ERA5, N=1,500) | 1.188 °C (ECMWF IFS, N=605)
                          Script: validation/run_temperature_validation.py
- ML-Corrected Tmax MAE:  1.555 °C (ERA5, N=1,500) | 1.531 °C (ECMWF IFS, N=605)
                          Paired Diff: -0.285 °C (ERA5, 95% CI [-0.338, -0.231]) | -0.591 °C (IFS, 95% CI [-0.677, -0.504])
                          Stations: Karwar, Honavar, Chitradurga (spatial holdouts)
                          Script: validation/run_ml_validation.py
                          Hard ±2.0 °C clamp applied; 1-7 day operational error unmeasured
                          Window: 12 UTC to 12 UTC for obs matching; IST calendar day for serving
========================================================================================
```

---

## 5. Local Reproduction Steps

### Terminal 1: Backend API
```bash
cd api
# Setup venv (Windows: python -m venv venv && .\venv\Scripts\activate)
# Setup venv (macOS/Linux: python3 -m venv venv && source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Terminal 2: Frontend App
```bash
cd app
npm install
npm run dev
# App starts at http://localhost:5173
```
