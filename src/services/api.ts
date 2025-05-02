import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service
export const hotelService = {
  getAll: (params?: any) => api.get('/hotels', { params }),
  getById: (id: string) => api.get(`/hotels/${id}`),
  create: (data: any) => api.post('/hotels', data),
  update: (id: string, data: any) => api.put(`/hotels/${id}`, data),
  delete: (id: string) => api.delete(`/hotels/${id}`),
};

export const authService = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  add: (hotelId: string) => api.post(`/favorites/${hotelId}`),
  remove: (hotelId: string) => api.delete(`/favorites/${hotelId}`),
};

export const messageService = {
  getAll: () => api.get('/messages'),
  send: (data: any) => api.post('/messages', data),
  delete: (id: string) => api.delete(`/messages/${id}`),
};

export default api;