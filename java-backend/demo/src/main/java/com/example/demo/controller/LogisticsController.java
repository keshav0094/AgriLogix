package com.example.demo.controller;

import com.example.demo.dto.AiRoutingResponse;
import com.example.demo.service.LogisticsOptimizationService;
import com.example.demo.entity.Order;
import com.example.demo.entity.Vehicle;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics")
@CrossOrigin(origins = "*")
public class LogisticsController {

    @Autowired
    private LogisticsOptimizationService logisticsOptimizationService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @PostMapping("/optimize")
    public ResponseEntity<AiRoutingResponse> optimizeRoutes() {
        AiRoutingResponse response = logisticsOptimizationService.triggerAiOptimization();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }
}
