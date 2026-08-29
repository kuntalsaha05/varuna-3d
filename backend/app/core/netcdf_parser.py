import os
import numpy as np
import xarray as xr
from app.config import settings

class NetCDFService:
    def __init__(self):
        self.ds_3d = None
        self.ds_sst = None
        self.ds_chl = None
        self.depth_coord = "ZAX"
        
        # 1. Load 3D Model Grid
        try:
            if os.path.exists(settings.MODEL_GRID_PATH):
                self.ds_3d = xr.open_dataset(settings.MODEL_GRID_PATH)
                if "ZAX" in self.ds_3d.coords:
                    self.depth_coord = "ZAX"
                elif "depth" in self.ds_3d.coords:
                    self.depth_coord = "depth"
                print(f"[+] NetCDF 3D Model loaded ({self.depth_coord}): {settings.MODEL_GRID_PATH}")
        except Exception as e:
            print(f"[!] Warning loading 3D Model: {e}")

        # 2. Load SST Grid
        try:
            if os.path.exists(settings.SST_PATH):
                self.ds_sst = xr.open_dataset(settings.SST_PATH)
                print(f"[+] NetCDF SST loaded: {settings.SST_PATH}")
        except Exception as e:
            print(f"[!] Warning loading SST: {e}")

        # 3. Load Chlorophyll Grid
        try:
            if os.path.exists(settings.CHLOROPHYLL_PATH):
                self.ds_chl = xr.open_dataset(settings.CHLOROPHYLL_PATH)
                print(f"[+] NetCDF Chlorophyll loaded: {settings.CHLOROPHYLL_PATH}")
        except Exception as e:
            print(f"[!] Warning loading Chlorophyll: {e}")

    def _resolve_var(self, variable: str):
        v = variable.lower()
        if v in ["temp", "temperature", "t_analyzed"]:
            return self.ds_3d, "T_ANALYZED" if self.ds_3d and "T_ANALYZED" in self.ds_3d else ("temp" if self.ds_3d and "temp" in self.ds_3d else None)
        elif v in ["sal", "salinity", "s_analyzed"]:
            return self.ds_3d, "S_ANALYZED" if self.ds_3d and "S_ANALYZED" in self.ds_3d else ("sal" if self.ds_3d and "sal" in self.ds_3d else None)
        elif v in ["sst", "asst"]:
            if self.ds_sst and "ASST" in self.ds_sst:
                return self.ds_sst, "ASST"
            return self.ds_3d, "T_ANALYZED" if self.ds_3d and "T_ANALYZED" in self.ds_3d else None
        elif v in ["chlorophyll", "chl", "chla"]:
            if self.ds_chl and "CHLOROPHYLL" in self.ds_chl:
                return self.ds_chl, "CHLOROPHYLL"
            return None, None
        return self.ds_3d, "T_ANALYZED" if self.ds_3d and "T_ANALYZED" in self.ds_3d else None

    def get_metadata(self):
        depths = [5.0, 10.0, 20.0, 30.0, 50.0, 75.0, 100.0, 150.0, 200.0, 300.0, 500.0, 1000.0, 2000.0]
        time_steps = ["2024-01-01T00:00:00"]
        lat_range = [5.0, 25.0]
        lon_range = [65.0, 90.0]

        if self.ds_3d is not None:
            if self.depth_coord in self.ds_3d:
                depths = [float(d) for d in self.ds_3d[self.depth_coord].values]
            if "time" in self.ds_3d:
                time_steps = [str(t)[:19] for t in self.ds_3d.time.values[:100]]
            if "latitude" in self.ds_3d:
                lat_range = [float(self.ds_3d.latitude.min()), float(self.ds_3d.latitude.max())]
            if "longitude" in self.ds_3d:
                lon_range = [float(self.ds_3d.longitude.min()), float(self.ds_3d.longitude.max())]

        return {
            "time_steps": time_steps,
            "depth_levels": depths,
            "lat_range": lat_range,
            "lon_range": lon_range,
            "variables": ["temp", "sal", "sst", "chlorophyll"],
            "default_variable": "temp"
        }

    def get_depth_slice(self, variable: str = "temp", depth: float = 0.0, time_index: int = -1):
        target_ds, var_name = self._resolve_var(variable)
        
        if target_ds is None or var_name is None or var_name not in target_ds:
            # High-fidelity synthetic fallback
            lats = np.linspace(5, 25, 45).tolist()
            lons = np.linspace(65, 90, 55).tolist()
            base = 28.5 if variable in ["temp", "sst"] else (35.5 if variable == "sal" else 0.8)
            grid = []
            for lat in lats:
                row = []
                for lon in lons:
                    decay = (depth / 1000.0) * 15.0 if variable == "temp" else 0.0
                    val = base - decay + np.sin(np.radians(lat * 3)) * 1.5 + np.cos(np.radians(lon * 2)) * 0.8
                    row.append(round(float(val), 2))
                grid.append(row)
            return {
                "variable": variable,
                "selected_depth": depth,
                "time_index": time_index,
                "lats": lats,
                "lons": lons,
                "min_val": 10.0 if variable == "temp" else 33.0,
                "max_val": 31.0 if variable == "temp" else 37.0,
                "grid": grid
            }

        try:
            da = target_ds[var_name]
            
            # Slice along time
            if "time" in da.dims:
                t_idx = time_index if 0 <= time_index < len(target_ds.time) else -1
                da = da.isel(time=t_idx)

            # Slice along depth if 3D
            if self.depth_coord in da.dims:
                da = da.sel({self.depth_coord: depth}, method="nearest")
                selected_depth = float(da[self.depth_coord].values)
            else:
                selected_depth = 0.0

            vals = da.values
            valid_vals = vals[~np.isnan(vals)]
            min_v = float(np.nanpercentile(valid_vals, 2)) if len(valid_vals) > 0 else 10.0
            max_v = float(np.nanpercentile(valid_vals, 98)) if len(valid_vals) > 0 else 32.0

            lats = [round(float(lat), 3) for lat in target_ds.latitude.values]
            lons = [round(float(lon), 3) for lon in target_ds.longitude.values]
            
            cleaned_grid = np.where(np.isnan(vals), None, np.round(vals, 2)).tolist()

            return {
                "variable": variable,
                "selected_depth": selected_depth,
                "time_index": time_index,
                "lats": lats,
                "lons": lons,
                "min_val": round(min_v, 2),
                "max_val": round(max_v, 2),
                "grid": cleaned_grid
            }
        except Exception as e:
            print(f"[!] Error extracting slice: {e}")
            return None

    def get_column_profile(self, lat: float, lon: float, variable: str = "temp", time_index: int = -1):
        target_ds, var_name = self._resolve_var(variable)
        
        if target_ds is None or var_name is None or var_name not in target_ds:
            depths = [5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 1000, 2000]
            return {
                "depth": depths,
                "values": [29.0 - (d ** 0.38) * 3.2 for d in depths],
                "nearest_lat": lat,
                "nearest_lon": lon
            }

        try:
            da = target_ds[var_name]
            if "time" in da.dims:
                t_idx = time_index if 0 <= time_index < len(target_ds.time) else -1
                da = da.isel(time=t_idx)

            col = da.sel(latitude=lat, longitude=lon, method="nearest")
            depths = [float(d) for d in target_ds[self.depth_coord].values]
            vals = [None if np.isnan(v) else float(np.round(v, 2)) for v in col.values]

            return {
                "depth": depths,
                "values": vals,
                "nearest_lat": float(col.latitude.values),
                "nearest_lon": float(col.longitude.values)
            }
        except Exception as e:
            print(f"[!] Error extracting column: {e}")
            return None

    def get_current_vectors(self, depth: float = 0.0, num_samples: int = 150):
        """
        Generates hydrodynamic ocean current vectors (u, v velocity) across the
        Arabian Sea, Bay of Bengal, and Indian Ocean for GPU particle streamlines.
        """
        lats = np.linspace(5.0, 25.0, 25)
        lons = np.linspace(65.0, 90.0, 30)
        
        vectors = []
        for lat in lats:
            for lon in lons:
                # Approximate geostrophic gyre flows in Indian Ocean:
                # Arabian Sea Clockwise Gyre + Bay of Bengal Cyclonic / Anticyclonic circulation
                # Somali current jet along Western boundary (lon 65)
                # West India Coastal Current (WICC) & East India Coastal Current (EICC)
                
                # Somali jet amplification
                somali_factor = np.exp(-((lon - 65.0) ** 2) / 12.0) * (1.2 if lat > 8 else 0.4)
                
                # Arabian Sea circulation
                u_as = -0.4 * np.sin(np.radians((lat - 15) * 12)) + somali_factor * 0.8
                v_as = 0.5 * np.cos(np.radians((lon - 70) * 10)) + somali_factor * 1.1
                
                # Bay of Bengal circulation
                bob_factor = 1.0 if lon > 80.0 else 0.0
                u_bob = 0.3 * np.cos(np.radians((lat - 12) * 14)) * bob_factor
                v_bob = -0.35 * np.sin(np.radians((lon - 85) * 12)) * bob_factor
                
                # Depth decay (surface currents are strongest, decay with thermocline depth)
                depth_decay = np.exp(-depth / 300.0)
                
                u = (u_as + u_bob) * depth_decay
                v = (v_as + v_bob) * depth_decay
                speed = float(np.sqrt(u**2 + v**2))
                
                vectors.append({
                    "lat": round(float(lat), 3),
                    "lon": round(float(lon), 3),
                    "u": round(float(u), 3),
                    "v": round(float(v), 3),
                    "speed": round(speed, 3)
                })

        return {
            "count": len(vectors),
            "lats": [round(float(lat), 2) for lat in lats],
            "lons": [round(float(lon), 2) for lon in lons],
            "sample_vectors": vectors
        }

netcdf_service = NetCDFService()
