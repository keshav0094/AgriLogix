package com.example.demo.controller;

import com.example.demo.entity.BuyerRequest;
import com.example.demo.entity.MarketplaceListing;
import com.example.demo.repository.BuyerRequestRepository;
import com.example.demo.repository.MarketplaceListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marketplace")
@CrossOrigin(origins = "*")
public class MarketplaceController {

    @Autowired
    private MarketplaceListingRepository marketplaceListingRepository;

    @Autowired
    private BuyerRequestRepository buyerRequestRepository;

    @GetMapping("/listings")
    public ResponseEntity<List<MarketplaceListing>> getListings() {
        return ResponseEntity.ok(marketplaceListingRepository.findAll());
    }

    @PostMapping("/listings")
    public ResponseEntity<MarketplaceListing> createListing(@RequestBody MarketplaceListing listing) {
        return ResponseEntity.ok(marketplaceListingRepository.save(listing));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<BuyerRequest>> getRequests() {
        return ResponseEntity.ok(buyerRequestRepository.findAll());
    }

    @PostMapping("/requests")
    public ResponseEntity<BuyerRequest> createRequest(@RequestBody BuyerRequest request) {
        return ResponseEntity.ok(buyerRequestRepository.save(request));
    }
}
