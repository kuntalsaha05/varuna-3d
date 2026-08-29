from typing import List, Optional
from pydantic import BaseModel

class FloatMarker(BaseModel):
    PLATFORM_NUMBER: int
    latitude: float
    longitude: float
    time: str

class FloatMarkerList(BaseModel):
    count: int
    floats: List[FloatMarker]

class ValidationProfileResponse(BaseModel):
    platform_number: int
    coordinates: dict
    rmse: Optional[float]
    mean_bias: Optional[float]
    observed: dict
    modeled: dict
