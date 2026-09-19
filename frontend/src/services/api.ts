import axios from 'axios';

// ==========================================
// ALL TRAFFIC GOES TO JAVA (Port 8080)
// Java acts as the bridge to the Python AI
// ==========================================
export const API_BASE_URL = 'http://localhost:8080/api/v1';



// --- MARKETPLACE ---
export const createListing = async (data: any) => {
  try {
    return await axios.post(`${API_BASE_URL}/marketplace/listings`, data);
  } catch (err) {
    console.error('Marketplace post failed:', err);
    return { data: { id: Date.now(), status: 'Pending' } };
  }
};

export const getListings = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/marketplace/listings`);
  } catch (err) {
    console.error('Fetching listings failed safely:', err);
    return { data: [] };
  }
};

export const createRequest = async (requestData: any) => {
  try {
    return await axios.post(`${API_BASE_URL}/marketplace/requests`, requestData);
  } catch (err) {
    console.error('Creating request failed:', err);
    return { data: { success: false } };
  }
};

export const getRequests = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/marketplace/requests`);
  } catch (err) {
    console.error('Fetching requests failed:', err);
    return { data: [] };
  }
};

// --- LOGISTICS (Orders, Vehicles, Routing) ---
export const getOrders = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/logistics/orders`);
  } catch (err) {
    console.error('Fetching orders failed safely:', err);
    return { data: [] }; // Safe fallback
  }
};

export const createOrder = async (orderData: any) => {
  try {
    return await axios.post(`${API_BASE_URL}/logistics/orders`, orderData);
  } catch (err) {
    console.error('Order creation failed:', err);
    return { data: { success: false } };
  }
};

export const getVehicles = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/logistics/vehicles`);
  } catch (err) {
    console.error('Fetching vehicles failed:', err);
    return { data: [] };
  }
};

export const triggerOptimization = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/logistics/optimize`);
    return response.data;
  } catch (error) {
    console.error('Optimization failed safely:', error);
    return { routes: [], unassigned: [] };
  }
};

// --- FORECASTING ---
export const getPriceForecast = async (params: { crop: string; region?: string; days?: number }) => {
  try {
    return await axios.post(`${API_BASE_URL}/forecast/predict`, {
      crop: params.crop,
      region: params.region
    });
  } catch (error) {
    console.error('Price forecast failed safely:', error);
    // Safe fallback returning dummy values to prevent UI crash
    return { 
      data: {
        predicted_price: 0,
        trend: [],
        advice: "Unable to fetch prediction. Server offline."
      } 
    };
  }
};

export const getCrops = async () => {
  return await axios.get(`${API_BASE_URL}/forecast/crops`);
};

export const getCropsPrices = async (limit: number = 30) => {
  return await axios.get(`${API_BASE_URL}/forecast/crops/prices?limit=${limit}`);
};

export const getRegions = async (crop: string) => {
  return await axios.get(`${API_BASE_URL}/forecast/regions?crop=${encodeURIComponent(crop)}`);
};