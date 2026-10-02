# Prototype of PARAM (SIH 2026, Team Kaminari)
## Engineering Handoff & Architecture Guide

Live deployments:
- **Frontend App**: [https://agromet-app.vercel.app](https://agromet-app.vercel.app)
- **Backend API**: [https://agromet-api.vercel.app](https://agromet-api.vercel.app)

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
- A single diurnal temperature residual offset (`ml_offset_tmax_c`) is computed per village from a 24-hour IFS forecast lattice ($N=247$ points $\times 24$ hours) using XGBoost v2.
- The offset is bounded by a hard ceiling of $\pm 2.0^\circ\text{C}$ (`clamp_limit_c = 2.0`).
- Applied operationally as: $T_{\text{max, served}} = T_{\text{max, physics}} + \Delta_{\text{ML}}$.
- Operational 1–7 day decay error is unmeasured prior to continuous multi-season operational tracking.

### 1-Line Revert to Pure Physics:
Set `SERVE_ML_TEMPERATURE = False` in `api/main.py` and restart/redeploy. The backend will instantly serve `village_daily_physics.csv` with zero ML adjustments.

---

## 3. Production Scope vs Offline Benchmarks

| Feature | Production Status | Source of Truth / Verification |
| :--- | :--- | :--- |
| **Orographic Rain (7-day)** | Live on `/api/daily` & `/api/forecast7` | 16.09% median APE via `validation/run_gauge_validation.py` |
| **Physics Lapse Rate** | Live fallback for $T_{\text{max}}$, active for $T_{\text{min}}$ | $1.84^\circ\text{C}$ ERA5 / $2.12^\circ\text{C}$ IFS via `validation/run_temperature_validation.py` |
| **ML $T_{\text{max}}$ Correction** | Live on `/api/daily` (clamped $\pm 2.0^\circ\text{C}$) | Offline research benchmark; 1-7 day operational error not yet measured |
| **Soil Water & Advisories** | **Excluded from production** | Kept in local-only research archives |

---

## 4. Verified Numbers Block (Committed Scripts Only)

```
========================================================================================
CANONICAL MEASUREMENTS (FROM COMMITTED SCRIPTS)
========================================================================================
- Rainfall Accuracy:      16.09 % Median APE (N=17 served-village rain gauges)
                          Script: validation/run_gauge_validation.py
- Physics Tmax MAE:       1.84 °C (ERA5, N=1,500) | 2.12 °C (ECMWF IFS, N=605)
                          Script: validation/run_temperature_validation.py
- Physics Tmin MAE:       1.05 °C (ERA5, N=1,500) | 1.19 °C (ECMWF IFS, N=605)
                          Script: validation/run_temperature_validation.py
- ML-Corrected Tmax:      Hard ±2.0 °C clamp applied; operational 1-7 day error unmeasured
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
