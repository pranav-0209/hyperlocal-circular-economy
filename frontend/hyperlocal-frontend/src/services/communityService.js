import api from './api';

/**
 * Maps the backend community object to the shape the frontend uses internally.
 *
 * Backend shape:
 *   { id (Long), name, code, description, category, admins: [string],
 *     memberCount, createdAt, inviteCode, admin: boolean }
 *
 * Frontend shape:
 *   { id (string), name, code, description, category,
 *     memberCount, createdAt, role: "admin"|"member" }
 */
const normalizeCommunity = (c) => ({
  id: String(c.id),
  name: c.name,
  // backend's inviteCode is the shareable join code (displayed / copied by user)
  code: c.inviteCode || c.code || '',
  description: c.description,
  category: c.category,
  memberCount: c.memberCount,
  createdAt: c.createdAt,
  role: c.admin ? 'admin' : 'member',
  admins: c.admins || [],
});

/**
 * GET /api/communities/me
 * Returns all communities the authenticated user belongs to.
 * @returns {Promise<Array>} normalized community array
 */
export const getMyCommunities = async () => {
  const response = await api.get('/api/communities/me');
  // backend returns a plain array
  return Array.isArray(response.data)
    ? response.data.map(normalizeCommunity)
    : [];
};

/**
 * POST /api/communities/join
 * Join a community by its invite code.
 * @param {string} code  - invite code e.g. "GRN-8821"
 * @returns {Promise<Object>} normalized community
 */
export const joinCommunity = async (code) => {
  const response = await api.post('/api/communities/join', { code });
  return normalizeCommunity(response.data);
};

/**
 * POST /api/communities
 * Create a new community.
 * @param {{ name: string, description: string, category: string }} data
 * @returns {Promise<Object>} normalized community
 */
export const createCommunity = async ({ name, description, category }) => {
  const response = await api.post('/api/communities', { name, description, category });
  return normalizeCommunity(response.data);
};

/**
 * GET /api/communities/{communityId}
 * Get a single community by ID (user must be a member).
 * @param {string|number} communityId
 * @returns {Promise<Object>} normalized community
 */
export const getCommunityById = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}`);
  return normalizeCommunity(response.data);
};

/**
 * DELETE /api/communities/{communityId}/members/me
 * Leave a community (not available to admins).
 * @param {string|number} communityId
 * @returns {Promise<{ message: string }>}
 */
export const leaveCommunity = async (communityId) => {
  const response = await api.delete(`/api/communities/${communityId}/members/me`);
  return response.data;
};

/**
 * GET /api/communities/{communityId}/members
 * Get paginated members of a community.
 * @param {string|number} communityId
 * @param {number} page  default 0
 * @param {number} size  default 20
 * @returns {Promise<{ content, pageNumber, pageSize, totalElements, totalPages, last }>}
 */
export const getCommunityMembers = async (communityId, page = 0, size = 20) => {
  const response = await api.get(`/api/communities/${communityId}/members`, {
    params: { page, size },
  });
  return response.data;
};
