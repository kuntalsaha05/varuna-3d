import pandas as pd
from app.config import settings

class ArgoService:
    def __init__(self):
        try:
            self.df = pd.read_csv(settings.ARGO_FLOATS_PATH, low_memory=False)
            self.df["PLATFORM_NUMBER"] = self.df["PLATFORM_NUMBER"].astype(int)
            self.df["PRES"] = pd.to_numeric(self.df["PRES"], errors="coerce")
            self.df["TEMP"] = pd.to_numeric(self.df["TEMP"], errors="coerce")
            if "PSAL" in self.df.columns:
                self.df["PSAL"] = pd.to_numeric(self.df["PSAL"], errors="coerce")
            print(f"[✓] Loaded Argo Observations: {len(self.df):,} rows")
        except Exception as e:
            print(f"[!] Warning: Could not open {settings.ARGO_FLOATS_PATH}: {e}")
            self.df = pd.DataFrame()

    def get_latest_markers(self, limit: int = 400):
        if self.df.empty:
            # Fallback sample floats across Indian Ocean
            return [
                {"PLATFORM_NUMBER": 2902101, "latitude": 12.5, "longitude": 70.2, "time": "2024-01-10T12:00:00Z"},
                {"PLATFORM_NUMBER": 2902102, "latitude": 15.3, "longitude": 84.1, "time": "2024-01-11T08:30:00Z"},
                {"PLATFORM_NUMBER": 2902103, "latitude": 8.1, "longitude": 76.5, "time": "2024-01-09T14:15:00Z"},
                {"PLATFORM_NUMBER": 2902104, "latitude": 18.2, "longitude": 68.9, "time": "2024-01-12T19:00:00Z"},
                {"PLATFORM_NUMBER": 2902105, "latitude": 11.0, "longitude": 88.0, "time": "2024-01-10T04:45:00Z"},
            ]
        
        latest = self.df.drop_duplicates(subset=["PLATFORM_NUMBER"], keep="last").head(limit)
        records = []
        for _, row in latest.iterrows():
            records.append({
                "PLATFORM_NUMBER": int(row["PLATFORM_NUMBER"]),
                "latitude": round(float(row["latitude"]), 4),
                "longitude": round(float(row["longitude"]), 4),
                "time": str(row["time"]),
            })
        return records

    def get_profile_by_platform(self, platform_number: int):
        if self.df.empty:
            depths = [5, 25, 50, 100, 200, 400, 600, 800, 1000]
            return {
                "platform_number": platform_number,
                "lat": 12.5,
                "lon": 70.2,
                "depth": depths,
                "temp": [28.5, 28.1, 26.2, 21.0, 15.4, 11.2, 8.5, 6.8, 5.5],
                "psal": [35.2, 35.3, 35.6, 35.8, 35.1, 34.9, 34.8, 34.7, 34.7]
            }
        
        subset = self.df[self.df["PLATFORM_NUMBER"] == platform_number].dropna(subset=["PRES", "TEMP"]).sort_values(by="PRES")
        if subset.empty:
            return None
        
        return {
            "platform_number": platform_number,
            "lat": float(subset["latitude"].iloc[0]),
            "lon": float(subset["longitude"].iloc[0]),
            "depth": subset["PRES"].tolist(),
            "temp": subset["TEMP"].tolist(),
            "psal": subset["PSAL"].dropna().tolist() if "PSAL" in subset.columns else []
        }

argo_service = ArgoService()
