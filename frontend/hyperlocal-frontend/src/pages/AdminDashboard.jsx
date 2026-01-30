import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminDashboard (/admin)
 * 
 * Visible only to ADMIN and SUPERADMIN roles.
 * Shows verification requests and community management.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-green mb-4">
            Access denied. Admin only.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-xl font-bold text-charcoal">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-sm text-muted-green hover:text-charcoal"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="pt-8 pb-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Verifications */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-green mb-2">
                  Pending Verifications
                </p>
                <p className="text-3xl font-bold text-charcoal">12</p>
              </div>
              <span className="text-2xl">✓</span>
            </div>
          </div>

          {/* Active Communities */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-green mb-2">
                  Active Communities
                </p>
                <p className="text-3xl font-bold text-charcoal">24</p>
              </div>
              <span className="text-2xl">🏘️</span>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-green mb-2">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-charcoal">384</p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Verification Requests */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-charcoal mb-6">
            Verification Requests
          </h2>

          <div className="space-y-4">
            {[
              {
                id: 1,
                name: 'Alice Johnson',
                submittedAt: '2 hours ago',
                status: 'PENDING',
              },
              {
                id: 2,
                name: 'Bob Smith',
                submittedAt: '5 hours ago',
                status: 'PENDING',
              },
              {
                id: 3,
                name: 'Carol Davis',
                submittedAt: '1 day ago',
                status: 'PENDING',
              },
            ].map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-charcoal">{request.name}</p>
                  <p className="text-sm text-muted-green">
                    Submitted {request.submittedAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-charcoal font-medium hover:bg-gray-50">
                    Review
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
