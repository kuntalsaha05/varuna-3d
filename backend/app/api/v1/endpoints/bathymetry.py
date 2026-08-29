from fastapi import APIRouter, Query
from app.core.bathymetry import bathymetry_service
from app.schemas.grid_schema import BathymetryResponse

router = APIRouter()

@router.get("/grid", response_model=BathymetryResponse)
def get_bathymetry_grid(
    res_lat: int = Query(50, description="Latitude grid resolution"),
    res_lon: int = Query(70, description="Longitude grid resolution")
):
    return bathymetry_service.get_bathymetry_grid(res_lat=res_lat, res_lon=res_lon)
