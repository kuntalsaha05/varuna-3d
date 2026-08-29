# Varuna-3D Documentation
### Volumetric Assessment & Rasterized Underwater NetCDF Analyzer
**SIH 2026 Problem Statement [SIH26067]** | *Ministry of Earth Sciences (MoES) & INCOIS*

---

## 1. Project Overview

**VARUNA-3D** is an interactive 3D ocean digital twin and statistical validation platform designed for the Smart India Hackathon (SIH 2026). The platform bridges numerical ocean models with autonomous in-situ observations across the entire Indian Ocean basin (Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean).

It allows oceanographers, fisheries managers, and climate researchers to explore:
- **3D Ocean Grids**: Depth-resolved fields of Temperature ($0-2000\,\text{m}$), Salinity, and Model Uncertainty from the INCOIS McCreary 10-day objective analysis.
- **Satellite Remote Sensing Layers**: High-resolution weekly Sea Surface Temperature (SST) and IRS Satellite Ocean Color Chlorophyll-a.
- **Autonomous In-Situ Argo Floats**: 280+ active and historical profiling floats with over 6.18 million quality-controlled data points.
- **Statistical Collocation & Validation Engine**: Instantaneous calculation of RMSE error anomaly, mean bias, MAE, Pearson correlation ($r$), and water mass classification.
- **Interactive 3D WebGL Visualization**: Three.js WebGL canvas featuring dynamic depth slicing, continental coastlines, 3D seabed bathymetry with oceanic ridges, particle current streamlines, and float drift trajectories across profiling cycles.

---

## 2. Integrated Datasets

| Dataset | File Path | Format | Dimensions / Coordinates | Key Variables |
| :--- | :--- | :--- | :--- | :--- |
| **INCOIS McCreary 10-Day Model** | `data/1_model_grid-3d/incois_argo_10day_McCreary_FULL.nc` | NetCDF4 | Time (921 steps: 2001–2026), ZAX (24 depth levels: 5m–2000m), Lat (-29.5° to 29.5°), Lon (30.5° to 119.5°) | `T_ANALYZED` (Temp), `S_ANALYZED` (Salinity), `T_MEAN`, `S_MEAN`, `T_STDEV`, `S_STDEV`, `T_RMSE`, `S_RMSE` |
| **Indian Ocean Argo In-Situ Observations** | `data/2_in_situ_observations/Indian_ARGO_Floats_FULL.csv` | CSV (6.48M rows) | 280 unique floats, cycle numbers, GPS coords, pressure levels ($0-2000\,\text{dbar}$) | `PRES` (dbar), `TEMP` (°C), `PSAL` (PSU), `time`, `latitude`, `longitude`, `CYCLE_NUMBER` |
| **INCOIS Weekly High-Res SST** | `data/3_sst/incois_argo_sst_weekly_FULL.nc` | NetCDF4 | Time (104 weeks), Lat (241), Lon (361) | `ASST` (Argo SST), `ERR` |
| **IRS Satellite Chlorophyll-a** | `data/4_chlorophyll/IRS_chlorophyll_datasets_FULL.nc` | NetCDF4 | Time (97 steps), Lat (2556), Lon (4315) | `CHLOROPHYLL` ($\text{mg}/\text{m}^3$) |

---

## 3. System Architecture

```
                                  VARUNA-3D ARCHITECTURE
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ DATA INGESTION & QUALITY CONTROL LAYER                                                  │
│ - INCOIS 10-Day 3D Model NetCDF (ZAX 5m-2000m, 25-Year Time Series)                     │
│ - Indian Ocean Argo Profiling Floats (6.18M QC-Verified Measurements)                  │
│ - Weekly High-Resolution SST & IRS Chlorophyll-a Satellite NetCDF                       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FASTAPI SCIENTIFIC ENGINE (Backend)                                                    │
│ - Generalized NetCDF Multi-Dataset Dimension Normalizer & Depth Slicer                 │
│ - In-Memory Indexed Argo Service (Sub-10ms Trajectory & Profile Retrieval)             │
│ - SciPy KD-Tree Spatial Indexer & Time-Aware Collocation Engine                         │
│ - Statistical Validation Engine (RMSE, Mean Bias, MAE, Pearson r, Water Mass Class)    │
│ - Indian Ocean Calibrated Bathymetry Seafloor Service                                  │
│ - CSV Validation Report Export Engine                                                  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼  REST API (JSON & CSV Streams)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3D WEBGL CLIENT (React 18 + Three.js + Zustand + Plotly.js)                             │
│ - 3D Bounding Box with Dynamic Depth Slicing Plane & Multi-Palette DataTextures        │
│ - 3D Bathymetric Seafloor Mesh with Continental Shelves & Mid-Ocean Ridges             │
│ - Continental Coastline Vectors for Indian Subcontinent, Africa, Arabia, SE Asia       │
│ - Interactive 3D Argo Pins with Glowing Beacons & Multi-Cycle Drift Trajectory Paths   │
│ - Animated Surface Current Flow Streamline Particles                                   │
│ - 4D Time Playback Scrubber (Play / Pause / Speed Controls across 2001-2026)           │
│ - Plotly Modal: Depth Profile Curves + Temperature-Salinity (T-S) Water Mass Diagram   │
│ - One-Click CSV Validation Report Download                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/slice/metadata` | Returns dimensions, depth levels, time steps, coordinate bounds, and variables for selected `dataset_type` (`model_3d`, `sst`, `chlorophyll`). |
| `GET` | `/api/v1/slice/depth` | Returns 2D grid matrix slice at target `depth`, `time_index`, `variable`, and `dataset_type`. |
| `GET` | `/api/v1/observations/floats` | Returns list of active Argo floats with latest GPS coordinates, measurement timestamps, and cycle counts. |
| `GET` | `/api/v1/observations/trajectory` | Returns chronological GPS drift track points across all historical cycles for an Argo float (`platform_number`). |
| `GET` | `/api/v1/observations/cycles` | Returns list of available profiling cycle numbers for a specific float. |
| `GET` | `/api/v1/validation/profile` | Collocated vertical profile comparison (Model vs In-Situ) with statistical error metrics (RMSE, Bias, MAE, Pearson $r$) and T-S water mass classification. |
| `GET` | `/api/v1/validation/export` | Generates and downloads a complete CSV validation report. |
| `GET` | `/api/v1/bathymetry/grid` | Returns calibrated seabed bathymetric elevation grid for Indian Ocean 3D seafloor rendering. |

---

## 5. Scientific Colormaps & Visual Scaling

VARUNA-3D incorporates perceptually uniform scientific colormaps:
- **Thermal** (`cmocean thermal`): Temperature fields ($2^\circ\text{C}$ to $32^\circ\text{C}$).
- **Haline** (`cmocean haline`): Salinity fields ($32$ to $37\,\text{PSU}$).
- **Algae** (`cmocean algae`): Satellite Chlorophyll-a ($0.01$ to $10.0\,\text{mg}/\text{m}^3$).
- **Turbo**: Smooth high-contrast rainbow palette for variance and uncertainty analysis.
- **Viridis**: Perceptually uniform multi-purpose colormap.
- **CoolWarm**: Diverging anomalies and residual error visualizer.

---

## 6. Installation & Quickstart

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Docker & Docker Compose** (optional)

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Client Application: `http://localhost:5173/`

### 3. Docker Deployment
```bash
docker-compose up --build
```

---

## 7. Running Backend Unit Tests

The backend includes a comprehensive automated test suite verifying NetCDF ingestion, Argo indexing, KDTree collocation, validation calculations, and API endpoints:
```bash
python -c "
import sys
sys.path.insert(0, 'backend')
from tests.test_backend import *
# Runs full test suite
"
```
*(10/10 tests pass)*

---

*Updated for SIH 2026 — Ministry of Earth Sciences & INCOIS*

