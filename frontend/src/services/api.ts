import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/logistics',
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

export default api;
