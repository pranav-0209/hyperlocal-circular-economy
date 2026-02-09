import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import StatusBadge from '../../components/superadmin/StatusBadge';
import DataTable from '../../components/superadmin/DataTable';

/**
 * SuperAdminVerifications Page (/superadmin/verifications)
 * List of all pending verification requests
 */
export default function SuperAdminVerifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('pending');

  // Mock data - In real app, fetch from backend
  const verifications = [
    {
      id: 1,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      community: 'Koramangala',
      status: 'pending',
      submittedAt: '2 hours ago',
      documents: 2,
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      email: 'rahul.kumar@email.com',
      phone: '+91 87654 32109',
      community: 'HSR Layout',
      status: 'pending',
      submittedAt: '5 hours ago',
      documents: 2,
    },
    {
      id: 3,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '+91 76543 21098',
      community: 'Indiranagar',
      status: 'pending',
      submittedAt: '1 day ago',
      documents: 3,
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 65432 10987',
      community: 'Whitefield',
      status: 'verified',
      submittedAt: '2 days ago',
      documents: 2,
    },
    {
      id: 5,
      name: 'Kavya Nair',
      email: 'kavya.nair@email.com',
      phone: '+91 54321 09876',
      community: 'JP Nagar',
      status: 'rejected',
      submittedAt: '3 days ago',
      documents: 1,
    },
  ];

  const filteredVerifications = verifications.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

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
      key: 'documents',
      label: 'Documents',
      render: (row) => (
        <span className="text-gray-600">{row.documents} files</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'submittedAt', label: 'Submitted' },
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

  const pendingCount = verifications.filter((v) => v.status === 'pending').length;

  return (
    <SuperAdminLayout title="Verification Requests">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">pending</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-sm text-yellow-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">
                {verifications.filter((v) => v.status === 'verified').length}
              </p>
              <p className="text-sm text-green-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600">cancel</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {verifications.filter((v) => v.status === 'rejected').length}
              </p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Filter by:</span>
          <div className="flex gap-2">
            {['all', 'pending', 'verified', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredVerifications}
        onRowClick={(row) => navigate(`/superadmin/verifications/${row.id}`)}
        emptyMessage="No verification requests found"
      />
    </SuperAdminLayout>
  );
}
