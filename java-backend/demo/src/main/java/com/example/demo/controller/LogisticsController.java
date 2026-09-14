package com.example.demo.controller;

import com.example.demo.dto.AiRoutingResponse;
import com.example.demo.service.LogisticsOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/logistics")
@CrossOrigin(origins = "*")
public class LogisticsController {

    @Autowired
    private LogisticsOptimizationService logisticsOptimizationService;

    @PostMapping("/optimize")
    public ResponseEntity<AiRoutingResponse> optimizeRoutes() {
        AiRoutingResponse response = logisticsOptimizationService.triggerAiOptimization();
        return ResponseEntity.ok(response);
    }
}
