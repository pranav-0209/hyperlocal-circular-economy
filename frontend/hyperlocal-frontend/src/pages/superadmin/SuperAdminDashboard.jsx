import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import StatsCard from '../../components/superadmin/StatsCard';
import { getAllUsers } from '../../services/authService';
import { getAdminCommunities } from '../../services/adminCommunityService';

const CATEGORY_LABELS = {
  NEIGHBOURHOOD: 'Neighbourhood',
  SOCIETY: 'Society / Apartment',
  COLLEGE: 'College / Campus',
  OFFICE: 'Office / Workplace',
  INTEREST_GROUP: 'Interest Group',
  OTHER: 'Other',
};

/** Small inline panel — recent communities fetched live */
function RecentCommunitiesPanel({ navigate }) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-recent-communities'],
    queryFn: () => getAdminCommunities({ size: 5, page: 0 }),
    staleTime: 1000 * 60 * 2,
  });
  const communities = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="px-6 py-8 text-center">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <span className="material-symbols-outlined text-3xl text-gray-300">location_city</span>
        <p className="text-sm text-gray-400 mt-2">No communities yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {communities.map((c) => (
        <div
          key={c.id}
          onClick={() => navigate('/superadmin/communities')}
          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-lg">location_city</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-400">{CATEGORY_LABELS[c.category] || c.category}</p>
            </div>
            <div className="text-right shrink-0">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {c.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
              <p className="text-xs text-gray-400 mt-1">{c.memberCount ?? 0} members</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SuperAdminDashboard Page (/superadmin)
 * Main dashboard with stats and overview
 */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  // ── Real data queries ───────────────────────────────────────────────────

  // Total users
  const { data: totalUsersData } = useQuery({
    queryKey: ['dashboard-total-users'],
    queryFn: () => getAllUsers({ size: 1 }),
    staleTime: 1000 * 60 * 2,
  });

  // Pending verifications count — sum all non-complete steps
  const { data: pendingCountData } = useQuery({
    queryKey: ['dashboard-pending-count'],
    queryFn: async () => {
      const [profileRes, docsRes, reviewRes] = await Promise.all([
        getAllUsers({ currentStep: 'PROFILE', size: 1 }),
        getAllUsers({ currentStep: 'DOCUMENT_VERIFICATION', size: 1 }),
        getAllUsers({ currentStep: 'REVIEW', size: 1 }),
      ]);
      return {
        totalElements:
          (profileRes.totalElements ?? 0) +
          (docsRes.totalElements ?? 0) +
          (reviewRes.totalElements ?? 0),
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  // Verified users count
  const { data: verifiedUsersData } = useQuery({
    queryKey: ['dashboard-verified-users'],
    queryFn: () => getAllUsers({ currentStep: 'COMPLETE', size: 1 }),
    staleTime: 1000 * 60 * 2,
  });

  // Active communities count
  const { data: activeCommunitiesData } = useQuery({
    queryKey: ['dashboard-active-communities'],
    queryFn: () => getAdminCommunities({ status: 'ACTIVE', size: 1 }),
    staleTime: 1000 * 60 * 2,
  });

  // Recent verifications list — all pending steps, most recent first
  const { data: pendingListData } = useQuery({
    queryKey: ['dashboard-pending-list'],
    queryFn: () => getAllUsers({ size: 8, sortBy: 'updatedAt', sortDir: 'desc' }),
    staleTime: 1000 * 60 * 2,
  });

  // Derived stats
  const stats = {
    totalUsers: totalUsersData?.totalElements ?? '—',
    pendingVerifications: pendingCountData?.totalElements ?? '—',
    activeCommunities: activeCommunitiesData?.totalElements ?? '—',
    verifiedUsers: verifiedUsersData?.totalElements ?? '—',
  };

  const STEP_CONFIG = {
    PROFILE: { label: 'Profile Incomplete', colors: 'bg-yellow-100 text-yellow-800' },
    DOCUMENT_VERIFICATION: { label: 'Docs Pending', colors: 'bg-blue-100 text-blue-800' },
    REVIEW: { label: 'Under Review', colors: 'bg-purple-100 text-purple-800' },
  };

  const pendingVerifications = (pendingListData?.content ?? [])
    .filter((u) => u.currentStep !== 'COMPLETE')
    .slice(0, 5)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      currentStep: u.currentStep,
      submitted: u.updatedAt
        ? new Date(u.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—',
    }));

  return (
    <SuperAdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon="group"
          label="Total Users"
          value={typeof stats.totalUsers === 'number' ? stats.totalUsers.toLocaleString() : stats.totalUsers}
          color="blue"
        />
        <StatsCard
          icon="pending"
          label="Pending Verifications"
          value={stats.pendingVerifications}
          color="yellow"
        />
        <StatsCard
          icon="location_city"
          label="Active Communities"
          value={stats.activeCommunities}
          color="primary"
        />
        <StatsCard
          icon="verified"
          label="Verified Users"
          value={typeof stats.verifiedUsers === 'number' ? stats.verifiedUsers.toLocaleString() : stats.verifiedUsers}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Verifications */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pending Verifications</h2>
            <button
              onClick={() => navigate('/superadmin/verifications')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingVerifications.length === 0 && (
              <div className="px-6 py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300">check_circle</span>
                <p className="text-sm text-gray-400 mt-2">No pending verifications</p>
              </div>
            )}
            {pendingVerifications.map((user) => {
              const step = STEP_CONFIG[user.currentStep] ?? { label: user.currentStep, colors: 'bg-gray-100 text-gray-600' };
              return (
                <div
                  key={user.id}
                  onClick={() => navigate(`/superadmin/verifications/${user.id}`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-gray-500">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${step.colors} border-transparent`}>
                        {step.label}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{user.submitted}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Communities */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Communities</h2>
            <button
              onClick={() => navigate('/superadmin/communities')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View All →
            </button>
          </div>
          <RecentCommunitiesPanel navigate={navigate} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/superadmin/verifications')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">verified_user</span>
            </div>
            <span className="font-medium text-gray-900">Review Verifications</span>
          </button>

          <button
            onClick={() => navigate('/superadmin/users')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">group</span>
            </div>
            <span className="font-medium text-gray-900">Manage Users</span>
          </button>

          <button
            onClick={() => navigate('/superadmin/communities')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">add_location</span>
            </div>
            <span className="font-medium text-gray-900">Add Community</span>
          </button>

          <button
            onClick={() => navigate('/superadmin/users')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">admin_panel_settings</span>
            </div>
            <span className="font-medium text-gray-900">Create Admin</span>
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
