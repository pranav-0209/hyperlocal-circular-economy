import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeNavbar from '../components/ui/HomeNavbar';

/**
 * DashboardPage (/dashboard)
 * 
 * Unified dashboard that shows:
 * - Community selection UI for verified users without communities
 * - Main dashboard with marketplace feed for users with communities
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, addCommunity } = useAuth();

  // Community selection states
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Join Community Form
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Create Community Form
  const [createForm, setCreateForm] = useState({
    communityName: '',
    description: '',
  });
  const [createError, setCreateError] = useState('');

  const handleJoinCommunity = async (e) => {
    e.preventDefault();
    setJoinError('');

    if (!joinCode.trim()) {
      setJoinError('Please enter a community code');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock: Add community
    addCommunity({
      id: `comm_${Date.now()}`,
      name: `Community ${joinCode}`,
      code: joinCode,
      role: 'member',
    });

    setIsLoading(false);
    // Reload to show dashboard with community
    window.location.reload();
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.communityName.trim()) {
      setCreateError('Community name is required');
      return;
    }

    if (!createForm.description.trim()) {
      setCreateError('Description is required');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock: Create community
    addCommunity({
      id: `comm_${Date.now()}`,
      name: createForm.communityName,
      description: createForm.description,
      role: 'admin',
    });

    setIsLoading(false);
    // Reload to show dashboard with community
    window.location.reload();
  };

  // If user has no communities, show community selection UI
  if (!user || !user.communities || user.communities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomeNavbar />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Verification Success Banner */}
          {showVerifiedBanner && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-bold text-green-900">You're verified!</h3>
                  <p className="text-sm text-green-800">
                    You can now access trusted local groups and start sharing securely with your neighbors.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifiedBanner(false)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-charcoal mb-2">
              Select your path
            </h2>
            <p className="text-muted-green">
              Join an existing neighborhood or create a new circle.
            </p>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Join Community Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white relative overflow-hidden">
              {/* Recommended Badge */}
              <span className="inline-block px-3 py-1 bg-green-400 text-green-900 text-xs font-bold rounded-full mb-4">
                Recommended
              </span>

              <h3 className="text-2xl font-bold mb-8">Join Community</h3>

              <div className="mt-auto">
                <h4 className="font-semibold mb-3">Have an invite code?</h4>
                <p className="text-sm text-white/90 mb-4">
                  Enter your unique code below to instantly join a trusted local group.
                </p>

                <form onSubmit={handleJoinCommunity} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Community Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="E.G. GRN-8821"
                        className="grow px-4 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isLoading ? '...' : 'Join'}
                      </button>
                    </div>
                    {joinError && (
                      <p className="text-red-200 text-sm mt-2">{joinError}</p>
                    )}
                  </div>
                </form>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/80">
                    Need help finding your code?{' '}
                    <a href="#" className="font-medium hover:underline">
                      Contact Support
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Create Community Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-charcoal rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">home</span>
                </div>
                <h3 className="text-xl font-bold text-charcoal">Start a new circle</h3>
              </div>

              <p className="text-sm text-muted-green mb-6">
                Create a hub for your neighborhood or apartment building.
              </p>

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={createForm.communityName}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        communityName: e.target.value,
                      })
                    }
                    placeholder="e.g. Maple Street Neighbors"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Briefly describe your community's goal..."
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>

                {createError && (
                  <p className="text-red-500 text-sm">{createError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Creating...' : (
                    <>
                      Preview & Create
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // User has communities - show main dashboard
  const currentCommunity = user.communities[0];

  // Mock marketplace items
  const marketplaceItems = [
    { id: 1, title: 'Cordless Power Drill', description: 'Perfect for home improvement projects.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', user: 'Sarah J.', verified: true, distance: '0.2 mi away', status: 'Available' },
    { id: 2, title: '6ft Aluminum Ladder', description: 'Lightweight and sturdy ladder.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', user: 'Mike T.', verified: false, distance: '0.5 mi away', status: 'Available' },
    { id: 3, title: 'Party Board Games Set', description: 'Catan, Ticket to Ride, and more.', image: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400', user: 'Emma W.', verified: true, distance: '0.1 mi away', status: 'Available' },
    { id: 4, title: '4-Person Camping Tent', description: 'Waterproof and easy to set up.', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400', user: 'David L.', verified: false, distance: '1.2 mi away', status: 'Available' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">
                Welcome back, {user.profile?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-muted-green flex items-center gap-2">
                You are viewing the <span className="font-medium text-charcoal">{currentCommunity.name}</span> community dashboard
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Verified Community
                </span>
              </p>
            </div>
            <button className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              List a New Item
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Community Feed */}
          <div className="lg:col-span-2">
            {/* Feed Tabs */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-charcoal">Community Feed</h2>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-full">For You</button>
                <button className="px-4 py-1.5 text-muted-green text-sm font-medium hover:bg-gray-100 rounded-full transition-colors">Nearby</button>
                <button className="px-4 py-1.5 text-muted-green text-sm font-medium hover:bg-gray-100 rounded-full transition-colors">Newest</button>
              </div>
            </div>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {marketplaceItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs font-bold rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {item.status}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                      {item.distance}
                    </span>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50">
                      <span className="material-symbols-outlined text-muted-green text-lg">bookmark</span>
                    </button>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-green mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {item.user.charAt(0)}
                        </div>
                        <span className="text-sm text-charcoal">{item.user}</span>
                        {item.verified && <span className="material-symbols-outlined text-primary text-sm">verified</span>}
                      </div>
                      <button className="text-primary font-medium text-sm hover:underline">Request</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 text-muted-green font-medium text-sm hover:text-primary transition-colors flex items-center justify-center gap-2">
              View more items
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Trust Score */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-charcoal">Trust Score</h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">GOOD</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#31816d" strokeWidth="3" strokeDasharray="85 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-primary">850</span>
                    <span className="text-[10px] text-muted-green">/1000</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-charcoal font-medium">You are a trusted member!</p>
                  <a href="#" className="text-primary text-sm hover:underline">View History ↗</a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-green">Complete ID verification to reach 1000 points.</p>
                </div>
              </div>
              <button className="w-full mt-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors">
                Start Verification
              </button>
            </div>

            {/* Requests */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-charcoal flex items-center gap-2">
                  Requests
                  <span className="w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                </h3>
                <a href="#" className="text-muted-green text-sm hover:text-primary">See all</a>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-charcoal font-bold shrink-0">J</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-charcoal">Jenny R.</span>
                      <br />
                      <span className="text-muted-green">Wants to borrow <span className="font-medium text-charcoal">Drill Set</span></span>
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg">Approve</button>
                      <button className="px-4 py-1.5 border border-gray-200 text-charcoal text-xs font-medium rounded-lg hover:bg-gray-50">Decline</button>
                    </div>
                  </div>
                  <span className="text-xs text-muted-green shrink-0">2h ago</span>
                </div>
              </div>
            </div>

            {/* My Listings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-charcoal">My Listings</h3>
                <button className="text-primary text-lg">+</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">Electric Leaf Blower</p>
                    <p className="text-xs text-accent">● With Neighbor</p>
                  </div>
                  <span className="material-symbols-outlined text-muted-green">chevron_right</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">Folding Chairs (x4)</p>
                    <p className="text-xs text-primary">● Available</p>
                  </div>
                  <span className="material-symbols-outlined text-muted-green">chevron_right</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors">
                Manage all listings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
