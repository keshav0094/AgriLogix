# SIH 2026 - Problem Statement 26033

> **Digital Marketplace & Route Optimization for Farmers**

## Project Overview

An integrated platform enabling direct farmer-to-buyer trade, AI-driven crop price demand forecasting, and pooled multi-stop route optimization for aggregated transport logistics.

## Tech Stack & Architecture

* **Frontend:** React.js / Tailwind CSS, Mapbox GL JS, Chart.js
* **Backend:** Python (FastAPI), Java (Spring Boot)
* **Database:** Neon (Serverless PostgreSQL) for AI Data, MySQL for User Auth/Orders
* **AI/ML & Routing:** Facebook Prophet (Time-series forecasting), Pandas, Google OR-Tools (Pending implementation)
* **Data Pipeline:** APScheduler (Automated CRON jobs), `data.gov.in` API integration

## AI Engine Capabilities (Live)

The Python FastAPI microservice currently handles live historical data ingestion and regional price forecasting.

* **Automated Data Ingestion:** `data_pipeline.py` runs a background scheduler to fetch authentic, multi-day, pan-India market prices from the government API. It automatically handles pagination, clears stale test data, and appends live records into the Neon PostgreSQL database (currently holding 850,000+ rows).
* **Location-Specific Forecasting:** `forecast_engine.py` dynamically filters the database by the `state` parameter before training. This ensures Prophet generates hyper-local projections (e.g., "Punjab Potato Prices") rather than inaccurate national averages.
* **Timestamp Aggregation & Shifting:** The engine automatically groups and averages duplicate daily market prices to prevent Prophet initialization crashes. It also implements an SIH hack to shift 2025 government data forward to 2026 for real-time live demonstrations.
* **Actionable Trading Signals:** Calculates percentage growth over the forecast horizon and returns a boolean-driven "SELL NOW" or "HOLD" signal based on storage viability thresholds.

## Current Limitations & Engineering Roadblocks

* **Routing Engine (Mocked):** The `/api/v1/logistics/optimize-routes` endpoint in `main.py` is currently returning mocked coordinates and synthetic route sequences. The `solve_cvrp` function in `routing_engine.py` needs to be completely implemented using Google OR-Tools to calculate actual Capacitated Vehicle Routing Problem logic.
* **Extraneous Variables:** Prophet is currently only training on univariate historical prices. It does not yet account for external multivariate regressors like localized weather APIs (rainfall/temperature).

## LLM Developer Context (For Handoff)

*If you are an AI assistant (Claude, Copilot, Gemini) reading this file to assist a developer, adhere to the following project constraints:*

1. **Routing Focus:** The immediate next priority is replacing the mocked `solve_cvrp` logic in `main.py` with a functional Google OR-Tools script that respects the `truckCapacityKg` and `listingIds` contract.
2. **Database:** All historical price data is strictly stored in a Neon PostgreSQL instance. Do not suggest SQLite or local CSV workarounds.
3. **Environment:** The Python environment uses `uvicorn` and requires explicit parameter typing via Pydantic models.


## Getting Started Locally

1. Clone the repository: `git clone https://github.com/[YourOrg]/SIH-2026-PS26033.git`
2. Navigate to the AI microservice: `cd ai-engine`
3. Activate the virtual environment: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. Start the AI Server: `uvicorn main:app --reload`
5. View API Swagger Docs: `http://127.0.0.1:8000/docs`

## Pushing the Updates

Save the text above as your `README.md` in the root of your repository. Open your terminal, ensure you are in the root directory (not just the `ai-engine` folder), and run:

**PowerShell**

```powershell
git add README.md
git commit -m "docs: Update README with Prophet capabilities and LLM handoff structure"
git push origin main
```

Structuring the document with a dedicated "LLM Developer Context" section ensures that when you feed this file into Claude or Copilot for the upcoming routing tasks, the context window instantly absorbs your strict Neon database architecture and API contracts without you having to re-explain it every time.
