import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '../components/ui/HomeNavbar';
import { getCommunityMembers } from '../services/communityService';

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
    const [codeCopied, setCodeCopied] = useState(false);

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
                <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-8 text-white shadow-xl mb-8 overflow-hidden">
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
                                        {community.role === 'admin' && (
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

                        {/* Members preview */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-charcoal">Members</h2>
                                <button
                                    onClick={() => navigate('/my-communities')}
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    View All
                                </button>
                            </div>

                            {membersLoading ? (
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
                                    { icon: 'workspace_premium', label: 'Your Role',        value: community.role === 'admin' ? 'Admin' : 'Member' },
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

                        {/* Invite Code card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-xs font-bold text-charcoal mb-1 uppercase tracking-wider">Invite Code</h3>
                            <p className="text-xs text-muted-green mb-4">Share with people you want to invite</p>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 font-mono text-xl font-bold text-charcoal tracking-widest bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
                                    {community.code}
                                </code>
                                <button
                                    onClick={handleCopyCode}
                                    title="Copy invite code"
                                    className={[
                                        'flex items-center justify-center w-11 h-11 rounded-xl transition-all shrink-0',
                                        codeCopied
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 hover:bg-primary/10 text-muted-green hover:text-primary',
                                    ].join(' ')}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {codeCopied ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
