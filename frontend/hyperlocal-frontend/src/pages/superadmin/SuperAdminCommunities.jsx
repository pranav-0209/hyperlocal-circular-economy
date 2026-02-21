import { useState } from 'react';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import DataTable from '../../components/superadmin/DataTable';

/**
 * SuperAdminCommunities Page (/superadmin/communities)
 * List and manage communities/neighborhoods
 */
export default function SuperAdminCommunities() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', city: '', description: '' });

  // Mock data - In real app, fetch from backend
  const communities = [
    {
      id: 1,
      name: 'Koramangala',
      city: 'Bangalore',
      members: 156,
      listings: 234,
      admin: 'Vikram Singh',
      status: 'active',
      createdAt: 'Jan 5, 2026',
    },
    {
      id: 2,
      name: 'HSR Layout',
      city: 'Bangalore',
      members: 89,
      listings: 112,
      admin: 'Sneha Reddy',
      status: 'active',
      createdAt: 'Jan 10, 2026',
    },
    {
      id: 3,
      name: 'Indiranagar',
      city: 'Bangalore',
      members: 203,
      listings: 301,
      admin: 'None',
      status: 'active',
      createdAt: 'Jan 12, 2026',
    },
    {
      id: 4,
      name: 'Whitefield',
      city: 'Bangalore',
      members: 67,
      listings: 78,
      admin: 'None',
      status: 'active',
      createdAt: 'Jan 15, 2026',
    },
    {
      id: 5,
      name: 'JP Nagar',
      city: 'Bangalore',
      members: 45,
      listings: 52,
      admin: 'None',
      status: 'inactive',
      createdAt: 'Jan 20, 2026',
    },
  ];

  const handleCreateCommunity = () => {
    if (!newCommunity.name.trim() || !newCommunity.city.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    alert(`Community "${newCommunity.name}" created successfully!`);
    setShowCreateModal(false);
    setNewCommunity({ name: '', city: '', description: '' });
  };

  const columns = [
    {
      key: 'name',
      label: 'Community',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">location_city</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'members',
      label: 'Members',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400 text-lg">group</span>
          <span className="text-gray-700">{row.members}</span>
        </div>
      ),
    },
    {
      key: 'listings',
      label: 'Listings',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400 text-lg">inventory_2</span>
          <span className="text-gray-700">{row.listings}</span>
        </div>
      ),
    },
    {
      key: 'admin',
      label: 'Community Admin',
      render: (row) => (
        <span className={row.admin === 'None' ? 'text-gray-400 italic' : 'text-gray-700'}>
          {row.admin}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Community"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Assign Admin"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
          </button>
        </div>
      ),
    },
  ];

  const totalMembers = communities.reduce((sum, c) => sum + c.members, 0);
  const totalListings = communities.reduce((sum, c) => sum + c.listings, 0);

  return (
    <SuperAdminLayout title="Communities">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{communities.length}</p>
          <p className="text-sm text-gray-500">Total Communities</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
          <p className="text-sm text-gray-500">Total Members</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-primary">{totalListings}</p>
          <p className="text-sm text-gray-500">Total Listings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">
            {communities.filter((c) => c.status === 'active').length}
          </p>
          <p className="text-sm text-gray-500">Active Communities</p>
        </div>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">All Communities</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Add Community
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={communities}
        emptyMessage="No communities found"
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create New Community</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  placeholder="e.g., Koramangala"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={newCommunity.city}
                  onChange={(e) => setNewCommunity({ ...newCommunity, city: e.target.value })}
                  placeholder="e.g., Bangalore"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  placeholder="Brief description of the community..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
