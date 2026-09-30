# AgroMet Downscaling Platform — Collaborator Handoff Guide

Welcome to the **AgroMet Panchayat Weather Downscaling Platform**. This document is a complete architectural handoff and onboarding guide for collaborators and reviewers.

---

## 1. High-Level Architecture & Repository Split

The project is structured with a clear separation of concerns between the **frontend client application**, the **serverless API backend**, and the **precomputed offline scientific data pipeline**.

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Deployments                   │
├───────────────────────────┬────────────────────────────┤
│  Frontend (agromet-app)   │   Backend (agromet-api)    │
│  https://agromet-app.     │   https://agromet-api.     │
│  vercel.app               │   vercel.app               │
└─────────────┬─────────────┴─────────────┬──────────────┘
              │                           │
              ▼                           ▼
       Directory: app/             Directory: api/
       React 19 + Vite + TS        FastAPI (Python 3.12)
       MapLibre GL + Tailwind      In-Memory Precomputed CSVs
```

### Component Summary

| Component | Repository Directory | Live Production URL | Framework / Runtime | Entry Point |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `app/` | [https://agromet-app.vercel.app](https://agromet-app.vercel.app) | React 19, Vite, TypeScript, Tailwind CSS | `app/index.html` → `app/src/main.tsx` |
| **Backend** | `api/` | [https://agromet-api.vercel.app](https://agromet-api.vercel.app) | FastAPI, Python 3.12 (Vercel Serverless) | `api/index.py` → `api/main.py` |

### Important Directory Disambiguation (`app/` vs `web/`)
- **`app/` is the true production frontend**: This is a modern, responsive Vite React application featuring interactive MapLibre GL mapping, GPS auto-location, crop advisory sheets, and daily weather forecast cards. It is deployed as `agromet-app` on Vercel.
- **`web/` is legacy prototype & presentation**: The repo also contains a `web/` directory from an earlier stage of development (containing vanilla JS demos and the `kaminari_param_deck.html` presentation deck). **`web/` is not linked to Vercel and is not deployed.**

### What a Frontend Reviewer Needs to Touch
- **Work inside `app/`**: All UI components (`app/src/components/`), screens (`app/src/screens/`), API client bindings (`app/src/services/agromet.ts`), styling, and package configs live here.
- **Files a frontend reviewer should NEVER need to touch**:
  - Anything inside `api/` (`main.py`, `index.py`, `requirements.txt`, `vercel.json`, and `api/data/*`).
  - Offline engine and scientific pipelines: `engine/`, `outputs/`, `data/`, `tests/`.

---

## 2. Precomputed Serving Data Inventory

The backend runs entirely on **precomputed, in-memory serving tables**. Zero API keys, zero external database connections, and zero live satellite fetching are required at serving time. All data files are committed to git under `api/data/`:

| File Path | Byte Size | Size (MB) | Purpose & Content |
| :--- | :---: | :---: | :--- |
| `api/data/village_serving.csv` | 1,314,045 | 1.25 MB | Catalog of 16,943 panchayats with centroid lat/lon, elevation, normal JJAS rain, and pre-indexed search tokens. Used by `/api/search` and nearest-neighbor `/api/predict`. |
| `api/data/village_daily.csv` | 3,484,240 | 3.32 MB | Daily 7-day downscaled forecast table for all 16,943 villages (includes ECMWF IFS coarse input, orographic rain ratio, and ML-corrected Tmax). |
| `api/data/village_daily_ml.csv` | 3,484,240 | 3.32 MB | Dedicated ML-corrected temperature table (byte-identical in size and content to `village_daily.csv`). |
| `api/data/village_daily_physics.csv` | 3,399,808 | 3.24 MB | Physics-only temperature table computed using pure environmental lapse-rate (6.5 °C/km) without ML residual corrections. |
| `api/data/rain_stations_transect.csv` | 1,972 | < 0.01 MB | Reference coordinates for 19 NOAA GHCN validation stations across the Western Ghats transect. |

---

## 3. Critical Model Disclosure: Temperature Serving Truth

> [!IMPORTANT]
> **Discrepancy Notice**: Earlier project documentation, commit notes, and repository readmes claimed that temperature downscaling was *purely physics-based lapse rate (6.5 °C/km) on SRTM terrain without machine learning*.  
> **In reality, the live deployment serves ML-corrected maximum temperatures (Tmax).**

### Exact Code Attribution in `api/main.py` (lines 40-50)

```python
# Serving configuration flag: set to False for instant 1-line mid-demo revert to physics-only
SERVE_ML_TEMPERATURE: bool = True

if SERVE_ML_TEMPERATURE:
    DAILY_DATA_PATH = BASE_DIR / "data" / "village_daily_ml.csv"
else:
    DAILY_DATA_PATH = BASE_DIR / "data" / "village_daily_physics.csv"

if not DAILY_DATA_PATH.exists():
    DAILY_DATA_PATH = BASE_DIR / "data" / "village_daily.csv"
```

### Why ML is Served
1. **Tmax (Daytime Maximum)**: An XGBoost diurnal residual correction model (`residual_temp_v2`) is applied on top of the lapse-rate base with a hard clamp ceiling of ±2.0 °C. This reduced out-of-sample MAE from 2.12 °C down to 1.53 °C (a 27.8% improvement across 605 ECMWF IFS station-days).
2. **Tmin (Nighttime Minimum)**: Remains **physics-only lapse rate**. ML was intentionally disabled for Tmin because nocturnal valley inversion dynamics exhibited negative transfer (-14.4%).
3. **Mid-Demo Revert**: If an evaluative reviewer requests pure physics serving with zero ML, setting `SERVE_ML_TEMPERATURE = False` in `api/main.py` instantly flips the live table to `api/data/village_daily_physics.csv`.

---

## 4. Local Run Instructions (Verified)

### Backend Service (`api/`)

#### Windows (PowerShell / CMD)
```powershell
# 1. Navigate to api directory
cd api

# 2. Create and activate virtual environment
python -m venv venv
.env\Scriptsctivate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start FastAPI server
python -m uvicorn main:app --reload --port 8000
```

#### macOS / Linux (Bash / Zsh)
```bash
# 1. Navigate to api directory
cd api

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start FastAPI server
uvicorn main:app --reload --port 8000
```

#### Verification (Local Backend)
Once started, test health and village prediction:
```bash
# Health check
curl http://localhost:8000/api/health
# Output: {"status":"ok"}

# Daily forecast for Jamagaon (KA)
curl "http://localhost:8000/api/daily?lat=15.56&lon=74.37"
# Output: {"village_id":"ka.geojson:28964","name":"Jamagaon","tmax_source":"ml_corrected", ...}
```

---

### Frontend Client (`app/`)

#### Windows (PowerShell / CMD)
```powershell
# 1. Navigate to app directory
cd app

# 2. Install Node dependencies
npm install

# 3. Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

#### macOS / Linux (Bash / Zsh)
```bash
# 1. Navigate to app directory
cd app

# 2. Install Node dependencies
npm install

# 3. Start Vite dev server
npm run dev
```

#### Configuring `VITE_API_BASE`
In `app/src/services/agromet.ts`:
```typescript
export const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
```
- **Local Dev against Local API**: Leave unset; it automatically defaults to `http://localhost:8000`.
- **Local Dev against Live Vercel API**: If you do not want to run the backend locally, create a local environment file `app/.env.local` containing:
  ```env
  VITE_API_BASE=https://agromet-api.vercel.app
  ```
  *(Note: `.env.local` is gitignored and will never be committed).*

#### Production Build Verification
To verify that the frontend compiles cleanly for production:
```bash
cd app
npm run build
```
This builds optimized bundles to `app/dist/` in ~5 seconds.

---

## 5. Deployment Note & Feedback Channel

Both production endpoints are deployed via Vercel CLI from the project lead's machine:
- Live Frontend: `https://agromet-app.vercel.app`
- Live Backend: `https://agromet-api.vercel.app`

Because the projects are currently CLI-deployed, pushing code to GitHub does not automatically trigger a live deploy. If you notice any bugs or visual anomalies during your frontend review, please report them to Vishal Prajapati; fixes will be tested locally and deployed directly to Vercel via CLI.
