import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { handleApiError, logError } from '../utils/errorHandler';

/**
 * Base API configuration
 * Axios instance with default settings for all API calls
 */
const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    // Check for both user and admin tokens
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

    // Prefer admin token for admin routes, otherwise use user token
    // Skip token injection for auth/login endpoints to avoid 401 loops with stale tokens
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    if (!isAuthEndpoint && config.url?.includes('/admin/')) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else if (!isAuthEndpoint && token) {
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
    // Convert to AppError using centralized error handler
    const appError = handleApiError(error);

    // Log error for debugging/monitoring
    logError(appError, {
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle unauthorized errors - clear tokens and redirect
    if (appError.statusCode === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Could trigger a redirect to login here if needed
      // window.location.href = '/login';
    }

    return Promise.reject(appError);
  }
);

export default api;
