import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    joinCommunity,
    createCommunity,
    getMyCommunities,
    getCommunityMembers,
    getPendingJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    removeMember,
    updateCommunity,
    updateJoinPolicy,
    updateCommunityStatus,
} from '../services/communityService';
import { MEMBERSHIP_STATUS } from '../constants';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch and sync the current user's communities (member + admin, incl. PENDING).
 * Keeps AuthContext in sync whenever the query data changes.
 * Auto-polls every 30s and fires toast notifications when join request status changes.
 */
export function useMyCommunities() {
    const { user, updateUser } = useAuth();

    // Track the previous snapshot of pending communities so we can diff on each fetch.
    // Shape: Map<communityId, communityName>
    const prevPendingRef = useRef(null);

    return useQuery({
        queryKey: ['communities', 'me'],
        queryFn: async () => {
            const communities = await getMyCommunities();

            // ── Diff pending status changes and notify the user ──────────────
            const currentPending = new Map(
                communities
                    .filter(c => c.membershipStatus === 'PENDING')
                    .map(c => [c.id, c.name])
            );

            if (prevPendingRef.current !== null) {
                const prev = prevPendingRef.current;

                // Communities that were PENDING before — what happened to them?
                prev.forEach((name, id) => {
                    const current = communities.find(c => c.id === id);
                    if (!current) {
                        // Membership no longer exists → request was rejected/cancelled
                        toast.info(`Your request to join "${name}" was declined.`, {
                            duration: 6000,
                            icon: '❌',
                        });
                    } else if (current.membershipStatus === 'APPROVED') {
                        // Status changed from PENDING → APPROVED
                        toast.success(`You've been accepted into "${name}"! 🎉`, {
                            description: 'You can now access this community.',
                            duration: 6000,
                        });
                    }
                });
            }

            // Store current pending snapshot for next comparison
            prevPendingRef.current = currentPending;
            // ────────────────────────────────────────────────────────────────

            // Keep AuthContext in sync so nav/protected-route checks still work
            updateUser({ communities, hasCommunities: communities.length > 0 });
            return communities;
        },
        enabled: !!user?.isVerified,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        // Poll every 30 seconds so pending users are notified without refreshing
        refetchInterval: 30_000,
    });
}

/**
 * Fetch paginated members of a community.
 * GET /api/communities/{communityId}/members
 */
export function useCommunityMembers(communityId, page = 0, size = 20) {
    return useQuery({
        queryKey: ['communities', communityId, 'members', page, size],
        queryFn: () => getCommunityMembers(communityId, page, size),
        enabled: !!communityId,
        staleTime: 30_000,
    });
}

/**
 * Fetch pending join requests for a community. Admin only.
 * GET /api/communities/{communityId}/join-requests
 */
export function usePendingJoinRequests(communityId) {
    return useQuery({
        queryKey: ['communities', communityId, 'join-requests'],
        queryFn: () => getPendingJoinRequests(communityId),
        enabled: !!communityId,
        staleTime: 0,
        refetchOnMount: true,
    });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Join a community by invite code.
 * POST /api/communities/join
 * Handles both OPEN (APPROVED) and APPROVAL_REQUIRED (PENDING) join flows.
 */
export function useJoinCommunity() {
    const queryClient = useQueryClient();
    const { addCommunity } = useAuth();

    return useMutation({
        mutationFn: (code) => joinCommunity(code.trim().toUpperCase()),
        onSuccess: (community) => {
            const isPending = community.membershipStatus === MEMBERSHIP_STATUS.PENDING;

            // Add to auth context only if immediately approved
            if (!isPending) {
                addCommunity(community);
            }
            queryClient.invalidateQueries({ queryKey: ['communities'] });

            if (isPending) {
                toast.info(`Join request sent to ${community.name}`, {
                    description: 'Waiting for admin approval',
                    duration: 4000,
                });
            } else {
                toast.success(`Joined ${community.name}!`, {
                    description: 'You can now access this community',
                    duration: 3000,
                });
            }
        },
        onError: (error) => {
            console.error('Join community error:', error);
            toast.error('Failed to join community', {
                description: error.message || 'Please check the code and try again',
                duration: 4000,
            });
        },
    });
}

/**
 * Create a new community (caller becomes ADMIN).
 * POST /api/communities
 * joinPolicy is passed through; success UI is handled by the caller.
 * NOTE: We do NOT call addCommunity here — doing so would immediately update AuthContext,
 * which can cause DashboardPage to switch views and unmount the success modal before it shows.
 * The CreateCommunityModal "Done" button handles query invalidation instead.
 */
export function useCreateCommunity() {
    return useMutation({
        mutationFn: (formData) =>
            createCommunity({
                // form field is communityName; API field is name
                name: formData.communityName || formData.name,
                description: formData.description,
                category: formData.category,
                joinPolicy: formData.joinPolicy || 'OPEN',
            }),
        onError: (error) => {
            console.error('Create community error:', error);
            toast.error('Failed to create community', {
                description: error.message || 'Please try again',
                duration: 4000,
            });
        },
    });
}

/**
 * Approve a pending join request. Admin only.
 * POST /api/communities/{communityId}/join-requests/{requestId}/approve
 */
export function useApproveJoinRequest(communityId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId) => approveJoinRequest(communityId, requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communities', communityId, 'join-requests'] });
            queryClient.invalidateQueries({ queryKey: ['communities', communityId, 'members'] });
            queryClient.invalidateQueries({ queryKey: ['communities', 'me'] });
            toast.success('Join request approved');
        },
        onError: (error) => {
            toast.error('Failed to approve request', {
                description: error.message,
                duration: 4000,
            });
        },
    });
}

/**
 * Reject a pending join request. Admin only.
 * POST /api/communities/{communityId}/join-requests/{requestId}/reject
 */
export function useRejectJoinRequest(communityId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId) => rejectJoinRequest(communityId, requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communities', communityId, 'join-requests'] });
            toast.success('Join request rejected');
        },
        onError: (error) => {
            toast.error('Failed to reject request', {
                description: error.message,
                duration: 4000,
            });
        },
    });
}

/**
 * Remove an approved member from a community. Admin only.
 * DELETE /api/communities/{communityId}/members/{membershipId}
 */
export function useRemoveMember(communityId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (membershipId) => removeMember(communityId, membershipId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communities', communityId, 'members'] });
            queryClient.invalidateQueries({ queryKey: ['communities', 'me'] });
            toast.success('Member removed from community');
        },
        onError: (error) => {
            toast.error('Failed to remove member', {
                description: error.message,
                duration: 4000,
            });
        },
    });
}

/**
 * Edit community name, description, and category. Admin only.
 * PUT /api/communities/{communityId}
 */
export function useUpdateCommunity(communityId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => updateCommunity(communityId, data),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            toast.success(`Community updated to "${updated.name}"`);
        },
        onError: (error) => {
            toast.error('Failed to update community', {
                description: error.message,
                duration: 4000,
            });
        },
    });
}

/**
 * Change the community join policy. Admin only.
 * PATCH /api/communities/{communityId}/join-policy
 */
export function useUpdateJoinPolicy(communityId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (joinPolicy) => updateJoinPolicy(communityId, joinPolicy),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            toast.success(`Join policy set to ${updated.joinPolicy}`);
        },
        onError: (error) => {
            toast.error('Failed to update join policy', {
                description: error.message,
                duration: 4000,
            });
        },
    });
}

/**
 * Activate or deactivate a community. Admin only.
 * PATCH /api/communities/{communityId}/status
 */
export function useUpdateCommunityStatus(communityId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (status) => updateCommunityStatus(communityId, status),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            toast.success(`Community is now ${updated.status}`);
        },
        onError: (error) => {
            toast.error('Failed to update community status', {
                description: error.message,
                duration: 4000,
            });
        },
    });
}
