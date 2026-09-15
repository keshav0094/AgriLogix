package com.example.demo.repository;

import com.example.demo.entity.BuyerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuyerRequestRepository extends JpaRepository<BuyerRequest, Long> {
}
