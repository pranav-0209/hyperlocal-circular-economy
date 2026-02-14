import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import DataTable from '../../components/superadmin/DataTable';
import { getAllUsers } from '../../services/authService';

/**
 * SuperAdminUsers Page (/superadmin/users)
 * List of verified users who have completed the verification process
 * Only shows users with currentStep = COMPLETE
 */
export default function SuperAdminUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    admins: 0,
    suspended: 0,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (pagination.pageNumber !== 0) {
        setPagination((prev) => ({ ...prev, pageNumber: 0 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['verified-users', pagination.pageNumber, debouncedSearch],
    queryFn: async () => {
      const params = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
        currentStep: 'COMPLETE',
        verificationStatus: 'VERIFIED',
      };

      if (debouncedSearch.trim()) {
        params.name = debouncedSearch.trim();
      }

      const response = await getAllUsers(params);
      console.log('Verified Users response:', response);
      return response;
    },
    onSuccess: (response) => {
      setPagination({
        pageNumber: response.page,
        pageSize: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    },
  });

  // Process data
  const users = data?.content.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    community: user.community || 'Not Assigned',
    role: user.role === 'ROLE_ADMIN' ? 'Community Admin' : 'User',
    joinedAt: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    verifiedAt: new Date(user.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  })) || [];

  // Calculate stats directly from data (not from users to avoid infinite loop)
  useEffect(() => {
    if (data) {
      const adminCount = data.content.filter((u) => u.role === 'ROLE_ADMIN').length;
      setStats({
        total: data.totalElements,
        verified: data.totalElements,
        admins: adminCount,
        suspended: 0,
      });
    }
  }, [data]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <SuperAdminLayout title="Users Management">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-red-600">error</span>
          <p className="text-red-800 mt-2">Failed to load users</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

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
          row.role === 'Community Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {row.role}
        </span>
      ),
    },
    { key: 'joinedAt', label: 'Joined' },
    { key: 'verifiedAt', label: 'Verified On' },
  ];

  return (
    <SuperAdminLayout title="Users Management">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">verified_user</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{pagination.totalElements}</p>
              <p className="text-sm text-green-600">Verified Users</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">admin_panel_settings</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{stats.admins}</p>
              <p className="text-sm text-purple-600">Community Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">groups</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{pagination.totalElements - stats.admins}</p>
              <p className="text-sm text-blue-600">Regular Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
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

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          📋 Showing only users who have completed verification successfully
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="text-gray-500 mt-4">Loading users...</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            emptyMessage="🎉 No verified users yet. They will appear here once you approve their verification requests."
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-600">
                Showing {pagination.pageNumber * pagination.pageSize + 1} to{' '}
                {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
                {pagination.totalElements} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.pageNumber === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-gray-600">
                    Page {pagination.pageNumber + 1} of {pagination.totalPages}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.pageNumber >= pagination.totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </SuperAdminLayout>
  );
}
