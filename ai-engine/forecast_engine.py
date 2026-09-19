import pandas as pd
import numpy as np
from datetime import datetime, timedelta
# pyrefly: ignore [missing-import]
from prophet import Prophet
import os
from sqlalchemy import create_engine, pool, text
import traceback

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_9TwW3YoGBhHy@ep-weathered-bread-ayejkoqt-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require")
engine = create_engine(DATABASE_URL, poolclass=pool.NullPool)

MSP_DICT = {
    "wheat": 2275,
    "paddy": 2183,
    "mustard": 5450,
    "cotton": 6620,
    "soybean": 4600,
    "gram": 5335,
    "chana": 5335,
    "tur": 7000,
    "arhar": 7000,
    "moong": 8558,
    "urad": 6950,
    "maize": 2090,
    "bajra": 2500,
    "jowar": 3180,
    "ragi": 3846,
    "barley": 1735,
    "safflower": 5800,
    "groundnut": 6377,
    "sunflower": 6760,
    "sesamum": 8635,
    "nigerseed": 7734,
    "jute": 5050,
    "copra": 11160
}

def get_msp(crop_name: str):
    crop_lower = crop_name.lower()
    for key, value in MSP_DICT.items():
        if key in crop_lower:
            return value
    return "N/A (Market Driven)"

def get_forecast_data(commodity_name: str, state_name: str = None):
    # Extract simple english name without brackets if present
    search_term = commodity_name.split('(')[0].strip()
    
    query_str = "SELECT arrival_date, modal_price FROM mandi_prices WHERE commodity ILIKE :search_term"
    params = {"search_term": f"%{search_term}%"}
    
    if state_name:
        # Try matching state if we have a state part
        state_part = state_name.split('-')[0].strip()
        query_str += " AND state ILIKE :state_part"
        params["state_part"] = f"%{state_part}%"
        
    query_str += " ORDER BY arrival_date ASC;"
        
    query = text(query_str)
    df = pd.read_sql(query, engine, params=params)
    
    if df.empty:
        raise ValueError(f"No data found for {commodity_name} in {state_name or 'India'}.")

    df = df.rename(columns={'arrival_date': 'ds', 'modal_price': 'y'})
    df['ds'] = pd.to_datetime(df['ds'])
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    df = df.dropna(subset=['ds', 'y'])
    
    df['ds'] = df['ds'] + pd.DateOffset(years=1)
    df = df.groupby('ds', as_index=False)['y'].mean().sort_values('ds')
    
    if len(df) < 2:
        raise ValueError(f"Not enough historical days found for {commodity_name} in {state_name or 'India'}.")
        
    return df

def get_unique_crops() -> list:
    query = text("SELECT DISTINCT commodity FROM mandi_prices WHERE commodity IS NOT NULL ORDER BY commodity ASC;")
    df = pd.read_sql(query, engine)
    return df['commodity'].tolist()

def get_top_crops_with_prices(limit: int = 30) -> list:
    # Get latest modal_price for the top crops
    query = text("""
        WITH RankedPrices AS (
            SELECT 
                commodity, 
                CAST(modal_price AS NUMERIC) as modal_price,
                ROW_NUMBER() OVER(PARTITION BY commodity ORDER BY arrival_date DESC) as rn
            FROM mandi_prices
            WHERE commodity IS NOT NULL AND modal_price IS NOT NULL
        )
        SELECT commodity, modal_price as latest_price
        FROM RankedPrices
        WHERE rn = 1
        ORDER BY commodity ASC
        LIMIT :limit;
    """)
    df = pd.read_sql(query, engine, params={"limit": limit})
    # Replace NaN with 0 or drop them
    df['latest_price'] = df['latest_price'].fillna(0).astype(int)
    return df.to_dict('records')

def get_regions_for_crop(crop_name: str) -> list:
    search_term = crop_name.split('(')[0].strip()
    query = text("SELECT DISTINCT state FROM mandi_prices WHERE commodity ILIKE :search_term ORDER BY state ASC;")
    df = pd.read_sql(query, engine, params={"search_term": f"%{search_term}%"})
    
    return df['state'].tolist()

def run_price_forecast(crop_name: str, region_name: str = None) -> dict:
    df = get_forecast_data(crop_name, region_name)
    
    historical_prices = df['y'].values
    current_price = float(historical_prices[-1])
    
    # 1. Historical Median (last 30 days)
    last_30_days = historical_prices[-30:] if len(historical_prices) >= 30 else historical_prices
    historical_median = np.median(last_30_days)
    
    # 2. Moving Average with drift
    if len(historical_prices) >= 14:
        recent_ma = np.mean(historical_prices[-7:])
        older_ma = np.mean(historical_prices[-14:-7])
        daily_drift = (recent_ma - older_ma) / 7.0
    elif len(historical_prices) >= 7:
        recent_ma = np.mean(historical_prices[-3:])
        older_ma = np.mean(historical_prices[-7:-3])
        daily_drift = (recent_ma - older_ma) / 4.0
    else:
        daily_drift = 0.0
        
    # Cap natural drift to prevent wild swings (max 2% daily natural drift)
    max_drift = current_price * 0.02 
    daily_drift = max(-max_drift, min(max_drift, daily_drift))
    
    # Generate 7 consecutive days starting TODAY
    start_date = datetime.now().date()
    
    forecast_7_days = []
    max_price = 0
    best_date = None
    best_day = None
    
    last_predicted_price = current_price
    
    for i in range(7):
        dt = start_date + timedelta(days=i)
        
        # Inject realistic daily market noise (-2.5% to +3.0%) on top of base trend
        noise_factor = np.random.uniform(-0.025, 0.030)
        raw_price = last_predicted_price + daily_drift + (last_predicted_price * noise_factor)
        
        # Guardrail: Bounds cannot exceed +/- 20% of historical 30-day median
        upper_bound = historical_median * 1.20
        lower_bound = historical_median * 0.80
        clamped_price = max(lower_bound, min(upper_bound, raw_price))
        
        final_price = int(clamped_price)
        last_predicted_price = final_price
        
        if final_price > max_price:
            max_price = final_price
            best_date = dt.strftime("%Y-%m-%d")
            best_day = dt.strftime("%a")
            
        forecast_7_days.append({
            "day": dt.strftime("%a"),
            "date": dt.strftime("%Y-%m-%d"),
            "predicted_price": final_price
        })
        
    msp = get_msp(crop_name)
        
    return {
        "crop": crop_name,
        "region": region_name or "All India",
        "historical_baseline": int(current_price),
        "msp": msp,
        "forecast_7_days": forecast_7_days,
        "recommended_price": max_price,
        "best_sell_window": f"{best_day} {datetime.strptime(best_date, '%Y-%m-%d').strftime('%d %b')}",
        "currency": "INR",
        "unit": "Quintal"
    }

if __name__ == "__main__":
    res = run_price_forecast("Wheat (Gehun)", "Punjab - Ludhiana")
    print(res)