from fastapi import APIRouter, Query, HTTPException
from app.core.netcdf_parser import netcdf_service
from app.schemas.grid_schema import GridMetadataResponse, DepthSliceResponse

router = APIRouter()

@router.get("/metadata", response_model=GridMetadataResponse)
def get_metadata():
    return netcdf_service.get_metadata()

@router.get("/depth", response_model=DepthSliceResponse)
def get_depth_slice(
    depth: float = Query(0.0, description="Target depth in meters"),
    time_index: int = Query(-1, description="Time step index"),
    variable: str = Query("temp", description="Variable key (temp, sal)")
):
    slice_data = netcdf_service.get_depth_slice(variable=variable, depth=depth, time_index=time_index)
    if not slice_data:
        raise HTTPException(status_code=404, detail="Slice data not found")
    return slice_data
