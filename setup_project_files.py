import os

files = {
    # -------------------------------------------------------------
    # 1. BACKEND REQUIREMENTS & CONFIG
    # -------------------------------------------------------------
    "backend/requirements.txt": """fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
pydantic-settings>=2.2.0
xarray>=2024.2.0
netCDF4>=1.6.5
pandas>=2.2.0
numpy>=1.26.0
scipy>=1.12.0
python-multipart>=0.0.9
""",

    "backend/app/config.py": """import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VARUNA-3D: Ocean Model & In-Situ Visualizer"
    API_V1_STR: str = "/api/v1"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    MODEL_GRID_PATH: str = os.path.join(DATA_DIR, "1_model_grid_3d", "incois_argo_10day_McCreary_FULL.nc")
    ARGO_FLOATS_PATH: str = os.path.join(DATA_DIR, "2_in_situ_observations", "Indian_ARGO_Floats_FULL.csv")
    SST_PATH: str = os.path.join(DATA_DIR, "3_sst", "incois_argo_sst_weekly_FULL.nc")
    CHLOROPHYLL_PATH: str = os.path.join(DATA_DIR, "4_chlorophyll", "IRS_chlorophyll_datasets_FULL.nc")

settings = Settings()
""",

    # -------------------------------------------------------------
    # 2. BACKEND SCHEMAS
    # -------------------------------------------------------------
    "backend/app/schemas/grid_schema.py": """from typing import List, Optional
from pydantic import BaseModel

class GridMetadataResponse(BaseModel):
    time_steps: List[str]
    depth_levels: List[float]
    lat_range: List[float]
    lon_range: List[float]
    variables: List[str]
    default_variable: str

class DepthSliceResponse(BaseModel):
    variable: str
    selected_depth: float
    time_index: int
    lats: List[float]
    lons: List[float]
    min_val: float
    max_val: float
    grid: List[List[Optional[float]]]
""",

    "backend/app/schemas/observation_schema.py": """from typing import List, Optional
from pydantic import BaseModel

class FloatMarker(BaseModel):
    PLATFORM_NUMBER: int
    latitude: float
    longitude: float
    time: str

class FloatMarkerList(BaseModel):
    count: int
    floats: List[FloatMarker]

class ValidationProfileResponse(BaseModel):
    platform_number: int
    coordinates: dict
    rmse: Optional[float]
    mean_bias: Optional[float]
    observed: dict
    modeled: dict
""",

    # -------------------------------------------------------------
    # 3. BACKEND CORE PARSERS & ENGINES
    # -------------------------------------------------------------
    "backend/app/core/netcdf_parser.py": """import numpy as np
import xarray as xr
from app.config import settings

class NetCDFService:
    def __init__(self):
        try:
            self.ds = xr.open_dataset(settings.MODEL_GRID_PATH)
            print(f"[✓] NetCDF Model loaded: {settings.MODEL_GRID_PATH}")
        except Exception as e:
            print(f"[!] Warning: Could not open {settings.MODEL_GRID_PATH}: {e}")
            self.ds = None

    def get_metadata(self):
        if self.ds is None:
            return {
                "time_steps": ["2024-01-01T00:00:00"],
                "depth_levels": [0, 10, 20, 50, 100, 200, 500, 1000, 2000],
                "lat_range": [5.0, 25.0],
                "lon_range": [65.0, 90.0],
                "variables": ["temp", "sal"],
                "default_variable": "temp"
            }
        vars_available = [v for v in self.ds.data_vars.keys() if len(self.ds[v].dims) >= 3]
        return {
            "time_steps": [str(t)[:19] for t in self.ds.time.values],
            "depth_levels": [float(d) for d in self.ds.depth.values],
            "lat_range": [float(self.ds.latitude.min()), float(self.ds.latitude.max())],
            "lon_range": [float(self.ds.longitude.min()), float(self.ds.longitude.max())],
            "variables": vars_available if vars_available else ["temp", "sal"],
            "default_variable": vars_available[0] if vars_available else "temp"
        }

    def get_depth_slice(self, variable: str = "temp", depth: float = 0.0, time_index: int = -1):
        if self.ds is None or variable not in self.ds:
            # Fallback synthetic grid for testing
            lats = np.linspace(5, 25, 40).tolist()
            lons = np.linspace(65, 90, 50).tolist()
            grid = [[28.0 - (depth / 100.0) + (lat * 0.1) for lat in lats] for _ in lons]
            return {
                "variable": variable,
                "selected_depth": depth,
                "time_index": time_index,
                "lats": lats,
                "lons": lons,
                "min_val": 10.0,
                "max_val": 30.0,
                "grid": grid
            }
        
        sub_slice = self.ds[variable].isel(time=time_index).sel(depth=depth, method="nearest")
        vals = sub_slice.values
        valid_vals = vals[~np.isnan(vals)]
        min_v = float(np.min(valid_vals)) if len(valid_vals) > 0 else 0.0
        max_v = float(np.max(valid_vals)) if len(valid_vals) > 0 else 35.0
        cleaned_grid = np.where(np.isnan(vals), None, np.round(vals, 2)).tolist()
        
        return {
            "variable": variable,
            "selected_depth": float(sub_slice.depth.values),
            "time_index": time_index,
            "lats": [float(lat) for lat in self.ds.latitude.values],
            "lons": [float(lon) for lon in self.ds.longitude.values],
            "min_val": min_v,
            "max_val": max_v,
            "grid": cleaned_grid
        }

    def get_column_profile(self, lat: float, lon: float, variable: str = "temp", time_index: int = -1):
        if self.ds is None or variable not in self.ds:
            depths = [0, 10, 20, 50, 100, 200, 500, 1000, 1500, 2000]
            return {
                "depth": depths,
                "values": [29.0 - (d ** 0.4) * 3 for d in depths],
                "nearest_lat": lat,
                "nearest_lon": lon
            }
        
        col = self.ds[variable].isel(time=time_index).sel(latitude=lat, longitude=lon, method="nearest")
        depths = [float(d) for d in self.ds.depth.values]
        vals = [None if np.isnan(v) else float(np.round(v, 2)) for v in col.values]
        
        return {
            "depth": depths,
            "values": vals,
            "nearest_lat": float(col.latitude.values),
            "nearest_lon": float(col.longitude.values)
        }

netcdf_service = NetCDFService()
""",

    "backend/app/core/argo_parser.py": """import pandas as pd
from app.config import settings

class ArgoService:
    def __init__(self):
        try:
            self.df = pd.read_csv(settings.ARGO_FLOATS_PATH, low_memory=False)
            self.df["PLATFORM_NUMBER"] = self.df["PLATFORM_NUMBER"].astype(int)
            self.df["PRES"] = pd.to_numeric(self.df["PRES"], errors="coerce")
            self.df["TEMP"] = pd.to_numeric(self.df["TEMP"], errors="coerce")
            if "PSAL" in self.df.columns:
                self.df["PSAL"] = pd.to_numeric(self.df["PSAL"], errors="coerce")
            print(f"[✓] Loaded Argo Observations: {len(self.df):,} rows")
        except Exception as e:
            print(f"[!] Warning: Could not open {settings.ARGO_FLOATS_PATH}: {e}")
            self.df = pd.DataFrame()

    def get_latest_markers(self, limit: int = 400):
        if self.df.empty:
            # Fallback sample floats across Indian Ocean
            return [
                {"PLATFORM_NUMBER": 2902101, "latitude": 12.5, "longitude": 70.2, "time": "2024-01-10T12:00:00Z"},
                {"PLATFORM_NUMBER": 2902102, "latitude": 15.3, "longitude": 84.1, "time": "2024-01-11T08:30:00Z"},
                {"PLATFORM_NUMBER": 2902103, "latitude": 8.1, "longitude": 76.5, "time": "2024-01-09T14:15:00Z"},
                {"PLATFORM_NUMBER": 2902104, "latitude": 18.2, "longitude": 68.9, "time": "2024-01-12T19:00:00Z"},
                {"PLATFORM_NUMBER": 2902105, "latitude": 11.0, "longitude": 88.0, "time": "2024-01-10T04:45:00Z"},
            ]
        
        latest = self.df.drop_duplicates(subset=["PLATFORM_NUMBER"], keep="last").head(limit)
        records = []
        for _, row in latest.iterrows():
            records.append({
                "PLATFORM_NUMBER": int(row["PLATFORM_NUMBER"]),
                "latitude": round(float(row["latitude"]), 4),
                "longitude": round(float(row["longitude"]), 4),
                "time": str(row["time"]),
            })
        return records

    def get_profile_by_platform(self, platform_number: int):
        if self.df.empty:
            depths = [5, 25, 50, 100, 200, 400, 600, 800, 1000]
            return {
                "platform_number": platform_number,
                "lat": 12.5,
                "lon": 70.2,
                "depth": depths,
                "temp": [28.5, 28.1, 26.2, 21.0, 15.4, 11.2, 8.5, 6.8, 5.5],
                "psal": [35.2, 35.3, 35.6, 35.8, 35.1, 34.9, 34.8, 34.7, 34.7]
            }
        
        subset = self.df[self.df["PLATFORM_NUMBER"] == platform_number].dropna(subset=["PRES", "TEMP"]).sort_values(by="PRES")
        if subset.empty:
            return None
        
        return {
            "platform_number": platform_number,
            "lat": float(subset["latitude"].iloc[0]),
            "lon": float(subset["longitude"].iloc[0]),
            "depth": subset["PRES"].tolist(),
            "temp": subset["TEMP"].tolist(),
            "psal": subset["PSAL"].dropna().tolist() if "PSAL" in subset.columns else []
        }

argo_service = ArgoService()
""",

    "backend/app/core/validation_engine.py": """import numpy as np
from scipy.interpolate import interp1d

class ValidationEngine:
    @staticmethod
    def calculate_metrics(obs_depths, obs_values, mod_depths, mod_values):
        valid_mod = [(d, v) for d, v in zip(mod_depths, mod_values) if v is not None]
        if len(valid_mod) < 2 or len(obs_depths) < 2:
            return None, None
        
        m_depths, m_vals = zip(*valid_mod)
        interp_fn = interp1d(m_depths, m_vals, bounds_error=False, fill_value=np.nan)
        mod_interp = interp_fn(obs_depths)
        
        obs_arr = np.array(obs_values)
        mask = ~np.isnan(mod_interp) & ~np.isnan(obs_arr)
        
        if np.sum(mask) == 0:
            return None, None
            
        residuals = mod_interp[mask] - obs_arr[mask]
        rmse = float(np.sqrt(np.mean(residuals ** 2)))
        mean_bias = float(np.mean(residuals))
        
        return round(rmse, 3), round(mean_bias, 3)

validation_engine = ValidationEngine()
""",

    # -------------------------------------------------------------
    # 4. BACKEND ENDPOINTS & ROUTERS
    # -------------------------------------------------------------
    "backend/app/api/v1/endpoints/model_slices.py": """from fastapi import APIRouter, Query, HTTPException
from app.core.netcdf_parser import netcdf_service
from app.schemas.grid_schema import GridMetadataResponse, DepthSliceResponse

router = APIRouter()

@router.get("/metadata", response_model=GridMetadataResponse)
def get_metadata():
    return netcdf_service.get_metadata()

@router.get("/depth", response_model=DepthSliceResponse)
def get_depth_slice(
    depth: float = Query(0.0, description="Target depth in meters"),
    time_index: int = Query(-1, description="Time step index"),
    variable: str = Query("temp", description="Variable key (temp, sal)")
):
    slice_data = netcdf_service.get_depth_slice(variable=variable, depth=depth, time_index=time_index)
    if not slice_data:
        raise HTTPException(status_code=404, detail="Slice data not found")
    return slice_data
""",

    "backend/app/api/v1/endpoints/observations.py": """from fastapi import APIRouter, Query
from app.core.argo_parser import argo_service
from app.schemas.observation_schema import FloatMarkerList

router = APIRouter()

@router.get("/floats", response_model=FloatMarkerList)
def get_floats(limit: int = Query(400, description="Max floats to return")):
    records = argo_service.get_latest_markers(limit=limit)
    return {"count": len(records), "floats": records}
""",

    "backend/app/api/v1/endpoints/validation.py": """from fastapi import APIRouter, HTTPException, Query
from app.core.argo_parser import argo_service
from app.core.netcdf_parser import netcdf_service
from app.core.validation_engine import validation_engine
from app.schemas.observation_schema import ValidationProfileResponse

router = APIRouter()

@router.get("/profile", response_model=ValidationProfileResponse)
def get_validation_profile(
    platform_number: int = Query(..., description="Argo Platform WMO ID"),
    variable: str = Query("temp", description="Validation variable (temp or sal)")
):
    obs_data = argo_service.get_profile_by_platform(platform_number)
    if not obs_data:
        raise HTTPException(status_code=404, detail="Float ID not found")
        
    lat, lon = obs_data["lat"], obs_data["lon"]
    model_col = netcdf_service.get_column_profile(lat=lat, lon=lon, variable=variable)
    
    rmse, bias = validation_engine.calculate_metrics(
        obs_depths=obs_data["depth"],
        obs_values=obs_data["temp"] if variable == "temp" else obs_data.get("psal", []),
        mod_depths=model_col["depth"],
        mod_values=model_col["values"]
    )
    
    return {
        "platform_number": platform_number,
        "coordinates": {"lat": lat, "lon": lon, "nearest_model_lat": model_col["nearest_lat"], "nearest_model_lon": model_col["nearest_lon"]},
        "rmse": rmse,
        "mean_bias": bias,
        "observed": {
            "depth": obs_data["depth"],
            "temperature": obs_data["temp"],
            "salinity": obs_data.get("psal", [])
        },
        "modeled": {
            "depth": model_col["depth"],
            "values": model_col["values"]
        }
    }
""",

    "backend/app/api/v1/router.py": """from fastapi import APIRouter
from app.api.v1.endpoints import model_slices, observations, validation

api_router = APIRouter()
api_router.include_router(model_slices.router, prefix="/slice", tags=["3D Model Slices"])
api_router.include_router(observations.router, prefix="/observations", tags=["In-Situ Observations"])
api_router.include_router(validation.router, prefix="/validation", tags=["Model vs Observation Validation"])
""",

    "backend/app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
""",

    # -------------------------------------------------------------
    # 5. FRONTEND PACKAGE & CONFIG
    # -------------------------------------------------------------
    "frontend/package.json": """{
  "name": "varuna-3d-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^9.102.6",
    "@react-three/fiber": "^8.16.1",
    "axios": "^1.6.8",
    "clsx": "^2.1.0",
    "lucide-react": "^0.359.0",
    "plotly.js-dist-min": "^2.30.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-plotly.js": "^2.6.0",
    "tailwind-merge": "^2.2.2",
    "three": "^0.162.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@types/three": "^0.162.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.6"
  }
}
""",

    "frontend/vite.config.ts": """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
""",

    "frontend/tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#030b1e',
          800: '#071630',
          700: '#0e2448',
          500: '#0077b6',
          400: '#00b4d8',
          300: '#90e0ef'
        }
      }
    },
  },
  plugins: [],
}
""",

    "frontend/postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",

    "frontend/index.html": """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VARUNA-3D | Ocean Model & In-Situ Visualizer</title>
  </head>
  <body class="bg-slate-950 text-slate-100 overflow-hidden select-none">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""",

    "frontend/src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
""",

    "frontend/src/main.tsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""",

    # -------------------------------------------------------------
    # 6. FRONTEND STATE & UTILS
    # -------------------------------------------------------------
    "frontend/src/state/store.ts": """import { create } from 'zustand';

interface AppState {
  activeVariable: string;
  selectedDepth: number;
  timeIndex: number;
  verticalExaggeration: number;
  colorPalette: 'turbo' | 'viridis' | 'thermal' | 'coolwarm';
  availableDepths: number[];
  timeSteps: string[];
  variables: string[];
  selectedFloatId: number | null;
  
  setActiveVariable: (v: string) => void;
  setSelectedDepth: (d: number) => void;
  setTimeIndex: (t: number) => void;
  setVerticalExaggeration: (scale: number) => void;
  setColorPalette: (p: 'turbo' | 'viridis' | 'thermal' | 'coolwarm') => void;
  setMetadata: (depths: number[], times: string[], vars: string[]) => void;
  setSelectedFloatId: (id: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  activeVariable: 'temp',
  selectedDepth: 0.0,
  timeIndex: -1,
  verticalExaggeration: 30,
  colorPalette: 'turbo',
  availableDepths: [0, 10, 20, 50, 75, 100, 150, 200, 300, 500, 1000, 1500, 2000],
  timeSteps: [],
  variables: ['temp', 'sal'],
  selectedFloatId: null,
  
  setActiveVariable: (v) => set({ activeVariable: v }),
  setSelectedDepth: (d) => set({ selectedDepth: d }),
  setTimeIndex: (t) => set({ timeIndex: t }),
  setVerticalExaggeration: (scale) => set({ verticalExaggeration: scale }),
  setColorPalette: (p) => set({ colorPalette: p }),
  setMetadata: (depths, times, vars) => set({ availableDepths: depths, timeSteps: times, variables: vars }),
  setSelectedFloatId: (id) => set({ selectedFloatId: id }),
}));
""",

    "frontend/src/utils/coordinates.ts": """export const LAT_BOUNDS = [5.0, 25.0];
export const LON_BOUNDS = [65.0, 90.0];
export const MAX_DEPTH = 2000.0;

export function geoTo3D(lat: number, lon: number, depth: number = 0, exaggeration: number = 30): [number, number, number] {
  const x = ((lon - LON_BOUNDS[0]) / (LON_BOUNDS[1] - LON_BOUNDS[0]) - 0.5) * 40;
  const z = -((lat - LAT_BOUNDS[0]) / (LAT_BOUNDS[1] - LAT_BOUNDS[0]) - 0.5) * 30;
  const y = -(depth / MAX_DEPTH) * (exaggeration / 3);
  return [x, y, z];
}
""",

    # -------------------------------------------------------------
    # 7. FRONTEND COMPONENTS
    # -------------------------------------------------------------
    "frontend/src/components/OceanVolume.tsx": """import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';

export const OceanVolume: React.FC = () => {
  const { activeVariable, selectedDepth, timeIndex, verticalExaggeration } = useStore();
  const [sliceData, setSliceData] = useState<any>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
      params: { depth: selectedDepth, time_index: timeIndex, variable: activeVariable }
    }).then(res => setSliceData(res.data)).catch(console.error);
  }, [activeVariable, selectedDepth, timeIndex]);

  const texture = useMemo(() => {
    if (!sliceData || !sliceData.grid) return null;

    const rows = sliceData.grid.length;
    const cols = sliceData.grid[0].length;
    const size = rows * cols;
    const data = new Uint8Array(4 * size);

    const minV = sliceData.min_val ?? 10;
    const maxV = sliceData.max_val ?? 30;
    const range = maxV - minV || 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = sliceData.grid[r][c];
        const idx = (r * cols + c) * 4;

        if (val === null || val === undefined) {
          data[idx] = 15;
          data[idx + 1] = 23;
          data[idx + 2] = 42;
          data[idx + 3] = 40;
        } else {
          const norm = Math.max(0, Math.min(1, (val - minV) / range));
          data[idx] = Math.floor(norm * 255);
          data[idx + 1] = Math.floor((1 - Math.abs(norm - 0.5) * 2) * 220);
          data[idx + 2] = Math.floor((1 - norm) * 255);
          data[idx + 3] = 230;
        }
      }
    }

    const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [sliceData]);

  const depthY = -(selectedDepth / 2000) * (verticalExaggeration / 3);

  return (
    <group>
      {/* 3D Ocean Bounding Box Wireframe */}
      <mesh position={[0, -(verticalExaggeration / 6), 0]}>
        <boxGeometry args={[40, verticalExaggeration / 3, 30]} />
        <meshBasicMaterial color="#00f5d4" wireframe opacity={0.15} transparent />
      </mesh>

      {/* Dynamic Depth Slice Plane */}
      {texture && (
        <mesh position={[0, depthY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 30]} />
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
""",

    "frontend/src/components/FloatMarkers.tsx": """import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D } from '../utils/coordinates';

export const FloatMarkers: React.FC = () => {
  const [floats, setFloats] = useState<any[]>([]);
  const { verticalExaggeration, setSelectedFloatId } = useStore();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=300')
      .then(res => setFloats(res.data.floats))
      .catch(console.error);
  }, []);

  return (
    <group>
      {floats.map((f) => {
        const [x, y, z] = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
        return (
          <group key={f.PLATFORM_NUMBER} position={[x, y + 0.3, z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFloatId(f.PLATFORM_NUMBER);
              }}
            >
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color="#ffb703"
                emissive="#fb8500"
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
""",

    "frontend/src/components/Viewport3D.tsx": """import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { OceanVolume } from './OceanVolume';
import { FloatMarkers } from './FloatMarkers';

export const Viewport3D: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [30, 25, 40], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 20, 15]} intensity={1.5} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <OceanVolume />
        <FloatMarkers />
        
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.1} />
        <gridHelper args={[60, 20, '#0284c7', '#1e293b']} position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};
""",

    "frontend/src/components/ControlPanel.tsx": """import React, { useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../state/store';
import { Layers, Sliders, Eye, Waves, Database } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    activeVariable,
    setActiveVariable,
    selectedDepth,
    setSelectedDepth,
    verticalExaggeration,
    setVerticalExaggeration,
    availableDepths,
    setMetadata
  } = useStore();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/metadata')
      .then(res => setMetadata(res.data.depth_levels, res.data.time_steps, res.data.variables))
      .catch(console.error);
  }, []);

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 space-y-5">
      {/* Title & Brand */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <Waves className="text-cyan-400 w-6 h-6" />
        <div>
          <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            VARUNA-3D
          </h1>
          <p className="text-xs text-slate-400">INCOIS Numerical Model & In-Situ Twin</p>
        </div>
      </div>

      {/* Variable Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
          <Layers size={14} className="text-cyan-400" /> OCEAN VARIABLE
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveVariable('temp')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeVariable === 'temp' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            Temperature (°C)
          </button>
          <button
            onClick={() => setActiveVariable('sal')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeVariable === 'sal' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            Salinity (PSU)
          </button>
        </div>
      </div>

      {/* Depth Scrubber */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Sliders size={14} className="text-cyan-400" /> DEPTH SLICE
          </span>
          <span className="font-mono text-cyan-400 font-bold">{selectedDepth} m</span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="10"
          value={selectedDepth}
          onChange={(e) => setSelectedDepth(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[0, 50, 100, 200, 500, 1000, 2000].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDepth(d)}
              className={`text-[10px] px-2 py-0.5 rounded ${
                selectedDepth === d ? 'bg-cyan-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Exaggeration Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Eye size={14} className="text-cyan-400" /> VERTICAL EXAGGERATION
          </span>
          <span className="font-mono text-cyan-400 font-bold">{verticalExaggeration}x</span>
        </div>
        <input
          type="range"
          min="5"
          max="80"
          step="1"
          value={verticalExaggeration}
          onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Legend & Instructions */}
      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
          <span>Yellow pins: In-situ Argo floats (Click to validate)</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={12} className="text-cyan-400" />
          <span>INCOIS McCreary 10-Day Objective Analysis</span>
        </div>
      </div>
    </div>
  );
};
""",

    "frontend/src/components/ValidationModal.tsx": """import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useStore } from '../state/store';
import { X, Activity } from 'lucide-react';

export const ValidationModal: React.FC = () => {
  const { selectedFloatId, setSelectedFloatId, activeVariable } = useStore();
  const [valData, setValData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFloatId) return;
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/v1/validation/profile', {
      params: { platform_number: selectedFloatId, variable: activeVariable }
    })
      .then(res => {
        setValData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedFloatId, activeVariable]);

  if (!selectedFloatId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={() => setSelectedFloatId(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-cyan-400 w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold">
              Argo Float WMO #{selectedFloatId} vs Numerical Model
            </h2>
            <p className="text-xs text-slate-400">Direct depth-resolved observation vs model prediction</p>
          </div>
        </div>

        {valData && (
          <div className="grid grid-cols-3 gap-3 mb-4 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div>
              <span className="text-slate-400 block">Position</span>
              <span className="font-semibold text-slate-200">{valData.coordinates.lat}°N, {valData.coordinates.lon}°E</span>
            </div>
            <div>
              <span className="text-slate-400 block">RMSE Anomaly</span>
              <span className="text-emerald-400 font-bold text-sm">{valData.rmse ?? 'N/A'} °C</span>
            </div>
            <div>
              <span className="text-slate-400 block">Mean Bias</span>
              <span className="text-cyan-400 font-bold text-sm">{valData.mean_bias ?? 'N/A'} °C</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
            Extracting profile & computing statistical metrics...
          </div>
        ) : valData ? (
          <Plot
            data={[
              {
                x: valData.observed.temperature,
                y: valData.observed.depth,
                mode: 'lines+markers',
                name: 'In-Situ Observed (Argo)',
                line: { color: '#ffb703', width: 3 },
                marker: { size: 6 }
              },
              {
                x: valData.modeled.values,
                y: valData.modeled.depth,
                mode: 'lines',
                name: 'INCOIS Model Prediction',
                line: { color: '#00f5d4', width: 3, dash: 'dash' }
              }
            ]}
            layout={{
              autosize: true,
              height: 380,
              paper_bgcolor: 'transparent',
              plot_bgcolor: '#0b1329',
              yaxis: {
                title: 'Depth (meters)',
                autorange: 'reversed',
                gridcolor: '#1e293b',
                color: '#94a3b8'
              },
              xaxis: {
                title: activeVariable === 'temp' ? 'Temperature (°C)' : 'Salinity (PSU)',
                gridcolor: '#1e293b',
                color: '#94a3b8'
              },
              legend: { font: { color: '#ffffff' }, orientation: 'h', y: 1.15 },
              margin: { t: 30, r: 20, l: 60, b: 50 }
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        ) : (
          <div className="text-rose-400 text-sm py-12 text-center">Unable to load validation data.</div>
        )}
      </div>
    </div>
  );
};
""",

    "frontend/src/App.tsx": """import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { ControlPanel } from './components/ControlPanel';
import { ValidationModal } from './components/ValidationModal';

export default function App() {
  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden">
      <Viewport3D />
      <ControlPanel />
      <ValidationModal />
    </main>
  );
}
"""
}

print("====================================================")
print("  VARUNA-3D Complete Project File Generator  ")
print("====================================================")

for filepath, content in files.items():
    folder = os.path.dirname(filepath)
    if folder:
        os.makedirs(folder, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[✓] Written: {filepath}")

print("\n====================================================")
print("  All backend and frontend files written successfully!")
print("====================================================")