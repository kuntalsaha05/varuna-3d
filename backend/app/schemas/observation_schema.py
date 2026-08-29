from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class FloatMarker(BaseModel):
    PLATFORM_NUMBER: int
    latitude: float
    longitude: float
    time: str
    cycle_count: Optional[int] = 1
    latest_cycle: Optional[int] = 1
    max_depth: Optional[float] = None
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None

class FloatMarkerList(BaseModel):
    count: int
    floats: List[FloatMarker]

class TrajectoryPoint(BaseModel):
    cycle: int
    latitude: float
    longitude: float
    time: str

class FloatTrajectoryResponse(BaseModel):
    platform_number: int
    point_count: int
    trajectory: List[TrajectoryPoint]

class ResidualItem(BaseModel):
    depth: float
    residual: float

class ValidationProfileResponse(BaseModel):
    platform_number: int
    cycle_number: Optional[int] = 1
    time: Optional[str] = None
    variable: Optional[str] = "temp"
    coordinates: Dict[str, Any]
    rmse: Optional[float]
    mean_bias: Optional[float]
    mae: Optional[float] = None
    pearson_r: Optional[float] = None
    water_mass: Optional[str] = None
    residuals: Optional[List[ResidualItem]] = []
    observed: Dict[str, Any]
    modeled: Dict[str, Any]
