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

    private static final String AI_ENGINE_FORECAST_URL = "http://127.0.0.1:8000/api/v1/forecast/predict";

    @PostMapping("/predict")
    public ResponseEntity<Object> predictForecast(@RequestBody ForecastRequest request) {
        Object response = restTemplate.postForObject(AI_ENGINE_FORECAST_URL, request, Object.class);
        return ResponseEntity.ok(response);
    }
}
