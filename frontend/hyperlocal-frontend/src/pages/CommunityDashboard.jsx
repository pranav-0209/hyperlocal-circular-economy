import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeNavbar from '../components/ui/HomeNavbar';
import ConfirmModal from '../components/ui/ConfirmModal';
import { getCommunityMembers } from '../services/communityService';
import {
    useCommunityMembers,
    usePendingJoinRequests,
    useApproveJoinRequest,
    useRejectJoinRequest,
    useRemoveMember,
    useUpdateCommunity,
    useUpdateJoinPolicy,
    useUpdateCommunityStatus,
} from '../hooks/useCommunityMutations';
import { updateCommunitySchema, COMMUNITY_CATEGORIES } from '../schemas/communitySchemas';

// ─── helpers ─────────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 4;

// Deterministic color palette — same name always gets the same color
const AVATAR_COLORS = [
    { bg: 'bg-violet-100',  text: 'text-violet-700' },
    { bg: 'bg-sky-100',     text: 'text-sky-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-amber-100',   text: 'text-amber-600' },
    { bg: 'bg-rose-100',    text: 'text-rose-600' },
    { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
    { bg: 'bg-teal-100',    text: 'text-teal-700' },
    { bg: 'bg-orange-100',  text: 'text-orange-600' },
];

function colorFor(name = '') {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Avatar — photo if available and loads successfully, otherwise a deterministically colored initial */
function MemberAvatar({ name = '', photoUrl, size = 'md' }) {
    const [imgError, setImgError] = useState(false);
    const color   = colorFor(name);
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    const dim     = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

    if (photoUrl && !imgError) {
        return (
            <img src={photoUrl} alt={name}
                onError={() => setImgError(true)}
                className={`${dim} rounded-full object-cover shrink-0`} />
        );
    }
    return (
        <div className={`${dim} ${color.bg} ${color.text} rounded-full flex items-center justify-center font-bold shrink-0`}>
            {initial}
        </div>
    );
}

const CATEGORY_LABELS = {
    NEIGHBOURHOOD:  'Neighbourhood',
    SOCIETY:        'Society / Apartment',
    COLLEGE:        'College / Campus',
    OFFICE:         'Office / Workplace',
    INTEREST_GROUP: 'Interest Group',
    OTHER:          'Other',
};

/**
 * CommunityDashboard Component
 * Displays a specific community's dashboard with activity, items, members and stats
 */
export default function CommunityDashboard({ community }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [codeCopied, setCodeCopied] = useState(false);
    // Which admin panel is open: null | 'join-requests' | 'edit'
    const [activePanel, setActivePanel] = useState(null);
    const togglePanel = (panel) => setActivePanel(p => p === panel ? null : panel);
    // Confirm modal state
    const [confirm, setConfirm] = useState({ open: false, title: '', message: '', confirmLabel: '', confirmClass: '', onConfirm: null });
    const openConfirm = (opts) => setConfirm({ open: true, ...opts });
    const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

    // ── Admin query + mutation hooks (only active when community.isAdmin) ──
    const { data: pendingRequests = [], isLoading: requestsLoading } =
        usePendingJoinRequests(community?.isAdmin ? community.id : null);
    const approveMutation = useApproveJoinRequest(community?.id);
    const rejectMutation  = useRejectJoinRequest(community?.id);

    const { data: membersPage, isLoading: allMembersLoading } =
        useCommunityMembers(community?.isAdmin ? community?.id : null, 0, 50);
    const allMembers = membersPage?.content || [];
    const removeMutation = useRemoveMember(community?.id);

    const updateMutation  = useUpdateCommunity(community?.id);
    const policyMutation  = useUpdateJoinPolicy(community?.id);
    const statusMutation  = useUpdateCommunityStatus(community?.id);

    // Edit form (pre-filled with current community data)
    const editForm = useForm({
        resolver: zodResolver(updateCommunitySchema),
        defaultValues: {
            name: community?.name || '',
            description: community?.description || '',
            category: community?.category || '',
        },
    });

    const handleEditSubmit = (data) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['communities'] });
                setActivePanel(null);
            },
        });
    };

    const handleTogglePolicy = () => {
        const next = community.joinPolicy === 'OPEN' ? 'APPROVAL_REQUIRED' : 'OPEN';
        const label = next === 'APPROVAL_REQUIRED' ? 'Approval Required' : 'Open';
        openConfirm({
            title: 'Change Join Policy?',
            message: `This will switch the join policy to "${label}". Members currently waiting for approval will not be affected.`,
            confirmLabel: 'Yes, Change',
            confirmClass: 'bg-cyan-700 text-white hover:bg-cyan-800',
            onConfirm: () => {
                policyMutation.mutate(next, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['communities'] });
                        closeConfirm();
                    },
                });
            },
        });
    };

    const handleToggleStatus = () => {
        const next = community.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const isDeactivating = next === 'INACTIVE';
        openConfirm({
            title: isDeactivating ? 'Deactivate Community?' : 'Activate Community?',
            message: isDeactivating
                ? 'Members will no longer be able to access or interact with this community until it is reactivated.'
                : 'This will make the community visible and accessible to all members again.',
            confirmLabel: isDeactivating ? 'Yes, Deactivate' : 'Yes, Activate',
            confirmClass: isDeactivating ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700',
            onConfirm: () => {
                statusMutation.mutate(next, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['communities'] });
                        closeConfirm();
                    },
                });
            },
        });
    };

    const { data: membersData, isLoading: membersLoading } = useQuery({
        queryKey: ['communityMembers', community?.id, 'preview'],
        queryFn: () => getCommunityMembers(community.id, 0, PREVIEW_COUNT),
        enabled: !!community?.id,
        staleTime: 30_000,
    });
    const previewMembers = membersData?.content || [];
    const totalMembers   = membersData?.totalElements ?? community?.memberCount ?? 0;
    const hasMore        = totalMembers > PREVIEW_COUNT;

    if (!community) return <div>Loading...</div>;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(community.code).then(() => {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2500);
        });
    };

    const categoryLabel = CATEGORY_LABELS[community.category] || community.category || '';

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Back link */}
                <button
                    onClick={() => navigate('/my-communities')}
                    className="flex items-center gap-1.5 text-muted-green hover:text-primary mt-4 mb-5 transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    My Communities
                </button>

                {/* ── Hero Header ─────────────────────────────────────── */}
                <div className={`relative rounded-3xl p-8 text-white shadow-xl mb-8 overflow-hidden ${
                    community.isAdmin
                        ? 'bg-gradient-to-br from-cyan-800 via-cyan-700 to-cyan-600'
                        : 'bg-gradient-to-br from-primary via-primary to-primary/80'
                }`}>
                    {/* decorative dot pattern */}
                    <div className="absolute inset-0 opacity-10"
                         style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                    <span className="material-symbols-outlined text-4xl">groups</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h1 className="text-2xl sm:text-3xl font-bold">{community.name}</h1>
                                        {community.isAdmin && (
                                            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold tracking-wide">ADMIN</span>
                                        )}
                                    </div>
                                    {categoryLabel && (
                                        <span className="inline-block px-2.5 py-0.5 bg-white/15 rounded-full text-xs font-medium mb-2">
                                            {categoryLabel}
                                        </span>
                                    )}
                                    {community.description && (
                                        <p className="text-white/75 text-sm max-w-md leading-relaxed">{community.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Stat pills */}
                            <div className="flex sm:flex-col gap-3 shrink-0">
                                <div className="flex items-center gap-2.5 bg-white/15 rounded-xl px-4 py-2.5 border border-white/10">
                                    <span className="material-symbols-outlined text-lg">group</span>
                                    <div>
                                        <p className="text-xs text-white/70 leading-none">Members</p>
                                        <p className="font-bold text-lg leading-tight">{community.memberCount ?? '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 bg-white/15 rounded-xl px-4 py-2.5 border border-white/10">
                                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                                    <div>
                                        <p className="text-xs text-white/70 leading-none">Active Items</p>
                                        <p className="font-bold text-lg leading-tight">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invite code row */}
                        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div>
                                <p className="text-xs text-white/60 mb-1 uppercase tracking-wider font-medium">Invite Code</p>
                                <code className="font-mono font-bold text-xl tracking-widest">{community.code}</code>
                            </div>
                            <button
                                onClick={handleCopyCode}
                                className={[
                                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                                    codeCopied
                                        ? 'bg-white text-primary'
                                        : 'bg-white/20 hover:bg-white/30 text-white border border-white/20',
                                ].join(' ')}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {codeCopied ? 'check' : 'content_copy'}
                                </span>
                                {codeCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Admin Controls Panel ───────────────────────────── */}
                {community.isAdmin && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 bg-cyan-700 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">admin_panel_settings</span>
                            </div>
                            <h2 className="text-base font-bold text-charcoal">Admin Controls</h2>
                            <span className="ml-auto text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-0.5 rounded-full">
                                Admin Only
                            </span>
                        </div>

                        {/* Action cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Join Requests */}
                            <button
                                onClick={() => togglePanel('join-requests')}
                                className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all text-left ${activePanel === 'join-requests' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-100'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-amber-600 text-xl">how_to_reg</span>
                                    </div>
                                    {!requestsLoading && (
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                            {pendingRequests.length} pending
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-charcoal text-sm">Join Requests</p>
                                    <p className="text-xs text-muted-green mt-0.5">Approve or reject requests</p>
                                </div>
                            </button>

                            {/* Edit Community */}
                            <button
                                onClick={() => togglePanel('edit')}
                                className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all text-left ${activePanel === 'edit' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'}`}
                            >
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">edit</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-charcoal text-sm">Edit Details</p>
                                    <p className="text-xs text-muted-green mt-0.5">Update name, desc &amp; category</p>
                                </div>
                            </button>

                            {/* Join Policy toggle */}
                            <button
                                onClick={handleTogglePolicy}
                                disabled={policyMutation.isPending}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all text-left disabled:opacity-60"
                            >
                                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-cyan-600 text-xl">
                                        {community.joinPolicy === 'OPEN' ? 'public' : 'lock'}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-charcoal text-sm">Join Policy</p>
                                    <p className="text-xs text-muted-green mt-0.5">
                                        Now: <span className="font-semibold text-charcoal">{community.joinPolicy === 'APPROVAL_REQUIRED' ? 'Approval Required' : 'Open'}</span>
                                    </p>
                                </div>
                            </button>

                            {/* Community Status toggle */}
                            <button
                                onClick={handleToggleStatus}
                                disabled={statusMutation.isPending}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all text-left disabled:opacity-60"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${community.status === 'ACTIVE' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <span className={`material-symbols-outlined text-xl ${community.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                                        {community.status === 'ACTIVE' ? 'toggle_on' : 'toggle_off'}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-charcoal text-sm">Community Status</p>
                                    <p className="text-xs text-muted-green mt-0.5">
                                        Now: <span className={`font-semibold ${community.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>{community.status || 'Active'}</span>
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Panel: Join Requests */}
                        {activePanel === 'join-requests' && (
                            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-4">
                                <h3 className="font-bold text-charcoal text-sm mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-600 text-base">how_to_reg</span>
                                    Pending Join Requests
                                </h3>
                                {requestsLoading ? (
                                    <div className="text-center py-8 text-muted-green text-sm">Loading…</div>
                                ) : pendingRequests.length === 0 ? (
                                    <div className="text-center py-8 text-muted-green text-sm">No pending requests.</div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {pendingRequests.map((req) => (
                                            <li key={req.membershipId} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <MemberAvatar name={req.name} photoUrl={req.profilePhotoUrl} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-charcoal text-sm">{req.name || `User #${req.userId}`}</p>
                                                        <p className="text-xs text-muted-green">{req.email || ''}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() => approveMutation.mutate(req.membershipId)}
                                                        disabled={approveMutation.isPending}
                                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectMutation.mutate(req.membershipId)}
                                                        disabled={rejectMutation.isPending}
                                                        className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-60"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Panel: Edit Details */}
                        {activePanel === 'edit' && (
                            <div className="bg-white rounded-2xl border border-primary/20 shadow-sm p-6 mb-4">
                                <h3 className="font-bold text-charcoal text-sm mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-base">edit</span>
                                    Edit Community Details
                                </h3>
                                <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-charcoal mb-1">Name</label>
                                        <input
                                            {...editForm.register('name')}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        {editForm.formState.errors.name && (
                                            <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.name.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-charcoal mb-1">Description</label>
                                        <textarea
                                            {...editForm.register('description')}
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        />
                                        {editForm.formState.errors.description && (
                                            <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.description.message}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={updateMutation.isPending}
                                            className="px-5 py-2 bg-primary text-white text-sm rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                                        >
                                            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePanel(null)}
                                            className="px-5 py-2 bg-gray-100 text-charcoal text-sm rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Main grid ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-charcoal">Recent Activity</h2>
                                <span className="text-xs text-muted-green bg-gray-100 px-2.5 py-1 rounded-full">Live</span>
                            </div>
                            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-400 text-3xl">feed</span>
                                </div>
                                <p className="font-medium text-charcoal text-sm">No activity yet</p>
                                <p className="text-xs text-muted-green max-w-xs">
                                    When members share, borrow or comment, it will appear here.
                                </p>
                            </div>
                        </div>

                        {/* Available Items */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-charcoal">Available Items</h2>
                                <button className="text-sm text-primary hover:underline font-medium">View All</button>
                            </div>
                            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
                                </div>
                                <p className="font-medium text-charcoal text-sm">Nothing to borrow yet</p>
                                <p className="text-xs text-muted-green max-w-xs">
                                    Be the first to list something — tools, books, appliances, anything!
                                </p>
                                <button className="mt-2 px-5 py-2 bg-primary text-white text-sm rounded-xl font-semibold hover:brightness-110 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">add_circle</span>
                                    List an Item
                                </button>
                            </div>
                        </div>

                        {/* Members preview / management */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-charcoal">
                                    {community.isAdmin ? 'Member Management' : 'Members'}
                                </h2>
                            </div>

                            {/* Admin: full member list with remove */}
                            {community.isAdmin ? (
                                allMembersLoading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                                    <div className="h-2.5 bg-gray-50 rounded w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : allMembers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                                        <span className="material-symbols-outlined text-gray-300 text-4xl">group_off</span>
                                        <p className="text-sm text-muted-green">No members yet</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {allMembers.map((m) => (
                                            <li key={m.id ?? m.userId} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <MemberAvatar name={m.name} photoUrl={m.profilePhotoUrl} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-charcoal text-sm">{m.name || `User #${m.userId}`}</p>
                                                        <p className="text-xs text-muted-green">{m.email || ''}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                                        m.role === 'ADMIN'
                                                            ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                                                            : 'bg-gray-100 text-charcoal border-gray-200'
                                                    }`}>{m.role}</span>
                                                    {m.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => openConfirm({
                                                                title: 'Remove Member?',
                                                                message: `Remove ${m.name || 'this member'} from the community?`,
                                                                confirmLabel: 'Remove',
                                                                confirmClass: 'bg-red-600 text-white hover:bg-red-700',
                                                                onConfirm: () => {
                                                                    removeMutation.mutate(m.userId, {
                                                                        onSuccess: closeConfirm,
                                                                    });
                                                                },
                                                            })}
                                                            disabled={removeMutation.isPending}
                                                            className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-60"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                /* Non-admin: preview with blur on last */
                                membersLoading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                                    <div className="h-2.5 bg-gray-50 rounded w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : previewMembers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                                        <span className="material-symbols-outlined text-gray-300 text-4xl">group_off</span>
                                        <p className="text-sm text-muted-green">No members yet</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="divide-y divide-gray-50">
                                            {previewMembers.map((member, idx) => {
                                                const isLast = idx === previewMembers.length - 1 && hasMore;
                                                return (
                                                    <div
                                                        key={member.userId ?? idx}
                                                        className={[
                                                            'flex items-center gap-3 py-3 first:pt-0',
                                                            isLast
                                                                ? 'select-none pointer-events-none'
                                                                : 'hover:bg-gray-50/60 px-2 rounded-xl -mx-2 transition-colors',
                                                        ].join(' ')}
                                                        style={isLast ? { filter: 'blur(3.5px)', opacity: 0.5 } : {}}
                                                    >
                                                        <MemberAvatar name={member.name} photoUrl={member.profilePhotoUrl} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-charcoal text-sm truncate">{member.name}</p>
                                                            <p className="text-xs text-muted-green truncate">{member.email}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {(member.role === 'ADMIN' || member.admin) && (
                                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                                    Admin
                                                                </span>
                                                            )}
                                                            {member.joinedAt && (
                                                                <span className="text-xs text-muted-green hidden sm:inline">
                                                                    {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {hasMore && (
                                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent flex items-end justify-center pb-1">
                                                <button
                                                    onClick={() => navigate('/my-communities')}
                                                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                                                >
                                                    See all {totalMembers} members
                                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Right sidebar (1/3) */}
                    <div className="space-y-6">

                        {/* Community Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-xs font-bold text-charcoal mb-4 uppercase tracking-wider">Community Info</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: 'group',             label: 'Members',         value: community.memberCount ?? '—' },
                                    { icon: 'inventory_2',       label: 'Active Items',     value: 0 },
                                    { icon: 'swap_horiz',        label: 'Completed Shares', value: 0 },
                                    { icon: 'workspace_premium', label: 'Your Role',        value: community.isAdmin ? 'Admin' : 'Member' },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-base">{icon}</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-sm text-muted-green">{label}</span>
                                            <span className="text-sm font-bold text-charcoal">{value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Who's here — avatar stack */}
                        {previewMembers.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-xs font-bold text-charcoal mb-4 uppercase tracking-wider">Who's Here</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {previewMembers.map((m) => (
                                        <div key={m.userId} title={m.name}>
                                            <MemberAvatar name={m.name} photoUrl={m.profilePhotoUrl} size="sm" />
                                        </div>
                                    ))}
                                    {hasMore && (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-muted-green">
                                            +{totalMembers - PREVIEW_COUNT}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-primary to-primary/85 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-base">bolt</span>
                                Quick Actions
                            </h3>
                            <div className="space-y-2.5">
                                {[
                                    { icon: 'add_circle', label: 'List an Item' },
                                    { icon: 'search',     label: 'Browse Items' },
                                    { icon: 'share',      label: 'Invite Members' },
                                ].map(({ icon, label }) => (
                                    <button
                                        key={label}
                                        className="w-full py-2.5 px-4 bg-white/15 backdrop-blur-sm hover:bg-white/25 active:bg-white/30 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 border border-white/10"
                                    >
                                        <span className="material-symbols-outlined text-base">{icon}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <ConfirmModal
                open={confirm.open}
                title={confirm.title}
                message={confirm.message}
                confirmLabel={confirm.confirmLabel}
                confirmClass={confirm.confirmClass}
                onConfirm={confirm.onConfirm}
                onCancel={closeConfirm}
                loading={policyMutation.isPending || statusMutation.isPending}
            />
        </div>
    );
}
