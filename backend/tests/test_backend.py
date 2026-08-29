import unittest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.core.netcdf_parser import netcdf_service
from app.core.argo_parser import argo_service
from app.core.spatial_indexer import spatial_indexer
from app.core.validation_engine import validation_engine
from app.core.bathymetry import bathymetry_service

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "VARUNA-3D" in data["title"]

def test_metadata_model_3d():
    response = client.get("/api/v1/slice/metadata?dataset_type=model_3d")
    assert response.status_code == 200
    data = response.json()
    assert "time_steps" in data
    assert "depth_levels" in data
    assert len(data["depth_levels"]) > 0
    assert "variables" in data
    assert "temp" in data["variables"]

def test_metadata_sst_and_chlorophyll():
    res_sst = client.get("/api/v1/slice/metadata?dataset_type=sst")
    assert res_sst.status_code == 200
    assert "sst" in res_sst.json()["variables"]

    res_chl = client.get("/api/v1/slice/metadata?dataset_type=chlorophyll")
    assert res_chl.status_code == 200
    assert "chlorophyll" in res_chl.json()["variables"]

def test_depth_slice():
    response = client.get("/api/v1/slice/depth?dataset_type=model_3d&variable=temp&depth=10.0&time_index=0")
    assert response.status_code == 200
    data = response.json()
    assert data["variable"] == "temp"
    assert "grid" in data
    assert len(data["grid"]) > 0
    assert len(data["lats"]) > 0
    assert len(data["lons"]) > 0

def test_observations_floats():
    response = client.get("/api/v1/observations/floats?limit=50")
    assert response.status_code == 200
    data = response.json()
    assert "floats" in data
    assert data["count"] > 0
    first_float = data["floats"][0]
    assert "PLATFORM_NUMBER" in first_float
    assert "latitude" in first_float
    assert "longitude" in first_float

def test_float_trajectory():
    floats_res = client.get("/api/v1/observations/floats?limit=1")
    float_id = floats_res.json()["floats"][0]["PLATFORM_NUMBER"]
    
    response = client.get(f"/api/v1/observations/trajectory?platform_number={float_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["platform_number"] == float_id
    assert len(data["trajectory"]) > 0

def test_validation_profile_and_export():
    floats_res = client.get("/api/v1/observations/floats?limit=1")
    float_id = floats_res.json()["floats"][0]["PLATFORM_NUMBER"]
    
    # 1. Profile JSON
    response = client.get(f"/api/v1/validation/profile?platform_number={float_id}&variable=temp")
    assert response.status_code == 200
    data = response.json()
    assert data["platform_number"] == float_id
    assert "coordinates" in data
    assert "observed" in data
    assert "modeled" in data
    assert "rmse" in data

    # 2. CSV Export
    csv_res = client.get(f"/api/v1/validation/export?platform_number={float_id}&variable=temp")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "VARUNA-3D" in csv_res.text

def test_bathymetry_grid():
    response = client.get("/api/v1/bathymetry/grid?res_lat=20&res_lon=30")
    assert response.status_code == 200
    data = response.json()
    assert "elevation" in data
    assert len(data["lats"]) == 20
    assert len(data["lons"]) == 30

def test_spatial_indexer():
    lat, lon, dist = spatial_indexer.find_nearest(15.0, 75.0)
    assert isinstance(lat, float)
    assert isinstance(lon, float)
    assert dist >= 0.0

def test_validation_metrics_engine():
    obs_depths = [5.0, 10.0, 20.0, 50.0, 100.0]
    obs_values = [28.0, 27.8, 27.5, 25.0, 20.0]
    mod_depths = [0.0, 10.0, 20.0, 50.0, 100.0, 200.0]
    mod_values = [28.2, 27.9, 27.4, 24.8, 19.8, 15.0]
    metrics = validation_engine.calculate_metrics(
        obs_depths, obs_values, mod_depths, mod_values, [35.5, 35.5, 35.6, 35.8, 36.0], 12.0, 70.0
    )
    assert metrics["rmse"] is not None
    assert metrics["rmse"] < 1.0
    assert metrics["mean_bias"] is not None
    assert metrics["water_mass"] is not None



class BackendTestSuite(unittest.TestCase):
    def test_root_endpoint(self):
        test_root_endpoint()

    def test_metadata_model_3d(self):
        test_metadata_model_3d()

    def test_metadata_sst_and_chlorophyll(self):
        test_metadata_sst_and_chlorophyll()

    def test_depth_slice(self):
        test_depth_slice()

    def test_observations_floats(self):
        test_observations_floats()

    def test_float_trajectory(self):
        test_float_trajectory()

    def test_validation_profile_and_export(self):
        test_validation_profile_and_export()

    def test_bathymetry_grid(self):
        test_bathymetry_grid()

    def test_spatial_indexer(self):
        test_spatial_indexer()

    def test_validation_metrics_engine(self):
        test_validation_metrics_engine()


if __name__ == "__main__":
    unittest.main(verbosity=2)


