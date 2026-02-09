import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import StatusBadge from '../../components/superadmin/StatusBadge';
import DataTable from '../../components/superadmin/DataTable';

/**
 * SuperAdminUsers Page (/superadmin/users)
 * List of all users with management actions
 */
export default function SuperAdminUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data - In real app, fetch from backend
  const users = [
    {
      id: 1,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      community: 'Koramangala',
      status: 'verified',
      role: 'user',
      joinedAt: 'Jan 28, 2026',
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      email: 'rahul.kumar@email.com',
      phone: '+91 87654 32109',
      community: 'HSR Layout',
      status: 'pending',
      role: 'user',
      joinedAt: 'Jan 27, 2026',
    },
    {
      id: 3,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '+91 76543 21098',
      community: 'Indiranagar',
      status: 'verified',
      role: 'admin',
      joinedAt: 'Jan 20, 2026',
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 65432 10987',
      community: 'Whitefield',
      status: 'verified',
      role: 'user',
      joinedAt: 'Jan 15, 2026',
    },
    {
      id: 5,
      name: 'Kavya Nair',
      email: 'kavya.nair@email.com',
      phone: '+91 54321 09876',
      community: 'JP Nagar',
      status: 'suspended',
      role: 'user',
      joinedAt: 'Jan 10, 2026',
    },
    {
      id: 6,
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91 43210 98765',
      community: 'Koramangala',
      status: 'verified',
      role: 'admin',
      joinedAt: 'Jan 5, 2026',
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.community.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' || user.status === filter || user.role === filter;

    return matchesSearch && matchesFilter;
  });

  const handleMakeAdmin = (user) => {
    if (confirm(`Make ${user.name} a Community Admin?`)) {
      alert(`${user.name} is now a Community Admin!`);
    }
  };

  const handleSuspend = (user) => {
    if (confirm(`Suspend ${user.name}'s account?`)) {
      alert(`${user.name}'s account has been suspended.`);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-500">person</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'community', label: 'Community' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.role === 'admin' ? 'Community Admin' : 'User'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'joinedAt', label: 'Joined' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.role !== 'admin' && row.status === 'verified' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMakeAdmin(row);
              }}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Make Admin"
            >
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            </button>
          )}
          {row.status !== 'suspended' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSuspend(row);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Suspend User"
            >
              <span className="material-symbols-outlined text-xl">block</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <SuperAdminLayout title="Users Management">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'verified').length}
          </p>
          <p className="text-sm text-gray-500">Verified</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'admin').length}
          </p>
          <p className="text-sm text-gray-500">Community Admins</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.status === 'suspended').length}
          </p>
          <p className="text-sm text-gray-500">Suspended</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or community..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'verified', 'pending', 'suspended', 'admin'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'admin' ? 'Admins' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyMessage="No users found matching your criteria"
      />
    </SuperAdminLayout>
  );
}
