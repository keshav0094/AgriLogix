import pandas as pd
import numpy as np
from datetime import datetime
from prophet import Prophet
import os
from sqlalchemy import create_engine

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/krishisetu")
engine = create_engine(DATABASE_URL)

def get_forecast_data(commodity_name: str):
    """
    Queries the live PostgreSQL database for historical prices instead of a CSV.
    """
    query = f"SELECT arrival_date as ds, modal_price as y FROM mandi_prices WHERE commodity = '{commodity_name}'"
    df = pd.read_sql(query, engine)
    
    # Prophet requires the datestamp column to be datetime objects
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Drop empty rows and sort chronologically
    df = df.dropna().sort_values('ds')
    
    if df.empty:
        raise ValueError(f"No data found for {commodity_name} in the live database.")
        
    return df

def run_price_forecast(crop_name: str, forecast_days: int = 14, csv_path: str = None) -> dict:
    """
    Fits Prophet on live database crop price history and returns structured 
    forecast data conforming to the team's API contract.
    """
    # 1. Acquire and format live SQL data
    df = get_forecast_data(crop_name)
    
    # 2. Instantiate and train Prophet (weekly turned off due to monthly/daily gaps)
    model = Prophet(daily_seasonality=False, weekly_seasonality=False, yearly_seasonality=True)
    model.fit(df)
    
    # 3. Create future date slots & run inference
    future = model.make_future_dataframe(periods=forecast_days, freq='D')
    forecast = model.predict(future)
    
    # 4. Extract the last forecasted period
    future_slice = forecast.tail(forecast_days)
    current_price = float(df['y'].iloc[-1])
    projected_end_price = float(future_slice['yhat'].iloc[-1])
    
    # 5. Formulate Sell/Hold recommendation
    percentage_growth = ((projected_end_price - current_price) / current_price) * 100
    signal = "HOLD" if percentage_growth > 3.0 else "SELL NOW"
    
    # 6. Format projections list for frontend Chart.js/Recharts
    daily_projections = []
    for idx, (_, row) in enumerate(future_slice.iterrows(), 1):
        daily_projections.append({
            "day": f"Day {idx}",
            "predicted_price": round(float(row['yhat']), 2),
            "lower_bound": round(float(row['yhat_lower']), 2),
            "upper_bound": round(float(row['yhat_upper']), 2)
        })
        
    return {
        "crop_name": crop_name,
        "current_mandi_price": round(current_price, 2),
        "recommended_selling_price": round(projected_end_price, 2),
        "signal": signal,
        "projected_growth_percent": round(percentage_growth, 2),
        "daily_projections": daily_projections
    }

if __name__ == "__main__":
    TARGET_CROP = "Potato"
    
    print(f"Training Prophet model on historical {TARGET_CROP} data from the live database...")
    try:
        result = run_price_forecast(crop_name=TARGET_CROP, forecast_days=14)
        print(f"\nCurrent Mandi Price: ₹{result['current_mandi_price']}/quintal")
        print(f"14-Day RSP: ₹{result['recommended_selling_price']}/quintal")
        print(f"Action Signal: {result['signal']} ({result['projected_growth_percent']}%)")
        print(f"Sample First Day Output: {result['daily_projections'][0]}")
    except Exception as e:
        print(f"Database Error: {e}\n(Ensure Ashutosh's database is running and populated via data_pipeline.py)")