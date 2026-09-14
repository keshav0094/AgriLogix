package com.example.demo.repository;

import com.example.demo.entity.LogisticsRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LogisticsRouteRepository extends JpaRepository<LogisticsRoute, Long> {
    Optional<LogisticsRoute> findByAiRouteId(String aiRouteId);
}
