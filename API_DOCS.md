# AgriLogix - API Schema Contracts

## 1. Authentication
```json
{
  "email": "farmer@example.com",
  "password": "securepassword123"
}
```
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "userId": "USR-1029",
  "role": "FARMER"
}
```
## 2. Farmer Listings
```json
{
  "farmerId": "USR-1029",
  "cropName": "Tomatoes",
  "quantityKg": 500,
  "askingPricePerKg": 25.5,
  "pickupLocation": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Village Kheda, District Meerut"
  }
}
```
```json
{
  "status": "SUCCESS",
  "listingId": "LST-8831",
  "createdAt": "2026-09-07T12:00:00Z"
}
```
## 3.Route Optimization Engine
```json
{
  "truckCapacityKg": 2000,
  "listingIds": ["LST-8831", "LST-8832", "LST-8835"]
}
```
```json
{
  "routeId": "RTE-402",
  "totalDistanceKm": 42.5,
  "optimizedWaypoints": [
    { "sequence": 1, "listingId": "LST-8831", "lat": 28.6139, "lng": 77.2090 },
    { "sequence": 2, "listingId": "LST-8832", "lat": 28.6210, "lng": 77.2150 }
  ]
}
```
## 4.Escrow & Payments
```json
{
  "buyerId": "BYR-501",
  "listingId": "LST-8831",
  "totalAmount": 12750.0
}
```
```json
{
  "escrowTxId": "ESC-99012",
  "status": "LOCKED",
  "payoutTrigger": "GPS_ARRIVAL_VERIFIED"
}
```

## 5. Price & Mandi Forecasting
```json
{
  "crop_name": "Potato",
  "forecast_days": 14
}
```
```json
{
  "status": "success",
  "data": {
    "crop_name": "Potato",
    "current_mandi_price": 1250.0,
    "recommended_selling_price": 1320.5,
    "signal": "HOLD",
    "projected_growth_percent": 5.64,
    "daily_projections": [
      {
        "day": "Day 1",
        "predicted_price": 1260.0,
        "lower_bound": 1240.0,
        "upper_bound": 1280.0
      }
    ]
  }
}
```
