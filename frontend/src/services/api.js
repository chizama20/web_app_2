/**
 * Centralized API service layer
 * Handles all API calls with axios
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials)
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/profile')
};

// Service Request APIs
export const serviceRequestAPI = {
  create: (data) => api.post('/api/service-requests', data),
  getAll: () => api.get('/api/service-requests'),
  getById: (id) => api.get(`/api/service-requests/${id}`),
  uploadPhotos: (id, formData) => {
    const token = localStorage.getItem('token');
    return api.post(`/api/service-requests/${id}/photos`, formData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Quote APIs
export const quoteAPI = {
  create: (data) => api.post('/api/quotes', data),
  getById: (id) => api.get(`/api/quotes/${id}`),
  respond: (id, data) => api.post(`/api/quotes/${id}/responses`, data),
  getByRequestId: (requestId) => api.get(`/api/service-requests/${requestId}/quotes`)
};

// Order APIs
export const orderAPI = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  complete: (id) => api.put(`/api/orders/${id}/complete`)
};

// Bill APIs
export const billAPI = {
  getAll: () => api.get('/api/bills'),
  getById: (id) => api.get(`/api/bills/${id}`),
  respond: (id, data) => api.post(`/api/bills/${id}/responses`, data)
};

export default api;

