# AI & Logistics Engine (SIH 26033)

This repository contains the AI Forecasting and Route Optimization engine for the agri-marketplace. It operates as an independent backend microservice, handling complex mathematical and machine learning tasks so the main application (Spring Boot) can remain fast and responsive.

## Core Features

- **Predictive Market Forecasting:** Analyzes historical agricultural market data to calculate a 14-day future price projection for specific crops. It outputs a recommended selling price and automatically generates a **"Hold"** or **"Sell Now"** signal based on projected profit growth.
- **Smart Logistics Routing:** Solves complex delivery problems by grouping multiple farm pickups into a single, highly efficient truck journey. It strictly accounts for truck weight capacities and calculates the absolute shortest stop sequence to save fuel and reduce carbon emissions.
- **Seamless API Integration:** Built on FastAPI, it functions as a standalone web server. The frontend and core database send lightweight JSON requests, and it instantly replies with optimized route paths and formatted price charts.

## API Endpoints

### 1. Price Forecasting

**`POST /api/v1/forecast/price`**

Generates a 14-day time-series price forecast using the Prophet ML model.

**Request Payload:**

```json
{
  "crop_name": "Potato",
  "forecast_days": 14
}
```

**Response:** Returns the current market price, the recommended future selling price, a Hold/Sell signal, and daily bounded projection intervals.

### 2. Route Optimization

**`POST /api/v1/logistics/optimize-routes`**

Calculates the optimal Capacitated Vehicle Routing Problem (CVRP) paths using Google OR-Tools.

**Request Payload:**

```json
{
  "hub_location": {
    "lat": 22.7196,
    "lng": 75.8577
  },
  "max_trucks": 2,
  "truck_capacity_quintals": 100.0,
  "pickup_nodes": [
    {
      "node_id": "P1",
      "lat": 22.745,
      "lng": 75.892,
      "weight_quintals": 30.0
    }
  ]
}
```

**Response:** Returns an array of dispatched trucks, capacity utilized, total route distance, estimated CO2 saved, and the exact coordinate path for mapping.

## Prototype Data vs. Production Implementation

To function within hackathon constraints, this prototype utilizes simulated environments for certain variables. The transition plan for the production build is as follows:

### Location Data

**Prototype:** Routing is tested using hardcoded, dummy GPS coordinates to validate the mathematical grouping logic.

**Production:** The frontend will capture live device GPS coordinates when a farmer creates a listing, feeding exact physical locations into the router.

### Distance Calculations

**Prototype:** The optimization engine relies on a straight-line (Euclidean) mathematical formula to estimate distance between coordinates.

**Production:** Will integrate OpenStreetMap (OSRM) to calculate true road network driving distances, accounting for unpaved roads and geographical barriers.

### Market Price Datasets

**Prototype:** The Prophet ML model currently trains on a static Agmarknet CSV file stored locally in the repository.

**Production:** A background CRON worker will be deployed to continuously fetch daily market prices from live Data.gov.in APIs, pushing them to PostgreSQL to ensure the model trains on real-time data.

## Local Setup & Execution

### Install Dependencies

```bash
pip install fastapi uvicorn pandas prophet ortools pydantic
```

### Ensure Data is Present

Verify that your `All_Type_of_Report_*.csv` file is located in the same directory as `main.py`.

### Run the Server

```bash
uvicorn main:app --reload --port 8000
```

### Test the API

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser to access the interactive Swagger UI and send test payloads.
