import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeNavbar from '../components/ui/HomeNavbar';
import CommunityDashboard from './CommunityDashboard';
import CreateItemModal from '../components/marketplace/CreateItemModal';
import { getMyListings, getRecentRequests } from '../services/marketplaceService';
import { useJoinCommunity, useMyCommunities } from '../hooks/useCommunityMutations';
import { joinCommunitySchema } from '../schemas/communitySchemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import CreateCommunityModal from '../components/ui/CreateCommunityModal';

/**
 * DashboardPage (/dashboard)
 * 
 * Shows community selection for users without communities.
 * Shows user-oriented dashboard overview for users with communities.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const communityId = searchParams.get('community');

  // Fetch real communities from backend (keeps AuthContext in sync).
  // We track isFetching (not just isLoading) so that when the user has communities
  // (hasCommunities=true from login response) we never flash the "Select your path"
  // screen while the background fetch is still in-flight.
  const { isLoading: communitiesLoading, isFetching: communitiesFetching } = useMyCommunities();

  // React Query mutations
  const joinMutation = useJoinCommunity();

  // Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(() => searchParams.get('showCreate') === 'true');
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);

  // React Hook Form instances
  const joinForm = useForm({
    resolver: zodResolver(joinCommunitySchema),
    defaultValues: { code: '' },
  });

  // Marketplace Queries
  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings'],
    queryFn: getMyListings,
    enabled: !!user,
  });

  const { data: recentRequests = [] } = useQuery({
    queryKey: ['recentRequests'],
    queryFn: getRecentRequests,
    enabled: !!user,
  });

  const handleJoinCommunity = (data) => {
    joinMutation.mutate(data.code, {
      onSuccess: () => {
        joinForm.reset();
        setShowJoinModal(false);
      },
    });
  };

  // Block render while:
  // â€¢ initial load (no cache yet)
  // â€¢ OR user told us at login they have communities (hasCommunities) but the
  //   fresh fetch hasn't landed yet â€” prevents wrong screen from flashing
  if (!user || communitiesLoading || (user.hasCommunities && communitiesFetching)) {
    return <div>Loading...</div>;
  }

  // If user has no communities, show community selection page
  if (!user.communities || user.communities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <HomeNavbar hideNavLinks={true} />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

          {/* Verification Badge */}
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white">verified</span>
            </div>
            <div>
              <h3 className="font-bold text-green-900 mb-1">You're verified! ðŸŽ‰</h3>
              <p className="text-sm text-green-700">
                You can now access trusted local groups and start sharing securely with your neighbors.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-2">
              Select your path
            </h1>
            <p className="text-muted-green">
              Join an existing neighborhood or create a new circle.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Join Community */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-white shadow-xl">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold mb-4">
                Recommended
              </div>

              <h2 className="text-2xl font-bold mb-2">Join Community</h2>
              <p className="text-white/90 mb-6 text-sm">
                Have an invite code?
              </p>
              <div className="space-y-4">
                <p className="text-white/80 text-sm leading-relaxed">
                  Enter your unique code below to instantly join a trusted local group.
                </p>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="w-full px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg"
                >
                  Enter Community Code
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-xs text-white/60 text-center">
                  Need help finding your code? <button className="underline hover:text-white">Contact Support</button>
                </p>
              </div>
            </div>

            {/* Right: Create Community */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-between gap-6">
              {/* Top section */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-charcoal to-charcoal/80 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-2xl">add_home</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-charcoal">Start a new circle</h2>
                    <p className="text-sm text-muted-green">Be the first in your neighborhood</p>
                  </div>
                </div>

                <p className="text-sm text-muted-green leading-relaxed mb-6">
                  Create a private sharing circle for your apartment, street, or group. You'll get a unique invite code to share with trusted neighbors.
                </p>

                {/* Feature highlights */}
                <ul className="space-y-3">
                  {[
                    { icon: 'key', text: 'Get an auto-generated invite code' },
                    { icon: 'lock', text: 'Private â€” only people you invite can join' },
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

              {/* CTA */}
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="w-full py-3 bg-charcoal text-white font-bold rounded-xl hover:bg-charcoal/90 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
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

      </div>
    );
  }

  // If specific community is selected, show community dashboard
  if (communityId) {
    const selectedCommunity = user.communities.find(c => c.id === communityId);

    if (!selectedCommunity) {
      // Invalid community ID, redirect to main dashboard
      navigate('/dashboard');
      return <div>Loading...</div>;
    }

    return <CommunityDashboard community={selectedCommunity} />;
  }

  // User has communities - show dashboard overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary/5">
      <HomeNavbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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

              {user.communities && user.communities.length > 0 ? (
                <div className="space-y-3">
                  {user.communities.slice(0, 3).map((community) => (
                    <button
                      key={community.id}
                      onClick={() => navigate(`/dashboard?community=${community.id}`)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">groups</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-charcoal">{community.name}</h3>
                          <p className="text-xs text-muted-green">
                            {community.memberCount || '?'} members Â· {community.role}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-muted-green">chevron_right</span>
                    </button>
                  ))}
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
                <h2 className="text-lg font-bold text-charcoal">Recent Requests</h2>
                <button className="text-sm text-primary hover:underline font-medium">
                  View All
                </button>
              </div>

              {recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {recentRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-lg">
                          ðŸŽ
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-charcoal">
                            {req.requestor} requested <span className="font-bold">{req.title}</span>
                          </p>
                          <p className="text-xs text-muted-green">{req.date}</p>
                        </div>
                      </div>
                      <Badge variant={req.status === 'PENDING' ? 'outline' : 'secondary'} className="text-xs">
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">inbox</span>
                  <p className="text-muted-green">No recent requests</p>
                </div>
              )}
            </div>

            {/* My Listings Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal">My Listings</h2>
                <button className="text-sm text-primary hover:underline font-medium">
                  View All
                </button>
              </div>

              {myListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myListings.slice(0, 4).map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-xl p-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-semibold text-sm text-charcoal truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{item.type}</Badge>
                          <span className="text-xs text-muted-green font-medium">
                            {item.price ? `â‚¹${item.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Add New Card */}
                  <button
                    onClick={() => setShowCreateItemModal(true)}
                    className="border border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-muted-green hover:text-primary h-[88px]"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    <span className="text-xs font-bold">List New Item</span>
                  </button>
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-charcoal mb-4">Trust Score</h3>

              <div className="text-center mb-4">
                <div className="w-32 h-32 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">850</div>
                    <div className="text-xs text-muted-green">/1000</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  GOOD
                </div>

                <p className="text-sm text-muted-green">
                  You are a trusted member! Keep up the good work.
                </p>
              </div>

              <button className="w-full py-2 text-sm text-primary hover:bg-gray-50 rounded-lg transition-colors">
                View detailed breakdown â†’
              </button>
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
                  <span className="font-bold text-charcoal">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Items Shared</span>
                  <span className="font-bold text-charcoal">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Active Listings</span>
                  <span className="font-bold text-charcoal">{myListings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-green">Pending Requests</span>
                  <span className="font-bold text-charcoal">{recentRequests.filter(r => r.status === 'PENDING').length}</span>
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
        communityId={user.communities?.[0]?.id || '1'}
      />

    </div>
  );
}
