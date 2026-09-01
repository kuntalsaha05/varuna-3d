from fastapi import APIRouter, Query, Body, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.ai_engine import varuna_ai_engine

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
def ai_chat(request: ChatRequest):
    """
    Varuna-AI Oceanographic Copilot: Parses natural language input and compiles
    executable 3D actions alongside scientific ocean insights.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    return varuna_ai_engine.process_query(user_prompt=request.prompt, current_context=request.context)

@router.get("/anomalies")
def get_anomalies(
    variable: str = Query("temp", description="Variable to scan for anomalies"),
    depth: float = Query(5.0, description="Depth level to scan")
):
    """
    Detects spatial statistical anomalies: Marine Heatwaves (MHWs), Coastal Upwelling cores,
    and Salinity Barrier Layers across the active ocean volume.
    """
    return {
        "variable": variable,
        "depth": depth,
        "anomalies": varuna_ai_engine.detect_anomalies(variable=variable, depth=depth)
    }

@router.get("/mld")
def get_mld_profile(
    lat: float = Query(..., description="Latitude coordinate"),
    lon: float = Query(..., description="Longitude coordinate")
):
    """
    Calculates Mixed Layer Depth (MLD), Thermocline Depth (D20), and max dT/dz gradient.
    """
    return varuna_ai_engine.calculate_mld(lat=lat, lon=lon)

