import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * CommunitySelectPage (/community/select)
 * 
 * Visible after verification is complete.
 * Allow user to join or create a community.
 */
export default function CommunitySelectPage() {
  const navigate = useNavigate();
  const { user, addCommunity } = useAuth();
  const [activeTab, setActiveTab] = useState('join');
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
    navigate('/dashboard');
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
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-bold text-charcoal">ShareMore</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-8 pb-16 px-4 max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-charcoal mb-2">
            Select your path
          </h2>
          <p className="text-muted-green">
            Join an existing neighborhood or create a new circle.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('join')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'join'
                ? 'text-primary border-primary'
                : 'text-muted-green border-transparent'
            }`}
          >
            Join Community
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'text-primary border-primary'
                : 'text-muted-green border-transparent'
            }`}
          >
            Create Community
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Join Community */}
          {activeTab === 'join' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-3xl">👥</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-charcoal text-center mb-2">
                Join Community
              </h3>
              <p className="text-sm text-muted-green text-center mb-6">
                Have an invite code? Enter it below to instantly join a trusted local group.
              </p>

              <form onSubmit={handleJoinCommunity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Community Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="E.G. GRN-8821"
                      className="grow px-4 py-3 border border-gray-300 rounded-lg bg-white text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? '...' : 'Join'}
                    </button>
                  </div>
                  {joinError && (
                    <p className="text-red-500 text-sm mt-2">{joinError}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-muted-green">
                    Don't have a code?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className="text-primary font-medium hover:underline"
                    >
                      Create your own community
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Create Community */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-3xl">🏘️</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-charcoal text-center mb-2">
                Start a new circle
              </h3>
              <p className="text-sm text-muted-green text-center mb-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-primary"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {createError && (
                  <p className="text-red-500 text-sm">{createError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Preview & Create'}
                </button>
              </form>
            </div>
          )}

          {/* Sidebar Info */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">
                ✓ You're verified!
              </h4>
              <p className="text-sm text-green-800">
                Your identity has been confirmed. You can now join or create a community and start
                sharing.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                💡 Community Features
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Share tools & equipment</li>
                <li>✓ Borrow from neighbors</li>
                <li>✓ Post requests</li>
                <li>✓ Build trust scores</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
