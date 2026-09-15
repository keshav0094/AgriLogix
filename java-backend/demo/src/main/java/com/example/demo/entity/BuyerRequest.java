package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="buyer_requests")
@Data
public class BuyerRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long buyerId;
    private String cropName;
    private Double requestedWeightQ;
    private Double targetPriceQ;
    private String status = "OPEN";
}
