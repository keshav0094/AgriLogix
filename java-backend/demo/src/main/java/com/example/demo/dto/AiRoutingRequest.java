package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiRoutingRequest {
    private Coordinate depot;
    private List<FarmPickup> pickups;
    private List<BuyerDelivery> deliveries;
    private List<VehicleConfig> vehicles;

    @Data
    public static class Coordinate {
        private Double lat;
        private Double lng;
    }

    @Data
    public static class FarmPickup {
        private String id;
        private Double lat;
        private Double lng;
        private Double weight_quintals;
        private String farmer_name;
        private String crop;
    }

    @Data
    public static class BuyerDelivery {
        private String id;
        private Double lat;
        private Double lng;
        private Double weight_quintals;
        private String buyer_name;
    }

    @Data
    public static class VehicleConfig {
        private String id;
        private Double capacity_quintals;
        private Double fixed_cost;
    }
}
