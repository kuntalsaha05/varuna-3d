from fastapi import APIRouter
from app.api.v1.endpoints import model_slices, observations, validation, bathymetry

api_router = APIRouter()
api_router.include_router(model_slices.router, prefix="/slice", tags=["3D Model Slices"])
api_router.include_router(observations.router, prefix="/observations", tags=["In-Situ Observations"])
api_router.include_router(validation.router, prefix="/validation", tags=["Model vs Observation Validation"])
api_router.include_router(bathymetry.router, prefix="/bathymetry", tags=["Bathymetry & Seafloor"])
