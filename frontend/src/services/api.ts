import axios from 'axios';

// ==========================================
// ALL TRAFFIC GOES TO JAVA (Port 8080)
// Java acts as the bridge to the Python AI
// ==========================================
export const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- MARKETPLACE ---
export const createListing = (data: any) => axios.post(`${API_BASE_URL}/marketplace/listings`, data);
export const getListings = () => axios.get(`${API_BASE_URL}/marketplace/listings`);
export const createRequest = (requestData: any) => axios.post(`${API_BASE_URL}/marketplace/requests`, requestData);
export const getRequests = () => axios.get(`${API_BASE_URL}/marketplace/requests`);

// --- LOGISTICS (Orders, Vehicles, Routing) ---
// Notice these all correctly point to /logistics/ now!
export const getOrders = () => axios.get(`${API_BASE_URL}/logistics/orders`);
export const createOrder = (orderData: any) => axios.post(`${API_BASE_URL}/logistics/orders`, orderData);
export const getVehicles = () => axios.get(`${API_BASE_URL}/logistics/vehicles`);

export const triggerOptimization = async () => {
  try {
    // Hits Java, which internally triggers the Python AI
    const response = await axios.post(`${API_BASE_URL}/logistics/optimize`);
    return response.data;
  } catch (error) {
    console.error('Optimization failed safely:', error);
    return { routes: [], unassigned: [] };
  }
};

// --- FORECASTING ---
export const getPriceForecast = (params: { crop: string; region?: string; days?: number }) => {
  // Hits Java, which internally asks Python for the prediction
  return axios.post(`${API_BASE_URL}/forecast/predict`, {
    crop_name: params.crop,
    state: params.region
  });
};