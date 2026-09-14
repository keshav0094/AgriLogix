package com.example.demo.entity;

import com.example.demo.enums.VehicleType;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    @Column(name = "capacity_quintals", nullable = false)
    private Double capacityQuintals;

    @Column(name = "fixed_cost", nullable = false)
    private BigDecimal fixedCost;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
}
