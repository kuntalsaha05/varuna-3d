from typing import List, Optional, Any
from pydantic import BaseModel

class GridMetadataResponse(BaseModel):
    dataset_type: Optional[str] = "model_3d"
    time_steps: List[str]
    depth_levels: List[float]
    lat_range: List[float]
    lon_range: List[float]
    variables: List[str]
    raw_variables: Optional[List[str]] = []
    default_variable: str
    units: Optional[str] = "°C"

class DepthSliceResponse(BaseModel):
    dataset_type: Optional[str] = "model_3d"
    variable: str
    raw_variable: Optional[str] = None
    selected_depth: float
    time_index: int
    time_str: Optional[str] = None
    lats: List[float]
    lons: List[float]
    min_val: float
    max_val: float
    grid: List[List[Optional[float]]]

class BathymetryResponse(BaseModel):
    lats: List[float]
    lons: List[float]
    elevation: List[List[float]]
    min_elevation: float
    max_elevation: float
