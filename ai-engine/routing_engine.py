# pyrefly: ignore [missing-import]
from ortools.constraint_solver import routing_enums_pb2
# pyrefly: ignore [missing-import]
from ortools.constraint_solver import pywrapcp
import math
import requests

def calculate_distance_matrix(locations):
    coords_string = ";".join([f"{loc[1]},{loc[0]}" for loc in locations])
    url = f"http://router.project-osrm.org/table/v1/driving/{coords_string}?annotations=distance"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if data.get("code") != "Ok" or "distances" not in data:
            return calculate_euclidean_distance_matrix(locations)
            
        matrix = []
        for row in data["distances"]:
            matrix.append([int(round(dist)) if dist is not None else 999999 for dist in row])
        return matrix
    except Exception:
        return calculate_euclidean_distance_matrix(locations)

def calculate_euclidean_distance_matrix(locations):
    matrix = []
    for from_node in locations:
        row = []
        for to_node in locations:
            dist = math.sqrt(((from_node[0] - to_node[0]) * 111) ** 2 + ((from_node[1] - to_node[1]) * 111) ** 2)
            row.append(round(dist * 1000))
        matrix.append(row)
    return matrix

def solve_vrppd(depot, pickups, deliveries, vehicles):
    # Indexing: 0 is Depot, 1 to P are Pickups, P+1 to P+D are Deliveries
    all_locations = [depot] + [[p["lat"], p["lng"]] for p in pickups] + [[d["lat"], d["lng"]] for d in deliveries]
    
    # Demands: Positive for pickup, negative for delivery to track running vehicle load
    demands = [0]
    for p in pickups: demands.append(int(p["weight_quintals"]))
    for d in deliveries: demands.append(-int(d["weight_quintals"]))
        
    distance_matrix = calculate_distance_matrix(all_locations)
    num_vehicles = len(vehicles)
    vehicle_capacities = [int(v["capacity_quintals"]) for v in vehicles]
    
    manager = pywrapcp.RoutingIndexManager(len(all_locations), num_vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Minimize fleet size by applying a fixed activation cost to each truck
    for i, v in enumerate(vehicles):
        routing.SetFixedCostOfVehicle(int(v["fixed_cost"]), i)

    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    
    # Configure heterogeneous capacities using AddDimensionWithVehicleCapacity
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  
        vehicle_capacities,
        True, 
        "Capacity"
    )
    
    # Distance dimension required to strictly enforce chronological order of pickups/deliveries
    routing.AddDimension(
        transit_callback_index,
        0,  
        9999999, 
        True,
        "Distance"
    )
    distance_dim = routing.GetDimensionOrDie("Distance")

    penalty = 1000000  # High penalty allows the solver to drop unfeasible isolated orders
    
    # Bind Farmer-to-Buyer pairs
    for i in range(len(pickups)):
        pickup_node = i + 1
        delivery_node = i + 1 + len(pickups)
        
        pickup_index = manager.NodeToIndex(pickup_node)
        delivery_index = manager.NodeToIndex(delivery_node)
        
        routing.AddPickupAndDelivery(pickup_index, delivery_index)
        # Force the same truck to handle both the pickup and the corresponding delivery
        routing.solver().Add(routing.VehicleVar(pickup_index) == routing.VehicleVar(delivery_index))
        # Force the truck to arrive at the pickup location BEFORE the delivery location
        routing.solver().Add(distance_dim.CumulVar(pickup_index) <= distance_dim.CumulVar(delivery_index))
        
        routing.AddDisjunction([pickup_index], penalty)
        routing.AddDisjunction([delivery_index], penalty)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
    
    solution = routing.SolveWithParameters(search_parameters)
    
    if not solution:
        return {"status": "error", "message": "No solution found."}

    routes_output = []
    
    for vehicle_id in range(num_vehicles):
        index = routing.Start(vehicle_id)
        path_coords = []
        node_sequence = []
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            path_coords.append(all_locations[node_index])
            node_sequence.append(node_index)
            index = solution.Value(routing.NextVar(index))
            
        if len(node_sequence) > 1:
            path_coords.append(all_locations[0])
            routes_output.append({
                "truck_id": vehicles[vehicle_id]["id"],
                "path_coords": path_coords,
                "node_sequence": node_sequence
            })
            
    return {"status": "success", "routes": routes_output}

if __name__ == "__main__":
    depot = [29.3909, 76.9708] # Panipat Hub
    pickups = [
        {"id": "F1_Sonipat", "lat": 28.9931, "lng": 77.0151, "weight_quintals": 5}, 
        {"id": "F2_Rohtak", "lat": 28.8955, "lng": 76.6066, "weight_quintals": 12}, 
        {"id": "F3_Karnal", "lat": 29.6857, "lng": 76.9905, "weight_quintals": 35} 
    ]
    deliveries = [
        {"id": "B1_Azadpur", "lat": 28.7373, "lng": 77.1725, "weight_quintals": 5}, 
        {"id": "B2_Gurugram", "lat": 28.4595, "lng": 77.0266, "weight_quintals": 12}, 
        {"id": "B3_Noida", "lat": 28.5355, "lng": 77.3910, "weight_quintals": 35} 
    ]
    vehicles = [
        {"id": "TATA_ACE_1", "capacity_quintals": 8, "fixed_cost": 1000},
        {"id": "BOLERO_1", "capacity_quintals": 15, "fixed_cost": 1800},
        {"id": "EICHER_1", "capacity_quintals": 40, "fixed_cost": 3500}
    ]
    
    import json
    res = solve_vrppd(depot, pickups, deliveries, vehicles)
    print(json.dumps(res, indent=2))