import numpy as np
from scipy.interpolate import interp1d
from scipy.stats import pearsonr
from typing import Dict, Any, Tuple, Optional, List

class ValidationEngine:
    @staticmethod
    def classify_water_mass(surface_sal: float, surface_temp: float, lat: float, lon: float) -> str:
        """Classifies primary regional water mass based on Indian Ocean oceanography."""
        if lat > 10 and lon < 75:
            if surface_sal > 35.8:
                return "Arabian Sea High Salinity Water (ASHSW)"
            return "Arabian Sea Mixed Layer"
        elif lat > 10 and lon >= 75:
            if surface_sal < 34.0:
                return "Bay of Bengal Low Salinity Water (BOBLSW)"
            return "Bay of Bengal Mixed Layer"
        elif -10 <= lat <= 10:
            return "Equatorial Indian Ocean Water (EIO)"
        elif lat < -10 and surface_sal > 35.0:
            return "South Indian Subtropical Surface Water (SSTW)"
        elif surface_temp < 10.0:
            return "Antarctic Intermediate / Deep Water (AAIW)"
        return "Indian Ocean Central Water (IOCW)"

    @classmethod
    def calculate_metrics(
        cls,
        obs_depths: List[float],
        obs_values: List[float],
        mod_depths: List[float],
        mod_values: List[Optional[float]],
        obs_salinity: Optional[List[float]] = None,
        lat: float = 0.0,
        lon: float = 0.0
    ) -> Dict[str, Any]:
        valid_mod = [(d, v) for d, v in zip(mod_depths, mod_values) if v is not None]
        if len(valid_mod) < 2 or len(obs_depths) < 2 or len(obs_values) < 2:
            return {
                "rmse": None,
                "mean_bias": None,
                "mae": None,
                "pearson_r": None,
                "residuals": [],
                "water_mass": "Unknown"
            }

        m_depths, m_vals = zip(*valid_mod)
        interp_fn = interp1d(m_depths, m_vals, bounds_error=False, fill_value=np.nan)
        mod_interp = interp_fn(obs_depths)

        obs_arr = np.array(obs_values, dtype=float)
        mask = ~np.isnan(mod_interp) & ~np.isnan(obs_arr)

        if np.sum(mask) < 2:
            return {
                "rmse": None,
                "mean_bias": None,
                "mae": None,
                "pearson_r": None,
                "residuals": [],
                "water_mass": "Unknown"
            }

        valid_mod_vals = mod_interp[mask]
        valid_obs_vals = obs_arr[mask]
        valid_depths = np.array(obs_depths)[mask]

        residuals_arr = valid_mod_vals - valid_obs_vals
        rmse = float(np.sqrt(np.mean(residuals_arr ** 2)))
        mean_bias = float(np.mean(residuals_arr))
        mae = float(np.mean(np.abs(residuals_arr)))

        # Pearson correlation
        r_val = None
        if len(valid_obs_vals) > 2 and np.std(valid_obs_vals) > 0 and np.std(valid_mod_vals) > 0:
            try:
                r_val = float(pearsonr(valid_obs_vals, valid_mod_vals)[0])
            except Exception:
                r_val = None

        # Residual depth series
        residuals = [
            {"depth": round(float(d), 1), "residual": round(float(r), 3)}
            for d, r in zip(valid_depths, residuals_arr)
        ]

        # Water mass classification
        s_sal = obs_salinity[0] if obs_salinity and len(obs_salinity) > 0 else 35.0
        s_temp = obs_values[0] if len(obs_values) > 0 else 25.0
        water_mass = cls.classify_water_mass(s_sal, s_temp, lat, lon)

        return {
            "rmse": round(rmse, 3),
            "mean_bias": round(mean_bias, 3),
            "mae": round(mae, 3),
            "pearson_r": round(r_val, 3) if r_val is not None else None,
            "residuals": residuals,
            "water_mass": water_mass
        }

validation_engine = ValidationEngine()

