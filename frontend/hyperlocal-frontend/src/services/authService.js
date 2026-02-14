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
 * @param {FormData} formData - Contains governmentId and addressProof (optional) files
 * @returns {Promise<{ message, profileCompletionPercentage, currentStep, pendingSteps }>}
 */
export const uploadDocuments = async (formData) => {
  const response = await api.post('/api/v1/users/documents', formData, {
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
 * Check user's verification status
 * @returns {Promise<{ status: 'NOT_VERIFIED'|'VERIFIED'|'REJECTED', profileCompletionPercentage, statusMessage, rejectionReason, verifiedAt }>}
 */
export const checkVerificationStatus = async () => {
  const response = await api.get('/api/v1/users/verification-status');
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

// =====================
// SUPER ADMIN APIs
// =====================

/**
 * Super Admin Login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ token, id, email, name, role }>}
 */
export const adminLogin = async (credentials) => {
  const response = await api.post('/api/v1/admin/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });
  return response.data;
};

/**
 * Save admin auth data to local storage
 * @param {string} token
 * @param {Object} admin
 */
export const saveAdminAuthData = (token, admin) => {
  if (token) {
    localStorage.setItem('adminToken', token);
  }
  if (admin) {
    localStorage.setItem('adminUser', JSON.stringify(admin));
  }
};

/**
 * Logout admin - clear admin local storage
 */
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

/**
 * Get current admin from local storage
 * @returns {Object|null}
 */
export const getCurrentAdmin = () => {
  const admin = localStorage.getItem('adminUser');
  return admin ? JSON.parse(admin) : null;
};

/**
 * Get all users with pagination and filtering
 * @param {Object} params - { page, size, sortBy, sortDir, email, name, role, verificationStatus, currentStep }
 * @returns {Promise<{ content, pageNumber, pageSize, totalElements, totalPages, last }>}
 */
export const getAllUsers = async (params = {}) => {
  // Use admin token for this request
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.get('/api/v1/admin/users', {
    params: {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc',
      ...(params.email && { email: params.email }),
      ...(params.name && { name: params.name }),
      ...(params.role && { role: params.role }),
      ...(params.verificationStatus && { verificationStatus: params.verificationStatus }),
      ...(params.currentStep && { currentStep: params.currentStep }),
    },
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return response.data;
};

/**
 * Get user details by ID for verification review
 * @param {number} userId - User's ID
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.get(`/api/v1/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return response.data;
};

/**
 * Verify user (approve or reject)
 * @param {number} userId - User's ID
 * @param {Object} data - { approved: boolean, rejectionReason?: string }
 * @returns {Promise<Object>}
 */
export const verifyUser = async (userId, data) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.post(
    `/api/v1/admin/users/${userId}/verify`,
    data,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }
  );
  return response.data;
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
  // Admin APIs
  adminLogin,
  saveAdminAuthData,
  logoutAdmin,
  getCurrentAdmin,
  getAllUsers,
  getUserById,
  verifyUser,
};
