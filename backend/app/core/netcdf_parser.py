import numpy as np
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
