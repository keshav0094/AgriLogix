package com.example.demo.repository;

import com.example.demo.entity.MarketplaceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceListingRepository extends JpaRepository<MarketplaceListing, Long> {
}
