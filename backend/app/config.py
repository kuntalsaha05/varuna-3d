import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VARUNA-3D: Ocean Model & In-Situ Visualizer"
    API_V1_STR: str = "/api/v1"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    MODEL_GRID_PATH: str = os.path.join(DATA_DIR, "1_model_grid-3d", "incois_argo_10day_McCreary_FULL.nc")
    ARGO_FLOATS_PATH: str = os.path.join(DATA_DIR, "2_in_situ_observations", "Indian_ARGO_Floats_FULL.csv")
    SST_PATH: str = os.path.join(DATA_DIR, "3_sst", "incois_argo_sst_weekly_FULL.nc")
    CHLOROPHYLL_PATH: str = os.path.join(DATA_DIR, "4_chlorophyll", "IRS_chlorophyll_datasets_FULL.nc")

settings = Settings()
