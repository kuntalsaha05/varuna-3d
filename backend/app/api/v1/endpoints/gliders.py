from fastapi import APIRouter
from app.core.disaster_engine import DisasterEngine
from typing import Dict, Any

router = APIRouter()

@router.get("/missions")
def get_glider_missions() -> Dict[str, Any]:
    """
    Retrieve autonomous underwater glider missions with 3D sawtooth trajectories and along-track CTD.
    """
    missions = DisasterEngine.get_glider_missions()
    return {
        "total_active_gliders": len(missions),
        "source": "INCOIS OceanGliders Data Assembly Centre",
        "missions": missions
    }

