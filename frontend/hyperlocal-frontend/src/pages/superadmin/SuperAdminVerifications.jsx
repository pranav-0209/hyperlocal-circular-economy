import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import DataTable from '../../components/superadmin/DataTable';
import { getAllUsers } from '../../services/authService';

/**
 * SuperAdminVerifications Page (/superadmin/verifications)
 * List of users in verification process (not yet completed)
 * Filters by currentStep: PROFILE, DOCUMENT_VERIFICATION, REVIEW
 */
export default function SuperAdminVerifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  // Helper function to get readable currentStep label (must be before use)
  const getCurrentStepLabel = (step) => {
    switch (step) {
      case 'PROFILE':
        return 'Profile Incomplete';
      case 'DOCUMENT_VERIFICATION':
        return 'Documents Pending';
      case 'REVIEW':
        return 'Under Review';
      case 'COMPLETE':
        return 'Completed';
      default:
        return step;
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch verifications with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['verifications', pagination.pageNumber, filter, debouncedSearch],
    queryFn: async () => {
      const params = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        sortBy: 'updatedAt',
        sortDir: 'desc',
      };

      if (debouncedSearch.trim()) {
        params.name = debouncedSearch.trim();
      }

      if (filter === 'profile') {
        params.currentStep = 'PROFILE';
      } else if (filter === 'documents') {
        params.currentStep = 'DOCUMENT_VERIFICATION';
      } else if (filter === 'review') {
        params.currentStep = 'REVIEW';
      }

      const response = await getAllUsers(params);
      console.log('Verifications response:', response);
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
  const verifications = data?.content
    .filter((user) => user.currentStep !== 'COMPLETE')
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      community: user.community || 'Not Assigned',
      currentStep: user.currentStep,
      currentStepLabel: getCurrentStepLabel(user.currentStep),
      submittedAt:
        new Date(user.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) +
        ' at ' +
        new Date(user.updatedAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      profileCompletion: user.profileCompletionPercentage || 0,
    })) || [];

  // Fetch stats separately with React Query
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['verification-stats'],
    queryFn: async () => {
      const [profileRes, documentsRes, reviewRes] = await Promise.all([
        getAllUsers({ currentStep: 'PROFILE', size: 1 }),
        getAllUsers({ currentStep: 'DOCUMENT_VERIFICATION', size: 1 }),
        getAllUsers({ currentStep: 'REVIEW', size: 1 }),
      ]);

      return {
        profile: profileRes.totalElements,
        documents: documentsRes.totalElements,
        review: reviewRes.totalElements,
        total: profileRes.totalElements + documentsRes.totalElements + reviewRes.totalElements,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Derive stats directly from query data (avoids setState in effect)
  const stats = statsData ?? { profile: 0, documents: 0, review: 0, total: 0 };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleRefresh = () => {
    refetch(); // Refetch verification list
    refetchStats(); // Refetch stats badges
  };

  if (error) {
    return (
      <SuperAdminLayout title="Verification Requests">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-red-600">error</span>
          <p className="text-red-800 mt-2">Failed to load verifications</p>
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
    {
      key: 'currentStep',
      label: 'Current Step',
      render: (row) => {
        const colors = {
          PROFILE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          DOCUMENT_VERIFICATION: 'bg-blue-100 text-blue-800 border-blue-200',
          REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[row.currentStep] || 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
          >
            {row.currentStepLabel}
          </span>
        );
      },
    },
    {
      key: 'profileCompletion',
      label: 'Progress',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${row.profileCompletion}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">{row.profileCompletion}%</span>
        </div>
      ),
    },
    { key: 'submittedAt', label: 'Last Activity' },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/superadmin/verifications/${row.id}`);
          }}
          className="text-primary hover:text-primary/80 font-medium text-sm"
        >
          Review →
        </button>
      ),
    },
  ];

  return (
    <SuperAdminLayout title="Verification Requests">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">summarize</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-sm text-blue-700">Total in Queue</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">edit_note</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{stats.profile}</p>
              <p className="text-sm text-yellow-700">Profile Incomplete</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-700">upload_file</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{stats.documents}</p>
              <p className="text-sm text-blue-700">Documents Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">rate_review</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{stats.review}</p>
              <p className="text-sm text-purple-700">Under Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-4 items-center">
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
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Filter by Step:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Steps', icon: 'summarize' },
                { value: 'profile', label: 'Profile', icon: 'edit_note' },
                { value: 'documents', label: 'Documents', icon: 'upload_file' },
                { value: 'review', label: 'Review', icon: 'rate_review' },
              ].map((step) => (
                <button
                  key={step.value}
                  onClick={() => setFilter(step.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === step.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span className="material-symbols-outlined text-base">{step.icon}</span>
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="text-gray-500 mt-4">Loading verification requests...</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={verifications}
            onRowClick={(row) => navigate(`/superadmin/verifications/${row.id}`)}
            emptyMessage="🎉 No users in verification queue. All users have completed verification!"
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-600">
                Showing {pagination.pageNumber * pagination.pageSize + 1} to{' '}
                {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
                {pagination.totalElements} requests
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
