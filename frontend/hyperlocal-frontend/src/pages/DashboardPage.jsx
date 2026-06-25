import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AppFooter from '../components/ui/AppFooter';
import HomeNavbar from '../components/ui/HomeNavbar';
import CommunityDashboard from './CommunityDashboard';
import CreateItemModal from '../components/marketplace/CreateItemModal';
import {
  approveBorrowRequest,
  cancelBorrowRequest,
  getIncomingRequests,
  getMyListings,
  getMySentRequests,
  rejectBorrowRequest,
  getMySentRequestsCount,
  getIncomingRequestsCount,
} from '../services/marketplaceService';
import { useJoinCommunity, useMyCommunities } from '../hooks/useCommunityMutations';
import { getMyProfile } from '../services/profileService';
import { getTrustTierLabel, normalizeTrustValues } from '../utils/trust';
import { joinCommunitySchema } from '../schemas/communitySchemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import CreateCommunityModal from '../components/ui/CreateCommunityModal';
import SecureImage from '../components/ui/SecureImage';
import { ROUTES } from '../constants';

/**
 * DashboardPage (/dashboard)
 * 
 * Shows community selection for users without communities.
 * Shows user-oriented dashboard overview for users with communities.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const communityId = searchParams.get('community');
  const [requestsTab, setRequestsTab] = useState('incoming');

  // React Query mutations
  const joinMutation = useJoinCommunity();

  // Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(() => searchParams.get('showCreate') === 'true');
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);

  // Verified banner dismiss state
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(true);

  // Fetch real communities from backend (keeps AuthContext in sync).
  // Pause polling while create listing modal is open to avoid periodic UI flicker.
  // We also read `data`, `isFetched`, and `isError` directly so the onboarding-vs-dashboard
  // decision is made from the same query result atomically — this eliminates the
  // race condition where React Query marks the query as settled (isLoading=false)
  // while the updateUser() callback that syncs user.communities is still pending
  // in a separate React state update batch.
  const {
    isLoading: communitiesLoading,
    isFetched: communitiesIsFetched,
    isError: communitiesIsError,
    data: communitiesData,
  } = useMyCommunities({
    refetchInterval: showCreateItemModal ? false : 30_000,
  });

  // React Hook Form instances
  const joinForm = useForm({
    resolver: zodResolver(joinCommunitySchema),
    defaultValues: { code: '' },
  });

  // Marketplace Queries — keys are scoped to user.id so User A's cache is
  // never served to User B even during the brief window after login.
  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings', user?.id],
    queryFn: getMyListings,
    enabled: !!user,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests', user?.id],
    queryFn: () => getIncomingRequests({ page: 0, size: 8 }),
    enabled: !!user,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sentRequests', user?.id],
    queryFn: () => getMySentRequests({ page: 0, size: 8 }),
    enabled: !!user,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: getMyProfile,
    enabled: !!user,
  });

  const { data: itemsBorrowed = 0 } = useQuery({
    queryKey: ['itemsBorrowedCount', user?.id],
    queryFn: () => getMySentRequestsCount('COMPLETED'),
    enabled: !!user,
  });

  const { data: itemsShared = 0 } = useQuery({
    queryKey: ['itemsSharedCount', user?.id],
    queryFn: () => getIncomingRequestsCount('COMPLETED'),
    enabled: !!user,
  });

  const { data: pendingRequestsCount = 0 } = useQuery({
    queryKey: ['pendingRequestsCount', user?.id],
    queryFn: () => getIncomingRequestsCount('PENDING'),
    enabled: !!user,
  });

  const verified = profile?.verified ?? false;
  const { trustIndex, trustXp } = normalizeTrustValues(profile?.trustIndex, profile?.trustXp);
  const trustTier = getTrustTierLabel(trustIndex);
  
  const trustAchievements = [
    { label: 'Profile verified', done: verified },
    { label: 'Community member', done: (profile?.joinedCommunityIds?.length ?? 0) > 0 || (user?.communities?.length ?? 0) > 0 },
    { label: 'On-time returns', done: trustIndex >= 70 },
    { label: 'Trust XP gained', done: trustXp > 0 },
  ];

  const invalidateRequestQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['incomingRequests', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['sentRequests', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['recentRequests', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['itemsBorrowedCount', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['itemsSharedCount', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['pendingRequestsCount', user?.id] });
  };

  const approveMutation = useMutation({
    mutationFn: (requestId) => approveBorrowRequest(requestId),
    onSuccess: () => {
      toast.success('Request approved.');
      invalidateRequestQueries();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve request.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => rejectBorrowRequest(requestId),
    onSuccess: () => {
      toast.success('Request rejected.');
      invalidateRequestQueries();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject request.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId) => cancelBorrowRequest(requestId),
    onSuccess: () => {
      toast.success('Request cancelled.');
      invalidateRequestQueries();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel request.');
    },
  });

  const formatRequestDate = (dateValue) => {
    if (!dateValue) return '';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatListingPrice = (priceValue) => {
    const parsed = Number(priceValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return 'Free';
    return `\u20B9${parsed.toLocaleString('en-IN')}`;
  };

  const getEffectiveRequestStatus = (request) => {
    const normalized = String(request?.status || '').toUpperCase();
    const exchangeStatus = String(request?.exchangeStatus || '').toUpperCase();

    if (normalized === 'COMPLETED') return 'COMPLETED';
    if (exchangeStatus === 'COMPLETED') return 'COMPLETED';
    if (normalized === 'APPROVED' && (request?.completedAt || request?.returnedAt || request?.actualReturnDate)) {
      return 'COMPLETED';
    }
    return normalized || 'PENDING';
  };

  const requestBadgeStyle = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'PENDING') return 'border-amber-200 text-amber-700 bg-amber-50';
    if (normalized === 'APPROVED') return 'border-green-200 text-green-700 bg-green-50';
    if (normalized === 'COMPLETED') return 'border-blue-200 text-blue-700 bg-blue-50';
    if (normalized === 'CANCELLED' || normalized === 'REJECTED') return 'border-gray-200 text-gray-600 bg-gray-50';
    return 'border-gray-200 text-charcoal bg-gray-50';
  };

  const activeRequests = requestsTab === 'incoming' ? incomingRequests : sentRequests;
  const previewRequests = activeRequests.slice(0, 3);
  const previewListings = myListings.slice(0, 4);
  const showCreateListingCard = previewListings.length > 0 && previewListings.length % 2 === 1;
  const pendingRequestCount = incomingRequests.filter((request) => request.status === 'PENDING').length;

  const handleJoinCommunity = (data) => {
    joinMutation.mutate(data.code, {
      onSuccess: () => {
        joinForm.reset();
        setShowJoinModal(false);
      },
    });
  };

  // Block render while the initial communities fetch is in-flight.
  // We gate on BOTH isLoading (pending + fetching) AND !isFetched to be safe:
  // - isLoading covers the first render before any data arrives
  // - !isFetched covers edge cases in React 19 concurrent mode where isLoading
  //   may transiently flicker to false before the first successful response
  //   has been committed to both React Query state and AuthContext state.
  // - communitiesIsError: if the fetch fails, release the gate so users aren't
  //   stuck on a spinner forever; resolvedCommunities will fall back to [] or
  //   user.communities (which may still have data from a prior session).
  if (!user || communitiesLoading || (!communitiesIsFetched && !communitiesIsError)) {
    return <div>Loading...</div>;
  }

  // Determine community membership directly from the query result — NOT from
  // user.communities — to avoid any race between React Query's status change
  // and the updateUser() call that syncs communities into AuthContext.
  // `communitiesData` is guaranteed to be populated at this point because we
  // waited for isFetched above.
  const resolvedCommunities = communitiesData ?? user.communities ?? [];

  // If user has no communities, show community selection page
  if (resolvedCommunities.length === 0) {
    const firstName = user.profile?.name?.split(' ')[0] || user.profile?.name || 'Neighbor';

    return (
      <div className="min-h-screen bg-[#f4f6f4] flex flex-col">
        <HomeNavbar hideNavLinks={true} hideProfileOption={true} />

        <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex-1 max-w-5xl mx-auto w-full">

          {/* Verified Success Banner — dismissible */}
          {showVerifiedBanner && (
            <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-white text-xl">verified</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-green-900 text-base leading-snug">
                  Welcome, {firstName}! You&apos;re verified &#127881;
                </h3>
                <p className="text-sm text-green-700 mt-0.5 leading-snug">
                  You can now access trusted local groups and start sharing securely with your neighbors.
                </p>
              </div>
              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => setShowVerifiedBanner(false)}
                aria-label="Dismiss banner"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-green-600 hover:bg-green-100 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-2 leading-tight">
              Get started with a community
            </h1>
            <p className="text-base text-muted-green">
              Join an existing neighborhood circle or start your own.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Join Community */}
            <div className="bg-gradient-to-br from-primary to-primary/85 rounded-2xl p-7 text-white shadow-lg flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-5 tracking-wide">
                  <span className="material-symbols-outlined text-sm">star</span>
                  Recommended
                </div>

                <h2 className="text-2xl font-bold mb-2">Join a Community</h2>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Have an invite code? Enter it below to instantly join a trusted local sharing group.
                </p>

                {/* Benefits list */}
                <ul className="space-y-2.5 mb-7">
                  {[
                    { icon: 'groups', text: 'Connect with verified neighbors' },
                    { icon: 'swap_horiz', text: 'Borrow, lend & share items' },
                    { icon: 'shield', text: 'Safe, trusted local network' },
                  ].map(({ icon, text }) => (
                    <li key={icon} className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-white/70 text-base">{icon}</span>
                      <span className="text-sm text-white/90">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="w-full flex items-center justify-center px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-md text-sm hover:opacity-90 transition-opacity"
                >
                  Enter Community Code
                </button>
              </div>
            </div>

            {/* Right: Create Community */}
            <div className="bg-white rounded-2xl p-7 shadow-lg border border-gray-100 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 bg-charcoal rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">add_home</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-charcoal leading-tight">Start a new circle</h2>
                    <p className="text-sm text-muted-green">Be the first in your neighborhood</p>
                  </div>
                </div>

                <p className="text-sm text-muted-green leading-relaxed mb-5">
                  Create a private sharing circle for your apartment, street, or group. You&apos;ll get a unique invite code to share with trusted neighbors.
                </p>

                {/* Feature highlights */}
                <ul className="space-y-2.5">
                  {[
                    { icon: 'key', text: 'Get an auto-generated invite code' },
                    { icon: 'lock', text: 'Private \u2014 only people you invite can join' },
                    { icon: 'swap_horiz', text: 'Share, borrow & trade within your circle' },
                  ].map(({ icon, text }) => (
                    <li key={icon} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-base">{icon}</span>
                      </div>
                      <span className="text-sm text-charcoal">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-white font-bold rounded-xl shadow-md text-sm mt-6 hover:bg-[#2a2a2a] transition-colors"
              >
                Create New Community
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>

        {/* Join Community Modal */}
        <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join Community</DialogTitle>
              <DialogDescription>
                Enter your community code to join an existing neighborhood group.
              </DialogDescription>
            </DialogHeader>

            <Form {...joinForm}>
              <form onSubmit={joinForm.handleSubmit(handleJoinCommunity)} className="space-y-4">
                <FormField
                  control={joinForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. ABC-1234"
                          disabled={joinMutation.isPending}
                          autoFocus
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {joinMutation.isError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    {joinMutation.error.message}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowJoinModal(false);
                      joinForm.reset();
                      joinMutation.reset();
                    }}
                    className="flex-1"
                    disabled={joinMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={joinMutation.isPending}
                    className="flex-1 shadow-lg"
                  >
                    {joinMutation.isPending ? 'Joining...' : 'Join Community'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <CreateCommunityModal open={showCreateModal} onOpenChange={setShowCreateModal} />

        <AppFooter />
      </div>
    );
  }

  // If specific community is selected, show community dashboard
  if (communityId) {
    const selectedCommunity = resolvedCommunities.find(c => c.id === communityId);

    if (!selectedCommunity) {
      // Invalid community ID, redirect to main dashboard
      navigate('/dashboard');
      return <div>Loading...</div>;
    }

    return <CommunityDashboard community={selectedCommunity} />;
  }

  // User has communities - show dashboard overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary/5 flex flex-col">
      <HomeNavbar />

      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Welcome back, {user.profile?.name || 'User'}!
          </h1>
          <p className="text-muted-green">Here's what's happening in your communities</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Communities Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal">My Communities</h2>
                <button
                  onClick={() => navigate('/my-communities')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              {resolvedCommunities.length > 0 ? (
                <div className="space-y-3">
                  {/* Pending memberships — amber strip at top */}
                  {resolvedCommunities.filter(c => c.membershipStatus === 'PENDING').map((community) => (
                    <div key={community.id} className="w-full flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-amber-600 text-[18px]">hourglass_empty</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-charcoal text-sm">{community.name}</h3>
                          <p className="text-xs text-amber-600">Awaiting admin approval</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PENDING</span>
                    </div>
                  ))}
                  {/* Active communities — most recent first */}
                  {resolvedCommunities
                    .filter(c => c.membershipStatus !== 'PENDING')
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 3)
                    .map((community) => {
                    const isAdmin = community.isAdmin === true;
                    return (
                      <button
                        key={community.id}
                        onClick={() => navigate(`/dashboard?community=${community.id}`)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-cyan-700' : 'bg-primary'}`}>
                            <span className="material-symbols-outlined text-white text-[20px]">
                              {isAdmin ? 'admin_panel_settings' : 'groups'}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-charcoal">{community.name}</h3>
                              {isAdmin && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 uppercase tracking-wide">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-green">
                              {community.memberCount || '?'} members
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-muted-green">chevron_right</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">groups</span>
                  <p className="text-muted-green mb-4">You haven't joined any communities yet</p>
                  <button
                    onClick={() => navigate('/my-communities')}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:brightness-110 transition-all"
                  >
                    Join a Community
                  </button>
                </div>
              )}
            </div>

            {/* Recent Requests Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal">Borrow Requests</h2>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MARKETPLACE_REQUESTS)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1 mb-4">
                <button
                  type="button"
                  onClick={() => setRequestsTab('incoming')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${requestsTab === 'incoming' ? 'bg-white text-charcoal shadow-sm' : 'text-muted-green hover:text-charcoal'}`}
                >
                  Incoming
                </button>
                <button
                  type="button"
                  onClick={() => setRequestsTab('sent')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${requestsTab === 'sent' ? 'bg-white text-charcoal shadow-sm' : 'text-muted-green hover:text-charcoal'}`}
                >
                  Sent
                </button>
              </div>

              {activeRequests.length > 0 ? (
                <div className="space-y-3">
                  {previewRequests.map((req) => {
                    const requestStatus = getEffectiveRequestStatus(req);
                    const displayStatus = requestsTab === 'incoming' && requestStatus === 'APPROVED'
                      ? 'COMPLETED'
                      : requestStatus;

                    return (
                      <div key={req.id} className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-lg">
                            <span className="material-symbols-outlined text-muted-green text-base">handshake</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-charcoal">
                              {requestsTab === 'incoming'
                                ? `${req.requesterName || req.requesterId || 'Community Member'} requested `
                                : 'You requested '}
                              <span className="font-bold">{req.listingTitle || 'Listing'}</span>
                              {requestsTab === 'sent' && (
                                <span>{` from ${req.ownerName || req.ownerId || 'Community member'}`}</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-green">{formatRequestDate(req.createdAt)}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold pointer-events-none select-none cursor-default ${requestBadgeStyle(displayStatus)}`}
                          >
                            {displayStatus}
                          </span>
                        </div>

                        {requestsTab === 'incoming' && requestStatus === 'PENDING' && (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => rejectMutation.mutate(req.id)}
                              disabled={rejectMutation.isPending && rejectMutation.variables === req.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                            >
                              {rejectMutation.isPending && rejectMutation.variables === req.id ? 'Rejecting...' : 'Reject'}
                            </button>
                            <button
                              type="button"
                              onClick={() => approveMutation.mutate(req.id)}
                              disabled={approveMutation.isPending && approveMutation.variables === req.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                            >
                              {approveMutation.isPending && approveMutation.variables === req.id ? 'Approving...' : 'Approve'}
                            </button>
                          </div>
                        )}

                        {requestsTab === 'sent' && requestStatus === 'PENDING' && (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => cancelMutation.mutate(req.id)}
                              disabled={cancelMutation.isPending && cancelMutation.variables === req.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-charcoal bg-white hover:bg-gray-100 disabled:opacity-60"
                            >
                              {cancelMutation.isPending && cancelMutation.variables === req.id ? 'Cancelling...' : 'Cancel Request'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">inbox</span>
                  <p className="text-muted-green">
                    {requestsTab === 'incoming' ? 'No incoming requests' : 'No sent requests'}
                  </p>
                </div>
              )}
            </div>

            {/* My Listings Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal">My Listings</h2>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MY_LISTINGS)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              {myListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {previewListings.map((item) => (
                    <div
                      key={item.id}
                      className="group border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 bg-gray-50/70 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200">
                        {item.images && item.images[0] ? (
                          <SecureImage source={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-xl">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-semibold text-sm text-charcoal truncate group-hover:text-primary transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-5 uppercase tracking-wide">{item.type}</Badge>
                          <span className="text-sm text-charcoal font-semibold">
                            {formatListingPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {showCreateListingCard && (
                    <button
                      onClick={() => setShowCreateItemModal(true)}
                      className="border border-dashed border-gray-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-muted-green hover:text-primary h-[94px]"
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                      <span className="text-xs font-bold">Create New Listing</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">inventory_2</span>
                  <p className="text-muted-green mb-4">You haven't listed any items yet</p>
                  <button
                    onClick={() => setShowCreateItemModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:brightness-110 transition-all"
                  >
                    List an Item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Trust Score Card */}
<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
  <h3 className="text-[11px] font-medium text-muted-green uppercase tracking-wide mb-4">
    Trust Score
  </h3>

  {profileLoading ? (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
      <p className="text-sm text-muted-green">Loading trust data...</p>
    </div>
  ) : !profile ? (
    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
      <span className="material-symbols-outlined text-gray-300 text-3xl">error_outline</span>
      <p className="text-sm text-muted-green">Trust data unavailable</p>
    </div>
  ) : (
    <>
      {/* Score Ring + Tier Info */}
      <div className="flex items-start gap-3.5 mb-4">

        {/* SVG Ring */}
        <div className="relative w-[88px] h-[88px] flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <circle cx="44" cy="44" r="35" fill="none" stroke="#e0f4f0" strokeWidth="8.5" />
            <circle
              cx="44" cy="44" r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeDasharray="219.91"
              strokeDashoffset={`${219.91 - (219.91 * trustIndex) / 100}`}
              className="text-primary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-semibold text-primary leading-none">{trustIndex}</span>
            <span className="text-[11px] text-muted-green mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Right: 2-col micro-stats + badge + progress bar */}
        <div className="flex-1 min-w-0">
          {/* Micro stats grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2.5">
            <div>
              <p className="text-[10px] text-muted-green mb-0.5">Trust tier</p>
              <p className="text-sm font-semibold text-charcoal">{trustTier}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-green mb-0.5">XP earned</p>
              <p className="text-sm font-semibold text-primary">{trustXp} XP</p>
            </div>
          </div>

          {/* Tier badge */}
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold mb-2.5
              ${trustTier.toLowerCase() === 'needs improvement'
                ? 'bg-red-100 text-red-700'
                : trustTier.toLowerCase() === 'fair'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>
              {trustTier.toLowerCase() === 'needs improvement' || trustTier.toLowerCase() === 'fair'
                ? 'shield'
                : 'trending_up'}
            </span>
            {trustTier.toUpperCase()}
          </div>

          {/* Score progress bar */}
          <p className="text-[10px] text-muted-green mb-1">Score progress</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${trustIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-100 mb-3.5" />

      {/* Achievements — 2×2 grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {trustAchievements.map((t) => (
          <div
            key={t.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] leading-snug
              ${t.done
                ? 'bg-green-50 text-green-800'
                : 'bg-gray-50 text-gray-400'
              }`}
          >
            <span
              className={`material-symbols-outlined flex-shrink-0 ${t.done ? 'text-green-500' : 'text-gray-300'}`}
              style={{
                fontSize: "14px",
                ...(t.done && { fontVariationSettings: "'FILL' 1" }),
              }}
            >
              {t.done ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {t.label}
          </div>
        ))}
      </div>
    </>
  )}
</div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">bolt</span>
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Join Community
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  <span className="material-symbols-outlined text-sm">add_home</span>
                  Create Community
                </button>

                <button
                  onClick={() => navigate('/discover')}
                  className="w-full py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  Browse Items
                </button>

                <button
                  onClick={() => setShowCreateItemModal(true)}
                  className="w-full py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  List an Item
                </button>
              </div>
            </div>

            {/* Activity Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-charcoal mb-4">Activity Summary</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Items Borrowed</span>
                  <span className="font-bold text-charcoal">{itemsBorrowed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Items Shared</span>
                  <span className="font-bold text-charcoal">{itemsShared}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Active Listings</span>
                  <span className="font-bold text-charcoal">
                    {myListings.filter((item) => item.status === 'AVAILABLE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Pending Requests</span>
                  <span className="font-bold text-charcoal">{pendingRequestsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Join Community Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Community</DialogTitle>
            <DialogDescription>
              Enter your community code to join an existing neighborhood group.
            </DialogDescription>
          </DialogHeader>

          <Form {...joinForm}>
            <form onSubmit={joinForm.handleSubmit(handleJoinCommunity)} className="space-y-4">
              <FormField
                control={joinForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. ABC-1234"
                        disabled={joinMutation.isPending}
                        autoFocus
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {joinMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {joinMutation.error.message}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowJoinModal(false);
                    joinForm.reset();
                    joinMutation.reset();
                  }}
                  className="flex-1"
                  disabled={joinMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={joinMutation.isPending}
                  className="flex-1 shadow-lg"
                >
                  {joinMutation.isPending ? 'Joining...' : 'Join Community'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CreateCommunityModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      <CreateItemModal
        open={showCreateItemModal}
        onOpenChange={setShowCreateItemModal}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['myListings', user?.id] });
        }}
      />

      <AppFooter />
    </div>
  );
}
