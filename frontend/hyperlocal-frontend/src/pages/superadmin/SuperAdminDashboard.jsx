import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import StatsCard from '../../components/superadmin/StatsCard';

/**
 * SuperAdminDashboard Page (/superadmin)
 * Main dashboard with stats and overview
 */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  // Mock data - In real app, fetch from backend
  const stats = {
    totalUsers: 1247,
    pendingVerifications: 23,
    activeCommunities: 15,
    verifiedUsers: 892,
  };

  const recentActivity = [
    { id: 1, type: 'verification', message: 'New verification request from Priya Sharma', time: '5 min ago' },
    { id: 2, type: 'user', message: 'Rahul Kumar completed registration', time: '12 min ago' },
    { id: 3, type: 'community', message: 'New community "HSR Layout" created', time: '1 hour ago' },
    { id: 4, type: 'verification', message: 'Verification approved for Anita Desai', time: '2 hours ago' },
    { id: 5, type: 'user', message: 'Amit Patel updated profile', time: '3 hours ago' },
  ];

  const pendingVerifications = [
    { id: 1, name: 'Priya Sharma', email: 'priya@email.com', submitted: '2 hours ago' },
    { id: 2, name: 'Rahul Kumar', email: 'rahul@email.com', submitted: '5 hours ago' },
    { id: 3, name: 'Sneha Reddy', email: 'sneha@email.com', submitted: '1 day ago' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'verification': return 'verified_user';
      case 'user': return 'person';
      case 'community': return 'location_city';
      default: return 'info';
    }
  };

  return (
    <SuperAdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon="group"
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="+12%"
          trendUp={true}
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
          trend="+3"
          trendUp={true}
          color="primary"
        />
        <StatsCard
          icon="verified"
          label="Verified Users"
          value={stats.verifiedUsers.toLocaleString()}
          trend="+8%"
          trendUp={true}
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
            {pendingVerifications.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/superadmin/verifications/${user.id}`)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-600">person</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{user.submitted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-600 text-lg">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
