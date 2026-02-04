import api from './api';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, agreeToTerms }
 * @returns {Promise<{ userId, email, message }>}
 */
export const registerUser = async (userData) => {
  const response = await api.post('/api/v1/auth/register', {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    agreeToTerms: userData.agreeToTerms,
  });
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ token, userId, name, email, role, profileCompleted, profileCompletionPercentage, currentStep, pendingSteps }>}
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/api/v1/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });
  return response.data;
};

/**
 * Update user profile details
 * @param {FormData} formData - Contains phone, address, bio, profilePhoto (file)
 * @returns {Promise<{ message, profileCompletionPercentage, currentStep, pendingSteps }>}
 */
export const updateProfile = async (formData) => {
  const response = await api.put('/api/v1/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Upload verification documents
 * @param {FormData} formData - Contains governmentId and addressProof files
 * @returns {Promise<{ profileCompletionPercentage, currentStep, pendingSteps, message }>}
 */
export const uploadDocuments = async (formData) => {
  const response = await api.post('/api/v1/user/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get current user's profile and verification status
 * @returns {Promise<{ user, profileCompletionPercentage, currentStep, pendingSteps }>}
 */
export const getUserProfile = async () => {
  const response = await api.get('/api/v1/user/profile');
  return response.data;
};

/**
 * Logout user - clear local storage
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Get current user from local storage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Save auth data to local storage
 * @param {string} token 
 * @param {Object} user 
 */
export const saveAuthData = (token, user) => {
  if (token) {
    localStorage.setItem('authToken', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export default {
  registerUser,
  loginUser,
  updateProfile,
  uploadDocuments,
  getUserProfile,
  logoutUser,
  getCurrentUser,
  saveAuthData,
};
