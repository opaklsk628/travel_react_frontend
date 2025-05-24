// src/services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 自動附帶JWT(如 localStorage 有 token)
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

// Hotel Management - 完整的酒店管理API
export const hotelService = {
  // 獲取酒店列表（分頁）
  getAll: (params?: {
    page?: number;
    limit?: number;
    city?: string;
    includeHidden?: boolean;
  }) => api.get('/hotels', { params }),
  
  // 獲取單個酒店
  getById: (id: string) => api.get(`/hotels/${id}`),
  
  // 搜尋酒店
  search: (params: {
    query?: string;
    cityCode?: string;
    page?: number;
    limit?: number;
  }) => api.get('/hotels/search', { params }),
  
  // 創建新酒店 (Operator/Admin)
  create: (hotelData: any) => api.post('/hotels', hotelData),
  
  // 更新酒店資訊 (Operator/Admin)
  update: (id: string, hotelData: any) => api.put(`/hotels/${id}`, hotelData),
  
  // 更新酒店狀態 (Operator/Admin)
  updateStatus: (id: string, status: 'active' | 'hidden' | 'deleted') => 
    api.patch(`/hotels/${id}/status`, { status }),
  
  // 從Amadeus導入酒店 (Operator/Admin)
  importFromAmadeus: (data: { amadeusId: string; cityCode: string }) =>
    api.post('/hotels/import/amadeus', data),
  
  // 永久刪除酒店 (Admin only)
  delete: (id: string) => api.delete(`/hotels/${id}`),
  
  // 獲取統計資訊 (Operator/Admin)
  getStats: () => api.get('/hotels/stats'),
  
  // 獲取所有酒店包含隱藏的 (Admin only)
  getAllAdmin: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/hotels/all', { params })
};

// Auth - 認證相關API
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Favorites - 收藏相關API
export const favoriteService = {
  getAll: () => api.get('/favorites'),
  add: (hotel: { hotelId: string; hotelName: string; cityCode: string; image?: string | null }) => 
    api.post('/favorites', hotel),
  remove: (hotelId: string) => api.delete(`/favorites/${hotelId}`),
  check: (hotelId: string) => api.get(`/favorites/check/${hotelId}`),
};

// Messages - 訊息相關API (預留)
export const messageService = {
  getAll: () => api.get('/messages'),
  send: (data: any) => api.post('/messages', data),
  delete: (id: string) => api.delete(`/messages/${id}`),
};

// Amadeus API - 外部API服務（保留用於城市搜尋等功能）
export const amadeusService = {
  list: (city = 'PAR') => api.get('/amadeus/hotels', { params: { city } }),
  cities: (keyword: string) => api.get('/amadeus/cities', { params: { keyword } }),
};

// Admin - 管理員相關API
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getLoginRecords: () => api.get('/admin/login-records'),
};

export default api;