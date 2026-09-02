from fastapi import APIRouter, Query
from app.core.argo_parser import argo_service
from app.schemas.observation_schema import FloatMarkerList

router = APIRouter()

@router.get("/floats", response_model=FloatMarkerList)
def get_floats(limit: int = Query(1000, description="Max floats to return")):
    records = argo_service.get_latest_markers(limit=limit)
    return {"count": len(records), "floats": records}
