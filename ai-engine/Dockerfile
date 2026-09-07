# Use a lightweight Python base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy dependencies first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files (main.py, CSVs, scripts)
COPY . .

# Expose port 8000 for internal network traffic
EXPOSE 8000

# Start the FastAPI server using Uvicorn on all network interfaces
# Replace the last line of your Dockerfile with this:
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]