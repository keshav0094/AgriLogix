# AgriLogix - API Schema Contracts

## 1. Authentication
### POST /api/v1/auth/login
* **Description:** Authenticates user and returns JWT token.
* **Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securepassword123"
}
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "userId": "USR-1029",
  "role": "FARMER"
}
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
{
  "status": "SUCCESS",
  "listingId": "LST-8831",
  "createdAt": "2026-09-07T12:00:00Z"
}
{
  "truckCapacityKg": 2000,
  "listingIds": ["LST-8831", "LST-8832", "LST-8835"]
}
{
  "routeId": "RTE-402",
  "totalDistanceKm": 42.5,
  "optimizedWaypoints": [
    { "sequence": 1, "listingId": "LST-8831", "lat": 28.6139, "lng": 77.2090 },
    { "sequence": 2, "listingId": "LST-8832", "lat": 28.6210, "lng": 77.2150 }
  ]
}
{
  "buyerId": "BYR-501",
  "listingId": "LST-8831",
  "totalAmount": 12750.0
}
{
  "escrowTxId": "ESC-99012",
  "status": "LOCKED",
  "payoutTrigger": "GPS_ARRIVAL_VERIFIED"
}
