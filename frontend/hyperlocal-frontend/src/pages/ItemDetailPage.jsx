import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HomeNavbar from '../components/ui/HomeNavbar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { requestItem } from '../services/marketplaceService';

// ── Condition colour map ──────────────────────────────────────────────────────

const CONDITION_STYLE = {
    'New':      'bg-green-100 text-green-800',
    'Like New': 'bg-emerald-100 text-emerald-800',
    'Good':     'bg-blue-100 text-blue-800',
    'Fair':     'bg-amber-100 text-amber-700',
    'Poor':     'bg-red-100 text-red-700',
};

const CAT_ICON = {
    'Electronics': 'devices', 'Vehicles': 'directions_car', 'Appliances': 'kitchen',
    'Books': 'menu_book', 'Fashion': 'checkroom', 'Tools': 'hardware',
    'Sports': 'sports_soccer', 'Kids': 'child_care', 'Other': 'category',
};

// ── Star rating ───────────────────────────────────────────────────────────────

function Stars({ rating = 5, size = 'sm' }) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const cls = size === 'lg' ? 'text-base' : 'text-sm';
    return (
        <span className="inline-flex items-center gap-0.5">
            {[...Array(full)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-amber-400 ${cls}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            ))}
            {half && <span className={`material-symbols-outlined text-amber-400 ${cls}`} style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>}
        </span>
    );
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function Gallery({ images }) {
    const [active, setActive] = useState(0);
    const imgs = images?.length ? images : ['https://placehold.co/1200x800/e5e7eb/9ca3af?text=No+Photo'];

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <img
                    key={active}
                    src={imgs[active]}
                    alt="Item photo"
                    className="w-full h-full object-cover"
                />
                {/* Nav arrows */}
                {imgs.length > 1 && (
                    <>
                        <button
                            onClick={() => setActive(i => Math.max(0, i - 1))}
                            disabled={active === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl text-charcoal">chevron_left</span>
                        </button>
                        <button
                            onClick={() => setActive(i => Math.min(imgs.length - 1, i + 1))}
                            disabled={active === imgs.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl text-charcoal">chevron_right</span>
                        </button>
                        {/* Counter pill */}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {active + 1} / {imgs.length}
                        </div>
                    </>
                )}
            </div>
            {/* Thumbnails */}
            {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {imgs.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === active ? 'border-primary scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-90'}`}
                        >
                            <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Request panel (right column) ──────────────────────────────────────────────

function RequestPanel({ item }) {
    const navigate = useNavigate();
    const [message, setMessage] = useState("Hi! Is this still available to borrow?");
    const [days, setDays] = useState(1);
    const [isRequesting, setIsRequesting] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const today = new Date().toISOString().split('T')[0];

    // Sync days when both dates chosen
    const handleFromDate = (val) => {
        setFromDate(val);
        if (toDate && val > toDate) setToDate('');
        if (val && toDate) {
            const diff = Math.ceil((new Date(toDate) - new Date(val)) / 86400000);
            if (diff > 0) setDays(diff);
        }
    };
    const handleToDate = (val) => {
        setToDate(val);
        if (val && fromDate) {
            const diff = Math.ceil((new Date(val) - new Date(fromDate)) / 86400000);
            if (diff > 0) setDays(diff);
        }
    };

    const totalCost = (item.price ?? 0) * days;

    const handleRequest = async () => {
        setIsRequesting(true);
        try {
            await requestItem(item.id, message);
            toast.success('Borrow request sent! The owner will get back to you.');
            navigate('/discover');
        } catch {
            toast.error('Failed to send request. Try again.');
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Price callout */}
            <div className="flex items-end gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-4xl font-bold text-charcoal">₹{item.price}</span>
                <span className="text-sm text-muted-green mb-1.5">/ day</span>
                <div className="flex-1" />
                <div className="text-right">
                    <p className="text-xs text-muted-green">Estimated total</p>
                    <p className="text-2xl font-bold text-primary">₹{totalCost}</p>
                    <p className="text-xs text-muted-green">{days} day{days !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Date pickers */}
            <div>
                <label className="text-xs font-bold text-charcoal mb-2 block tracking-wide uppercase">Select dates</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-muted-green mb-1 block">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            min={today}
                            onChange={e => handleFromDate(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary bg-white cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-green mb-1 block">To</label>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || today}
                            onChange={e => handleToDate(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary bg-white cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Manual day stepper */}
            <div>
                <label className="text-xs font-bold text-charcoal mb-2 block tracking-wide uppercase">Or set number of days</label>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setDays(d => Math.max(1, d - 1))}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold text-charcoal text-xl">{days}</span>
                    <button
                        type="button"
                        onClick={() => setDays(d => d + 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                    <span className="text-sm text-muted-green">{days} day{days > 1 ? 's' : ''} · ₹{totalCost} total</span>
                </div>
            </div>

            {/* Message */}
            <div>
                <label className="text-xs font-bold text-charcoal mb-2 block tracking-wide uppercase">Message to owner</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-primary bg-white"
                />
            </div>

            {/* CTA */}
            <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="w-full py-4 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
                {isRequesting ? (
                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Sending…</>
                ) : (
                    <><span className="material-symbols-outlined text-base">handshake</span>Send Borrow Request</>
                )}
            </button>

            {/* Safety note */}
            <p className="text-[11px] text-muted-green text-center leading-relaxed">
                <span className="material-symbols-outlined text-xs align-middle mr-0.5">verified_user</span>
                Always meet in a safe location &middot; Inspect before borrowing &middot; Return on time
            </p>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ItemDetailPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const item = state?.item;

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50">
                <HomeNavbar />
                <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-4xl text-muted-green">search_off</span>
                    </div>
                    <h2 className="text-xl font-bold text-charcoal">Item not found</h2>
                    <p className="text-sm text-muted-green max-w-xs">This item may have been removed or the link is invalid.</p>
                    <button
                        onClick={() => navigate('/discover')}
                        className="mt-2 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    const availWindow = (item.availableFrom && item.availableTo)
        ? `${new Date(item.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(item.availableTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            {/* ── Breadcrumb bar ─────────────────────────────────── */}
            <div className="pt-16 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                    <nav className="flex items-center gap-1.5 text-sm text-muted-green flex-wrap">
                        <button
                            onClick={() => navigate('/discover')}
                            className="hover:text-primary transition-colors font-medium"
                        >
                            Marketplace
                        </button>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <button
                            onClick={() => navigate('/discover')}
                            className="hover:text-primary transition-colors"
                        >
                            {item.category}
                        </button>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-charcoal font-semibold truncate max-w-[220px]">{item.title}</span>
                    </nav>
                </div>
            </div>

            {/* ── Main Content ───────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* ── Left column ──────────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-5">

                        {/* Gallery */}
                        <Gallery images={item.images} />

                        {/* Title block */}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge className="bg-primary/10 text-primary border-0 font-semibold text-xs gap-1 py-1">
                                    <span className="material-symbols-outlined text-sm">{CAT_ICON[item.category] ?? 'category'}</span>
                                    {item.category}
                                </Badge>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONDITION_STYLE[item.condition] ?? 'bg-gray-100 text-gray-700'}`}>
                                    {item.condition}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-muted-green bg-gray-100 px-2.5 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                    Borrow &amp; Return
                                </span>
                                {item.status === 'AVAILABLE' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Available
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Unavailable</span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal leading-tight">{item.title}</h1>
                        </div>

                        {/* Community card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-green mb-0.5">Listed in community</p>
                                <p className="text-sm font-bold text-charcoal truncate">{item.communityName ?? 'Your Community'}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
                                <span className="material-symbols-outlined text-xs">lock</span>
                                Members only
                            </span>
                        </div>

                        {/* About this item */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-base font-bold text-charcoal mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">info</span>
                                About this item
                            </h2>
                            <p className="text-sm text-muted-green leading-relaxed">{item.description}</p>
                        </div>

                        {/* Item details grid */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">list_alt</span>
                                Item details
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { icon: 'sell', label: 'Category', value: item.category },
                                    { icon: 'grade', label: 'Condition', value: item.condition },
                                    { icon: 'payments', label: 'Price / day', value: `₹${item.price}` },
                                    { icon: 'swap_horiz', label: 'Type', value: 'Borrow & Lend' },
                                ].map(d => (
                                    <div key={d.label} className="bg-gray-50 rounded-xl p-3.5 flex flex-col gap-1">
                                        <span className="material-symbols-outlined text-muted-green text-xl">{d.icon}</span>
                                        <p className="text-[10px] text-muted-green font-medium uppercase tracking-wide">{d.label}</p>
                                        <p className="text-sm font-semibold text-charcoal">{d.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability window (if set) */}
                        {availWindow && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-base font-bold text-charcoal mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">event_available</span>
                                    Availability window
                                </h2>
                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <span className="material-symbols-outlined text-primary text-2xl">date_range</span>
                                    <div>
                                        <p className="text-sm font-semibold text-charcoal">{availWindow}</p>
                                        <p className="text-xs text-muted-green mt-0.5">Owner has marked the item available during this period</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Owner card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">person</span>
                                About the owner
                            </h2>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                                    <AvatarImage src={item.owner?.avatarUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                        {item.owner?.avatar ?? 'US'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-charcoal text-base">{item.owner?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <Stars rating={item.owner?.rating ?? 4.5} size="lg" />
                                        <span className="text-sm font-semibold text-charcoal">{item.owner?.rating ?? '4.5'}</span>
                                        <span className="text-xs text-muted-green">·</span>
                                        <span className="text-xs text-muted-green">{item.owner?.itemsListed ?? 1} item{(item.owner?.itemsListed ?? 1) !== 1 ? 's' : ''} listed</span>
                                    </div>
                                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        Verified Neighbour
                                    </p>
                                </div>
                                <button className="text-sm font-semibold text-primary border border-primary/30 rounded-xl px-4 py-2 hover:bg-primary/5 transition-colors flex-shrink-0">
                                    View profile
                                </button>
                            </div>

                            {/* Owner stats */}
                            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                                {[
                                    { label: 'Rating', value: item.owner?.rating ?? '4.5', icon: 'star' },
                                    { label: 'Items listed', value: item.owner?.itemsListed ?? 1, icon: 'inventory_2' },
                                    { label: 'Lends done', value: item.owner?.lendsCompleted ?? 8, icon: 'handshake' },
                                ].map(s => (
                                    <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                                        <span className="material-symbols-outlined text-muted-green text-lg">{s.icon}</span>
                                        <p className="text-base font-bold text-charcoal mt-1">{s.value}</p>
                                        <p className="text-[10px] text-muted-green">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Safety & Guidelines */}
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                            <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-amber-600 text-lg">verified_user</span>
                                Safety &amp; Guidelines
                            </h2>
                            <ul className="space-y-2">
                                {[
                                    'Always meet in a safe, public location within your community',
                                    'Inspect the item thoroughly before accepting it',
                                    'Return on time and in the same condition it was given',
                                    'Leave an honest review after borrowing',
                                    'Report any issues through the platform immediately',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                                        <span className="material-symbols-outlined text-amber-500 text-base mt-0.5 flex-shrink-0">check_circle</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ── Right column: Sticky request panel ───────── */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-24 space-y-4">

                            {/* Request card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                                <div className="mb-5">
                                    <h2 className="text-xl font-bold text-charcoal">Borrow this item</h2>
                                    <p className="text-xs text-muted-green mt-1">Your request is sent to the owner for approval</p>
                                </div>
                                <RequestPanel item={item} />
                            </div>

                            {/* Back button */}
                            <button
                                onClick={() => navigate('/discover')}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-green hover:text-charcoal border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Back to Marketplace
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
