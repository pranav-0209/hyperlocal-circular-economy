import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppFooter from '../components/ui/AppFooter';
import HomeNavbar from '../components/ui/HomeNavbar';
import RatingStars from '../components/ui/RatingStars';
import SecureImage from '../components/ui/SecureImage';
import { ROUTES } from '../constants';
import { getMyProfile, updateMyProfile } from '../services/profileService';
import { getMySentRequests, getIncomingRequests, getUserReviews } from '../services/marketplaceService';
import { getTrustTierLabel, normalizeTrustValues } from '../utils/trust';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusStyle(status = '') {
    const s = status.toUpperCase();
    if (s === 'APPROVED') return 'text-green-700 bg-green-50 border-green-200';
    if (s === 'COMPLETED' || s === 'RETURNED') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (s === 'PENDING') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (s === 'REJECTED' || s === 'CANCELLED') return 'text-red-600 bg-red-50 border-red-200';
    if (s === 'ACTIVE' || s === 'ONGOING') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
}

function StatusBadge({ status }) {
    const label = status.charAt(0) + status.slice(1).toLowerCase();
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${statusStyle(status)}`}>
            {label}
        </span>
    );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSaved }) {
    const [form, setForm] = useState({
        phone: profile?.phone ?? '',
        address: profile?.address ?? '',
        bio: profile?.bio ?? '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await updateMyProfile({ ...form, profilePhoto: photoFile });
            onSaved();
        } catch (err) {
            setError(err?.message ?? 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">edit</span>
                        <h2 className="text-lg font-bold text-charcoal">Edit Profile</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-green hover:text-charcoal hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="px-6 py-5">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile photo */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-green mb-1.5 uppercase tracking-wide">Profile Photo</label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-primary/40 rounded-xl text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
                                >
                                    <span className="material-symbols-outlined text-base">upload</span>
                                    {photoFile ? photoFile.name : 'Choose photo'}
                                </button>
                                {photoFile && (
                                    <button type="button" onClick={() => setPhotoFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
                            </div>
                        </div>

                        {[
                            { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210', icon: 'phone' },
                            { name: 'address', label: 'Address', placeholder: 'Your neighbourhood / area', icon: 'location_on' },
                        ].map(({ name, label, placeholder, icon }) => (
                            <div key={name}>
                                <label className="block text-xs font-semibold text-muted-green mb-1.5 uppercase tracking-wide">{label}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">{icon}</span>
                                    <input
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                        className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                        ))}

                        <div>
                            <label className="block text-xs font-semibold text-muted-green mb-1.5 uppercase tracking-wide">Bio</label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tell your community a little about yourself…"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-charcoal hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving ? (
                                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Saving…</>
                                ) : (
                                    <><span className="material-symbols-outlined text-base">save</span> Save Changes</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-gray-400">{icon}</span>
            </div>
            <p className="text-sm font-semibold text-charcoal">{title}</p>
            {subtitle && <p className="text-xs text-muted-green max-w-xs">{subtitle}</p>}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('borrows');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    // Activity data
    const [sentRequests, setSentRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
        } catch {
            // fall back to auth context values silently
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        setActivityLoading(true);
        try {
            const [sent, incoming] = await Promise.all([
                getMySentRequests({ page: 0, size: 10 }).catch(() => []),
                getIncomingRequests({ page: 0, size: 10 }).catch(() => []),
            ]);
            setSentRequests(sent);
            setIncomingRequests(incoming);
        } finally {
            setActivityLoading(false);
        }
    };

    const fetchReviews = async (userId) => {
        if (!userId) return;
        setReviewsLoading(true);
        try {
            const data = await getUserReviews(userId, { page: 0, size: 10 });
            const reviews = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
            setUserReviews(reviews);
        } catch {
            setUserReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchActivity();
    }, []);

    useEffect(() => {
        const userId = profile?.userId ?? user?.id ?? user?.userId;
        if (userId) fetchReviews(userId);
    }, [profile, user]);

    // Derived values
    const name = profile?.name ?? user?.profile?.name ?? 'User';
    const email = profile?.email ?? user?.email ?? '';
    const phone = profile?.phone ?? null;
    const initials = name.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const photoUrl = profile?.profilePhotoUrl ?? user?.profile?.photo ?? null;

    const listingsPosted = profile?.stats?.listingsPosted ?? 0;
    const borrowsCompleted = profile?.stats?.borrowsCompleted ?? sentRequests.filter(r => r.status === 'COMPLETED').length;
    const lendsCompleted = profile?.stats?.lendsCompleted ?? incomingRequests.filter(r => r.status === 'COMPLETED').length;

    const verified = profile?.verified ?? false;
    const { trustIndex, trustXp } = normalizeTrustValues(profile?.trustIndex, profile?.trustXp);
    const trustTier = getTrustTierLabel(trustIndex);
    const memberSince = profile?.memberSince
        ? new Date(profile.memberSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
    const bio = profile?.bio ?? null;
    const address = profile?.address ?? null;

    // Profile completion
    const completionFields = [
        { label: 'Name', done: !!name && name !== 'User' },
        { label: 'Phone', done: !!phone },
        { label: 'Address', done: !!address },
        { label: 'Bio', done: !!bio },
        { label: 'Photo', done: !!photoUrl },
        { label: 'Verified', done: verified },
    ];
    const completionPct = Math.round((completionFields.filter(f => f.done).length / completionFields.length) * 100);

    const tabs = [
        { key: 'borrows', label: 'Borrows', icon: 'download' },
        { key: 'lends', label: 'Lends', icon: 'upload' },
        { key: 'reviews', label: 'Reviews', icon: 'reviews' },
    ];

    // Dynamic borrow list from backend.
    const borrowsForDisplay = sentRequests;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <HomeNavbar />

            {showEditModal && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEditModal(false)}
                    onSaved={() => { setShowEditModal(false); fetchProfile(); }}
                />
            )}

            {/* Breadcrumb */}
            <div className="pt-16 bg-white border-b border-gray-100">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm text-muted-green">
                    <button onClick={() => navigate(ROUTES.DASHBOARD)} className="hover:text-primary transition-colors">Dashboard</button>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-charcoal font-semibold">My Profile</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                        <p className="text-sm text-muted-green">Loading profile…</p>
                    </div>
                </div>
            ) : (
                <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-10">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                        {/* ── Left column ─────────────────────────────── */}
                        <div className="w-full lg:w-72 flex-shrink-0 space-y-4">

                            {/* Main profile card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Cover */}
                                <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-emerald-500 relative">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                </div>

                                <div className="px-5 pb-5">
                                    {/* Avatar */}
                                    <div className="-mt-6 mb-3 flex items-end justify-between relative z-10">
                                        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white overflow-hidden flex-shrink-0">
                                            {photoUrl ? (
                                                <SecureImage source={photoUrl} alt={name} className="w-full h-full object-cover" fallback={initials} />
                                            ) : initials}
                                        </div>
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/5 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Edit
                                        </button>
                                    </div>

                                    <h1 className="text-xl font-bold text-charcoal leading-tight">{name}</h1>
                                    <p className="text-sm text-muted-green mt-0.5">{email}</p>

                                    {/* Badges row */}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {verified ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                                <span className="material-symbols-outlined text-xs">verified</span>
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                <span className="material-symbols-outlined text-xs">pending</span>
                                                Unverified
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-full">
                                            <span className="material-symbols-outlined text-xs">shield</span>
                                            {trustTier}
                                        </span>
                                    </div>

                                    {/* Info rows */}
                                    <div className="mt-3 space-y-1.5">
                                        {phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-green">
                                                <span className="material-symbols-outlined text-base text-gray-400">phone</span>
                                                {phone}
                                            </div>
                                        )}
                                        {address && (
                                            <div className="flex items-center gap-2 text-sm text-muted-green">
                                                <span className="material-symbols-outlined text-base text-gray-400">location_on</span>
                                                {address}
                                            </div>
                                        )}
                                        {memberSince && (
                                            <div className="flex items-center gap-2 text-sm text-muted-green">
                                                <span className="material-symbols-outlined text-base text-gray-400">calendar_month</span>
                                                Member since {memberSince}
                                            </div>
                                        )}
                                    </div>

                                    {bio && (
                                        <p className="text-sm text-muted-green mt-3 leading-relaxed border-t border-gray-100 pt-3 italic">&ldquo;{bio}&rdquo;</p>
                                    )}

                                    {/* Profile completion */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-semibold text-charcoal">Profile completion</span>
                                            <span className="text-xs font-bold text-primary">{completionPct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="bg-primary h-1.5 rounded-full transition-all duration-700"
                                                style={{ width: `${completionPct}%` }}
                                            />
                                        </div>
                                        {completionPct < 100 && (
                                            <p className="text-[10px] text-muted-green mt-1.5">
                                                Missing: {completionFields.filter(f => !f.done).map(f => f.label).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Activity stats */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-green mb-4">Activity Stats</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Listed', value: listingsPosted, icon: 'inventory_2', color: 'text-primary bg-primary/10' },
                                        { label: 'Borrowed', value: borrowsCompleted, icon: 'download', color: 'text-blue-600 bg-blue-50' },
                                        { label: 'Lent', value: lendsCompleted, icon: 'upload', color: 'text-emerald-600 bg-emerald-50' },
                                    ].map(s => (
                                        <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                                            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
                                                <span className="material-symbols-outlined text-base">{s.icon}</span>
                                            </div>
                                            <p className="text-lg font-bold text-charcoal">{s.value}</p>
                                            <p className="text-[10px] text-muted-green leading-tight">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Communities */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-green mb-3">My Communities</h2>
                                {(profile?.joinedCommunityIds?.length ?? 0) === 0 ? (
                                    <p className="text-sm text-muted-green text-center py-2">No communities yet.</p>
                                ) : (
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-white text-base">groups</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-charcoal">{profile.joinedCommunityIds.length}</p>
                                            <p className="text-xs text-muted-green">Communit{profile.joinedCommunityIds.length === 1 ? 'y' : 'ies'} joined</p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate(ROUTES.MY_COMMUNITIES)}
                                    className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                >
                                    View all communities
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>

                            {/* Quick links */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-0.5">
                                {[
                                    { label: 'My Activity', icon: 'timeline', path: ROUTES.MARKETPLACE_ACTIVITY },
                                    { label: 'My Listings', icon: 'sell', path: ROUTES.MY_LISTINGS },
                                    { label: 'Marketplace', icon: 'store', path: ROUTES.DISCOVER },
                                    { label: 'Dashboard', icon: 'dashboard', path: ROUTES.DASHBOARD },
                                ].map(link => (
                                    <button
                                        key={link.label}
                                        onClick={() => navigate(link.path)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <span className="material-symbols-outlined text-muted-green text-lg">{link.icon}</span>
                                        {link.label}
                                        <span className="material-symbols-outlined text-muted-green text-base ml-auto">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Right column ─────────────────────────────── */}
                        <div className="flex-1 min-w-0 space-y-4">

                            {/* Trust Score card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary text-xl">shield</span>
                                    <h2 className="text-base font-bold text-charcoal">Trust Score</h2>
                                </div>
                                <div className="flex items-center gap-5">
                                    {/* Circular progress */}
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                                                strokeDasharray={`${trustIndex} 100`}
                                                strokeLinecap="round"
                                                className="text-primary transition-all duration-700"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-xl font-bold text-charcoal leading-none">{trustIndex}</span>
                                            <span className="text-[10px] text-muted-green">/ 100</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-green">Trust tier</p>
                                            <p className="text-lg font-bold text-charcoal">{trustTier}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-green">Trust XP earned</p>
                                            <p className="text-sm font-bold text-primary">{trustXp} XP</p>
                                        </div>
                                    </div>

                                    {/* Milestones */}
                                    <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                                        {[
                                            { label: 'Profile verified', done: verified },
                                            { label: 'Community member', done: (profile?.joinedCommunityIds?.length ?? 0) > 0 },
                                            { label: 'On-time returns', done: trustIndex >= 70 },
                                            { label: 'Trust XP gained', done: trustXp > 0 },
                                        ].map((t) => (
                                            <div key={t.label} className="flex items-center gap-2 text-xs">
                                                <span className={`material-symbols-outlined text-sm ${t.done ? 'text-green-600' : 'text-gray-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    check_circle
                                                </span>
                                                <span className={t.done ? 'text-charcoal font-medium' : 'text-muted-green'}>{t.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Activity & Reviews Tabs */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Tab bar */}
                                <div className="flex border-b border-gray-100">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-green hover:text-charcoal hover:bg-gray-50'}`}
                                        >
                                            <span className="material-symbols-outlined text-base">{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Borrows Tab (my sent requests) */}
                                {activeTab === 'borrows' && (
                                    activityLoading ? (
                                        <div className="flex items-center justify-center py-14 gap-2 text-muted-green text-sm">
                                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            Loading…
                                        </div>
                                    ) : borrowsForDisplay.length === 0 ? (
                                        <EmptyState
                                            icon="download"
                                            title="No borrow requests yet"
                                            subtitle="Items you request to borrow from the marketplace will appear here."
                                        />
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {borrowsForDisplay.map(req => (
                                                <div key={req.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                        <span className="material-symbols-outlined text-blue-500 text-lg">download</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-charcoal truncate">{req.listingTitle || 'Item'}</p>
                                                        <p className="text-xs text-muted-green mt-0.5">
                                                            From <span className="font-medium">{req.ownerName || 'Owner'}</span>
                                                            {req.startDate && <> &middot; {formatDate(req.startDate)}{req.endDate && ` → ${formatDate(req.endDate)}`}</>}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={req.status} />
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Lends Tab (incoming requests) */}
                                {activeTab === 'lends' && (
                                    activityLoading ? (
                                        <div className="flex items-center justify-center py-14 gap-2 text-muted-green text-sm">
                                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            Loading…
                                        </div>
                                    ) : incomingRequests.length === 0 ? (
                                        <EmptyState
                                            icon="upload"
                                            title="No lending activity yet"
                                            subtitle="When neighbors request to borrow your items, you'll see them here."
                                        />
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {incomingRequests.map(req => (
                                                <div key={req.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="material-symbols-outlined text-primary text-lg">upload</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-charcoal truncate">{req.listingTitle || 'Item'}</p>
                                                        <p className="text-xs text-muted-green mt-0.5">
                                                            To <span className="font-medium">{req.requesterName || 'Borrower'}</span>
                                                            {req.startDate && <> &middot; {formatDate(req.startDate)}{req.endDate && ` → ${formatDate(req.endDate)}`}</>}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={req.status} />
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Reviews Tab */}
                                {activeTab === 'reviews' && (
                                    reviewsLoading ? (
                                        <div className="flex items-center justify-center py-14 gap-2 text-muted-green text-sm">
                                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            Loading…
                                        </div>
                                    ) : userReviews.length === 0 ? (
                                        <EmptyState
                                            icon="reviews"
                                            title="No reviews yet"
                                            subtitle="Reviews from completed borrow exchanges will appear here."
                                        />
                                    ) : (
                                        <div className="p-5 space-y-3">
                                            {userReviews.map((r, i) => {
                                                const reviewerName = r.reviewerName ?? r.reviewer?.name ?? 'Community Member';
                                                const initials2 = reviewerName.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
                                                const rating = r.rating ?? r.score ?? 0;
                                                const comment = r.comment ?? r.text ?? r.review ?? '';
                                                const date = r.createdAt ? formatDate(r.createdAt) : '';
                                                return (
                                                    <div key={r.id ?? i} className="bg-gray-50 rounded-2xl p-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">{initials2}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-charcoal">{reviewerName}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <RatingStars rating={rating} size={12} />
                                                                    {date && <span className="text-xs text-muted-green">{date}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {comment && <p className="text-sm text-muted-green leading-relaxed">{comment}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <AppFooter />
        </div>
    );
}
