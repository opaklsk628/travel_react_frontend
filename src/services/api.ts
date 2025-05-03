import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 自動附帶 JWT（若 localStorage 有 token）
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Hotel
export const hotelService = {
  getAll:    (params?: any)         => api.get('/hotels', { params }),
  getById:   (id: string)           => api.get(`/hotels/${id}`),
  create:    (data: any)            => api.post('/hotels', data),
  update:    (id: string, data: any)=> api.put(`/hotels/${id}`, data),
  delete:    (id: string)           => api.delete(`/hotels/${id}`),
};

// Auth
export const authService = {
  login:         (credentials: { email: string; password: string }) =>
                   api.post('/auth/login', credentials),
  register:      (userData: any)        => api.post('/auth/register', userData),
  getProfile:    ()                     => api.get('/auth/profile'),
  updateProfile: (data: any)            => api.put('/auth/profile', data),
};

// Favorites
export const favoriteService = {
  getAll:               ()                => api.get('/favorites'),
  add:    (hotelId: string)               => api.post(`/favorites/${hotelId}`),
  remove: (hotelId: string)               => api.delete(`/favorites/${hotelId}`),
};

// Messages
export const messageService = {
  getAll:            ()          => api.get('/messages'),
  send:   (data: any)            => api.post('/messages', data),
  delete: (id: string)           => api.delete(`/messages/${id}`),
};

//Admin
export const adminService = {
  //取得所有使用者（需要 admin JWT）
  getUsers:        () => api.get('/admin/users'),
  //取得所有登入紀錄（需要 admin JWT）
  getLoginRecords: () => api.get('/admin/login-records'),
};

export default api;
