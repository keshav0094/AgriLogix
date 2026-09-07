import pandas as pd
import numpy as np
from datetime import datetime
from prophet import Prophet

def load_real_agmarknet_data(csv_path: str, crop_name: str) -> pd.DataFrame:
    """
    Reads the real Agmarknet CSV, cleans the data, and formats it 
    strictly to meet Prophet's 'ds' and 'y' column requirements.
    """
    # 1. Agmarknet CSVs have a title in the first row, so we skip it
    df = pd.read_csv(csv_path, header=1)
    
    # 2. Filter for the specific crop (case-insensitive to avoid errors)
    df = df[df['Commodity'].str.lower() == crop_name.lower()]
    
    if df.empty:
        raise ValueError(f"No data found for {crop_name}. Check spelling or CSV contents.")
    
    # 3. Dynamically find the 'Modal Price' column regardless of the date range in the header
    price_col = [col for col in df.columns if 'Modal Price' in col][0]
    
    # 4. Rename columns to match Prophet's strict requirements
    df = df.rename(columns={
        'Month': 'ds', 
        price_col: 'y'
    })
    
    # 5. Convert 'January-2023' strings to proper datetime objects
    df['ds'] = pd.to_datetime(df['ds'], format='%B-%Y', errors='coerce')
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    
    # 6. Average the prices if multiple markets reported data in the same month
    df = df.groupby('ds')['y'].mean().reset_index()
    
    # 7. Drop empty rows and sort chronologically
    df = df.dropna().sort_values('ds')
    
    return df

def run_price_forecast(csv_path: str, crop_name: str, forecast_days: int = 14) -> dict:
    """
    Fits Prophet on real crop price history and returns structured 
    forecast data conforming to the team's API contract.
    """
    # 1. Acquire and format real data
    df = load_real_agmarknet_data(csv_path, crop_name)
    
    # 2. Instantiate and train Prophet (weekly turned off due to monthly data intervals)
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
    # Target the exact downloaded CSV filename and a known crop
    CSV_FILENAME = "All_Type_of_Report_(All_Grades)_04-09-2026_09-32-22_PM.csv"
    TARGET_CROP = "Potato"
    
    print(f"Training Prophet model on historical {TARGET_CROP} data...")
    result = run_price_forecast(CSV_FILENAME, TARGET_CROP, forecast_days=14)
    
    print(f"\nCurrent Mandi Price: ₹{result['current_mandi_price']}/quintal")
    print(f"14-Day RSP: ₹{result['recommended_selling_price']}/quintal")
    print(f"Action Signal: {result['signal']} ({result['projected_growth_percent']}%)")
    print(f"Sample First Day Output: {result['daily_projections'][0]}")