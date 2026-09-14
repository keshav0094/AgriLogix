from data_pipeline import start_pipeline
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

# Ignore Pyright import warnings for local files
from forecast_engine import run_price_forecast  # type: ignore
from routing_engine import solve_vrppd          # type: ignore

app = FastAPI(
    title="KrishiSetu AI Engine",
    description="Microservice for price forecasting and multi-vehicle route optimization (VRPPD)",
    version="2.0.0"
)

@app.on_event("startup")
def startup_event():
    start_pipeline()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models for Forecasting ---
class ForecastRequest(BaseModel):
    crop_name: str = "Potato"
    state: Optional[str] = None
    forecast_days: int = 14

# --- Models for Advanced Logistics (VRPPD) ---
class Coordinate(BaseModel):
    lat: float
    lng: float

class FarmPickup(BaseModel):
    id: str
    lat: float
    lng: float
    weight_quintals: float
    farmer_name: Optional[str] = None
    crop: Optional[str] = None

class BuyerDelivery(BaseModel):
    id: str
    lat: float
    lng: float
    weight_quintals: float
    buyer_name: Optional[str] = None

class VehicleConfig(BaseModel):
    id: str
    capacity_quintals: float
    fixed_cost: float = 1000.0

class RoutingRequest(BaseModel):
    # New VRPPD Contract
    depot: Optional[Coordinate] = None
    pickups: Optional[List[FarmPickup]] = None
    deliveries: Optional[List[BuyerDelivery]] = None
    vehicles: Optional[List[VehicleConfig]] = None

    # Backward-Compatibility Contract
    truckCapacityKg: Optional[float] = None
    listingIds: Optional[List[str]] = None

# Default Corridor Data (NCR - Haryana - Western UP)
DEFAULT_DEPOT = [29.3909, 76.9708]  # Panipat Logistics Hub

DEFAULT_PICKUPS = [
    {"id": "FARM-SONIPAT", "lat": 28.9931, "lng": 77.0151, "weight_quintals": 5.0, "farmer_name": "Ramesh Kumar", "crop": "Potato"},
    {"id": "FARM-ROHTAK", "lat": 28.8955, "lng": 76.6066, "weight_quintals": 12.0, "farmer_name": "Suresh Hooda", "crop": "Onion"},
    {"id": "FARM-KARNAL", "lat": 29.6857, "lng": 76.9905, "weight_quintals": 35.0, "farmer_name": "Gurpreet Singh", "crop": "Wheat"},
]

DEFAULT_DELIVERIES = [
    {"id": "BUY-AZADPUR", "lat": 28.7373, "lng": 77.1725, "weight_quintals": 5.0, "buyer_name": "Azadpur Mandi Wholesaler"},
    {"id": "BUY-GURUGRAM", "lat": 28.4595, "lng": 77.0266, "weight_quintals": 12.0, "buyer_name": "FreshCart Retail Gurugram"},
    {"id": "BUY-NOIDA", "lat": 28.5355, "lng": 77.3910, "weight_quintals": 35.0, "buyer_name": "Metro Food Hub Noida"},
]

DEFAULT_VEHICLES = [
    {"id": "TATA_ACE_1", "capacity_quintals": 8.0, "fixed_cost": 1000.0},
    {"id": "BOLERO_1", "capacity_quintals": 15.0, "fixed_cost": 1800.0},
    {"id": "EICHER_1", "capacity_quintals": 40.0, "fixed_cost": 3500.0},
]

MOCK_LISTINGS = {
    "LST-8831": {"lat": 28.6139, "lng": 77.2090, "weight_quintals": 5.0},
    "LST-8832": {"lat": 28.6210, "lng": 77.2150, "weight_quintals": 3.0},
    "LST-8835": {"lat": 28.6300, "lng": 77.2200, "weight_quintals": 7.0},
    "LST-8836": {"lat": 28.6400, "lng": 77.2300, "weight_quintals": 4.0},
}

# --- Endpoints ---
@app.get("/")
def health_check():
    return {"status": "online", "service": "KrishiSetu AI Forecasting & Multi-Vehicle VRPPD Engine"}

@app.post("/api/v1/forecast/price")
def get_price_forecast(payload: ForecastRequest):
    try:
        forecast_result = run_price_forecast(
            crop_name=payload.crop_name,
            state_name=payload.state,
            forecast_days=payload.forecast_days
        )
        return {"status": "success", "data": forecast_result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/logistics/optimize-routes")
def optimize_logistics(payload: RoutingRequest):
    try:
        # 1. Resolve Depot
        depot = [payload.depot.lat, payload.depot.lng] if payload.depot else DEFAULT_DEPOT

        # 2. Resolve Pickups & Deliveries
        if payload.pickups and payload.deliveries:
            pickups_data = [p.model_dump() for p in payload.pickups]
            deliveries_data = [d.model_dump() for d in payload.deliveries]
        elif payload.listingIds:
            # Adapt old listingIds request into pickup-delivery pairs
            pickups_data = []
            deliveries_data = []
            for lid in payload.listingIds:
                item = MOCK_LISTINGS.get(lid, {"lat": 28.6100, "lng": 77.2100, "weight_quintals": 2.0})
                pickups_data.append({"id": lid, "lat": item["lat"], "lng": item["lng"], "weight_quintals": item["weight_quintals"]})
                deliveries_data.append({"id": f"DELIV-{lid}", "lat": 28.7373, "lng": 77.1725, "weight_quintals": item["weight_quintals"]})
        else:
            # Default rich scenario for testing
            pickups_data = DEFAULT_PICKUPS
            deliveries_data = DEFAULT_DELIVERIES

        # 3. Resolve Fleet Configuration
        if payload.vehicles:
            vehicles_data = [v.model_dump() for v in payload.vehicles]
        elif payload.truckCapacityKg:
            vehicles_data = [{"id": "PRIMARY_TRUCK", "capacity_quintals": payload.truckCapacityKg / 100.0, "fixed_cost": 1500.0}]
        else:
            vehicles_data = DEFAULT_VEHICLES

        # 4. Run Optimization
        optimization_result = solve_vrppd(depot, pickups_data, deliveries_data, vehicles_data)

        if optimization_result.get("status") == "error":
            raise HTTPException(status_code=422, detail=optimization_result.get("message"))

        # 5. Build Human-Readable Stops & Audit Visited Nodes
        visited_nodes = set()
        dispatched_routes = []
        total_fixed_cost = 0

        vehicle_dict = {v["id"]: v for v in vehicles_data}

        for r in optimization_result.get("routes", []):
            truck_id = r["truck_id"]
            seq = r["node_sequence"]
            visited_nodes.update(seq)

            fixed_cost = vehicle_dict.get(truck_id, {}).get("fixed_cost", 0.0)
            total_fixed_cost += fixed_cost

            stops = []
            for node_idx in seq:
                if node_idx == 0:
                    stops.append({"step": len(stops) + 1, "type": "DEPOT", "name": "Central Logistics Hub", "coords": depot})
                elif 1 <= node_idx <= len(pickups_data):
                    p = pickups_data[node_idx - 1]
                    stops.append({
                        "step": len(stops) + 1,
                        "type": "PICKUP",
                        "id": p["id"],
                        "name": p.get("farmer_name", p["id"]),
                        "crop": p.get("crop", "Produce"),
                        "weight_quintals": p["weight_quintals"],
                        "coords": [p["lat"], p["lng"]]
                    })
                else:
                    d_idx = node_idx - 1 - len(pickups_data)
                    if d_idx < len(deliveries_data):
                        d = deliveries_data[d_idx]
                        stops.append({
                            "step": len(stops) + 1,
                            "type": "DELIVERY",
                            "id": d["id"],
                            "name": d.get("buyer_name", d["id"]),
                            "weight_quintals": d["weight_quintals"],
                            "coords": [d["lat"], d["lng"]]
                        })

            dispatched_routes.append({
                "truckId": truck_id,
                "dispatchedFixedCost": fixed_cost,
                "pathCoords": r["path_coords"],
                "stops": stops
            })

        # 6. Track Unserviced Requests
        unassigned_orders = []
        for i, p in enumerate(pickups_data):
            pickup_node_idx = i + 1
            if pickup_node_idx not in visited_nodes:
                unassigned_orders.append({
                    "pickupId": p["id"],
                    "deliveryId": deliveries_data[i]["id"],
                    "reason": "Exceeded available vehicle capacity or outside profitable corridor"
                })

        # Backward compatibility waypoints format
        optimized_waypoints = []
        if dispatched_routes:
            for s in dispatched_routes[0]["stops"]:
                optimized_waypoints.append({
                    "sequence": s["step"],
                    "listingId": s.get("id", "HUB"),
                    "lat": s["coords"][0],
                    "lng": s["coords"][1]
                })

        return {
            "status": "success",
            "routeId": f"RTE-{uuid.uuid4().hex[:4].upper()}",
            "fleetSummary": {
                "availableVehicles": len(vehicles_data),
                "dispatchedVehicles": len(dispatched_routes),
                "totalFleetCostInr": total_fixed_cost
            },
            "routes": dispatched_routes,
            "unassignedOrders": unassigned_orders,
            "optimizedWaypoints": optimized_waypoints
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))