package com.example.demo.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ForecastResponse {
    private String status;
    private Map<String, Object> data;
}
