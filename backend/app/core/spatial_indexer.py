import numpy as np
from scipy.spatial import cKDTree
from typing import Tuple, List, Optional
from app.core.netcdf_parser import netcdf_service

class SpatialIndexer:
    def __init__(self):
        self.tree: Optional[cKDTree] = None
        self.grid_coords: List[Tuple[float, float]] = []
        self._build_tree()

    def _build_tree(self):
        try:
            meta = netcdf_service.get_metadata("model_3d")
            ds = netcdf_service.ds_3d
            if ds is not None:
                lat_name = "latitude" if "latitude" in ds.coords else "lat"
                lon_name = "longitude" if "longitude" in ds.coords else "lon"
                lats = ds[lat_name].values
                lons = ds[lon_name].values

                mesh_lon, mesh_lat = np.meshgrid(lons, lats)
                self.grid_coords = list(zip(mesh_lat.ravel(), mesh_lon.ravel()))
                self.tree = cKDTree(self.grid_coords)
                print(f"[OK] Built Spatial Index with {len(self.grid_coords)} Indian Ocean model grid nodes")
        except Exception as e:
            print(f"[WARN] Spatial tree build deferred: {e}")

    def haversine_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates the great circle distance between two points on the earth in km."""
        r = 6371.0 # Earth radius in kilometers
        phi1, phi2 = np.radians(lat1), np.radians(lat2)
        dphi = np.radians(lat2 - lat1)
        dlambda = np.radians(lon2 - lon1)

        a = np.sin(dphi / 2.0) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
        c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
        return round(float(r * c), 2)

    def find_nearest(self, lat: float, lon: float) -> Tuple[float, float, float]:
        """Returns (nearest_lat, nearest_lon, distance_km)"""
        if self.tree is None:
            self._build_tree()

        if self.tree is not None and self.grid_coords:
            dist, idx = self.tree.query([lat, lon])
            n_lat, n_lon = self.grid_coords[idx]
            dist_km = self.haversine_distance_km(lat, lon, n_lat, n_lon)
            return float(n_lat), float(n_lon), dist_km
        
        return lat, lon, 0.0

spatial_indexer = SpatialIndexer()
