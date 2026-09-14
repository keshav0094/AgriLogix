package com.example.demo.service;

import com.example.demo.dto.AiRoutingRequest;
import com.example.demo.dto.AiRoutingResponse;
import com.example.demo.entity.Order;
import com.example.demo.entity.Vehicle;
import com.example.demo.enums.OrderStatus;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogisticsOptimizationService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    private static final String AI_ENGINE_URL = "http://127.0.0.1:8000/api/v1/logistics/optimize-routes";

    public AiRoutingResponse triggerAiOptimization() {
        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING);
        List<Vehicle> availableVehicles = vehicleRepository.findByIsAvailableTrue();

        AiRoutingRequest request = new AiRoutingRequest();
        
        AiRoutingRequest.Coordinate depot = new AiRoutingRequest.Coordinate();
        depot.setLat(29.3909);
        depot.setLng(76.9708);
        request.setDepot(depot);

        List<AiRoutingRequest.FarmPickup> pickups = new ArrayList<>();
        List<AiRoutingRequest.BuyerDelivery> deliveries = new ArrayList<>();

        for (Order order : pendingOrders) {
            AiRoutingRequest.FarmPickup pickup = new AiRoutingRequest.FarmPickup();
            pickup.setId(order.getId().toString());
            pickup.setLat(order.getFarmer().getLat());
            pickup.setLng(order.getFarmer().getLng());
            pickup.setWeight_quintals(order.getWeightQuintals());
            pickup.setFarmer_name(order.getFarmer().getName());
            pickup.setCrop(order.getCropName());
            pickups.add(pickup);

            AiRoutingRequest.BuyerDelivery delivery = new AiRoutingRequest.BuyerDelivery();
            delivery.setId(order.getId().toString());
            delivery.setLat(order.getBuyer().getLat());
            delivery.setLng(order.getBuyer().getLng());
            delivery.setWeight_quintals(order.getWeightQuintals());
            delivery.setBuyer_name(order.getBuyer().getName());
            deliveries.add(delivery);
        }
        
        request.setPickups(pickups);
        request.setDeliveries(deliveries);

        List<AiRoutingRequest.VehicleConfig> vehicleConfigs = availableVehicles.stream().map(v -> {
            AiRoutingRequest.VehicleConfig vc = new AiRoutingRequest.VehicleConfig();
            vc.setId(v.getId().toString());
            vc.setCapacity_quintals(v.getCapacityQuintals());
            vc.setFixed_cost(v.getFixedCost().doubleValue());
            return vc;
        }).collect(Collectors.toList());

        request.setVehicles(vehicleConfigs);

        ResponseEntity<AiRoutingResponse> response = restTemplate.postForEntity(AI_ENGINE_URL, request, AiRoutingResponse.class);
        return response.getBody();
    }
}
