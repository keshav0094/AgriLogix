# Server Initiation Guide

Follow these steps to start all three servers and run the website locally.

### 1. Start the AI Engine
- Open a terminal
- Run `cd ai-engine`
- Run `.\venv\Scripts\activate` to activate the virtual environment
- Run `uvicorn main:app --reload`

### 2. Start the Java Backend
- Open a **2nd terminal** (Do not close the first one)
- Run `cd java-backend\demo`
- Run `.\mvnw spring-boot:run`

### 3. Start the Frontend Dashboard
- Open a **3rd terminal** (Don't close the other two)
- Run `cd frontend`
- Run `npm install`
- Run `npm run dev`
- Go to the given link (For ex - http://localhost:5173/)

---

**Troubleshooting Note:**
If you restart your computer and the Java server throws that same `javac` error again, just run this temporary path override in the terminal before running step 2: 
```powershell
$jdkPath = (Get-ChildItem -Path "C:\Program Files\Eclipse Adoptium" -Filter "jdk-17*" | Select-Object -First 1).FullName; $env:JAVA_HOME = $jdkPath; $env:PATH = "$jdkPath\bin;$env:PATH"
```
or
```powershell
npx kill-port 8080
```