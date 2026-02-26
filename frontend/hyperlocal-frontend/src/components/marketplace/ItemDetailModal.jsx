import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { requestItem } from '../../services/marketplaceService';

// Condition colour map
const CONDITION_STYLE = {
    'New':      'bg-green-100 text-green-800',
    'Like New': 'bg-emerald-100 text-emerald-800',
    'Good':     'bg-blue-100 text-blue-800',
    'Fair':     'bg-amber-100 text-amber-700',
    'Poor':     'bg-red-100 text-red-700',
};

// Category icon map
const CAT_ICON = {
    'Electronics': 'devices', 'Vehicles': 'directions_car', 'Appliances': 'kitchen',
    'Books': 'menu_book', 'Fashion': 'checkroom', 'Tools': 'hardware',
    'Sports': 'sports_soccer', 'Kids': 'child_care', 'Other': 'category',
};

// Star rating display
function Stars({ rating = 5 }) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <span className="inline-flex items-center gap-0.5">
            {[...Array(full)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            ))}
            {half && <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>}
        </span>
    );
}

// Photo gallery
function Gallery({ images }) {
    const [active, setActive] = useState(0);
    const imgs = images?.length ? images : ['https://placehold.co/800x600/e5e7eb/9ca3af?text=No+Photo'];

    return (
        <div className="space-y-2">
            {/* Main photo */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img
                    key={active}
                    src={imgs[active]}
                    alt="Item photo"
                    className="w-full h-full object-cover"
                />
                {imgs.length > 1 && (
                    <>
                        <button
                            onClick={() => setActive(i => Math.max(0, i - 1))}
                            disabled={active === 0}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow disabled:opacity-30 hover:bg-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg text-charcoal">chevron_left</span>
                        </button>
                        <button
                            onClick={() => setActive(i => Math.min(imgs.length - 1, i + 1))}
                            disabled={active === imgs.length - 1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow disabled:opacity-30 hover:bg-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg text-charcoal">chevron_right</span>
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                            {imgs.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? 'bg-white' : 'bg-white/50'}`}
                                />
                            ))}
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
                            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === active ? 'border-primary' : 'border-transparent'}`}
                        >
                            <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Request panel
function RequestPanel({ item, onClose }) {
    const [message, setMessage] = useState("Hi! Is this still available to borrow?");
    const [days, setDays] = useState(1);
    const [isRequesting, setIsRequesting] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const totalCost = (item.price ?? 0) * days;

    const handleRequest = async () => {
        setIsRequesting(true);
        try {
            await requestItem(item.id, message);
            toast.success('Borrow request sent! The owner will get back to you.');
            onClose();
        } catch {
            toast.error('Failed to send request. Try again.');
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Price callout */}
            <div className="flex items-end gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-3xl font-bold text-charcoal">₹{item.price}</span>
                <span className="text-sm text-muted-green mb-1">/ day</span>
                <div className="flex-1" />
                <div className="text-right">
                    <p className="text-xs text-muted-green">Estimated total</p>
                    <p className="text-lg font-bold text-primary">₹{totalCost}</p>
                </div>
            </div>

            {/* Duration */}
            <div>
                <label className="text-xs font-semibold text-charcoal mb-2 block">How many days?</label>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setDays(d => Math.max(1, d - 1))}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="w-8 text-center font-bold text-charcoal text-lg">{days}</span>
                    <button
                        type="button"
                        onClick={() => setDays(d => d + 1)}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                    <span className="text-sm text-muted-green ml-1">{days} day{days > 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-semibold text-charcoal mb-1.5 block">From</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-charcoal mb-1.5 block">To</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Message */}
            <div>
                <label className="text-xs font-semibold text-charcoal mb-1.5 block">Message to owner</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-primary"
                />
            </div>

            {/* CTA */}
            <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {isRequesting ? (
                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Sending…</>
                ) : (
                    <><span className="material-symbols-outlined text-base">handshake</span>Send Borrow Request</>
                )}
            </button>

            {/* Safety tip */}
            <p className="text-[11px] text-muted-green text-center leading-relaxed">
                <span className="material-symbols-outlined text-xs align-middle mr-1">verified_user</span>
                Always meet in a safe location &middot; Inspect the item before borrowing &middot; Return on time
            </p>
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────

const ItemDetailModal = ({ item, open, onOpenChange }) => {
    const onClose = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {item && (
            <DialogContent className="w-full max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0 rounded-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
                >
                    <span className="material-symbols-outlined text-lg text-charcoal">close</span>
                </button>

                <div className="flex flex-col lg:flex-row min-h-0">
                    {/* ── Left: Gallery + info ────────────────────────────────── */}
                    <div className="lg:w-[55%] p-5 lg:overflow-y-auto lg:max-h-[95vh]">
                        <Gallery images={item.images} />

                        {/* Meta badges */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <Badge className="bg-primary/10 text-primary border-0 font-semibold text-xs gap-1">
                                <span className="material-symbols-outlined text-sm">{CAT_ICON[item.category] ?? 'category'}</span>
                                {item.category}
                            </Badge>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONDITION_STYLE[item.condition] ?? 'bg-gray-100 text-gray-700'}`}>
                                {item.condition}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-green">
                                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                Borrow &amp; Return
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-charcoal mt-3 leading-snug">{item.title}</h1>

                        {/* Community */}
                        <p className="flex items-center gap-1 text-sm text-muted-green mt-1">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {item.communityName ?? 'Your Community'}
                        </p>

                        {/* Description */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-charcoal mb-2">About this item</h3>
                            <p className="text-sm text-muted-green leading-relaxed">{item.description}</p>
                        </div>

                        {/* Item details grid */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {[
                                { icon: 'sell', label: 'Category', value: item.category },
                                { icon: 'star', label: 'Condition', value: item.condition },
                                { icon: 'schedule', label: 'Price', value: `₹${item.price}/day` },
                                { icon: 'inventory_2', label: 'Status', value: item.status === 'AVAILABLE' ? 'Available' : 'Unavailable' },
                            ].map(d => (
                                <div key={d.label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-muted-green text-lg">{d.icon}</span>
                                    <div>
                                        <p className="text-[10px] text-muted-green font-medium">{d.label}</p>
                                        <p className="text-sm font-semibold text-charcoal">{d.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Owner card */}
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={item.owner?.avatarUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                        {item.owner?.avatar ?? 'US'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-charcoal text-sm">{item.owner?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Stars rating={item.owner?.rating ?? 4.5} />
                                        <span className="text-xs text-muted-green">{item.owner?.rating ?? '4.5'}</span>
                                        <span className="text-xs text-muted-green">·</span>
                                        <span className="text-xs text-muted-green">{item.owner?.itemsListed ?? 1} item{(item.owner?.itemsListed ?? 1) !== 1 ? 's' : ''} listed</span>
                                    </div>
                                    <p className="text-[10px] text-green-600 flex items-center gap-0.5 mt-0.5">
                                        <span className="material-symbols-outlined text-xs">verified</span>
                                        Verified Neighbour
                                    </p>
                                </div>
                            </div>
                            <button className="text-xs font-semibold text-primary border border-primary/30 rounded-xl px-3 py-1.5 hover:bg-primary/5 transition-colors">
                                Profile
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Request panel ────────────────────────────────── */}
                    <div className="lg:w-[45%] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 lg:overflow-y-auto lg:max-h-[95vh]">
                        {/* Header */}
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-charcoal">Borrow this item</h2>
                            <p className="text-xs text-muted-green mt-0.5">Request is sent to the owner for approval</p>
                        </div>

                        <RequestPanel item={item} onClose={onClose} />
                    </div>
                </div>
            </DialogContent>
            )}
        </Dialog>
    );
};

export default ItemDetailModal;
