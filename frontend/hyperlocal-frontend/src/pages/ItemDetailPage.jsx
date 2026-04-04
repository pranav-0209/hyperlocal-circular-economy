import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import AppFooter from '../components/ui/AppFooter';
import HomeNavbar from '../components/ui/HomeNavbar';
import { Badge } from '../components/ui/badge';
import SecureImage from '../components/ui/SecureImage';
import RatingStars from '../components/ui/RatingStars';
import ListingReviewsSection from '../components/marketplace/ListingReviewsSection';
import { getItemById, getListingAvailability, getListingReviews, requestItem } from '../services/marketplaceService';
import { getUserProfileById } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import { getTrustTierLabel, normalizeTrustValues } from '../utils/trust';

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
    'Furniture': 'chair_alt',
    'Books': 'menu_book', 'Fashion': 'checkroom', 'Tools': 'hardware',
    'Sports': 'sports_soccer', 'Kids': 'child_care', 'Other': 'category',
};

const initialsFromName = (name = '') => {
    const parts = String(name)
        .trim()
        .split(' ')
        .filter(Boolean);

    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatMemberSince = (memberSince) => {
    if (!memberSince) return 'Member since recently';

    const parsedDate = new Date(memberSince);
    if (Number.isNaN(parsedDate.getTime())) return 'Member since recently';

    return `Member since ${parsedDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })}`;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const pad2 = (value) => String(value).padStart(2, '0');

const dateKeyFromDate = (date) => (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
);

const parseDateKey = (dateKey) => {
    if (!dateKey) return null;
    const parsed = new Date(`${dateKey}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const addDaysToDateKey = (dateKey, days) => {
    const parsed = parseDateKey(dateKey);
    if (!parsed) return null;
    return dateKeyFromDate(new Date(parsed.getTime() + days * DAY_MS));
};

const buildBlockedDateSet = (blockedRanges = []) => {
    const blockedSet = new Set();

    blockedRanges.forEach((range) => {
        const start = parseDateKey(range?.startDate);
        const end = parseDateKey(range?.endDate);

        if (!start || !end) return;
        let cursor = new Date(start);

        while (cursor <= end) {
            blockedSet.add(dateKeyFromDate(cursor));
            cursor = new Date(cursor.getTime() + DAY_MS);
        }
    });

    return blockedSet;
};

const buildRangeDateSet = (fromDate, toDate) => {
    const rangeSet = new Set();
    const start = parseDateKey(fromDate);
    const end = parseDateKey(toDate);

    if (!start) return rangeSet;

    const finalEnd = end && end >= start ? end : start;
    let cursor = new Date(start);

    while (cursor <= finalEnd) {
        rangeSet.add(dateKeyFromDate(cursor));
        cursor = new Date(cursor.getTime() + DAY_MS);
    }

    return rangeSet;
};

const countDaysInclusive = (fromDate, toDate) => {
    const start = parseDateKey(fromDate);
    const end = parseDateKey(toDate);
    if (!start) return 1;
    if (!end || end < start) return 1;
    return Math.floor((end - start) / DAY_MS) + 1;
};

// ── Gallery ───────────────────────────────────────────────────────────────────

function Gallery({ images }) {
    const [active, setActive] = useState(0);
    const imgs = images?.length ? images : ['https://placehold.co/1200x800/e5e7eb/9ca3af?text=No+Photo'];

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <SecureImage key={active} source={imgs[active]} alt="Item photo" className="w-full h-full object-cover" />
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
                            <SecureImage source={src} alt="" className="w-full h-full object-cover" />
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
    const [isRequesting, setIsRequesting] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
    const [isDragging, setIsDragging] = useState(false);
    const [dragAnchorDate, setDragAnchorDate] = useState('');
    const [dragCurrentDate, setDragCurrentDate] = useState('');
    const [dragMoved, setDragMoved] = useState(false);
    const [suppressNextClick, setSuppressNextClick] = useState(false);

    const { data: availabilityData, isLoading: availabilityLoading, isError: availabilityError, refetch: refetchAvailability } = useQuery({
        queryKey: ['listingAvailabilityCalendar', item.id],
        queryFn: () => getListingAvailability(item.id),
        enabled: !!item?.id,
        staleTime: 30_000,
    });

    const todayDate = new Date();
    const todayKey = dateKeyFromDate(todayDate);

    const availableFromDate = parseDateKey(availabilityData?.availableFrom ?? item?.availableFrom);
    const availableToDate = parseDateKey(availabilityData?.availableTo ?? item?.availableTo);
    const availableFromKey = availableFromDate ? dateKeyFromDate(availableFromDate) : null;
    const availableToKey = availableToDate ? dateKeyFromDate(availableToDate) : null;

    const blockedDateSet = buildBlockedDateSet(availabilityData?.blockedRanges ?? []);
    const previewStart = isDragging && dragMoved && dragAnchorDate && dragCurrentDate
        ? (dragAnchorDate <= dragCurrentDate ? dragAnchorDate : dragCurrentDate)
        : fromDate;
    const previewEnd = isDragging && dragMoved && dragAnchorDate && dragCurrentDate
        ? (dragAnchorDate >= dragCurrentDate ? dragAnchorDate : dragCurrentDate)
        : toDate;

    const selectedRangeSet = buildRangeDateSet(previewStart, previewEnd || previewStart);

    const days = countDaysInclusive(fromDate, toDate);
    const totalCost = (item.price ?? 0) * days;

    const isInsideAvailabilityWindow = (dateKey) => {
        if (!availableFromKey || !availableToKey) return true;
        return dateKey >= availableFromKey && dateKey <= availableToKey;
    };

    const isDateBlocked = (dateKey) => blockedDateSet.has(dateKey);

    const isDateSelectable = (dateKey) => {
        if (dateKey < todayKey) return false;
        if (!isInsideAvailabilityWindow(dateKey)) return false;
        if (isDateBlocked(dateKey)) return false;
        return true;
    };

    const doesSelectionOverlapBlocked = (startKey, endKey) => {
        const start = parseDateKey(startKey);
        const end = parseDateKey(endKey);
        if (!start || !end || end < start) return false;

        let cursor = new Date(start);
        while (cursor <= end) {
            if (isDateBlocked(dateKeyFromDate(cursor))) {
                return true;
            }
            cursor = new Date(cursor.getTime() + DAY_MS);
        }
        return false;
    };

    const handleDateSelection = (dateKey) => {
        if (!isDateSelectable(dateKey)) return;

        // Toggle off single selected day.
        if (fromDate && toDate && fromDate === toDate && dateKey === fromDate) {
            setFromDate('');
            setToDate('');
            return;
        }

        if (!fromDate) {
            setFromDate(dateKey);
            setToDate(dateKey);
            return;
        }

        const rangeStart = fromDate <= toDate ? fromDate : toDate;
        const rangeEnd = fromDate <= toDate ? toDate : fromDate;

        // Allow endpoint unselect/shrink for already selected ranges.
        if (selectedRangeSet.has(dateKey)) {
            if (dateKey === rangeStart) {
                const nextStart = addDaysToDateKey(rangeStart, 1);
                if (!nextStart || nextStart > rangeEnd) {
                    setFromDate('');
                    setToDate('');
                    return;
                }

                setFromDate(nextStart);
                setToDate(rangeEnd);
                return;
            }

            if (dateKey === rangeEnd) {
                const nextEnd = addDaysToDateKey(rangeEnd, -1);
                if (!nextEnd || nextEnd < rangeStart) {
                    setFromDate('');
                    setToDate('');
                    return;
                }

                setFromDate(rangeStart);
                setToDate(nextEnd);
                return;
            }

            toast.info('To unselect, click the first or last selected day.');
            return;
        }

        const prevAdjacent = addDaysToDateKey(rangeStart, -1);
        const nextAdjacent = addDaysToDateKey(rangeEnd, 1);

        if (prevAdjacent && dateKey === prevAdjacent && isDateSelectable(prevAdjacent)) {
            if (doesSelectionOverlapBlocked(dateKey, rangeEnd)) {
                toast.error('Selected range overlaps with booked dates.');
                return;
            }

            setFromDate(dateKey);
            setToDate(rangeEnd);
            return;
        }

        if (nextAdjacent && dateKey === nextAdjacent && isDateSelectable(nextAdjacent)) {
            if (doesSelectionOverlapBlocked(rangeStart, dateKey)) {
                toast.error('Selected range overlaps with booked dates.');
                return;
            }

            setFromDate(rangeStart);
            setToDate(dateKey);
            return;
        }

        toast.info('Select only the next or previous adjacent date to extend the range.');
    };

    const finalizeDraggedSelection = (endDateKey) => {
        if (!isDragging || !dragAnchorDate || !endDateKey) return;

        if (!dragMoved) {
            setIsDragging(false);
            setDragAnchorDate('');
            setDragCurrentDate('');
            return;
        }

        const start = dragAnchorDate <= endDateKey ? dragAnchorDate : endDateKey;
        const end = dragAnchorDate >= endDateKey ? dragAnchorDate : endDateKey;

        if (!isDateSelectable(start) || !isDateSelectable(end) || doesSelectionOverlapBlocked(start, end)) {
            toast.error('Selected range includes unavailable or booked dates.');
            setFromDate(dragAnchorDate);
            setToDate(dragAnchorDate);
        } else {
            setFromDate(start);
            setToDate(end);
        }

        setIsDragging(false);
        setDragAnchorDate('');
        setDragCurrentDate('');
        setDragMoved(false);
        setSuppressNextClick(true);
    };

    const handleDateMouseDown = (dateKey) => {
        if (!isDateSelectable(dateKey)) return;
        setIsDragging(true);
        setDragAnchorDate(dateKey);
        setDragCurrentDate(dateKey);
        setDragMoved(false);
    };

    const handleDateMouseEnter = (dateKey) => {
        if (!isDragging || !isDateSelectable(dateKey)) return;
        if (dateKey !== dragCurrentDate) {
            setDragMoved(true);
        }
        setDragCurrentDate(dateKey);
    };

    const handleDateMouseUp = (dateKey) => {
        if (!isDragging) return;

        if (!isDateSelectable(dateKey)) {
            setIsDragging(false);
            setDragAnchorDate('');
            setDragCurrentDate('');
            setDragMoved(false);
            setSuppressNextClick(true);
            return;
        }

        finalizeDraggedSelection(dateKey);
    };

    const handleDateClick = (dateKey) => {
        if (suppressNextClick) {
            setSuppressNextClick(false);
            return;
        }

        handleDateSelection(dateKey);
    };

    const calendarDays = (() => {
        const monthStart = startOfMonth(visibleMonth);
        const firstDayOffset = monthStart.getDay();
        const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

        const cells = [];
        for (let i = 0; i < firstDayOffset; i += 1) {
            cells.push(null);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
        }

        return cells;
    })();

    const isRangeValidationFailed = Boolean(fromDate && toDate && doesSelectionOverlapBlocked(fromDate, toDate));

    const availabilityWindowLabel = (availableFromKey && availableToKey)
        ? `${availableFromDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${availableToDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : null;

    const handleRequest = async () => {
        if (!fromDate || !toDate) {
            toast.info('Please select both from and to dates.');
            return;
        }

        if (new Date(toDate) < new Date(fromDate)) {
            toast.error('To date must be on or after from date.');
            return;
        }

        setIsRequesting(true);
        try {
            const availability = await getListingAvailability(item.id, {
                fromDate,
                toDate,
            });

            if (availability?.requestedRangeAvailable === false || availability?.isAvailable === false) {
                toast.error('This item is not available for the selected date range.');
                return;
            }

            await requestItem(item.id, {
                message,
                fromDate,
                toDate,
            });
            toast.success('Borrow request sent! The owner will get back to you.');
            navigate('/discover');
        } catch (error) {
            toast.error(error.message || 'Failed to send request. Try again.');
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

            {/* Calendar availability */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-charcoal block tracking-wide uppercase">Select dates</label>
                    {availabilityWindowLabel && (
                        <span className="text-[11px] text-muted-green">Window: {availabilityWindowLabel}</span>
                    )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => setVisibleMonth((prev) => addMonths(prev, -1))}
                            className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:border-primary transition-colors flex items-center justify-center"
                            aria-label="Previous month"
                        >
                            <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <p className="text-sm font-semibold text-charcoal">
                            {visibleMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                        <button
                            type="button"
                            onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
                            className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:border-primary transition-colors flex items-center justify-center"
                            aria-label="Next month"
                        >
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <span key={day} className="text-[10px] font-semibold text-muted-green uppercase tracking-wide py-1">
                                {day}
                            </span>
                        ))}
                    </div>

                    {availabilityLoading ? (
                        <div className="h-56 flex items-center justify-center text-sm text-muted-green gap-2">
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                            Loading availability...
                        </div>
                    ) : availabilityError ? (
                        <div className="h-56 flex flex-col items-center justify-center text-center gap-2 px-4">
                            <p className="text-sm text-red-600">Failed to load availability calendar.</p>
                            <button
                                type="button"
                                onClick={() => refetchAvailability()}
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1" onMouseLeave={() => finalizeDraggedSelection(dragCurrentDate)}>
                            {calendarDays.map((dateValue, index) => {
                                if (!dateValue) {
                                    return <div key={`empty-${index}`} className="h-9" />;
                                }

                                const dateKey = dateKeyFromDate(dateValue);
                                const isSelected = selectedRangeSet.has(dateKey);
                                const isBlocked = isDateBlocked(dateKey);
                                const isAvailable = isInsideAvailabilityWindow(dateKey) && !isBlocked && dateKey >= todayKey;
                                const selectable = isDateSelectable(dateKey);

                                let dayClass = 'bg-gray-100 border-gray-200 text-gray-400';
                                if (isBlocked) {
                                    dayClass = 'bg-red-50 border-red-200 text-red-600';
                                } else if (isSelected) {
                                    dayClass = 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm';
                                } else if (isAvailable) {
                                    dayClass = 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm';
                                }

                                return (
                                    <button
                                        key={dateKey}
                                        type="button"
                                        onClick={() => handleDateClick(dateKey)}
                                        onMouseDown={() => handleDateMouseDown(dateKey)}
                                        onMouseEnter={() => handleDateMouseEnter(dateKey)}
                                        onMouseUp={() => handleDateMouseUp(dateKey)}
                                        disabled={!selectable}
                                        className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${dayClass} ${!selectable ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-95'}`}
                                    >
                                        {dateValue.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!availabilityLoading && !availabilityError && !availabilityWindowLabel && !(availabilityData?.blockedRanges?.length > 0) && (
                        <p className="mt-3 text-xs text-muted-green text-center">
                            Availability data is limited for this listing. You can still request dates.
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-green flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> Available
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Booked
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Selected
                        </span>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-green">
                        Range selection is sequential: choose the previous or next adjacent day, or drag continuously.
                    </p>
                </div>
            </div>

            {/* Selected range summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-green font-semibold">Start Date</p>
                    <p className="text-sm font-semibold text-charcoal mt-1">{fromDate || 'Not selected'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-green font-semibold">End Date</p>
                    <p className="text-sm font-semibold text-charcoal mt-1">{toDate || 'Not selected'}</p>
                </div>
            </div>

            {isRangeValidationFailed && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    Selected range is not available due to overlapping approved bookings.
                </div>
            )}

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
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const itemFromState = state?.item ?? null;
    const reviewContext = state?.reviewContext ?? null;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [id]);

    const { data: fetchedItem, isLoading } = useQuery({
        queryKey: ['marketplaceListing', id],
        queryFn: () => getItemById(id),
        enabled: !!id,
    });

    const { data: listingReviewsData, isLoading: listingReviewsLoading, isError: listingReviewsError, refetch: refetchListingReviews } = useQuery({
        queryKey: ['listingReviews', id],
        queryFn: () => getListingReviews(id, { page: 0, size: 5, sort: 'createdAt,desc' }),
        enabled: !!id,
        staleTime: 1000 * 30,
    });

    const item = fetchedItem ?? itemFromState;
    const currentUserId = user?.id ?? user?.userId;
    const ownerId = item?.owner?.userId ?? item?.owner?.id;
    const isOwner = currentUserId != null && ownerId != null && String(currentUserId) === String(ownerId);

    const { data: ownerProfileData } = useQuery({
        queryKey: ['ownerPublicProfile', ownerId],
        queryFn: () => getUserProfileById(ownerId),
        enabled: !!ownerId && !isOwner,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    if (isLoading && !item) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <HomeNavbar />
                <div className="flex items-center justify-center flex-1">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
                <AppFooter />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <HomeNavbar />
                <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-4">
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
                <AppFooter />
            </div>
        );
    }

    const ownerName = ownerProfileData?.name ?? item.owner?.name ?? 'Community Member';
    const ownerAvatarUrl = ownerProfileData?.profilePhotoUrl ?? item.owner?.avatarUrl ?? null;
    const ownerVerified = ownerProfileData?.verified ?? item.owner?.verified ?? false;
    const { trustIndex: ownerTrustIndex, trustXp: ownerTrustXp } = normalizeTrustValues(
        ownerProfileData?.trustIndex ?? item.owner?.trustIndex,
        ownerProfileData?.trustXp ?? item.owner?.trustXp,
    );
    const ownerTrustTier = getTrustTierLabel(ownerTrustIndex);
    const ownerListingsPosted = Number(ownerProfileData?.listingsPosted ?? item.owner?.itemsListed ?? 0);
    const ownerMemberSinceLabel = formatMemberSince(ownerProfileData?.memberSince ?? item.owner?.memberSince);

    const availWindow = (item.availableFrom && item.availableTo)
        ? `${new Date(item.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(item.availableTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : null;
    const listingRatingSummary = listingReviewsData?.summary ?? { averageRating: 0, totalReviews: 0 };

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            {/* ── Breadcrumb bar ─────────────────────────────────── */}
            <div className="pt-16 bg-white border-b border-gray-100">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5">
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
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-8">
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
                            <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5">
                                {listingRatingSummary.totalReviews > 0 ? (
                                    <>
                                        <span className="text-sm font-bold text-charcoal">{listingRatingSummary.averageRating.toFixed(1)}</span>
                                        <RatingStars rating={listingRatingSummary.averageRating} size={14} />
                                        <span className="text-xs text-amber-800">{listingRatingSummary.totalReviews} ratings</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-amber-800">No ratings yet</span>
                                )}
                                {listingReviewsLoading && (
                                    <span className="text-[10px] text-muted-green">Loading...</span>
                                )}
                            </div>
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

                        <ListingReviewsSection
                            itemId={item.id}
                            itemTitle={item.title}
                            reviewContext={reviewContext}
                            reviewsData={listingReviewsData}
                            isLoading={listingReviewsLoading}
                            isError={listingReviewsError}
                            onRefresh={refetchListingReviews}
                        />

                        {!isOwner && (
                            <>
                                {/* Owner card */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">person</span>
                                        About the owner
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 border-2 border-white shadow-md rounded-full overflow-hidden">
                                            <SecureImage
                                                source={ownerAvatarUrl}
                                                alt={ownerName}
                                                className="w-full h-full object-cover"
                                                fallback={(
                                                    <div className="w-full h-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                                                        {initialsFromName(ownerName)}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-charcoal text-base">{ownerName}</p>
                                            <p className="text-xs text-muted-green mt-0.5">{ownerMemberSinceLabel}</p>
                                            <p className="text-xs text-primary mt-1 font-semibold">{ownerTrustTier}</p>
                                            {ownerVerified && (
                                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                                                    <span className="material-symbols-outlined text-sm">verified</span>
                                                    Verified Neighbour
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Owner stats */}
                                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                                        {[
                                            { label: 'Trust score', value: ownerTrustIndex, icon: 'shield' },
                                            { label: 'Trust XP', value: ownerTrustXp, icon: 'military_tech' },
                                            { label: 'Listings posted', value: ownerListingsPosted, icon: 'inventory_2' },
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
                            </>
                        )}
                    </div>

                    {/* ── Right column: Sticky request panel ───────── */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-24 space-y-4">

                            {/* Request card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                                <div className="mb-5">
                                    <h2 className="text-xl font-bold text-charcoal">{isOwner ? 'Your listing' : 'Borrow this item'}</h2>
                                    <p className="text-xs text-muted-green mt-1">
                                        {isOwner
                                            ? 'This item belongs to you. Manage availability or edit details from My Listings.'
                                            : 'Your request is sent to the owner for approval'}
                                    </p>
                                </div>
                                {isOwner ? (
                                    <button
                                        onClick={() => navigate(ROUTES.MY_LISTINGS)}
                                        className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-base">inventory_2</span>
                                        Go to My Listings
                                    </button>
                                ) : (
                                    <RequestPanel item={item} />
                                )}
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
            <AppFooter />
        </div>
    );
}
