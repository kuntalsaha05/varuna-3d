from typing import List, Optional
from pydantic import BaseModel

class GridMetadataResponse(BaseModel):
    time_steps: List[str]
    depth_levels: List[float]
    lat_range: List[float]
    lon_range: List[float]
    variables: List[str]
    default_variable: str

class DepthSliceResponse(BaseModel):
    variable: str
    selected_depth: float
    time_index: int
    lats: List[float]
    lons: List[float]
    min_val: float
    max_val: float
    grid: List[List[Optional[float]]]

class VectorPoint(BaseModel):
    lat: float
    lon: float
    u: float
    v: float
    speed: float

class CurrentVectorsResponse(BaseModel):
    count: int
    lats: List[float]
    lons: List[float]
    sample_vectors: List[VectorPoint]
