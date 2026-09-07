# KrishiSetu AI Engine

This microservice handles the AI price forecasting (Prophet) and physical logistics routing (Google OR-Tools + OSRM) for the KrishiSetu platform. It is fully decoupled from the core Java backend.

## Local Development
1. Activate the virtual environment: `.\venv\Scripts\Activate.ps1`
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `uvicorn main:app --reload`
4. Access Swagger UI: `http://127.0.0.1:8000/docs`

## Docker Production Build
To run the engine in an isolated container using Gunicorn:
`docker build -t krishisetu-ai .`
`docker run -d -p 8000:8000 --name krishisetu-service krishisetu-ai`

## Core Endpoints

### 1. Route Optimization (OSRM + OR-Tools)
**POST** `/api/v1/logistics/optimize-routes`
Calculates optimal multi-stop pickup routes accounting for real-world driving distances and vehicle capacity constraints.

**Request:**
{
  "truckCapacityKg": 2000,
  "listingIds": ["LST-8831", "LST-8832", "LST-8835"]
}

### 2. Price Forecasting (Prophet)
**POST** `/api/v1/forecast/price`
Generates 14-day price projections and HOLD/SELL signals based on historical Mandi data.
