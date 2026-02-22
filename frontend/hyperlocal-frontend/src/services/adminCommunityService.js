import api from './api';

/**
 * Admin Community Service
 * All endpoints require a valid admin JWT token (handled by the api interceptor).
 *
 * Implemented endpoints from /api/v1/admin/communities:
 *   GET    /api/v1/admin/communities           – paginated + filterable list
 *   GET    /api/v1/admin/communities/{id}      – detail + member list
 *   PATCH  /api/v1/admin/communities/{id}/status – activate / deactivate
 *   DELETE /api/v1/admin/communities/{id}      – permanent delete
 *   GET    /api/v1/admin/communities/{id}/members – paginated member list
 */

/**
 * GET /api/v1/admin/communities
 * @param {{ page?: number, size?: number, status?: 'ACTIVE'|'INACTIVE', search?: string }} params
 * @returns {Promise<{ content, pageNumber, pageSize, totalElements, totalPages, last }>}
 */
export const getAdminCommunities = async (params = {}) => {
  const response = await api.get('/api/v1/admin/communities', { params });
  return response.data;
};

/**
 * GET /api/v1/admin/communities/{id}
 * Returns community detail including admins[] and members[].
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getAdminCommunityById = async (id) => {
  const response = await api.get(`/api/v1/admin/communities/${id}`);
  return response.data;
};

/**
 * PATCH /api/v1/admin/communities/{id}/status
 * @param {number|string} id
 * @param {'ACTIVE'|'INACTIVE'} status
 * @returns {Promise<Object>} updated community
 */
export const updateCommunityStatus = async (id, status) => {
  const response = await api.patch(`/api/v1/admin/communities/${id}/status`, { status });
  return response.data;
};

/**
 * DELETE /api/v1/admin/communities/{id}
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export const deleteAdminCommunity = async (id) => {
  await api.delete(`/api/v1/admin/communities/${id}`);
};

/**
 * GET /api/v1/admin/communities/{id}/members
 * @param {number|string} id
 * @param {number} page  default 0
 * @param {number} size  default 20
 * @returns {Promise<{ content, pageNumber, pageSize, totalElements, totalPages, last }>}
 */
export const getAdminCommunityMembers = async (id, page = 0, size = 20) => {
  const response = await api.get(`/api/v1/admin/communities/${id}/members`, {
    params: { page, size },
  });
  return response.data;
};
