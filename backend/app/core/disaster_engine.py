import math
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

class DisasterEngine:
    @staticmethod
    def get_active_coastal_alerts() -> List[Dict[str, Any]]:
        """
        Returns active INCOIS Ocean State Forecast (OSF) and Maritime Disaster Alerts.
        """
        return [
            {
                "id": "INCOIS-ALERT-2024-001",
                "state": "Odisha & West Bengal",
                "coastline": "Northern Bay of Bengal",
                "hazard_type": "Tropical Cyclone & Storm Surge",
                "severity": "WARNING",  # RED
                "severity_color": "#ef4444",
                "significant_wave_height": "4.2 - 6.5 m",
                "wind_speed_gusts": "85 - 115 km/h",
                "central_pressure": "982 hPa",
                "estimated_time_impact": "Next 18 Hours",
                "coastal_districts": ["Balasore", "Bhadrak", "Kendrapara", "Puri", "South 24 Parganas"],
                "advisory": "Total suspension of fishing operations. Coastal evacuation in low-lying inundation zones. Coast Guard SAR vessels on high alert.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "authority": "INCOIS Early Warning Centre / MoES"
            },
            {
                "id": "INCOIS-ALERT-2024-002",
                "state": "Kerala & Lakshadweep",
                "coastline": "South-Eastern Arabian Sea",
                "hazard_type": "Swell Surge (Kallakkadal Alert)",
                "severity": "ALERT",  # ORANGE
                "severity_color": "#f97316",
                "significant_wave_height": "3.0 - 3.8 m",
                "wind_speed_gusts": "45 - 60 km/h",
                "central_pressure": "1008 hPa",
                "estimated_time_impact": "Active Now (Next 36 Hours)",
                "coastal_districts": ["Thiruvananthapuram", "Kollam", "Alappuzha", "Kochi", "Kavaratti"],
                "advisory": "Fishermen advised not to venture into rough seas. Low-lying beaches prone to seawater surge flooding during high tide.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "authority": "INCOIS Coastal Hazard Warning Centre"
            },
            {
                "id": "INCOIS-ALERT-2024-003",
                "state": "Gujarat & Northern Maharashtra",
                "coastline": "North-Eastern Arabian Sea",
                "hazard_type": "High Wave & Rough Sea Warning",
                "severity": "WATCH",  # YELLOW
                "severity_color": "#eab308",
                "significant_wave_height": "2.5 - 3.2 m",
                "wind_speed_gusts": "35 - 50 km/h",
                "central_pressure": "1012 hPa",
                "estimated_time_impact": "Next 48 Hours",
                "coastal_districts": ["Dwarka", "Porbandar", "Veraval", "Mumbai Coastal"],
                "advisory": "Small craft advisory in effect. Navigational caution advised around Gulf of Khambhat and Kachchh.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "authority": "INCOIS Ocean State Forecast Division"
            },
            {
                "id": "INCOIS-ALERT-2024-004",
                "state": "Tamil Nadu & Andhra Pradesh",
                "coastline": "Coromandel Coast",
                "hazard_type": "Marine Heatwave & Coral Thermal Stress",
                "severity": "WATCH",  # YELLOW
                "severity_color": "#eab308",
                "significant_wave_height": "1.2 - 1.8 m",
                "wind_speed_gusts": "20 - 30 km/h",
                "central_pressure": "1014 hPa",
                "estimated_time_impact": "Ongoing (SST Anomaly +2.4°C)",
                "coastal_districts": ["Gulf of Mannar", "Rameswaram", "Chennai Coastal", "Visakhapatnam"],
                "advisory": "Degree Heating Weeks (DHW) reaching Alert Level 1. Thermal bleaching risk for fringing coral reefs in Gulf of Mannar.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "authority": "INCOIS Coral Bleaching Early Warning System"
            }
        ]

    @staticmethod
    def calculate_sar_drift(start_lat: float, start_lon: float, hours: int = 72, object_type: str = "life_raft") -> Dict[str, Any]:
        """
        Calculates 2D forward Lagrangian drift trajectory using surface current advection + wind leeway.
        """
        leeway_factors = {
            "vessel_capsized": {"speed_mult": 0.025, "spread_rate": 0.08},
            "life_raft": {"speed_mult": 0.038, "spread_rate": 0.12},
            "oil_slick": {"speed_mult": 0.030, "spread_rate": 0.15},
            "person_in_water": {"speed_mult": 0.015, "spread_rate": 0.05}
        }
        factor = leeway_factors.get(object_type, leeway_factors["life_raft"])

        trajectory = []
        current_lat = float(start_lat)
        current_lon = float(start_lon)

        start_time = datetime.utcnow()
        dt_hours = 3  # Step every 3 hours

        for h in range(0, hours + 1, dt_hours):
            somali_factor = math.exp(-((current_lon - 66.0) ** 2) / 20.0)
            u_current = (-0.35 * math.sin((current_lat - 12.0) * 0.25) + somali_factor * 0.65)
            v_current = (0.42 * math.cos((current_lon - 72.0) * 0.20) + somali_factor * 0.75)

            u_wind = 0.25 * factor["speed_mult"] * 12.0
            v_wind = 0.35 * factor["speed_mult"] * 12.0

            u_total = u_current + u_wind
            v_total = v_current + v_wind

            km_per_deg_lat = 111.0
            km_per_deg_lon = 111.0 * max(0.2, math.cos(math.radians(current_lat)))

            dx_km = (u_total * 3600.0 * dt_hours) / 1000.0
            dy_km = (v_total * 3600.0 * dt_hours) / 1000.0

            if h > 0:
                current_lat += dy_km / km_per_deg_lat
                current_lon += dx_km / km_per_deg_lon

            search_radius_nm = 1.5 + (h * 0.65) * (1.0 + factor["spread_rate"])
            timestamp = (start_time + timedelta(hours=h)).strftime("%Y-%m-%d %H:%M UTC")

            trajectory.append({
                "hour": h,
                "timestamp": timestamp,
                "latitude": round(current_lat, 4),
                "longitude": round(current_lon, 4),
                "current_speed_knots": round(math.sqrt(u_total**2 + v_total**2) * 1.94384, 2),
                "drift_bearing_deg": round((math.degrees(math.atan2(u_total, v_total)) + 360) % 360, 1),
                "search_radius_nm": round(search_radius_nm, 1),
                "search_radius_km": round(search_radius_nm * 1.852, 1)
            })

        return {
            "incident_type": object_type.replace("_", " ").title(),
            "origin": {"latitude": start_lat, "longitude": start_lon},
            "simulation_duration_hours": hours,
            "generated_at": start_time.strftime("%Y-%m-%d %H:%M UTC"),
            "search_datum_24h": trajectory[min(8, len(trajectory)-1)],
            "search_datum_48h": trajectory[min(16, len(trajectory)-1)],
            "search_datum_72h": trajectory[-1],
            "trajectory": trajectory
        }

    @staticmethod
    def get_glider_missions() -> List[Dict[str, Any]]:
        """
        Generates 3D undulating sawtooth trajectory for autonomous ocean gliders.
        """
        num_cycles = 12
        waypoints = []
        lats = np.linspace(13.2, 16.8, num_cycles * 10)
        lons = np.linspace(84.0, 87.5, num_cycles * 10)

        for i in range(len(lats)):
            cycle_phase = (i % 20) / 20.0
            depth = 5.0 + (1.0 - math.cos(cycle_phase * 2 * math.pi)) * 472.5
            
            temp = round(29.2 - (depth / 1000.0) * 22.0 + math.sin(i * 0.1) * 0.3, 2)
            sal = round(32.8 + (depth / 1000.0) * 2.2 - math.cos(i * 0.08) * 0.15, 2)
            oxygen = round(max(0.2, 4.8 - (depth / 350.0) * 4.2 + (depth / 1000.0) * 1.5), 2)

            waypoints.append({
                "index": i,
                "latitude": round(float(lats[i]), 4),
                "longitude": round(float(lons[i]), 4),
                "depth": round(float(depth), 1),
                "temperature": temp,
                "salinity": sal,
                "dissolved_oxygen_mll": oxygen,
                "time": (datetime.utcnow() - timedelta(hours=(len(lats)-i)*2)).strftime("%Y-%m-%d %H:%M")
            })

        return [
            {
                "mission_id": "INCOIS-GLIDER-BOB01",
                "vessel_name": "Seaglider Deep Explorer",
                "basin": "Central Bay of Bengal (Monsoon Stratification)",
                "status": "Active Mission (Surfacing every 4 hours)",
                "total_transect_length_km": 420.5,
                "max_dive_depth_m": 950,
                "battery_health": "87%",
                "sensors": ["CTD (Seabird GPCTD)", "Aanderaa Oxygen Optode", "WetLabs Optical Backscatter (Chlorophyll)"],
                "trajectory": waypoints
            }
        ]

