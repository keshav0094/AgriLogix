# AgriLogix - Smart India Hackathon Prototype

AgriLogix is a full-stack agricultural logistics optimization platform. It leverages a VRPPD AI routing engine to optimize fleet dispatch, reduce transit costs, and visualize delivery routes on a live interactive dashboard.

## Architecture
* **AI Engine:** Python, FastAPI, OR-Tools (VRPPD Solver)
* **Backend:** Java 8, Spring Boot 2.7.x, MySQL
* **Frontend:** React 18, Vite, Tailwind CSS, Leaflet

## Quick Start
### 1. Database Setup
Create a MySQL database named `agrilogix_db`. The Spring Boot backend will auto-generate the schema on startup.

### 2. Boot the AI Engine
Navigate to the `ai-engine/` directory and run the FastAPI server:
`uvicorn main:app --reload`

### 3. Boot the Java Backend
Navigate to the `java-backend/demo/` directory and start the Spring server:
`.\mvnw spring-boot:run`

### 4. Start the Frontend Dashboard
Navigate to the `frontend/` directory and start the Vite development server:
`npm run dev`

## Author
* Keshav Murari