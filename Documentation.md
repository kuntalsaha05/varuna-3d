# Varuna-3D Documentation

## 1. Project Overview

**Varuna-3D** is an interactive 3D ocean visualization and analytics platform developed for the Smart India Hackathon (SIH) 2026. The project transforms multi-dimensional oceanographic datasets into immersive 3D visualizations, enabling researchers and analysts to explore marine variables such as sea surface temperature (SST), chlorophyll concentration, and subsurface current fields in real time.

The application combines a React-based 3D frontend with a FastAPI backend that processes NetCDF and CSV oceanographic datasets. It is designed to serve as a decision-support tool for marine research, fisheries, and climate monitoring.

---

## 2. Datasets and Data Sources

### 2.1 Dataset Inventory

The project integrates the following datasets:

| Dataset | Format | Description |
|---------|--------|-------------|
| INCOIS Argo 10-Day Model Grid | NetCDF (`incois_argo_10day_McCreary_FULL.nc`) | 3D gridded ocean model output from the McCreary model |
| Indian ARGO Floats | CSV (`Indian_ARGO_Floats_FULL.csv`) | In-situ observations from Argo floats deployed in the Indian Ocean |
| INCOIS Argo SST Weekly | NetCDF (`incois_argo_sst_weekly_FULL.nc`) | Weekly Sea Surface Temperature derived from Argo observations |
| IRS Chlorophyll Datasets | NetCDF (`IRS_chlorophyll_datasets_FULL.nc`) | Chlorophyll-a concentration data from Indian Remote Sensing satellites |

### 2.2 Data Collection and Research Papers

Datasets are collected primarily from:
- **INCOIS** (Indian National Centre for Ocean Information Services) — model outputs and satellite-derived products
- **Argo Program** — global array of profiling floats providing subsurface temperature, salinity, and current data
- **IRS Ocean Color Instruments** — satellite sensors measuring chlorophyll and other biogeochemical variables

Relevant research domains include:
- Ocean circulation modelling (McCreary et al., Indian Ocean modelling literature)
- Argo float data assimilation and quality control
- Satellite ocean color remote sensing for chlorophyll estimation

---

## 3. Architecture

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Three.js)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Viewport3D   │  │ VolumeRender │  │ FloatMarkersLayer│   │
│  │ (3D Globe)   │  │ (3D Volumes) │  │ (ARGO Pins)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ DepthSlider  │  │ TimeScrubber │  │ PaletteEditor    │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                         │                                    │
│                   Zustand State Store                       │
│                   (colorScales, coords, slices)             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP / WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  main.py (app entrypoint, CORS, startup loader)      │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │  VarunaDataEngine (xarray, lazy NetCDF loading)      │   │
│  │  - get_metadata()                                    │   │
│  │  - slice_depth_plane(variable, depth, time_index)    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │  Core Parsers                                         │   │
│  │  - netcdf_parser.py (grid model data)                 │   │
│  │  - csv_parser.py (in-situ float data)                 │   │
│  │  - spatial_indexer.py (spatial query engine)          │   │
│  │  - exporter.py (data export utilities)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  Data Volume  │
                  │  (NetCDF/CSV) │
                  └───────────────┘
```

### 3.2 Technology Stack

**Frontend**
- React + TypeScript
- Three.js / React Three Fiber for 3D rendering
- MapLibre / custom 3D globe visualization
- Tailwind CSS for styling
- Zustand for state management
- Vite as the build tool

**Backend**
- FastAPI (Python)
- xarray + netCDF4 for gridded ocean data
- NumPy for numerical computations
- Uvicorn as the ASGI server

**DevOps**
- Docker & Docker Compose
- Colormap generation via Matplotlib

### 3.3 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/metadata` | GET | Returns dataset variables, dimensions (depth, lat, lon, time) |
| `/api/v1/slice/horizontal` | GET | Extracts a 2D depth layer for a given variable, depth, and time index |

---

## 4. Dataset Pipeline and Kaggle Integration

### 4.1 Dataset Preparation

Oceanographic datasets are processed and standardized before ingestion:
1. **Raw Acquisition** — NetCDF model outputs and CSV float observations are downloaded from INCOIS portals and Argo repositories.
2. **Validation & QC** — Data is checked for missing values, unit consistency, and coordinate system alignment.
3. **Format Standardization** — NetCDF files are normalized to common dimension names (`time`, `depth`, `latitude`, `longitude`) and variable naming conventions.
4. **Colormap Generation** — `scripts/generate_colormaps.py` creates PNG textures for scientific colormaps (cmocean_thermal, cmocean_haline, cmocean_speed, cmocean_algae).

### 4.2 Kaggle Integration

Datasets are uploaded to Kaggle to ensure reproducibility and community accessibility. The Kaggle API is used for:
- Automated dataset versioning and updates
- Integration with Kaggle Kernels for preprocessing pipelines
- Direct download into the project's `data/` directory via `kaggle datasets download`

**Planned Kaggle API integration points:**
- Pull latest dataset versions on application startup
- Push newly processed slices or derived features back to a companion dataset
- Trigger Kaggle Notebook jobs for ML preprocessing steps

---

## 5. Development Iterations

### Iteration 1 — Core 3D Viewport and Data Slicing

**Objective:** Build the minimum viable product with a 3D ocean view and depth-based slicing.

**Delivered:**
- FastAPI backend with lazy-loading xarray engine
- Horizontal depth-slice API returning lat/lon grids
- React frontend with 3D viewport, depth slider, and time scrubber
- Volume renderer and palette editor

**Bugs Found:**
- **Yellow Pin Click Bug:** When clicking yellow pins (ARGO float markers) on the 3D globe, the map view did not update and the ocean layer failed to render. The click event was not propagating correctly to the coordinate transform logic, and the depth slider state was not synchronized with the marker selection. This caused the slice API to request invalid depth ranges, returning empty or NaN grids.

**Resolution:** Fixed event propagation in `FloatMarkersLayer.tsx` and ensured the marker click handler updates the global depth state before triggering a slice request.

---

## 6. Future Roadmap

### 6.1 Ocean Animations

- **Time-Varying Current Fields:** Animated vector fields showing ocean current evolution over time using the `TimeScrubber` component and backend time-index slicing.
- **Wave and Tide Simulations:** Integration of wave height and tidal constituent visualizations using shader-based animations in Three.js.
- **Particle Tracing:** GPU-accelerated particle advection to visualize water mass movement and eddy dynamics.

### 6.2 Real-Time Predictions Using ML Models

- **Subsurface Temperature & Salinity Forecasting:** Deploy LSTM / Transformer models trained on historical Argo profiles to predict temperature and salinity at unobserved depths and times.
- **Chlorophyll Bloom Prediction:** Time-series forecasting of chlorophyll concentration using satellite historical data and ocean physics inputs.
- **Anomaly Detection:** Autoencoder-based models to flag unusual ocean conditions (e.g., marine heatwaves, dead zones) in near real time.
- **API Layer:** Expose ML inference endpoints alongside existing data-slice endpoints, returning probabilistic forecasts and confidence intervals.

### 6.3 Enhanced Collaboration

- Multi-user sessions with synchronized viewports
- Annotation and bookmarking of interesting ocean features
- Export of high-resolution renders and data subsets

---

## 7. Project Structure

```
varuna-3d/
├── README.md
├── docker-compose.yml
├── requirements.txt
├── app.ipynb
├── scripts/
│   └── generate_colormaps.py
├── data/
│   ├── 1_model_grid-3d/
│   │   └── incois_argo_10day_McCreary_FULL.nc
│   ├── 2_in_situ_observations/
│   │   └── Indian_ARGO_Floats_FULL.csv
│   ├── 3_sst/
│   │   └── incois_argo_sst_weekly_FULL.nc
│   └── 4_chlorophyll/
│       └── IRS_chlorophyll_datasets_FULL.nc
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── engine.py
│       ├── core/
│       │   ├── csv_parser.py
│       │   ├── netcdf_parser.py
│       │   ├── spatial_indexer.py
│       │   └── exporter.py
│       ├── schemas/
│       │   ├── float_schema.py
│       │   └── grid_schema.py
│       └── api/
│           └── v1/
│               ├── router.py
│               └── endpoints/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── public/
    │   └── assets/
    │       └── colormaps/
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Viewport3D.tsx
        │   ├── VolumeRenderer.tsx
        │   ├── FloatMarkersLayer.tsx
        │   ├── DepthSlider.tsx
        │   ├── TimeScrubber.tsx
        │   ├── PaletteEditor.tsx
        │   ├── ProfileChartModal.tsx
        │   └── CurrentVectorField.tsx
        ├── hooks/
        │   ├── useModelData.ts
        │   └── useObservations.ts
        ├── state/
        │   └── store.ts
        └── utils/
            ├── colorScales.ts
            └── coordinateTransforms.ts
```

---

## 8. Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (optional, for containerized deployment)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Deployment
```bash
docker-compose up --build
```

---

*Last updated: 2026-08-28*
