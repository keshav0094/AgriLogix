package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiRoutingResponse {
    private String status;
    private String routeId;
    private FleetSummary fleetSummary;
    private List<Route> routes;
    private List<UnassignedOrder> unassignedOrders;

    @Data
    public static class FleetSummary {
        private Integer availableVehicles;
        private Integer dispatchedVehicles;
        private Double totalFleetCostInr;
    }

    @Data
    public static class Route {
        private String truckId;
        private Double dispatchedFixedCost;
        private List<List<Double>> pathCoords;
        private List<Stop> stops;
    }

    @Data
    public static class Stop {
        private Integer step;
        private String type;
        private String id;
        private String name;
        private String crop;
        private Double weight_quintals;
        private List<Double> coords;
    }

    @Data
    public static class UnassignedOrder {
        private String pickupId;
        private String deliveryId;
        private String reason;
    }
}
