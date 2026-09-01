from fastapi import APIRouter, Query
from app.core.disaster_engine import DisasterEngine
from typing import Dict, Any

router = APIRouter()

@router.get("/alerts")
def get_coastal_alerts() -> Dict[str, Any]:
    """
    Retrieve active INCOIS coastal disaster and hazard warning bulletins.
    """
    alerts = DisasterEngine.get_active_coastal_alerts()
    return {
        "total_active_alerts": len(alerts),
        "source": "INCOIS Early Warning Centre (ESSO-INCOIS / MoES)",
        "alerts": alerts
    }

@router.get("/sar-drift")
def simulate_sar_drift(
    lat: float = Query(..., description="Distress origin Latitude"),
    lon: float = Query(..., description="Distress origin Longitude"),
    hours: int = Query(72, ge=6, le=120, description="Simulation drift duration in hours"),
    object_type: str = Query("life_raft", description="Object type: vessel_capsized, life_raft, oil_slick, person_in_water")
) -> Dict[str, Any]:
    """
    Computes forward Lagrangian drift trajectory and search uncertainty radius using ocean currents.
    """
    return DisasterEngine.calculate_sar_drift(start_lat=lat, start_lon=lon, hours=hours, object_type=object_type)

