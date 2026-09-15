# AgriLogix - Smart India Hackathon Prototype

AgriLogix is a full-stack agricultural logistics optimization platform. It leverages a VRPPD AI routing engine to optimize fleet dispatch, reduce transit costs, and visualize delivery routes on a live interactive dashboard.

## Architecture

* **AI Engine:** Python, FastAPI, Google OR-Tools (VRPPD Solver)
* **Backend:** Java 17, Spring Boot 3.x (Spring Data JPA), MySQL
* **Frontend:** React 18, Vite, Tailwind CSS, Leaflet.js

## Quick Start

### 1. Database Setup

Create a MySQL database named `agrilogix_db`. The Spring Boot backend will auto-generate the schema on startup. Ensure your local MySQL server is running on port `3306`.

### 2. Boot the AI Engine

Open a terminal, activate your virtual environment `(venv)`, navigate to the AI directory, and start the FastAPI server:

```powershell
cd ai-engine
uvicorn main:app --reload
```

*The AI API will be available at* *`http://localhost:8000`**.*

### 3. Boot the Java Backend

Open a **new** terminal tab, navigate to the backend directory, and start the Spring server:

PowerShell

```powershell
cd java-backend\demo
.\mvnw spring-boot:run
```

*The backend API will be available at* *`http://localhost:8080`**.*

### 4. Start the Frontend Dashboard

Open a **third** terminal tab, navigate to the frontend directory, and start the Vite development server:

PowerShell

```powershell
cd frontend
npm run dev
```

*The interactive dashboard will be available at* *`http://localhost:5173`**.*

## Author

* Keshav Murari
