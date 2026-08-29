# 🌊 VARUNA-3D (V.A.R.U.N.A.)
### Volumetric Assessment & Rasterized Underwater NetCDF Analyzer
**SIH 2026 Problem Statement [SIH26067]** | *Ministry of Earth Sciences (MoES) & INCOIS*
---
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D_Engine-Three.js-black.svg?logo=three.js&logoColor=white)](https://threejs.org/)
[![xarray](https://img.shields.io/badge/Data_Engine-xarray_%26_netCDF4-orange.svg)](https://docs.xarray.dev/)
[![INCOIS](https://img.shields.io/badge/Data_Source-INCOIS_ERDDAP-blue.svg)](https://erddap.incois.gov.in/)
[![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)

---
## 📌 Executive Summary & The Core Challenge
India's vast Exclusive Economic Zone (EEZ) and coastline demand continuous, depth-resolved monitoring of ocean state variables. While **INCOIS** routinely generates numerical ocean model outputs (3D fields of temperature, salinity, currents, chlorophyll) and collects autonomous in-situ observations (Argo floats, gliders), an integrated web-based digital twin platform is vital to co-visualize and validate both datasets simultaneously.

**VARUNA-3D** provides a browser-native, interactive 3D platform that integrates multi-dimensional NetCDF model grids with real-time in-situ physical observations across the entire Indian Ocean basin (Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean).

```
                 VARUNA-3D ARCHITECTURE
┌─────────────────────────────────────────────────────────────┐
│ DATA INGESTION & QUALITY CONTROL LAYER                      │
│ - INCOIS 10-Day Model NetCDF (.nc) [ZAX 5m–2000m, 2001–2026]│
│ - Indian ARGO Floats Observations (6.18M QC-Filtered Rows)  │
│ - Weekly High-Res SST & Satellite Chlorophyll-a NetCDFs     │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASTAPI SCIENTIFIC ENGINE (Backend)                         │
│ - xarray Multi-Dataset Normalizer & Depth-Slicing Engine    │
│ - High-Speed Indexed Argo Service (Sub-10ms Queries)        │
│ - SciPy KD-Tree Spatial Indexer & Time-Aware Collocation    │
│ - Statistical Validation Engine (RMSE, Bias, MAE, Pearson r)│
│ - Indian Ocean Calibrated Bathymetry Seafloor Engine        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼  REST API (JSON / CSV Streams)
┌─────────────────────────────────────────────────────────────┐
│ 3D WEBGL CLIENT (React 18 + Three.js + Zustand + Plotly.js) │
│ - 3D Dynamic Ocean Volume with Depth-Slicing Plane          │
│ - 3D Seabed Bathymetry Floor with Continental Ridges        │
│ - Continental Coastlines & Surface Current Flow Particles   │
│ - Interactive Argo Float Surface Markers & 3D Drift Tracks  │
│ - 4D Time Playback Scrubber (2001–2026 Time Series)         │
│ - Plotly.js Depth Profiles & T-S Water Mass Diagram         │
│ - Direct One-Click CSV Validation Report Export             │
└─────────────────────────────────────────────────────────────┘
```

---
## ✨ Key Features
- **Interactive 3D Ocean Volume**: Depth-resolved rendering of ocean temperature and salinity fields across the Indian Ocean (Arabian Sea, Bay of Bengal, Equatorial Indian Ocean).
- **Multi-Dataset Support**: Seamless switching between (1) 3D Model Fields (Temp & Salinity), (2) Weekly Satellite SST, and (3) IRS Satellite Chlorophyll-a.
- **Dynamic Horizontal Depth Slicing**: Real-time slider to slice continuous 3D scalar fields from surface ($0\,\text{m}$) down to abyssal depths ($2000\,\text{m}$) with mixed layer depth presets.
- **3D Seafloor Bathymetry & Coastlines**: Realistic Indian Ocean seabed terrain rendering underwater continental shelves, Central Indian Ridge, and Ninety East Ridge.
- **Surface Current Streamline Particles**: GPU-accelerated particle advection visualizing surface circulation drift.
- **In-Situ Argo Float Trajectories**: Geospatially plotted 3D pins representing 280+ floats with multi-cycle drift tracks.
- **Direct Model-to-Observation Validation**: Collocated profile comparison with **RMSE error**, **mean bias**, **MAE**, and **Pearson correlation ($r$)**.
- **Oceanographic T-S Diagrams**: Temperature-Salinity water mass classification curve (Arabian Sea High Salinity Water, Bay of Bengal Low Salinity Water, etc.).
- **4D Time Scrubber**: Interactive playback bar to animate through 25-year 10-day time steps.
- **Downloadable CSV Validation Reports**: Instant export of depth-resolved residuals and metadata.

---
## 🛠️ Tech Stack
| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend 3D** | React 18, Three.js, React Three Fiber, Drei | 3D WebGL ocean canvas, lighting, camera controls |
| **Frontend UI** | Tailwind CSS, Lucide Icons, Zustand | Responsive operational dashboard & state management |
| **Scientific Charts** | Plotly.js / React-Plotly | Depth vs parameter ($T, S$) validation curve & T-S diagram |
| **Backend API** | Python, FastAPI, Uvicorn | High-performance asynchronous REST endpoints |
| **Scientific Data** | xarray, netCDF4, pandas, numpy, scipy | Multi-dimensional grid slicing & KDTree interpolation |
| **DevOps** | Docker, Docker Compose | Containerized multi-service deployment |

---
## 📡 API Endpoints Overview
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/slice/metadata` | Dimensions, depth levels, time steps, bounds, and variables |
| `GET` | `/api/v1/slice/depth` | 2D horizontal field grid slice at target depth and time |
| `GET` | `/api/v1/observations/floats` | Surface GPS coordinates and metadata of active Argo floats |
| `GET` | `/api/v1/observations/trajectory` | Historical GPS drift track points for an Argo float |
| `GET` | `/api/v1/observations/cycles` | Available profiling cycles for an Argo float |
| `GET` | `/api/v1/validation/profile` | Collocated vertical profile comparison with RMSE & T-S curve |
| `GET` | `/api/v1/validation/export` | Downloadable CSV validation report |
| `GET` | `/api/v1/bathymetry/grid` | Indian Ocean seafloor bathymetric elevation grid |

---
## 🚀 Quickstart & Installation
### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Docker & Docker Compose** (optional)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the 3D application at: `http://localhost:5173/`

### 4. Docker Deployment
```bash
docker-compose up --build
```

---
## 👨‍💻 Contributors
Kuntal Saha ([@kuntalsaha05](https://github.com/kuntalsaha05))

Developed for **Smart India Hackathon (SIH 2026)**
