from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
from app.core.argo_parser import argo_service
from app.core.netcdf_parser import netcdf_service
from app.core.spatial_indexer import spatial_indexer
from app.core.validation_engine import validation_engine
from app.core.exporter import export_service
from app.schemas.observation_schema import ValidationProfileResponse

router = APIRouter()

def _build_validation_data(platform_number: int, variable: str, cycle_number: Optional[int] = None):
    obs_data = argo_service.get_profile_by_platform(platform_number, cycle_number=cycle_number)
    if not obs_data:
        raise HTTPException(status_code=404, detail=f"Argo Float WMO #{platform_number} profile not found")
        
    lat, lon = obs_data["lat"], obs_data["lon"]
    obs_time = obs_data.get("time", "")
    
    # Time collocation: match closest model time index
    t_idx = netcdf_service.find_nearest_time_index(obs_time)
    
    # Spatial collocation
    near_lat, near_lon, dist_km = spatial_indexer.find_nearest(lat, lon)
    model_col = netcdf_service.get_column_profile(lat=near_lat, lon=near_lon, variable=variable, time_index=t_idx)
    
    obs_values = obs_data["temp"] if variable == "temp" else obs_data.get("psal", [])
    metrics = validation_engine.calculate_metrics(
        obs_depths=obs_data["depth"],
        obs_values=obs_values,
        mod_depths=model_col["depth"],
        mod_values=model_col["values"],
        obs_salinity=obs_data.get("psal", []),
        lat=lat,
        lon=lon
    )
    
    return {
        "platform_number": platform_number,
        "cycle_number": obs_data.get("cycle_number", 1),
        "time": obs_time,
        "variable": variable,
        "coordinates": {
            "lat": lat,
            "lon": lon,
            "nearest_model_lat": model_col["nearest_lat"],
            "nearest_model_lon": model_col["nearest_lon"],
            "distance_km": dist_km
        },
        "rmse": metrics["rmse"],
        "mean_bias": metrics["mean_bias"],
        "mae": metrics["mae"],
        "pearson_r": metrics["pearson_r"],
        "water_mass": metrics["water_mass"],
        "residuals": metrics["residuals"],
        "observed": {
            "depth": obs_data["depth"],
            "values": obs_values,
            "temperature": obs_data["temp"],
            "salinity": obs_data.get("psal", [])
        },
        "modeled": {
            "depth": model_col["depth"],
            "values": model_col["values"],
            "variable": variable,
            "time_str": model_col.get("time_str")
        }
    }

@router.get("/profile", response_model=ValidationProfileResponse)
def get_validation_profile(
    platform_number: int = Query(..., description="Argo Platform WMO ID"),
    cycle_number: Optional[int] = Query(None, description="Specific Argo profile cycle"),
    variable: str = Query("temp", description="Validation variable (temp or sal)")
):
    return _build_validation_data(platform_number, variable, cycle_number)

@router.get("/export")
def export_validation_profile_csv(
    platform_number: int = Query(..., description="Argo Platform WMO ID"),
    cycle_number: Optional[int] = Query(None, description="Specific Argo profile cycle"),
    variable: str = Query("temp", description="Validation variable (temp or sal)")
):
    val_data = _build_validation_data(platform_number, variable, cycle_number)
    csv_content = export_service.generate_validation_csv(val_data)
    filename = f"varuna_validation_WMO_{platform_number}_cycle_{val_data.get('cycle_number', 1)}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
