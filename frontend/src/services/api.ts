import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/logistics';

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

export default api;
