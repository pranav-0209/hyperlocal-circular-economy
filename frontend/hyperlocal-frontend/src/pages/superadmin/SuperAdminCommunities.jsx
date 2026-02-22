import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import DataTable from '../../components/superadmin/DataTable';
import {
  getAdminCommunities,
  getAdminCommunityById,
  updateCommunityStatus,
  deleteAdminCommunity,
  getAdminCommunityMembers,
} from '../../services/adminCommunityService';

const CATEGORY_LABELS = {
  NEIGHBOURHOOD: 'Neighbourhood',
  SOCIETY: 'Society / Apartment',
  COLLEGE: 'College / Campus',
  OFFICE: 'Office / Workplace',
  INTEREST_GROUP: 'Interest Group',
  OTHER: 'Other',
};

/**
 * SuperAdminCommunities Page (/superadmin/communities)
 * Full management of communities using live backend endpoints.
 */
export default function SuperAdminCommunities() {
  const queryClient = useQueryClient();

  // ── List state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });

  // ── Detail drawer state ─────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null);
  const [detailMembersPage, setDetailMembersPage] = useState(0);

  // ── Delete confirmation state ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((p) => ({ ...p, pageNumber: 0 }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: listData, isLoading, error, refetch } = useQuery({
    queryKey: ['adminCommunities', pagination.pageNumber, statusFilter, debouncedSearch],
    queryFn: async () => {
      const res = await getAdminCommunities({
        page: pagination.pageNumber,
        size: pagination.pageSize,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });
      console.log('[Communities] GET /api/v1/admin/communities (list):', res);
      return res;
    },
    onSuccess: (res) => {
      setPagination((p) => ({ ...p, totalElements: res.totalElements, totalPages: res.totalPages }));
    },
  });

  const { data: activeData } = useQuery({
    queryKey: ['adminCommunities-active'],
    queryFn: async () => {
      const res = await getAdminCommunities({ status: 'ACTIVE', size: 1 });
      console.log('[Communities] GET /api/v1/admin/communities?status=ACTIVE (count):', res?.totalElements);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
  const { data: inactiveData } = useQuery({
    queryKey: ['adminCommunities-inactive'],
    queryFn: async () => {
      const res = await getAdminCommunities({ status: 'INACTIVE', size: 1 });
      console.log('[Communities] GET /api/v1/admin/communities?status=INACTIVE (count):', res?.totalElements);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
  const { data: allData } = useQuery({
    queryKey: ['adminCommunities-all-count'],
    queryFn: async () => {
      const res = await getAdminCommunities({ size: 1 });
      console.log('[Communities] GET /api/v1/admin/communities (total count):', res?.totalElements);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['adminCommunityDetail', selectedId],
    queryFn: async () => {
      const res = await getAdminCommunityById(selectedId);
      console.log(`[Communities] GET /api/v1/admin/communities/${selectedId} (detail):`, res);
      return res;
    },
    enabled: !!selectedId,
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['adminCommunityMembers', selectedId, detailMembersPage],
    queryFn: async () => {
      const res = await getAdminCommunityMembers(selectedId, detailMembersPage, 10);
      console.log(`[Communities] GET /api/v1/admin/communities/${selectedId}/members (page ${detailMembersPage}):`, res);
      return res;
    },
    enabled: !!selectedId,
  });

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidateCommunities = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCommunities'] });
    queryClient.invalidateQueries({ queryKey: ['adminCommunities-active'] });
    queryClient.invalidateQueries({ queryKey: ['adminCommunities-inactive'] });
    queryClient.invalidateQueries({ queryKey: ['adminCommunities-all-count'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateCommunityStatus(id, status),
    onSuccess: (res, { id, status }) => {
      console.log(`[Communities] PATCH /api/v1/admin/communities/${id}/status → ${status}:`, res);
      invalidateCommunities();
      if (selectedId) queryClient.invalidateQueries({ queryKey: ['adminCommunityDetail', selectedId] });
    },
    onError: (err, { id, status }) => {
      console.error(`[Communities] PATCH /api/v1/admin/communities/${id}/status → ${status} FAILED:`, err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminCommunity(id),
    onSuccess: (res, id) => {
      console.log(`[Communities] DELETE /api/v1/admin/communities/${id}:`, res);
      invalidateCommunities();
      if (selectedId === String(deleteTarget?.id)) setSelectedId(null);
      setDeleteTarget(null);
    },
    onError: (err, id) => {
      console.error(`[Communities] DELETE /api/v1/admin/communities/${id} FAILED:`, err);
    },
  });

  // ── Derived data ─────────────────────────────────────────────────────────

  const communities = listData?.content ?? [];
  const totalAll = allData?.totalElements ?? 0;
  const totalActive = activeData?.totalElements ?? 0;
  const totalInactive = inactiveData?.totalElements ?? 0;

  const handleToggleStatus = (e, row) => {
    e.stopPropagation();
    statusMutation.mutate({ id: row.id, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'name',
      label: 'Community',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">location_city</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-400 font-mono">{row.code || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="text-sm text-gray-600">{CATEGORY_LABELS[row.category] || row.category || '—'}</span>
      ),
    },
    {
      key: 'memberCount',
      label: 'Members',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-gray-400 text-lg">group</span>
          <span className="text-gray-700 font-medium">{row.memberCount ?? 0}</span>
        </div>
      ),
    },
    {
      key: 'admins',
      label: 'Admins',
      render: (row) => {
        // API may return admins as string[], object[], or null
        const raw = row.admins ?? row.adminNames ?? row.communityAdmins ?? [];
        const admins = Array.isArray(raw)
          ? raw.map((a) => (typeof a === 'string' ? a : (a?.name ?? a?.email ?? JSON.stringify(a))))
          : [];
        if (admins.length === 0) {
          return (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedId(String(row.id)); setDetailMembersPage(0); }}
              className="text-xs text-gray-400 hover:text-primary italic transition-colors"
            >
              View details
            </button>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {admins.slice(0, 2).map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>person</span>
                {a}
              </span>
            ))}
            {admins.length > 2 && (
              <span className="text-xs text-gray-400">+{admins.length - 2} more</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
          row.status === 'ACTIVE'
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
          {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleToggleStatus(e, row)}
            disabled={statusMutation.isPending}
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            className={`p-2 rounded-lg transition-colors ${
              row.status === 'ACTIVE'
                ? 'text-green-600 hover:bg-orange-50 hover:text-orange-600'
                : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {row.status === 'ACTIVE' ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: row.id, name: row.name }); }}
            title="Delete"
            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SuperAdminLayout title="Communities">

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600">location_city</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{totalAll}</p>
              <p className="text-sm text-blue-700">Total Communities</p>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{totalActive}</p>
              <p className="text-sm text-green-700">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-gray-500">cancel</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{totalInactive}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {[{ label: 'All', value: '' }, { label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }].map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPagination((p) => ({ ...p, pageNumber: 0 })); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-red-800 text-sm">
            Failed to load communities.{' '}
            <button onClick={() => refetch()} className="underline">Retry</button>
          </p>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="text-gray-500 mt-4">Loading communities...</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={communities}
            onRowClick={(row) => { setSelectedId(String(row.id)); setDetailMembersPage(0); }}
            emptyMessage="No communities found"
          />
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">
                Showing {pagination.pageNumber * pagination.pageSize + 1}–
                {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)} of {pagination.totalElements}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                  disabled={pagination.pageNumber === 0}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >Previous</button>
                <span className="px-3 py-1.5 text-sm text-gray-600">{pagination.pageNumber + 1} / {pagination.totalPages}</span>
                <button
                  onClick={() => setPagination((p) => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                  disabled={pagination.pageNumber >= pagination.totalPages - 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Community Detail Drawer ──────────────────────────────────────── */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedId(null)} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Community Detail</h2>
              <button onClick={() => setSelectedId(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
              </div>
            ) : detailData ? (
              <div className="flex-1 px-6 py-5 space-y-6">
                {/* Info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl">location_city</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">{detailData.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        detailData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>{detailData.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{CATEGORY_LABELS[detailData.category] || detailData.category}</p>
                    {detailData.description && <p className="text-sm text-gray-600 mt-2">{detailData.description}</p>}
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Invite Code', value: <span className="font-mono font-bold">{detailData.code || '—'}</span> },
                    { label: 'Members', value: detailData.memberCount ?? 0 },
                    { label: 'Created', value: detailData.createdAt ? new Date(detailData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
                    { label: 'Last Updated', value: detailData.updatedAt ? new Date(detailData.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="text-sm text-gray-800 mt-1">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Admins */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Community Admins</h4>
                  {detailData.admins?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detailData.admins.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No admins assigned</p>
                  )}
                </div>

                <div className="border-t border-gray-100" />

                {/* Members list */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Members
                    {membersData && <span className="ml-2 text-xs text-gray-400 font-normal">({membersData.totalElements} total)</span>}
                  </h4>
                  {membersLoading ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                    </div>
                  ) : membersData?.content?.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {membersData.content.map((m) => (
                          <div key={m.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            {/* Always render initials as base; img overlays and hides on error */}
                            <div className="relative w-9 h-9 shrink-0">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center absolute inset-0">
                                <span className="text-primary font-bold text-sm">{(m.name || '?').charAt(0).toUpperCase()}</span>
                              </div>
                              {m.profilePhotoUrl && (
                                <img
                                  src={m.profilePhotoUrl}
                                  alt={m.name}
                                  className="w-9 h-9 rounded-full object-cover absolute inset-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                              <p className="text-xs text-gray-400 truncate">{m.email}</p>
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                              {m.role === 'ADMIN' && (
                                <span className="block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Admin</span>
                              )}
                              <p className="text-xs text-gray-400">
                                {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {membersData.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-3">
                          <button onClick={() => setDetailMembersPage((p) => Math.max(0, p - 1))} disabled={detailMembersPage === 0} className="text-sm text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                          <span className="text-xs text-gray-400">Page {detailMembersPage + 1} of {membersData.totalPages}</span>
                          <button onClick={() => setDetailMembersPage((p) => p + 1)} disabled={detailMembersPage >= membersData.totalPages - 1} className="text-sm text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No members yet</p>
                  )}
                </div>

                {/* Drawer actions */}
                <div className="border-t border-gray-100 pt-4 flex gap-3">
                  <button
                    onClick={() => statusMutation.mutate({ id: detailData.id, status: detailData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                    disabled={statusMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      detailData.status === 'ACTIVE'
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{detailData.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}</span>
                    {detailData.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setDeleteTarget({ id: detailData.id, name: detailData.name }); setSelectedId(null); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-20">
                <p className="text-gray-400">Failed to load community details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ─────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-red-600">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Community?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Permanently delete <strong className="text-gray-900">"{deleteTarget.name}"</strong>? This cannot be undone.
              </p>
              {deleteMutation.isError && <p className="text-sm text-red-600 mb-4">Failed to delete. Please try again.</p>}
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm disabled:opacity-60">
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </SuperAdminLayout>
  );
}

