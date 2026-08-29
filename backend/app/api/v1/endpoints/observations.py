from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.core.argo_parser import argo_service
from app.schemas.observation_schema import FloatMarkerList, FloatTrajectoryResponse

router = APIRouter()

@router.get("/floats", response_model=FloatMarkerList)
def get_floats(limit: int = Query(400, description="Max floats to return")):
    records = argo_service.get_latest_markers(limit=limit)
    return {"count": len(records), "floats": records}

@router.get("/trajectory", response_model=FloatTrajectoryResponse)
def get_float_trajectory(
    platform_number: int = Query(..., description="Argo Platform WMO ID")
):
    traj = argo_service.get_float_trajectory(platform_number)
    if not traj:
        raise HTTPException(status_code=404, detail="Trajectory not found for float")
    return {
        "platform_number": platform_number,
        "point_count": len(traj),
        "trajectory": traj
    }

@router.get("/cycles")
def get_float_cycles(
    platform_number: int = Query(..., description="Argo Platform WMO ID")
):
    cycles = argo_service.get_float_cycles(platform_number)
    return {
        "platform_number": platform_number,
        "cycles": cycles
    }
