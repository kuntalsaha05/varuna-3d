# 🌊 VARUNA-3D (V.A.R.U.N.A.)
### Volumetric Assessment & Rasterized Underwater NetCDF Analyzer
**SIH 2026 Problem Statement [SIH26067]** | *Ministry of Earth Sciences (MoES) & INCOIS*
---
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D_Engine-Three.js-black.svg?logo=three.js&logoColor=white)](https://threejs.org/)
[![xarray](https://img.shields.io/badge/Data_Engine-xarray_%26_netCDF4-orange.svg)](https://docs.xarray.dev/)
[![INCOIS](https://img.shields.io/badge/Data_Source-INCOIS_ERDDAP-blue.svg)](https://erddap.incois.gov.in/)
---
## 📌 Executive Summary & The Core Challenge
India's vast Exclusive Economic Zone (EEZ) and coastline demand continuous, depth-resolved monitoring of ocean state variables. While **INCOIS** routinely generates numerical ocean model outputs (3D fields of temperature, salinity, currents, chlorophyll) and collects autonomous in-situ observations (Argo floats, gliders), no integrated web-based platform previously existed to co-visualize and validate both datasets simultaneously.

**VARUNA-3D** bridges this gap with a browser-native, interactive 3D platform that integrates multi-dimensional NetCDF model grids with real-time in-situ physical observations.

```
                 VARUNA-3D ARCHITECTURE
┌─────────────────────────────────────────────────────────────┐
│ DATA INGESTION LAYER                                        │
│ - INCOIS 10-Day Model NetCDF (.nc) [Lon x Lat x Depth]     │
│ - Indian ARGO Floats Observations (.csv / .nc)              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASTAPI DATA ENGINE (Backend)                               │
│ - xarray Subsetter & Depth-Slicing Engine                   │
│ - Float Spatial Indexer & Profile Extractor                  │
│ - Statistical Validation Engine (RMSE & Mean Bias)          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
                   REST API (JSON / Buffers)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3D WEBGL CLIENT (React + Three.js)                          │
│ - 3D Dynamic Ocean Volume with Depth-Slicing Plane          │
│ - Interactive Argo Float Surface Markers & Raycasting       │
│ - Vertical Exaggeration Controller (5x - 80x)               │
│ - Plotly.js In-situ vs Model Depth Profile Chart Modal      │
└─────────────────────────────────────────────────────────────┘
```

---
## ✨ Key Features
- **Interactive 3D Ocean Volume**: Depth-resolved rendering of ocean temperature and salinity fields across the Indian Ocean (Arabian Sea, Bay of Bengal, Equatorial Indian Ocean).
- **Dynamic Horizontal Depth Slicing**: Real-time slider to slice continuous 3D scalar fields from surface ($0\,\text{m}$) down to abyssal depths ($2000\,\text{m}$).
- **Vertical Exaggeration Controls**: Custom depth scaling ($5\times$ to $80\times$) to prevent bathymetry flattening and make depth thermoclines immediately perceivable.
- **In-Situ Argo Float Marker Overlay**: Geospatially plotted 3D pins representing active autonomous floats.
- **Direct Model-to-Observation Validation**: Clicking any Argo float extracts the real sensor profile and compares it directly against the model's collocated prediction, calculating **RMSE error** and **mean bias anomaly**.
- **Lightweight & Modular**: High async throughput backend powered by FastAPI + xarray with zero client-side dependencies.
---
## 🛠️ Tech Stack
| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend 3D** | React 18, Three.js, React Three Fiber, Drei | 3D WebGL ocean canvas, lighting, camera controls |
| **Frontend UI** | Tailwind CSS, Lucide Icons, Zustand | Responsive operational dashboard & state management |
| **Scientific Charts** | Plotly.js / React-Plotly | Depth vs parameter ($T, S$) validation curve plotting |
| **Backend API** | Python, FastAPI, Uvicorn | High-performance asynchronous REST endpoints |
| **Scientific Data** | xarray, netCDF4, pandas, numpy, scipy | Multi-dimensional grid slicing & profile interpolation |
| **Data Source** | INCOIS ERDDAP, Coriolis GDAC | Real-world gridded models & Argo profiles |
---
## 📂 Project Structure
```
varuna-3d/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entrypoint
│   │   ├── config.py               # Centralized dataset paths & configuration
│   │   ├── schemas/                # Pydantic models for API validation
│   │   │   ├── float_schema.py
│   │   │   └── grid_schema.py
│   │   ├── core/                   # Core scientific computation engines
│   │   │   ├── netcdf_parser.py    # xarray NetCDF slicing & interpolation
│   │   │   ├── csv_parser.py       # Pandas in-situ observation parser
│   │   │   ├── spatial_indexer.py  # SciPy KDTree spatial matching
│   │   │   └── exporter.py         # Binary Float32 buffer / FlatBuffers
│   │   └── api/v1/
│   │       ├── router.py           # Master API router
│   │       └── endpoints/
│   │           ├── model_slices.py # Endpoints: /slice (2D), /volume (3D)
│   │           ├── observations.py # Endpoints: /floats, /gliders, /profile-data
│   │           ├── validation.py   # Statistical validation (Model vs. Obs RMSE)
│   │           └── bathymetry.py   # Seafloor depth profile endpoint
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/                 # 3D models, shaders, colormaps
│   ├── src/
│   │   ├── App.tsx                 # Main React dashboard
│   │   ├── components/
│   │   │   ├── Viewport3D.tsx      # Three.js / Cesium.js canvas viewport
│   │   │   ├── VolumeRenderer.tsx  # Volumetric raymarching mesh controller
│   │   │   ├── CurrentVectorField.tsx # 3D vector particles / streamline system
│   │   │   ├── FloatMarkersLayer.tsx # 3D markers & glider trajectory polylines
│   │   │   ├── ProfileChartModal.tsx # Plotly chart: Model vs. In-Situ profile
│   │   │   ├── TimeScrubber.tsx    # 4D time playback slider
│   │   │   ├── DepthSlider.tsx     # Depth-slicing & Vertical Exaggeration
│   │   │   └── PaletteEditor.tsx   # Dynamic colorbar range clamping
│   │   ├── hooks/
│   │   │   ├── useModelData.ts     # React-query hook to stream 3D slices
│   │   │   └── useObservations.ts  # Hook to fetch Argo/Glider points
│   │   ├── state/
│   │   │   └── store.ts            # Zustand state (variable, depth, time)
│   │   └── utils/
│   │       ├── colorScales.ts      # Linear & logarithmic palette interpolation
│   │       └── coordinateTransforms.ts # WGS84 (Lat/Lon/Depth) to 3D Cartesian
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── data/                           # Local NetCDF, CSV, and GeoTIFF datasets
├── docker-compose.yml              # Multi-container orchestration (FastAPI + React)
└── README.md
```

---
## 🚀 Quickstart & Installation
### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### 2. Backend Setup
```bash
cd backend
# Install Python scientific dependencies
pip install -r requirements.txt
# Start the FastAPI engine
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
# Install Node dependencies
npm install
# Start Vite development server
npm run dev
```
Access the 3D application at: `http://localhost:5173/`

---
## 📡 API Endpoints Overview
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/slice/metadata` | Available variables, depth levels, and bounding box |
| `GET` | `/api/v1/slice/depth` | 2D horizontal field grid slice at target depth and time |
| `GET` | `/api/v1/observations/floats` | Surface GPS coordinates and metadata of active Argo floats |
| `GET` | `/api/v1/validation/profile` | Collocated vertical profile comparison with RMSE anomaly |

---
## 🔮 Roadmap
- **Volumetric GPU Raymarching**: 3D Texture shader for smooth continuous volumetric fog rendering.
- **Glider Mission Trajectories**: 3D underwater sawtooth trajectory paths for autonomous gliders.
- **Ocean Current Streamlines**: Dynamic particle vector flow advection ($u, v, w$).
- **Biogeochemical (BGC) Layers**: Dissolved Oxygen, Chlorophyll-a, and pH iso-surfaces.

---
## 👨‍💻 Contributors
Kuntal Saha ([@kuntalsaha05](https://github.com/kuntalsaha05))

Developed for **Smart India Hackathon (SIH 2026)**
