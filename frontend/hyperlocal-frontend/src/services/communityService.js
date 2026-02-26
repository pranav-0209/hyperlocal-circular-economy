import api from './api';

/**
 * Maps the backend CommunityResponse to the shape the frontend uses internally.
 *
 * Backend shape (v2):
 *   { id, name, code, description, category, status, joinPolicy,
 *     admins, memberCount, pendingCount, createdAt,
 *     inviteCode (admin only), isAdmin, membershipStatus }
 *
 * Frontend normalized shape:
 *   { id (string), name, code, description, category, status, joinPolicy,
 *     memberCount, pendingCount, createdAt, inviteCode,
 *     role: 'admin'|'member', membershipStatus, admins }
 */
export const normalizeCommunity = (c) => ({
  id: String(c.id),
  name: c.name,
  // inviteCode is the shareable join code — only populated for admins
  code: c.inviteCode || c.code || '',
  inviteCode: c.inviteCode || null,
  description: c.description,
  category: c.category,
  status: c.status || 'ACTIVE',
  joinPolicy: c.joinPolicy || 'OPEN',
  memberCount: c.memberCount || 0,
  // pendingCount is only populated when isAdmin: true
  pendingCount: c.pendingCount || 0,
  createdAt: c.createdAt,
  // API returns "admin" boolean (not "isAdmin") — keep both for safety
  isAdmin: Boolean(c.admin ?? c.isAdmin),
  // role string for display/legacy usage
  role: (c.admin ?? c.isAdmin) ? 'admin' : 'member',
  membershipStatus: c.membershipStatus || 'APPROVED',
  admins: c.admins || [],
});

// ---------------------------------------------------------------------------
// Core community endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/communities/me
 * Returns all communities the authenticated user belongs to (member + admin),
 * including PENDING memberships.
 * @returns {Promise<Array>} normalized community array
 */
export const getMyCommunities = async () => {
  const response = await api.get('/api/communities/me');
  return Array.isArray(response.data)
    ? response.data.map(normalizeCommunity)
    : [];
};

/**
 * POST /api/communities/join
 * Join a community by invite code.
 * membershipStatus in response: 'APPROVED' (OPEN) or 'PENDING' (APPROVAL_REQUIRED)
 * @param {string} code  e.g. "GRE-4421"
 * @returns {Promise<Object>} normalized community
 */
export const joinCommunity = async (code) => {
  const response = await api.post('/api/communities/join', { code });
  return normalizeCommunity(response.data);
};

/**
 * POST /api/communities
 * Create a new community. Caller becomes ADMIN with APPROVED status.
 * @param {{ name, description, category, joinPolicy }} data
 * @returns {Promise<Object>} normalized community (includes inviteCode)
 */
export const createCommunity = async ({ name, description, category, joinPolicy }) => {
  const response = await api.post('/api/communities', {
    name,
    description,
    category,
    joinPolicy: joinPolicy || 'OPEN',
  });
  return normalizeCommunity(response.data);
};

/**
 * GET /api/communities/{communityId}
 * Get a single community by ID (must be APPROVED or PENDING member).
 * @param {string|number} communityId
 * @returns {Promise<Object>} normalized community
 */
export const getCommunityById = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}`);
  return normalizeCommunity(response.data);
};

// ---------------------------------------------------------------------------
// Member endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/communities/{communityId}/members?page=0&size=20
 * Paginated list of APPROVED members. Requires APPROVED membership.
 * @returns {Promise<{ content, pageNumber, pageSize, totalElements, totalPages, last }>}
 */
export const getCommunityMembers = async (communityId, page = 0, size = 20) => {
  const response = await api.get(`/api/communities/${communityId}/members`, {
    params: { page, size },
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// Admin-only endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/communities/{communityId}/join-requests
 * Returns all PENDING join requests. Admin only.
 * @returns {Promise<Array<{ membershipId, userId, name, email, profilePhotoUrl, status, requestedAt }>>}
 */
export const getPendingJoinRequests = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}/join-requests`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * POST /api/communities/{communityId}/join-requests/{requestId}/approve
 * Approve a pending join request. Admin only.
 * @returns {Promise<void>}
 */
export const approveJoinRequest = async (communityId, requestId) => {
  await api.post(`/api/communities/${communityId}/join-requests/${requestId}/approve`);
};

/**
 * POST /api/communities/{communityId}/join-requests/{requestId}/reject
 * Reject (delete) a pending join request. Admin only.
 * @returns {Promise<void>}
 */
export const rejectJoinRequest = async (communityId, requestId) => {
  await api.post(`/api/communities/${communityId}/join-requests/${requestId}/reject`);
};

/**
 * DELETE /api/communities/{communityId}/members/{membershipId}
 * Remove an approved member. Admin only. Admin cannot remove themselves.
 * @returns {Promise<void>}  (204 No Content)
 */
export const removeMember = async (communityId, membershipId) => {
  await api.delete(`/api/communities/${communityId}/members/${membershipId}`);
};

/**
 * PUT /api/communities/{communityId}
 * Edit community name, description, and category. Admin only.
 * @param {{ name, description, category }} data
 * @returns {Promise<Object>} normalized community
 */
export const updateCommunity = async (communityId, { name, description, category }) => {
  const response = await api.put(`/api/communities/${communityId}`, {
    name,
    description,
    category,
  });
  return normalizeCommunity(response.data);
};

/**
 * PATCH /api/communities/{communityId}/join-policy
 * Change the community join policy. Admin only.
 * @param {'OPEN'|'APPROVAL_REQUIRED'} joinPolicy
 * @returns {Promise<Object>} normalized community
 */
export const updateJoinPolicy = async (communityId, joinPolicy) => {
  const response = await api.patch(`/api/communities/${communityId}/join-policy`, {
    joinPolicy,
  });
  return normalizeCommunity(response.data);
};

/**
 * PATCH /api/communities/{communityId}/status
 * Activate or deactivate a community. Admin only.
 * @param {'ACTIVE'|'INACTIVE'} status
 * @returns {Promise<Object>} normalized community
 */
export const updateCommunityStatus = async (communityId, status) => {
  const response = await api.patch(`/api/communities/${communityId}/status`, { status });
  return normalizeCommunity(response.data);
};
