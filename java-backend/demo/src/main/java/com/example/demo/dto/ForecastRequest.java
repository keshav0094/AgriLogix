package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ForecastRequest {
    @JsonProperty("crop_name")
    private String cropName;
    private String state;
    @JsonProperty("forecast_days")
    private Integer forecastDays;
}
