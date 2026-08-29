import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from app.config import settings

class ArgoService:
    def __init__(self):
        self.df = pd.DataFrame()
        self.float_summaries: Dict[int, Dict[str, Any]] = {}
        self.float_trajectories: Dict[int, List[Dict[str, Any]]] = {}
        self._load_and_index_floats()

    def _load_and_index_floats(self):
        if not os.path.exists(settings.ARGO_FLOATS_PATH):
            print(f"[WARN] Argo dataset not found at {settings.ARGO_FLOATS_PATH}")
            self._load_fallback_floats()
            return

        try:
            print("[INFO] Indexing Argo In-Situ Observations...")
            # Read columns needed for indexing
            self.df = pd.read_csv(settings.ARGO_FLOATS_PATH, low_memory=False)
            
            # Normalize column types
            self.df["PLATFORM_NUMBER"] = pd.to_numeric(self.df["PLATFORM_NUMBER"], errors="coerce").fillna(0).astype(int)
            self.df["PRES"] = pd.to_numeric(self.df["PRES"], errors="coerce")
            self.df["TEMP"] = pd.to_numeric(self.df["TEMP"], errors="coerce")
            if "PSAL" in self.df.columns:
                self.df["PSAL"] = pd.to_numeric(self.df["PSAL"], errors="coerce")
            if "CYCLE_NUMBER" in self.df.columns:
                self.df["CYCLE_NUMBER"] = pd.to_numeric(self.df["CYCLE_NUMBER"], errors="coerce").fillna(1).astype(int)

            # Apply quality control (QC) filtering: physical oceanographic ranges
            qc_mask = (
                (self.df["PRES"] >= 0) & (self.df["PRES"] <= 2500) &
                (self.df["TEMP"] >= -2.5) & (self.df["TEMP"] <= 38.0)
            )
            if "PSAL" in self.df.columns:
                qc_mask = qc_mask & (
                    self.df["PSAL"].isna() | ((self.df["PSAL"] >= 20.0) & (self.df["PSAL"] <= 43.0))
                )
            self.df = self.df[qc_mask]

            # Index latest float positions and trajectories
            grouped_floats = self.df.groupby("PLATFORM_NUMBER")
            for wmo, group in grouped_floats:
                # Cycle trajectory
                if "CYCLE_NUMBER" in group.columns:
                    cycles = group.drop_duplicates(subset=["CYCLE_NUMBER"]).sort_values(by="CYCLE_NUMBER")
                else:
                    cycles = group.drop_duplicates(subset=["time"])

                traj = []
                for _, row in cycles.iterrows():
                    traj.append({
                        "cycle": int(row.get("CYCLE_NUMBER", 1)),
                        "latitude": round(float(row["latitude"]), 4),
                        "longitude": round(float(row["longitude"]), 4),
                        "time": str(row["time"])
                    })
                self.float_trajectories[wmo] = traj

                # Latest summary
                latest_row = cycles.iloc[-1]
                self.float_summaries[wmo] = {
                    "PLATFORM_NUMBER": int(wmo),
                    "latitude": round(float(latest_row["latitude"]), 4),
                    "longitude": round(float(latest_row["longitude"]), 4),
                    "time": str(latest_row["time"]),
                    "cycle_count": len(cycles),
                    "latest_cycle": int(latest_row.get("CYCLE_NUMBER", 1)),
                    "max_depth": round(float(group["PRES"].max()), 1),
                    "min_temp": round(float(group["TEMP"].min()), 2),
                    "max_temp": round(float(group["TEMP"].max()), 2),
                }

            print(f"[OK] Indexed {len(self.float_summaries)} Argo floats ({len(self.df):,} QC-verified profile levels)")
        except Exception as e:
            print(f"[WARN] Error loading Argo dataset: {e}")
            self._load_fallback_floats()

    def _load_fallback_floats(self):
        fallback_list = [
            {"PLATFORM_NUMBER": 2902101, "latitude": 12.5, "longitude": 70.2, "time": "2024-01-10T12:00:00Z", "cycle_count": 45, "max_depth": 2000.0},
            {"PLATFORM_NUMBER": 2902102, "latitude": 15.3, "longitude": 84.1, "time": "2024-01-11T08:30:00Z", "cycle_count": 32, "max_depth": 2000.0},
            {"PLATFORM_NUMBER": 2902103, "latitude": 8.1, "longitude": 76.5, "time": "2024-01-09T14:15:00Z", "cycle_count": 60, "max_depth": 1800.0},
            {"PLATFORM_NUMBER": 2902104, "latitude": 18.2, "longitude": 68.9, "time": "2024-01-12T19:00:00Z", "cycle_count": 28, "max_depth": 1500.0},
            {"PLATFORM_NUMBER": 2902105, "latitude": 11.0, "longitude": 88.0, "time": "2024-01-10T04:45:00Z", "cycle_count": 51, "max_depth": 2000.0},
            {"PLATFORM_NUMBER": 2902106, "latitude": -5.2, "longitude": 65.4, "time": "2024-01-14T02:20:00Z", "cycle_count": 18, "max_depth": 2000.0},
            {"PLATFORM_NUMBER": 2902107, "latitude": -12.8, "longitude": 80.6, "time": "2024-01-13T10:10:00Z", "cycle_count": 40, "max_depth": 2000.0},
            {"PLATFORM_NUMBER": 2902108, "latitude": 4.5, "longitude": 92.3, "time": "2024-01-15T16:40:00Z", "cycle_count": 22, "max_depth": 1600.0}
        ]
        for f in fallback_list:
            wmo = f["PLATFORM_NUMBER"]
            self.float_summaries[wmo] = f
            self.float_trajectories[wmo] = [
                {"cycle": 1, "latitude": f["latitude"] - 1.0, "longitude": f["longitude"] - 1.0, "time": "2023-11-01T00:00:00Z"},
                {"cycle": 2, "latitude": f["latitude"] - 0.5, "longitude": f["longitude"] - 0.5, "time": "2023-12-01T00:00:00Z"},
                {"cycle": f["cycle_count"], "latitude": f["latitude"], "longitude": f["longitude"], "time": f["time"]}
            ]

    def get_latest_markers(self, limit: int = 400) -> List[Dict[str, Any]]:
        floats = list(self.float_summaries.values())
        return floats[:limit]

    def get_float_trajectory(self, platform_number: int) -> List[Dict[str, Any]]:
        return self.float_trajectories.get(platform_number, [])

    def get_float_cycles(self, platform_number: int) -> List[int]:
        traj = self.float_trajectories.get(platform_number, [])
        return [p["cycle"] for p in traj if "cycle" in p]

    def get_profile_by_platform(self, platform_number: int, cycle_number: Optional[int] = None) -> Optional[Dict[str, Any]]:
        if self.df.empty or platform_number not in self.float_summaries:
            summary = self.float_summaries.get(platform_number, {})
            lat = summary.get("latitude", 12.5)
            lon = summary.get("longitude", 70.2)
            time_str = summary.get("time", "2024-01-10T12:00:00Z")
            depths = [5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1000, 1500, 2000]
            temp = [28.8, 28.5, 28.2, 27.5, 26.1, 23.4, 20.8, 17.2, 14.5, 11.8, 9.7, 7.5, 6.2, 5.3, 3.8, 2.9]
            psal = [35.2, 35.25, 35.3, 35.5, 35.8, 35.9, 35.7, 35.4, 35.1, 34.9, 34.85, 34.8, 34.75, 34.7, 34.68, 34.65]
            return {
                "platform_number": platform_number,
                "cycle_number": cycle_number or 1,
                "lat": lat,
                "lon": lon,
                "time": time_str,
                "depth": depths,
                "temp": temp,
                "psal": psal
            }

        subset = self.df[self.df["PLATFORM_NUMBER"] == platform_number]
        if cycle_number is not None and "CYCLE_NUMBER" in subset.columns:
            cycle_subset = subset[subset["CYCLE_NUMBER"] == cycle_number]
            if not cycle_subset.empty:
                subset = cycle_subset
            else:
                # If specific cycle not found, take latest cycle
                max_cycle = subset["CYCLE_NUMBER"].max()
                subset = subset[subset["CYCLE_NUMBER"] == max_cycle]
        elif "CYCLE_NUMBER" in subset.columns:
            max_cycle = subset["CYCLE_NUMBER"].max()
            subset = subset[subset["CYCLE_NUMBER"] == max_cycle]

        subset = subset.dropna(subset=["PRES", "TEMP"]).sort_values(by="PRES")
        if subset.empty:
            return None

        lat = float(subset["latitude"].iloc[0])
        lon = float(subset["longitude"].iloc[0])
        time_str = str(subset["time"].iloc[0])
        curr_cycle = int(subset["CYCLE_NUMBER"].iloc[0]) if "CYCLE_NUMBER" in subset.columns else 1

        pres_vals = np.round(subset["PRES"].values, 1).tolist()
        temp_vals = np.round(subset["TEMP"].values, 3).tolist()
        psal_vals = []
        if "PSAL" in subset.columns and not subset["PSAL"].isna().all():
            psal_vals = np.round(subset["PSAL"].fillna(35.0).values, 3).tolist()

        return {
            "platform_number": platform_number,
            "cycle_number": curr_cycle,
            "lat": lat,
            "lon": lon,
            "time": time_str,
            "depth": pres_vals,
            "temp": temp_vals,
            "psal": psal_vals
        }

argo_service = ArgoService()

