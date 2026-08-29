import numpy as np
from typing import Dict, Any, List

class BathymetryService:
    def __init__(self):
        self.cached_grid: Dict[str, Any] = {}

    def get_bathymetry_grid(self, res_lat: int = 50, res_lon: int = 70) -> Dict[str, Any]:
        """
        Generates calibrated bathymetric seafloor elevation for the Indian Ocean
        (Lat: -30 to +30, Lon: 30 to 120).
        Negative values represent ocean depths in meters (e.g. -4000m).
        """
        if self.cached_grid:
            return self.cached_grid

        lats = np.linspace(-30.0, 30.0, res_lat)
        lons = np.linspace(30.0, 120.0, res_lon)
        lon_grid, lat_grid = np.meshgrid(lons, lats)

        # Baseline abyssal plain depth ~ 4200m
        depth = np.full_like(lon_grid, -4200.0)

        # 1. Continental landmass elevation (India subcontinent: lat 8..28, lon 68..90)
        india_mask = (lat_grid > 8) & (lat_grid < 28) & (lon_grid > 68) & (lon_grid < 88)
        # Triangular peninsular shape
        peninsula_mask = india_mask & ((lat_grid - 8) > (np.abs(lon_grid - 78) * 1.6 - 3))
        depth[peninsula_mask] = 150.0 # Land above sea level

        # Continental shelf around India (shallower depths 0 to -200m, slope to -1500m)
        near_india = (lat_grid > 6) & (lat_grid < 26) & (lon_grid > 65) & (lon_grid < 92) & ~peninsula_mask
        dist_to_coast = np.sqrt((lat_grid - 15)**2 + (lon_grid - 78)**2)
        shelf_factor = np.clip((dist_to_coast - 6) / 10.0, 0, 1)
        depth[near_india] = -200.0 - shelf_factor[near_india] * 3000.0

        # 2. Arabian Peninsula (lat 12..30, lon 40..60)
        arabia_mask = (lat_grid > 12) & (lat_grid < 30) & (lon_grid > 40) & (lon_grid < 60) & ((lat_grid - 12) > (lon_grid - 55) * -0.6)
        depth[arabia_mask] = 200.0

        # 3. East Africa (lat -30..12, lon 30..45)
        africa_mask = (lon_grid < 42) & (lat_grid < 12)
        depth[africa_mask] = 200.0

        # 4. Madagascar (lat -25..-12, lon 43..51)
        madagascar_mask = (lat_grid > -25) & (lat_grid < -12) & (lon_grid > 43) & (lon_grid < 51)
        depth[madagascar_mask] = 100.0

        # 5. Sumatra / Indonesia (lat -10..8, lon 95..120)
        sumatra_mask = (lat_grid > -10) & (lat_grid < 8) & (lon_grid > 95) & ((lon_grid - 95) > (lat_grid + 10) * 1.2)
        depth[sumatra_mask] = 150.0

        # 6. Major Oceanic Ridges (Shallower underwater features -1500m to -2500m)
        # Ninety East Ridge (Lon ~90, Lat -30 to 10)
        ninety_east = (np.abs(lon_grid - 90.0) < 1.8) & (lat_grid > -30) & (lat_grid < 10) & (depth < -1500)
        depth[ninety_east] = -2200.0 + np.random.uniform(-100, 100, size=np.sum(ninety_east))

        # Central Indian Ridge (SW to NE ridge)
        cir = (np.abs(lon_grid - (65.0 - lat_grid * 0.5)) < 2.2) & (lat_grid > -28) & (lat_grid < 5) & (depth < -1500)
        depth[cir] = -2500.0 + np.random.uniform(-150, 150, size=np.sum(cir))

        # Carlsberg Ridge (NW towards Gulf of Aden)
        carlsberg = (np.abs((lat_grid - 5) - (lon_grid - 63) * 0.4) < 1.8) & (lon_grid > 50) & (lon_grid < 68) & (depth < -1500)
        depth[carlsberg] = -2300.0

        # Chagos-Laccadive Ridge (Lon ~72-74, Lat -10 to 14)
        chagos = (np.abs(lon_grid - 73.0) < 1.2) & (lat_grid > -10) & (lat_grid < 14) & (depth < -1000)
        depth[chagos] = -1200.0

        # Sunda / Java Trench (Deep trench down to -6500m)
        sunda_trench = (lat_grid > -11) & (lat_grid < 0) & (np.abs(lon_grid - (98 + (lat_grid + 10) * 1.5)) < 1.2)
        depth[sunda_trench] = -6000.0

        self.cached_grid = {
            "lats": [round(float(x), 2) for x in lats],
            "lons": [round(float(x), 2) for x in lons],
            "elevation": np.round(depth, 1).tolist(),
            "min_elevation": float(np.min(depth)),
            "max_elevation": float(np.max(depth))
        }
        return self.cached_grid

bathymetry_service = BathymetryService()

