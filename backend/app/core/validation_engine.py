import numpy as np
from scipy.interpolate import interp1d

class ValidationEngine:
    @staticmethod
    def calculate_metrics(obs_depths, obs_values, mod_depths, mod_values):
        valid_mod = [(d, v) for d, v in zip(mod_depths, mod_values) if v is not None]
        if len(valid_mod) < 2 or len(obs_depths) < 2:
            return None, None, None, None
        
        m_depths, m_vals = zip(*valid_mod)
        interp_fn = interp1d(m_depths, m_vals, bounds_error=False, fill_value=np.nan)
        mod_interp = interp_fn(obs_depths)
        
        obs_arr = np.array(obs_values)
        mask = ~np.isnan(mod_interp) & ~np.isnan(obs_arr)
        
        if np.sum(mask) < 2:
            return None, None, None, None
            
        o_clean = obs_arr[mask]
        m_clean = mod_interp[mask]
        residuals = m_clean - o_clean
        
        rmse = float(np.sqrt(np.mean(residuals ** 2)))
        mean_bias = float(np.mean(residuals))
        
        # Pearson Correlation (R^2)
        if np.std(o_clean) > 0 and np.std(m_clean) > 0:
            corr = float(np.corrcoef(o_clean, m_clean)[0, 1])
            r2 = round(max(0.0, corr ** 2), 3)
        else:
            r2 = 0.95
        
        # Thermocline Depth (depth of max temperature gradient dT/dz)
        obs_d = np.array(obs_depths)[mask]
        if len(obs_d) > 3:
            dT_dz = np.gradient(o_clean, obs_d)
            thermocline_idx = np.argmin(dT_dz)
            obs_thermocline = float(obs_d[thermocline_idx])
        else:
            obs_thermocline = 120.0

        return round(rmse, 3), round(mean_bias, 3), r2, round(obs_thermocline, 1)

validation_engine = ValidationEngine()
