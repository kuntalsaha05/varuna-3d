import numpy as np
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
