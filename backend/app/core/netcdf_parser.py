import numpy as np
import xarray as xr
import pandas as pd
from typing import Dict, Any, List, Optional
from app.config import settings

class NetCDFService:
    def __init__(self):
        self.datasets: Dict[str, Optional[xr.Dataset]] = {
            "model_3d": None,
            "sst": None,
            "chlorophyll": None
        }
        self._load_datasets()

    def _load_datasets(self):
        # 1. McCreary 10-day 3D Model
        try:
            self.datasets["model_3d"] = xr.open_dataset(settings.MODEL_GRID_PATH)
            print(f"[OK] NetCDF 3D Model loaded: {settings.MODEL_GRID_PATH}")
        except Exception as e:
            print(f"[WARN] Could not load 3D Model: {e}")

        # 2. Weekly SST
        try:
            self.datasets["sst"] = xr.open_dataset(settings.SST_PATH)
            print(f"[OK] NetCDF Weekly SST loaded: {settings.SST_PATH}")
        except Exception as e:
            print(f"[WARN] Could not load SST: {e}")

        # 3. IRS Chlorophyll
        try:
            self.datasets["chlorophyll"] = xr.open_dataset(settings.CHLOROPHYLL_PATH)
            print(f"[OK] NetCDF Chlorophyll loaded: {settings.CHLOROPHYLL_PATH}")
        except Exception as e:
            print(f"[WARN] Could not load Chlorophyll: {e}")

    @property
    def ds_3d(self) -> Optional[xr.Dataset]:
        return self.datasets.get("model_3d")

    def _get_depth_dim_and_values(self, ds: xr.Dataset) -> tuple[Optional[str], List[float]]:
        for d in ["depth", "ZAX", "z", "depth_levels", "level"]:
            if d in ds.coords or d in ds.dims:
                return d, [float(x) for x in ds[d].values]
        return None, [0.0]

    def _get_lat_lon_coords(self, ds: xr.Dataset) -> tuple[str, str, List[float], List[float]]:
        lat_name = "latitude" if "latitude" in ds.coords else ("lat" if "lat" in ds.coords else list(ds.coords.keys())[0])
        lon_name = "longitude" if "longitude" in ds.coords else ("lon" if "lon" in ds.coords else list(ds.coords.keys())[1])
        lats = [float(x) for x in ds[lat_name].values]
        lons = [float(x) for x in ds[lon_name].values]
        return lat_name, lon_name, lats, lons

    def _resolve_var_key(self, ds: xr.Dataset, requested_var: str) -> str:
        var_lower_map = {k.lower(): k for k in ds.data_vars.keys()}
        
        alias_map = {
            "temp": ["t_analyzed", "t_mean", "temperature", "temp", "asst"],
            "sal": ["s_analyzed", "s_mean", "salinity", "sal", "psal"],
            "sst": ["asst", "sst", "t_analyzed"],
            "chlorophyll": ["chlorophyll", "chla", "chl"],
            "t_stdev": ["t_stdev"],
            "s_stdev": ["s_stdev"],
            "t_rmse": ["t_rmse"],
            "s_rmse": ["s_rmse"]
        }

        req_clean = requested_var.lower().strip()
        if req_clean in var_lower_map:
            return var_lower_map[req_clean]

        if req_clean in alias_map:
            for candidate in alias_map[req_clean]:
                if candidate in var_lower_map:
                    return var_lower_map[candidate]

        # Return first available variable
        available = list(ds.data_vars.keys())
        return available[0] if available else requested_var

    def get_metadata(self, dataset_type: str = "model_3d") -> Dict[str, Any]:
        ds = self.datasets.get(dataset_type) or self.ds_3d
        if ds is None:
            return {
                "dataset_type": dataset_type,
                "time_steps": ["2024-01-01T00:00:00"],
                "depth_levels": [0, 10, 20, 50, 100, 200, 500, 1000, 2000],
                "lat_range": [-29.5, 29.5],
                "lon_range": [30.5, 119.5],
                "variables": ["temp", "sal"],
                "default_variable": "temp",
                "units": "°C"
            }

        depth_name, depths = self._get_depth_dim_and_values(ds)
        lat_name, lon_name, lats, lons = self._get_lat_lon_coords(ds)
        
        times = []
        if "time" in ds.coords:
            times = [str(t)[:19] for t in ds.time.values]

        vars_available = list(ds.data_vars.keys())
        user_friendly_vars = []
        for v in vars_available:
            if v == "T_ANALYZED":
                user_friendly_vars.append("temp")
            elif v == "S_ANALYZED":
                user_friendly_vars.append("sal")
            elif v == "ASST":
                user_friendly_vars.append("sst")
            elif v == "CHLOROPHYLL":
                user_friendly_vars.append("chlorophyll")
            else:
                user_friendly_vars.append(v.lower())

        # Determine default
        default_var = user_friendly_vars[0] if user_friendly_vars else "temp"
        if "temp" in user_friendly_vars:
            default_var = "temp"
        elif "sst" in user_friendly_vars:
            default_var = "sst"
        elif "chlorophyll" in user_friendly_vars:
            default_var = "chlorophyll"

        return {
            "dataset_type": dataset_type,
            "time_steps": times,
            "depth_levels": depths,
            "lat_range": [min(lats), max(lats)],
            "lon_range": [min(lons), max(lons)],
            "variables": user_friendly_vars,
            "raw_variables": vars_available,
            "default_variable": default_var,
            "units": "°C" if default_var in ["temp", "sst"] else ("PSU" if default_var == "sal" else "mg/m³")
        }

    def get_depth_slice(
        self,
        dataset_type: str = "model_3d",
        variable: str = "temp",
        depth: float = 0.0,
        time_index: int = -1,
        max_resolution: int = 120
    ) -> Dict[str, Any]:
        ds = self.datasets.get(dataset_type) or self.ds_3d
        if ds is None:
            # Fallback synthetic grid
            lats = np.linspace(-29.5, 29.5, 60).tolist()
            lons = np.linspace(30.5, 119.5, 90).tolist()
            grid = [[28.0 - (depth / 100.0) + (lat * 0.1) for lat in lats] for _ in lons]
            return {
                "dataset_type": dataset_type,
                "variable": variable,
                "selected_depth": depth,
                "time_index": time_index,
                "lats": lats,
                "lons": lons,
                "min_val": 10.0,
                "max_val": 30.0,
                "grid": grid
            }

        var_key = self._resolve_var_key(ds, variable)
        da = ds[var_key]
        
        # Select time
        if "time" in da.dims:
            t_idx = max(0, min(time_index if time_index >= 0 else len(ds.time) + time_index, len(ds.time) - 1))
            da = da.isel(time=t_idx)
        else:
            t_idx = 0

        # Select depth if dataset has vertical dimension
        depth_name, _ = self._get_depth_dim_and_values(ds)
        actual_depth = depth
        if depth_name and depth_name in da.dims:
            da = da.sel({depth_name: depth}, method="nearest")
            actual_depth = float(da[depth_name].values)

        lat_name, lon_name, lats, lons = self._get_lat_lon_coords(ds)
        
        # Downsample large 2D grids (e.g. Chlorophyll 2556x4315) to max_resolution for real-time WebGL
        lat_step = max(1, len(lats) // max_resolution)
        lon_step = max(1, len(lons) // max_resolution)
        
        if lat_step > 1 or lon_step > 1:
            da = da.isel({lat_name: slice(0, None, lat_step), lon_name: slice(0, None, lon_step)})
            lats = [float(x) for x in da[lat_name].values]
            lons = [float(x) for x in da[lon_name].values]

        vals = da.values
        valid_mask = ~np.isnan(vals)
        if np.any(valid_mask):
            min_v = float(np.min(vals[valid_mask]))
            max_v = float(np.max(vals[valid_mask]))
        else:
            min_v, max_v = 0.0, 35.0

        cleaned_grid = np.where(np.isnan(vals), None, np.round(vals, 3)).tolist()

        return {
            "dataset_type": dataset_type,
            "variable": variable,
            "raw_variable": var_key,
            "selected_depth": actual_depth,
            "time_index": t_idx,
            "time_str": str(ds.time.values[t_idx])[:19] if "time" in ds.coords else None,
            "lats": lats,
            "lons": lons,
            "min_val": round(min_v, 2),
            "max_val": round(max_v, 2),
            "grid": cleaned_grid
        }

    def get_column_profile(
        self,
        lat: float,
        lon: float,
        variable: str = "temp",
        time_index: int = -1
    ) -> Dict[str, Any]:
        ds = self.ds_3d
        if ds is None:
            depths = [5, 10, 20, 50, 100, 200, 500, 1000, 1500, 2000]
            return {
                "depth": depths,
                "values": [29.0 - (d ** 0.4) * 3 for d in depths],
                "nearest_lat": lat,
                "nearest_lon": lon,
                "variable": variable
            }

        var_key = self._resolve_var_key(ds, variable)
        da = ds[var_key]
        
        t_idx = max(0, min(time_index if time_index >= 0 else len(ds.time) + time_index, len(ds.time) - 1))
        da_t = da.isel(time=t_idx)

        lat_name, lon_name, _, _ = self._get_lat_lon_coords(ds)
        col = da_t.sel({lat_name: lat, lon_name: lon}, method="nearest")

        depth_name, _ = self._get_depth_dim_and_values(ds)
        depths = [float(d) for d in ds[depth_name].values] if depth_name else [0.0]
        vals = [None if np.isnan(v) else float(np.round(v, 3)) for v in col.values]

        return {
            "depth": depths,
            "values": vals,
            "nearest_lat": float(col[lat_name].values),
            "nearest_lon": float(col[lon_name].values),
            "variable": variable,
            "time_str": str(ds.time.values[t_idx])[:19]
        }

    def find_nearest_time_index(self, obs_time_str: str) -> int:
        ds = self.ds_3d
        if ds is None or "time" not in ds.coords:
            return -1
        try:
            target_t = pd.to_datetime(obs_time_str)
            time_series = pd.to_datetime(ds.time.values)
            idx = int(np.argmin(np.abs(time_series - target_t)))
            return idx
        except Exception:
            return -1

netcdf_service = NetCDFService()

