from fastapi import APIRouter, HTTPException, Query
from app.core.argo_parser import argo_service
from app.core.netcdf_parser import netcdf_service
from app.core.validation_engine import validation_engine
from app.schemas.observation_schema import ValidationProfileResponse

router = APIRouter()

@router.get("/profile", response_model=ValidationProfileResponse)
def get_validation_profile(
    platform_number: int = Query(..., description="Argo Platform WMO ID"),
    variable: str = Query("temp", description="Validation variable (temp or sal)")
):
    obs_data = argo_service.get_profile_by_platform(platform_number)
    if not obs_data:
        raise HTTPException(status_code=404, detail="Float ID not found")
        
    lat, lon = obs_data["lat"], obs_data["lon"]
    model_col = netcdf_service.get_column_profile(lat=lat, lon=lon, variable=variable)
    
    rmse, bias, r2, thermocline_d = validation_engine.calculate_metrics(
        obs_depths=obs_data["depth"],
        obs_values=obs_data["temp"] if variable == "temp" else obs_data.get("psal", []),
        mod_depths=model_col["depth"],
        mod_values=model_col["values"]
    )
    
    return {
        "platform_number": platform_number,
        "coordinates": {"lat": lat, "lon": lon, "nearest_model_lat": model_col["nearest_lat"], "nearest_model_lon": model_col["nearest_lon"]},
        "rmse": rmse,
        "mean_bias": bias,
        "r2_score": r2,
        "thermocline_depth": thermocline_d,
        "observed": {
            "depth": obs_data["depth"],
            "temperature": obs_data["temp"],
            "salinity": obs_data.get("psal", [])
        },
        "modeled": {
            "depth": model_col["depth"],
            "values": model_col["values"]
        }
    }
