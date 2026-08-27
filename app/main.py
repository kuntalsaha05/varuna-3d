from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.engine import VarunaDataEngine
import os

app = FastAPI(title="Varuna-3D Ocean API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handle dataset path check on startup
NC_PATH = os.path.join("data", "incois_model_sample.nc")
engine = None

@app.on_event("startup")
def load_engine():
    global engine
    if os.path.exists(NC_PATH):
        engine = VarunaDataEngine(NC_PATH)
    else:
        print(f"Warning: Dataset not found at {NC_PATH}. Upload a file to test data slicing.")

@app.get("/api/v1/metadata")
def metadata():
    if not engine:
        raise HTTPException(status_code=500, detail="NetCDF file not loaded in server.")
    return engine.get_metadata()

@app.get("/api/v1/slice/horizontal")
def get_horizontal_slice(variable: str, depth: float, time_index: int = 0):
    if not engine:
        raise HTTPException(status_code=500, detail="NetCDF file not loaded in server.")
    try:
        return engine.slice_depth_plane(variable, depth, time_index)
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))