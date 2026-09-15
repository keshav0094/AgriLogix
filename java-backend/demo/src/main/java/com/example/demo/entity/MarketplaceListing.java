package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="marketplace_listings")
@Data
public class MarketplaceListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long farmerId;
    private String cropName;
    private Double availableWeightQ;
    private Double pricePerQ;
    private String status = "ACTIVE";
}
