import api from './api';

/**
 * Profile Service
 * Handles all user profile-related API calls
 */

/**
 * Get the currently authenticated user's profile
 * GET /api/profile/me
 * @returns {Promise<{ userId, name, email, phone, address, bio, profilePhotoUrl, verified, memberSince, averageRating, totalReviews, stats, joinedCommunityIds, createdCommunityIds }>}
 */
export const getMyProfile = async () => {
  const response = await api.get('/api/profile/me');
  return response.data;
};

/**
 * Get a user's public profile by their ID
 * GET /api/profile/{userId}
 * @param {number} userId - The user's ID
 * @returns {Promise<{ userId, name, email, phone, address, bio, profilePhotoUrl, verified, memberSince, averageRating, totalReviews, stats, joinedCommunityIds, createdCommunityIds }>}
 */
export const getUserProfileById = async (userId) => {
  const response = await api.get(`/api/profile/${userId}`);
  return response.data;
};

/**
 * Update the currently authenticated user's profile
 * PUT /api/profile/me
 * Accepts multipart/form-data with optional fields: phone, address, bio, profilePhoto (binary)
 * @param {Object} profileData - { phone?, address?, bio?, profilePhoto?: File }
 * @returns {Promise<{ message, profileCompletionPercentage, currentStep, pendingSteps }>}
 */
export const updateMyProfile = async (profileData) => {
  const formData = new FormData();

  if (profileData.phone !== undefined) formData.append('phone', profileData.phone);
  if (profileData.address !== undefined) formData.append('address', profileData.address);
  if (profileData.bio !== undefined) formData.append('bio', profileData.bio);
  if (profileData.profilePhoto instanceof File) formData.append('profilePhoto', profileData.profilePhoto);

  const response = await api.put('/api/profile/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
