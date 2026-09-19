package com.example.demo.controller;

import com.example.demo.dto.ForecastRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/v1/forecast")
@CrossOrigin(origins = "*")
public class ForecastController {

    @Autowired
    private RestTemplate restTemplate;

    private static final String AI_ENGINE_FORECAST_URL = "http://127.0.0.1:8000/api/v1/forecast";

    @GetMapping("/crops")
    public ResponseEntity<Object> getCrops() {
        Object response = restTemplate.getForObject(AI_ENGINE_FORECAST_URL + "/crops", Object.class);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/crops/prices")
    public ResponseEntity<Object> getCropsPrices(@RequestParam(value = "limit", defaultValue = "30") int limit) {
        Object response = restTemplate.getForObject(AI_ENGINE_FORECAST_URL + "/crops/prices?limit=" + limit, Object.class);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/regions")
    public ResponseEntity<Object> getRegions(@RequestParam("crop") String crop) {
        Object response = restTemplate.getForObject(AI_ENGINE_FORECAST_URL + "/regions?crop=" + crop, Object.class);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/predict")
    public ResponseEntity<Object> predictForecast(@RequestBody ForecastRequest request) {
        Object response = restTemplate.postForObject(AI_ENGINE_FORECAST_URL + "/predict", request, Object.class);
        return ResponseEntity.ok(response);
    }
}
