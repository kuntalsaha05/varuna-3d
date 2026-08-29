import io
import csv
from typing import Dict, Any, List

class ExportService:
    @staticmethod
    def generate_validation_csv(val_data: Dict[str, Any]) -> str:
        """Generates CSV text for a complete validation report."""
        output = io.StringIO()
        writer = csv.writer(output)

        # Header metadata
        writer.writerow(["# VARUNA-3D Model vs Argo Float Validation Report"])
        writer.writerow(["# Platform WMO ID", val_data.get("platform_number")])
        writer.writerow(["# Cycle Number", val_data.get("cycle_number", 1)])
        writer.writerow(["# Observation Time", val_data.get("time", "N/A")])
        writer.writerow(["# Float Latitude", val_data.get("coordinates", {}).get("lat")])
        writer.writerow(["# Float Longitude", val_data.get("coordinates", {}).get("lon")])
        writer.writerow(["# Nearest Model Lat", val_data.get("coordinates", {}).get("nearest_model_lat")])
        writer.writerow(["# Nearest Model Lon", val_data.get("coordinates", {}).get("nearest_model_lon")])
        writer.writerow(["# Distance (km)", val_data.get("coordinates", {}).get("distance_km")])
        writer.writerow(["# RMSE Anomaly", val_data.get("rmse")])
        writer.writerow(["# Mean Bias", val_data.get("mean_bias")])
        writer.writerow(["# MAE", val_data.get("mae")])
        writer.writerow(["# Pearson Correlation (r)", val_data.get("pearson_r")])
        writer.writerow(["# Water Mass Classification", val_data.get("water_mass")])
        writer.writerow([])

        # Table data
        writer.writerow(["Depth_m", "Observed_Value", "Model_Interpolated_Value", "Residual_Error", "Observed_Salinity"])
        
        obs_depths = val_data.get("observed", {}).get("depth", [])
        obs_vals = val_data.get("observed", {}).get("values", [])
        obs_psal = val_data.get("observed", {}).get("salinity", [])
        mod_depths = val_data.get("modeled", {}).get("depth", [])
        mod_vals = val_data.get("modeled", {}).get("values", [])

        # Create quick map of mod depths
        mod_map = {d: v for d, v in zip(mod_depths, mod_vals)}

        for i, d in enumerate(obs_depths):
            o_val = obs_vals[i] if i < len(obs_vals) else ""
            s_val = obs_psal[i] if i < len(obs_psal) else ""
            m_val = mod_map.get(d, "")
            res = ""
            if isinstance(o_val, (int, float)) and isinstance(m_val, (int, float)):
                res = round(m_val - o_val, 3)
            writer.writerow([d, o_val, m_val, res, s_val])

        return output.getvalue()

export_service = ExportService()

