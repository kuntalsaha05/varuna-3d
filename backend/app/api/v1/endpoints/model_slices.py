from fastapi import APIRouter, Query, HTTPException
from app.core.netcdf_parser import netcdf_service
from app.schemas.grid_schema import GridMetadataResponse, DepthSliceResponse, CurrentVectorsResponse

router = APIRouter()

@router.get("/metadata", response_model=GridMetadataResponse)
def get_metadata():
    return netcdf_service.get_metadata()

@router.get("/depth", response_model=DepthSliceResponse)
def get_depth_slice(
    depth: float = Query(0.0, description="Target depth in meters (e.g. 0, 10, 50, 100, 200, 500, 1000)"),
    time_index: int = Query(-1, description="Time step index"),
    variable: str = Query("temp", description="Variable key: temp, sal, sst, chlorophyll")
):
    slice_data = netcdf_service.get_depth_slice(variable=variable, depth=depth, time_index=time_index)
    if not slice_data:
        raise HTTPException(status_code=404, detail="Slice data not found")
    return slice_data

@router.get("/currents", response_model=CurrentVectorsResponse)
def get_current_vectors(
    depth: float = Query(0.0, description="Depth level for hydrodynamic current vectors")
):
    vectors_data = netcdf_service.get_current_vectors(depth=depth)
    return vectors_data
