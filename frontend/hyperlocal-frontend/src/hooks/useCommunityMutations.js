import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
    joinCommunity,
    createCommunity,
    getMyCommunities,
    leaveCommunity,
} from '../services/communityService';
import { toast } from 'sonner';

/**
 * Query hook to fetch and sync the current user's communities.
 * Keeps AuthContext in sync whenever the query data changes.
 */
export function useMyCommunities() {
    const { user, updateUser } = useAuth();

    return useQuery({
        queryKey: ['communities', 'me'],
        queryFn: async () => {
            const communities = await getMyCommunities();
            // Keep AuthContext in sync so nav/protected-route checks still work
            updateUser({ communities, hasCommunities: communities.length > 0 });
            return communities;
        },
        // Only fetch for verified users who are past the verification flow
        enabled: !!user?.isVerified,
        // staleTime: 0 — always fetch fresh data so DashboardPage routing is never
        // based on stale auth state. Background refetch is cheap; wrong screen is not.
        staleTime: 0,
        refetchOnMount: true,
    });
}

/**
 * Custom hook for joining a community.
 * Calls real backend: POST /api/communities/join
 */
export function useJoinCommunity() {
    const queryClient = useQueryClient();
    const { addCommunity } = useAuth();

    return useMutation({
        mutationFn: (code) => joinCommunity(code.trim().toUpperCase()),
        onSuccess: (community) => {
            // Update auth context immediately (optimistic-style)
            addCommunity(community);
            // Invalidate so useMyCommunities re-fetches fresh data
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            toast.success(`Joined ${community.name}!`, {
                description: 'You can now access this community',
                duration: 3000,
            });
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
 * Custom hook for creating a community.
 * Calls real backend: POST /api/communities
 */
export function useCreateCommunity() {
    const queryClient = useQueryClient();
    const { addCommunity } = useAuth();

    return useMutation({
        mutationFn: (formData) =>
            createCommunity({
                name: formData.name,
                description: formData.description,
                category: formData.category,
            }),
        onSuccess: (community) => {
            addCommunity(community);
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            // Success UI (modal + invite code) is handled by the caller (DashboardPage)
        },
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
 * Custom hook for leaving a community.
 * Calls real backend: DELETE /api/communities/{id}/members/me
 */
export function useLeaveCommunity() {
    const queryClient = useQueryClient();
    const { updateUser, user } = useAuth();

    return useMutation({
        mutationFn: (communityId) => leaveCommunity(communityId),
        onSuccess: (_, communityId) => {
            // Remove from auth context
            const updated = (user?.communities || []).filter(
                (c) => c.id !== String(communityId)
            );
            updateUser({ communities: updated });
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            toast.success('You have left the community.');
        },
        onError: (error) => {
            console.error('Leave community error:', error);
            toast.error('Failed to leave community', {
                description: error.message || 'Please try again',
                duration: 4000,
            });
        },
    });
}
