import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '../components/ui/HomeNavbar';
import { getMyListings } from '../services/marketplaceService';
import { ROUTES } from '../constants';

const CONDITION_STYLE = {
    'New':      'bg-green-100 text-green-800',
    'Like New': 'bg-emerald-100 text-emerald-800',
    'Good':     'bg-blue-100 text-blue-800',
    'Fair':     'bg-amber-100 text-amber-700',
    'Poor':     'bg-red-100 text-red-700',
};

const STATUS_STYLE = {
    'AVAILABLE':   { label: 'Available', cls: 'text-green-700 bg-green-50 border-green-100', icon: 'check_circle' },
    'UNAVAILABLE': { label: 'Unavailable', cls: 'text-red-600 bg-red-50 border-red-100', icon: 'cancel' },
    'BORROWED':    { label: 'Borrowed', cls: 'text-blue-700 bg-blue-50 border-blue-100', icon: 'swap_horiz' },
};

const CAT_ICON = {
    'Electronics': 'devices', 'Vehicles': 'directions_car', 'Appliances': 'kitchen',
    'Books': 'menu_book', 'Fashion': 'checkroom', 'Tools': 'hardware',
    'Sports': 'sports_soccer', 'Kids': 'child_care', 'Other': 'category',
};

function ListingCard({ item, onEdit, onToggle, onDelete }) {
    const s = STATUS_STYLE[item.status] ?? STATUS_STYLE['AVAILABLE'];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="relative aspect-video bg-gray-100">
                <img
                    src={item.images?.[0] ?? 'https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Photo'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                {/* Status badge */}
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
                    <span className="material-symbols-outlined text-xs">{s.icon}</span>
                    {s.label}
                </span>
                {/* Price pill */}
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    ₹{item.price}/day
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-charcoal text-sm truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-0.5 text-xs text-muted-green">
                                <span className="material-symbols-outlined text-sm">{CAT_ICON[item.category] ?? 'category'}</span>
                                {item.category}
                            </span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CONDITION_STYLE[item.condition] ?? 'bg-gray-100 text-gray-600'}`}>
                                {item.condition}
                            </span>
                        </div>
                        <p className="text-xs text-muted-green mt-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            {item.communityName ?? 'Your Community'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onToggle(item)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            item.status === 'AVAILABLE'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {item.status === 'AVAILABLE' ? 'pause_circle' : 'play_circle'}
                        </span>
                        {item.status === 'AVAILABLE' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-charcoal hover:bg-gray-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyListingsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['myListings'],
        queryFn: getMyListings,
    });

    const filtered = filter === 'All' ? items : items.filter(i => i.status === filter);

    const handleEdit = () => {};        // Placeholder — will open CreateItemModal pre-filled
    const handleToggle = () => {};      // Placeholder — toggle AVAILABLE/UNAVAILABLE
    const handleDelete = () => {};      // Placeholder — confirm + delete

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            {/* Breadcrumb */}
            <div className="pt-16 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm text-muted-green">
                    <button onClick={() => navigate(ROUTES.DASHBOARD)} className="hover:text-primary transition-colors">Dashboard</button>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-charcoal font-semibold">My Listings</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal">My Listings</h1>
                        <p className="text-sm text-muted-green mt-0.5">Items you&apos;ve listed for borrowing in your communities</p>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.DISCOVER)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        List New Item
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'Total Listed', value: items.length, icon: 'inventory_2', color: 'text-primary' },
                        { label: 'Available', value: items.filter(i => i.status === 'AVAILABLE').length, icon: 'check_circle', color: 'text-green-600' },
                        { label: 'Borrowed Out', value: items.filter(i => i.status === 'BORROWED').length, icon: 'swap_horiz', color: 'text-blue-600' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                            <div>
                                <p className="text-xl font-bold text-charcoal">{s.value}</p>
                                <p className="text-xs text-muted-green">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-1.5 w-fit">
                    {['All', 'AVAILABLE', 'BORROWED', 'UNAVAILABLE'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                filter === f ? 'bg-primary text-white shadow-sm' : 'text-muted-green hover:text-charcoal'
                            }`}
                        >
                            {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                                <div className="aspect-video bg-gray-100" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-muted-green">inventory_2</span>
                        </div>
                        <h3 className="text-lg font-bold text-charcoal">
                            {filter === 'All' ? "You haven't listed anything yet" : `No ${filter.toLowerCase()} listings`}
                        </h3>
                        <p className="text-sm text-muted-green max-w-xs">
                            Share tools, books, and gear with your neighbours to build community trust.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.DISCOVER)}
                            className="mt-2 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            List Your First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(item => (
                            <ListingCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
