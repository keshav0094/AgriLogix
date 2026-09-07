import os
import requests
import pandas as pd
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

# Replace with the exact credentials from Ashutosh
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/krishisetu")
engine = create_engine(DATABASE_URL)

# Register a free account at data.gov.in for your API key
DATA_GOV_API_KEY = "YOUR_API_KEY_HERE" 
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"  # Daily Mandi prices UUID

def fetch_and_store_mandi_prices():
    print(f"[{datetime.now()}] Starting live Mandi data pull...")
    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}?api-key={DATA_GOV_API_KEY}&format=json&limit=5000"
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print("API fetch failed. Defaulting to existing database records.")
            return

        data = response.json()
        if "records" not in data:
            return
            
        df = pd.DataFrame(data["records"])
        
        # Format the dataset to Prophet's required structure or your DB schema
        df = df[['arrival_date', 'commodity', 'state', 'modal_price']]
        df['arrival_date'] = pd.to_datetime(df['arrival_date'], format="%d/%m/%Y")
        
        # Append rows directly to the core database
        df.to_sql('mandi_prices', engine, if_exists='append', index=False)
        print(f"[{datetime.now()}] Inserted {len(df)} records into PostgreSQL.")
        
    except Exception as e:
        print(f"Pipeline exception: {e}")

def start_pipeline():
    scheduler = BackgroundScheduler()
    # Execute every midnight to capture the day's closing market prices
    scheduler.add_job(fetch_and_store_mandi_prices, 'cron', hour=0, minute=0)
    scheduler.start()