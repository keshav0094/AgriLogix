import axios from 'axios';

export const API_BASE_URL = '[https://1a2b3c4d.ngrok-free.app/api/v1](https://1a2b3c4d.ngrok-free.app/api/v1)';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const triggerOptimization = async () => {
  try {
    const response = await api.post('/optimize');
    return response.data;
  } catch (error) {
    console.error('Error triggering optimization:', error);
    throw error;
  }
};

export const getOrders = () => axios.get(`${API_BASE_URL}/orders`);
export const createOrder = (orderData: any) => axios.post(`${API_BASE_URL}/orders`, orderData);
export const getVehicles = () => axios.get(`${API_BASE_URL}/vehicles`);

export const getPriceForecast = (params: { crop: string; region?: string; days?: number }) => {
  return axios.post(`${API_BASE_URL.replace('/logistics', '')}/forecast/predict`, {
    crop_name: params.crop,
    state: params.region,
    forecast_days: params.days || 14
  });
};

export const getListings = () => axios.get(`${API_BASE_URL.replace('/logistics', '')}/marketplace/listings`);
export const createListing = (data: any) => axios.post(`${API_BASE_URL.replace('/logistics', '')}/marketplace/listings`, data);
export const getRequests = () => axios.get(`${API_BASE_URL.replace('/logistics', '')}/marketplace/requests`);
export const createRequest = (data: any) => axios.post(`${API_BASE_URL.replace('/logistics', '')}/marketplace/requests`, data);

export default api;
