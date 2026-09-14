import os
import requests
import pandas as pd
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

# Replace with the exact credentials from Ashutosh
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_9TwW3YoGBhHy@ep-weathered-bread-ayejkoqt-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
engine = create_engine(DATABASE_URL)

# Register a free account at data.gov.in for your API key
DATA_GOV_API_KEY = "579b464db66ec23bdd000001675df5f39cfb43bd6aab914bd518e223" 
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"  # Variety-wise Daily Market Prices UUID

def fetch_and_store_mandi_prices():
    print(f"[{datetime.now()}] Starting live Mandi data pull...")
    
    offset = 0
    batch_size = 1000
    total_inserted = 0
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    while True:
        url = f"https://api.data.gov.in/resource/{RESOURCE_ID}?api-key={DATA_GOV_API_KEY}&format=json&limit={batch_size}&offset={offset}"
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                print(f"API fetch failed at offset {offset}! Status: {response.status_code}")
                break

            data = response.json()
            
            if "records" not in data or len(data["records"]) == 0:
                print(f"[{datetime.now()}] Finished! Total records inserted: {total_inserted}")
                break
                
            df = pd.DataFrame(data["records"])
            
            # Extract the exact Title Case columns returned by this new API
            df = df[['Arrival_Date', 'Commodity', 'State', 'Modal_Price']]
            
            # Rename them to lowercase to match your database schema
            df = df.rename(columns={
                'Arrival_Date': 'arrival_date',
                'Commodity': 'commodity',
                'State': 'state',
                'Modal_Price': 'modal_price'
            })
            
            # Format the dates
            df['arrival_date'] = pd.to_datetime(df['arrival_date'], format="%d/%m/%Y")
            
            # Reset table on batch 0, append on every subsequent batch
            write_mode = 'replace' if offset == 0 else 'append'
            df.to_sql('mandi_prices', engine, if_exists=write_mode, index=False)
            
            total_inserted += len(df)
            print(f"[{datetime.now()}] Total inserted: {total_inserted} (Current Offset: {offset})")
            
            offset += batch_size
            
        except Exception as e:
            print(f"Pipeline exception at offset {offset}: {e}")
            break

def start_pipeline():
    scheduler = BackgroundScheduler()
    # Execute every midnight to capture the day's closing market prices
    scheduler.add_job(fetch_and_store_mandi_prices, 'cron', hour=0, minute=0)
    scheduler.start()

if __name__ == "__main__":
    fetch_and_store_mandi_prices()