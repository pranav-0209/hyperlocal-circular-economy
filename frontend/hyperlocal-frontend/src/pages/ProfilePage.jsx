import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppFooter from '../components/ui/AppFooter';
import HomeNavbar from '../components/ui/HomeNavbar';
import { ROUTES } from '../constants';
import { getMyProfile, updateMyProfile } from '../services/profileService';

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating = 5 }) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <span className="inline-flex items-center gap-0.5">
            {[...Array(full)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            ))}
            {half && <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>}
        </span>
    );
}

// ── Mock recent activity (placeholder until activity API is available) ─────────
const MOCK_ACTIVITY = [
    { id: 1, type: 'lend', item: 'DeWalt Cordless Drill', to: 'Meera T.', date: '15 Feb 2026', status: 'returned' },
    { id: 2, type: 'borrow', item: 'Nikon DSLR Camera', from: 'Sneha R.', date: '10 Feb 2026', status: 'active' },
    { id: 3, type: 'lend', item: 'Camping Tent (4 Person)', to: 'Vikram N.', date: '2 Feb 2026', status: 'returned' },
    { id: 4, type: 'borrow', item: 'Harry Potter Box Set', from: 'Amit K.', date: '25 Jan 2026', status: 'returned' },
];

const STATUS_STYLE = {
    returned: 'text-green-700 bg-green-50 border-green-100',
    active: 'text-blue-700 bg-blue-50 border-blue-100',
};

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-charcoal">Edit Profile</h2>
                    <button onClick={onClose} className="text-muted-green hover:text-charcoal transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile photo */}
                    <div>
                        <label className="block text-xs font-semibold text-muted-green mb-1.5">Profile Photo</label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-charcoal hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">upload</span>
                                {photoFile ? photoFile.name : 'Choose photo'}
                            </button>
                            {photoFile && (
                                <button type="button" onClick={() => setPhotoFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted-green mb-1.5">Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted-green mb-1.5">Address</label>
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Your neighbourhood / area"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted-green mb-1.5">Bio</label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell your community a little about yourself…"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-charcoal hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('activity');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const name = profile?.name ?? user?.profile?.name ?? 'User';
    const email = profile?.email ?? user?.email ?? '';
    const initials = name.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const photoUrl = profile?.profilePhotoUrl ?? user?.profile?.photo ?? null;

    const rating = profile?.averageRating ?? 0;
    const totalReviews = profile?.totalReviews ?? 0;
    const listingsPosted = profile?.stats?.listingsPosted ?? 0;
    const verified = profile?.verified ?? false;
    const memberSince = profile?.memberSince
        ? new Date(profile.memberSince).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
    const bio = profile?.bio ?? null;
    const address = profile?.address ?? null;

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

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="pt-16 bg-white border-b border-gray-100">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm text-muted-green">
                    <button onClick={() => navigate(ROUTES.DASHBOARD)} className="hover:text-primary transition-colors">Dashboard</button>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-charcoal font-semibold">My Profile</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
            ) : (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── Left: Profile card ─────────────────────── */}
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-4">

                        {/* Main profile card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Cover gradient */}
                            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-50" />

                            <div className="px-5 pb-5">
                                {/* Avatar — overlapping cover */}
                                <div className="-mt-10 mb-3">
                                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white">
                                        {photoUrl ? (
                                            <img src={photoUrl} alt={name} className="w-full h-full rounded-2xl object-cover" />
                                        ) : initials}
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold text-charcoal">{name}</h1>
                                <p className="text-base text-muted-green">{email}</p>

                                {/* Verification badge */}
                                {verified && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                        <span className="material-symbols-outlined text-xs">verified</span>
                                        Verified Member
                                    </span>
                                </div>
                                )}

                                {/* Rating */}
                                {totalReviews > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                    <Stars rating={rating} />
                                    <span className="text-sm font-bold text-charcoal">{rating.toFixed(1)}</span>
                                    <span className="text-xs text-muted-green">({totalReviews} reviews)</span>
                                </div>
                                )}

                                {address && (
                                <p className="text-sm text-muted-green mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    {address}
                                </p>
                                )}

                                {memberSince && (
                                <p className="text-sm text-muted-green mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">calendar_month</span>
                                    Member since {memberSince}
                                </p>
                                )}

                                {bio && (
                                <p className="text-sm text-muted-green mt-3 leading-relaxed border-t border-gray-100 pt-3">{bio}</p>
                                )}

                                {/* Edit profile button */}
                                <button onClick={() => setShowEditModal(true)} className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-charcoal hover:bg-gray-50 transition-colors">
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-green mb-4">Activity Stats</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Items Listed', value: listingsPosted, icon: 'inventory_2' },
                                    { label: 'Borrows', value: 0, icon: 'download' },
                                    { label: 'Lends', value: 0, icon: 'upload' },
                                ].map(s => (
                                    <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                                        <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
                                        <p className="text-xl font-bold text-charcoal mt-1">{s.value}</p>
                                        <p className="text-[10px] text-muted-green leading-tight">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Communities */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-green mb-3">My Communities</h2>
                            <div className="space-y-2">
                                {(profile?.joinedCommunityIds?.length ?? 0) === 0 ? (
                                    <p className="text-sm text-muted-green text-center py-2">No communities yet.</p>
                                ) : (
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary text-base">groups</span>
                                        </div>
                                        <span className="text-sm font-medium text-charcoal">{profile.joinedCommunityIds.length} comm{profile.joinedCommunityIds.length === 1 ? 'unity' : 'unities'} joined</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate(ROUTES.MY_COMMUNITIES)}
                                    className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                >
                                    View all communities
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1">
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

                    {/* ── Right: Activity & reviews ───────────────── */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* Tabs */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                {[
                                    { key: 'activity', label: 'Activity', icon: 'history' },
                                    { key: 'reviews', label: 'Reviews', icon: 'reviews' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-primary border-b-2 border-primary' : 'text-muted-green hover:text-charcoal'}`}
                                    >
                                        <span className="material-symbols-outlined text-base">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Activity Tab */}
                            {activeTab === 'activity' && (
                                <div className="divide-y divide-gray-50">
                                    {MOCK_ACTIVITY.map(act => (
                                        <div key={act.id} className="flex items-center gap-4 px-5 py-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${act.type === 'lend' ? 'bg-primary/10' : 'bg-blue-50'}`}>
                                                <span className={`material-symbols-outlined text-lg ${act.type === 'lend' ? 'text-primary' : 'text-blue-500'}`}>
                                                    {act.type === 'lend' ? 'upload' : 'download'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-charcoal truncate">{act.item}</p>
                                                <p className="text-xs text-muted-green mt-0.5">
                                                    {act.type === 'lend' ? `Lent to ${act.to}` : `Borrowed from ${act.from}`}
                                                    <span className="mx-1.5">·</span>{act.date}
                                                </p>
                                            </div>
                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLE[act.status]}`}>
                                                {act.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="p-5 space-y-4">
                                    {[
                                        { author: 'Meera T.', avatar: 'MT', rating: 5, date: '16 Feb 2026', text: 'Rahul was super cooperative. The drill was in perfect condition and he explained everything carefully. Would borrow again!' },
                                        { author: 'Vikram N.', avatar: 'VN', rating: 5, date: '3 Feb 2026', text: 'Tent was exactly as described. Clean, all parts included. Easy handover. Highly recommended!' },
                                        { author: 'Priya S.', avatar: 'PS', rating: 4, date: '10 Jan 2026', text: 'Good experience overall. Item was clean and returned on time.' },
                                    ].map((r, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">{r.avatar}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-charcoal">{r.author}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <Stars rating={r.rating} />
                                                        <span className="text-xs text-muted-green">{r.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-green leading-relaxed">{r.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Trust & Safety card */}
                        <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5">
                            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary text-lg">shield</span>
                                Your Trust Score
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                                            strokeDasharray={`${(rating / 5) * 100} 100`}
                                            strokeLinecap="round" className="text-primary" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-charcoal">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {[
                                        { label: 'Profile verified', done: verified },
                                        { label: 'Community member', done: (profile?.joinedCommunityIds?.length ?? 0) > 0 },
                                        { label: '5+ successful lends', done: false },
                                        { label: 'Identity document uploaded', done: false },
                                    ].map(t => (
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

                    </div>
                </div>
            </div>
            )}
            <AppFooter />
        </div>
    );
}
