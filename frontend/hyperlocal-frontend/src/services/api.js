import axios from 'axios';

/**
 * Base API configuration
 * Axios instance with default settings for all API calls
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error cases
    if (error.response) {
      const { status, data } = error.response;
      
      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Could redirect to login here if needed
      }
      
      // Return a cleaner error message
      const message = data?.message || data?.error || 'Something went wrong';
      return Promise.reject(new Error(message));
    }
    
    // Network error
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
