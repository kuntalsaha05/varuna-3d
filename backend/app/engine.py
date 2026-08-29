import xarray as xr
import numpy as np

class VarunaDataEngine:
    def __init__(self, nc_path: str):
        # Open NetCDF dataset lazily
        self.ds = xr.open_dataset(nc_path)

    def get_metadata(self):
        """Returns spatial bounds, depth dimensions, and variable keys."""
        return {
            "variables": list(self.ds.data_vars.keys()),
            "dimensions": {
                "depth": self.ds.depth.values.tolist() if "depth" in self.ds else [],
                "latitude": [float(self.ds.latitude.min()), float(self.ds.latitude.max())],
                "longitude": [float(self.ds.longitude.min()), float(self.ds.longitude.max())],
                "time": [str(t) for t in self.ds.time.values]
            }
        }

    def slice_depth_plane(self, var_name: str, depth_m: float, time_idx: int = 0):
        """Extracts a 2D depth layer grid."""
        data_slice = self.ds[var_name].isel(time=time_idx).sel(depth=depth_m, method="nearest")
        
        # Replace NaN values with None for clean JSON serialization
        clean_matrix = np.where(np.isnan(data_slice.values), None, data_slice.values)
        
        return {
            "variable": var_name,
            "target_depth": float(data_slice.depth.values),
            "latitudes": data_slice.latitude.values.tolist(),
            "longitudes": data_slice.longitude.values.tolist(),
            "matrix": clean_matrix.tolist()
        }