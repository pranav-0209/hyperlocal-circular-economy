import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketplaceSchema, ITEM_CATEGORIES, CONDITIONS } from '../../schemas/marketplaceSchema';
import { createItem, getListingCategories, updateItem } from '../../services/marketplaceService';
import { getMyCommunities } from '../../services/communityService';
import { toast } from 'sonner';
import 'react-day-picker/style.css';

const DEFAULT_FORM_VALUES = {
    communityId: undefined,
    title: '',
    description: '',
    category: undefined,
    type: 'RENT',
    price: '',
    condition: undefined,
    availableFrom: '',
    availableTo: '',
};

const EMPTY_COMMUNITIES = [];
const DROPDOWN_CONTENT_CLASS = 'z-[500] border-gray-200 bg-white/95 backdrop-blur-sm shadow-xl';
const DROPDOWN_ITEM_CLASS = 'py-3 pr-3 text-charcoal transition-colors duration-150 hover:bg-gray-50 data-[highlighted]:bg-gray-50 focus:bg-gray-50 hover:!text-primary data-[highlighted]:!text-primary focus:!text-primary';

const toCalendarDate = (value) => {
    if (!value) return undefined;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toIsoDate = (date) => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatCalendarDate = (value) => {
    if (!value) return 'dd-mm-yyyy';
    const parsed = toCalendarDate(value);
    if (!parsed) return 'dd-mm-yyyy';

    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

function DatePickerInput({ value, onChange, minDate, placeholder = 'dd-mm-yyyy' }) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(() => toCalendarDate(value) ?? toCalendarDate(minDate) ?? new Date());
    const wrapperRef = useRef(null);

    const selectedDate = toCalendarDate(value);
    const minCalendarDate = toCalendarDate(minDate);

    useEffect(() => {
        if (!open) return undefined;

        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => {
                    if (!open) {
                        setMonth(selectedDate ?? minCalendarDate ?? new Date());
                    }
                    setOpen((prev) => !prev);
                }}
                className={`w-full h-10 px-3 rounded-xl border bg-white text-sm text-left flex items-center justify-between transition-colors ${
                    open
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-primary/40'
                }`}
            >
                <span className={value ? 'text-charcoal' : 'text-muted-green'}>
                    {value ? formatCalendarDate(value) : placeholder}
                </span>
                <span className="material-symbols-outlined text-muted-green text-base">calendar_month</span>
            </button>

            {open && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-[560] rounded-2xl border border-gray-200 bg-gray-50 shadow-xl px-4 py-3 w-[288px]">
                    <div className="mb-0 px-1 pb-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                const next = new Date(month.getFullYear(), month.getMonth() - 1, 1);
                                setMonth(next);
                            }}
                            className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-charcoal hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
                            aria-label="Previous month"
                        >
                            <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
                        </button>

                        <p className="text-sm font-semibold text-charcoal">
                            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
                                setMonth(next);
                            }}
                            className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-charcoal hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
                            aria-label="Next month"
                        >
                            <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
                        </button>
                    </div>

                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        defaultMonth={selectedDate ?? minCalendarDate ?? new Date()}
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(date) => {
                            if (!date) return;
                            onChange(toIsoDate(date));
                            setOpen(false);
                        }}
                        disabled={minCalendarDate ? { before: minCalendarDate } : undefined}
                        showOutsideDays
                        hideNavigation
                        className="text-sm"
                        classNames={{
                            months: 'flex',
                            month: 'space-y-0 w-full',
                            month_caption: 'hidden',
                            caption: 'hidden',
                            caption_label: 'hidden',
                            nav: 'hidden',
                            button_previous: 'hidden',
                            button_next: 'hidden',
                            week: 'flex',
                            weekdays: 'flex justify-between text-xs text-muted-green font-semibold px-0.5',
                            weekday: 'w-9 text-center',
                            week_number: 'hidden',
                            day: 'h-9 w-9 rounded-lg',
                            day_button: 'h-9 w-9 rounded-lg border border-transparent bg-transparent text-xs font-semibold text-charcoal transition-colors hover:bg-primary/10 hover:text-primary',
                            day_today: 'ring-1 ring-primary/35 text-primary',
                            day_selected: 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm hover:bg-blue-100 hover:text-blue-700',
                            day_outside: 'text-gray-300',
                            day_disabled: 'border-transparent bg-transparent text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

const toDateInputValue = (value) => {
    if (!value) return '';
    return String(value).slice(0, 10);
};

// ── AI mock helpers ──────────────────────────────────────────────────────────

const AI_PRICE_MAP = {
    'Like New': [120, 150, 200, 250],
    'New':      [150, 200, 250, 300],
    'Good':     [60,  80,  100, 120],
    'Fair':     [30,  40,  50,  60],
    'Poor':     [10,  15,  20,  25],
};

function mockAiPrice(condition) {
    const pool = AI_PRICE_MAP[condition] ?? [50, 80, 100];
    return pool[Math.floor(Math.random() * pool.length)];
}

function mockAiCategory(title) {
    const t = title.toLowerCase();
    if (/phone|laptop|camera|tablet|headphone|tv|computer|printer|speaker|drone/.test(t)) return 'Electronics';
    if (/car|bike|bicycle|scooter|activa|vehicle|cycle|moped/.test(t))                   return 'Vehicles';
    if (/table|chair|sofa|bed|desk|almirah|wardrobe|shelf|cabinet|stool|furniture/.test(t)) return 'Furniture';
    if (/washing|fridge|microwave|cooker|blender|mixer|oven|toaster|air.?condition/.test(t)) return 'Appliances';
    if (/drill|hammer|ladder|saw|wrench|spanner|screwdriver|tool/.test(t))              return 'Tools';
    if (/book|novel|textbook|comic|magazine/.test(t))                                    return 'Books';
    if (/shirt|dress|jacket|shoes|saree|lehenga|kurta|fashion|cloth|outfit/.test(t))    return 'Fashion';
    if (/tent|racket|cricket|football|yoga|gym|badminton|cycle|sports/.test(t))         return 'Sports';
    if (/toy|stroller|cradle|baby|kids|child|pram/.test(t))                             return 'Kids';
    return 'Other';
}

// ── Photo uploader sub-component ─────────────────────────────────────────────

function PhotoUploader({ photos, setPhotos }) {
    const fileRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const addFiles = useCallback((files) => {
        const valid = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .slice(0, 5 - photos.length);
        const previews = valid.map(f => ({
            id: Math.random().toString(36).slice(2),
            file: f,
            preview: URL.createObjectURL(f),
        }));
        setPhotos(prev => [...prev, ...previews].slice(0, 5));
    }, [photos.length, setPhotos]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const remove = (id) => {
        setPhotos(prev => {
            const photo = prev.find(p => p.id === id);
            if (photo) URL.revokeObjectURL(photo.preview);
            return prev.filter(p => p.id !== id);
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-charcoal">
                    Photos <span className="text-red-500">*</span> <span className="text-xs font-normal text-muted-green">(at least 1, up to 5)</span>
                </label>
                {photos.length > 0 && (
                    <span className="text-xs text-muted-green">{photos.length}/5 added</span>
                )}
            </div>

            {photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {photos.map((p, i) => (
                        <div key={p.id} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group flex-shrink-0">
                            <img src={p.preview} alt="" className="w-full h-full object-cover" />
                            {i === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-primary text-white py-0.5">COVER</span>
                            )}
                            <button
                                type="button"
                                onClick={() => remove(p.id)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                        </div>
                    ))}
                    {photos.length < 5 && (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-muted-green hover:border-primary hover:text-primary transition-colors flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        </button>
                    )}
                </div>
            )}

            {photos.length === 0 && (
                <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`w-full h-36 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'}`}
                >
                    <span className="material-symbols-outlined text-4xl text-muted-green">add_photo_alternate</span>
                    <p className="text-sm font-medium text-charcoal">Add photos</p>
                    <p className="text-xs text-muted-green">Drag &amp; drop or <span className="text-primary underline">browse</span></p>
                </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────

const CreateItemModal = ({
    open,
    onOpenChange,
    onSuccess,
    mode = 'create',
    listingId = null,
    initialValues = null,
}) => {
    const [photos, setPhotos] = useState([]);
    const [aiPriceLoading, setAiPriceLoading] = useState(false);
    const [aiPriceSuggestion, setAiPriceSuggestion] = useState(null);
    const [aiCatLoading, setAiCatLoading] = useState(false);
    const [aiCatSuggestion, setAiCatSuggestion] = useState(null);
    const wasOpenRef = useRef(false);
    const isEditMode = mode === 'edit';

    const { data: categoryOptions = ITEM_CATEGORIES } = useQuery({
        queryKey: ['listingCategories'],
        queryFn: getListingCategories,
        staleTime: 1000 * 60 * 5,
    });
    const resolvedCategoryOptions = categoryOptions.length ? categoryOptions : ITEM_CATEGORIES;

    const { data: joinedAndCreatedCommunitiesData, isLoading: communitiesLoading } = useQuery({
        queryKey: ['communities', 'me', 'create-listing'],
        queryFn: getMyCommunities,
        staleTime: 1000 * 60,
        enabled: open,
    });
    const joinedAndCreatedCommunities = joinedAndCreatedCommunitiesData ?? EMPTY_COMMUNITIES;

    const selectableCommunities = useMemo(() => (
        joinedAndCreatedCommunities
            .filter((community) => community.membershipStatus === 'APPROVED' && community.status === 'ACTIVE')
            .map((community) => ({
                id: String(community.id),
                name: community.name,
                role: community.isAdmin ? 'OWNER' : 'MEMBER',
            }))
            .sort((a, b) => {
                if (a.role !== b.role) return a.role === 'OWNER' ? -1 : 1;
                return a.name.localeCompare(b.name);
            })
    ), [joinedAndCreatedCommunities]);

    const form = useForm({
        resolver: zodResolver(marketplaceSchema),
        defaultValues: DEFAULT_FORM_VALUES,
    });
    const selectedAvailableFrom = form.watch('availableFrom');

    const resetTransientState = () => {
        setPhotos([]);
        setAiPriceSuggestion(null);
        setAiCatSuggestion(null);
    };

    const handleDialogOpenChange = (nextOpen) => {
        if (!nextOpen) {
            resetTransientState();
            form.reset(DEFAULT_FORM_VALUES);
        }
        onOpenChange(nextOpen);
    };

    useEffect(() => {
        if (!open) {
            wasOpenRef.current = false;
            return;
        }

        if (wasOpenRef.current) return;
        wasOpenRef.current = true;

        if (isEditMode && initialValues) {
            const availableFrom = toDateInputValue(initialValues.availableFrom);
            const availableTo = toDateInputValue(initialValues.availableTo);

            form.reset({
                communityId: initialValues.communityId
                    ? String(initialValues.communityId)
                    : selectableCommunities[0]?.id,
                title: initialValues.title ?? '',
                description: initialValues.description ?? '',
                category: initialValues.category ?? undefined,
                type: 'RENT',
                price: initialValues.price ?? '',
                condition: initialValues.condition ?? undefined,
                availableFrom,
                availableTo,
            });
            return;
        }

        form.reset({
            ...DEFAULT_FORM_VALUES,
            communityId: undefined,
        });
    }, [open, isEditMode, initialValues, form, selectableCommunities]);

    useEffect(() => {
        if (!open || isEditMode || selectableCommunities.length === 0) return;

        const currentCommunityId = form.getValues('communityId');
        const currentSelectionIsValid = selectableCommunities.some((community) => community.id === currentCommunityId);

        if (!currentSelectionIsValid) {
            form.setValue('communityId', selectableCommunities[0]?.id, {
                shouldValidate: true,
                shouldDirty: false,
                shouldTouch: false,
            });
        }
    }, [open, isEditMode, selectableCommunities, form]);

    const handleSuggestPrice = async () => {
        const title = form.getValues('title');
        const condition = form.getValues('condition');
        if (!title || title.length < 3) { toast.info('Enter a title first'); return; }
        if (!condition) { toast.info('Select a condition first'); return; }
        setAiPriceLoading(true);
        setAiPriceSuggestion(null);
        await new Promise(r => setTimeout(r, 1500));
        setAiPriceSuggestion(mockAiPrice(condition));
        setAiPriceLoading(false);
    };

    const applyAiPrice = () => {
        if (aiPriceSuggestion != null) {
            form.setValue('price', aiPriceSuggestion, { shouldValidate: true });
            setAiPriceSuggestion(null);
        }
    };

    const handleSuggestCategory = async () => {
        const title = form.getValues('title');
        if (!title || title.length < 3) { toast.info('Enter a title first'); return; }
        setAiCatLoading(true);
        setAiCatSuggestion(null);
        await new Promise(r => setTimeout(r, 1200));
        setAiCatSuggestion(mockAiCategory(title));
        setAiCatLoading(false);
    };

    const applyAiCategory = () => {
        if (aiCatSuggestion) {
            form.setValue('category', aiCatSuggestion, { shouldValidate: true });
            setAiCatSuggestion(null);
        }
    };

    const onSubmit = async (data) => {
        const hasNewPhotos = photos.length > 0;

        if (!isEditMode && !hasNewPhotos) {
            toast.error('Please upload at least one photo before listing your item.');
            return;
        }

        const payload = {
            ...data,
            imageFiles: photos.map((photo) => photo.file),
            images: isEditMode && !hasNewPhotos ? (initialValues?.images ?? []) : undefined,
        };

        try {
            if (isEditMode) {
                if (!listingId) {
                    toast.error('Unable to update listing: missing listing id.');
                    return;
                }

                await updateItem(listingId, payload);
                toast.success('Listing updated successfully!');
            } else {
                await createItem(payload);
                toast.success('Item listed for borrowing!');
            }

            form.reset(DEFAULT_FORM_VALUES);
            resetTransientState();
            handleDialogOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || (isEditMode ? 'Failed to update listing' : 'Failed to list item'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary">
                                {isEditMode ? 'edit_square' : 'add_box'}
                            </span>
                        </div>
                        <div>
                            <DialogTitle className="text-left text-lg">
                                {isEditMode ? 'Edit Listing' : 'List an Item for Borrowing'}
                            </DialogTitle>
                            <DialogDescription className="text-left text-xs">
                                {isEditMode
                                    ? 'Update your listing details and availability.'
                                    : 'Share with your community and reduce waste.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">

                        {/* Photos */}
                        <PhotoUploader photos={photos} setPhotos={setPhotos} />
                        {isEditMode && initialValues?.images?.length > 0 && photos.length === 0 && (
                            <p className="text-xs text-muted-green -mt-3">
                                Existing photos will be kept unless you upload new ones.
                            </p>
                        )}

                        {/* Community */}
                        <FormField control={form.control} name="communityId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Community <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={communitiesLoading || selectableCommunities.length === 0 || isEditMode}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue
                                                placeholder={communitiesLoading ? 'Loading your communities...' : 'Select community'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent
                                            sideOffset={8}
                                            className={DROPDOWN_CONTENT_CLASS}
                                        >
                                            {selectableCommunities.map((community) => (
                                                <SelectItem
                                                    key={community.id}
                                                    value={community.id}
                                                    className={DROPDOWN_ITEM_CLASS}
                                                >
                                                    <div className="flex items-center justify-between gap-3 w-full">
                                                        <span className="text-sm font-medium leading-snug transition-colors">{community.name}</span>
                                                        <span
                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                                community.role === 'OWNER'
                                                                    ? 'bg-cyan-50 border-cyan-100 text-cyan-700'
                                                                    : 'bg-primary/10 border-primary/20 text-primary'
                                                            }`}
                                                        >
                                                            {community.role === 'OWNER' ? 'Owner' : 'Member'}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                {isEditMode ? (
                                    <FormDescription className="text-xs">
                                        Community cannot be changed when editing an existing listing.
                                    </FormDescription>
                                ) : !communitiesLoading && selectableCommunities.length === 0 ? (
                                    <FormDescription className="text-xs text-amber-700">
                                        You need to create or join a community (and be approved) before listing an item.
                                    </FormDescription>
                                ) : null}
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Title */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item title <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. DeWalt Cordless Drill, Sony Camera…" {...field} className="rounded-xl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Category + AI suggest */}
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <FormControl>
                                            <Select
                                                value={field.value ?? ''}
                                                onValueChange={(value) => field.onChange(value || undefined)}
                                            >
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent sideOffset={8} className={DROPDOWN_CONTENT_CLASS}>
                                                    {resolvedCategoryOptions.map((cat) => (
                                                        <SelectItem key={cat} value={cat} className={DROPDOWN_ITEM_CLASS}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSuggestCategory}
                                        disabled={aiCatLoading}
                                        className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-colors disabled:opacity-60 whitespace-nowrap flex-shrink-0"
                                    >
                                        {aiCatLoading
                                            ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                                        AI Suggest
                                    </button>
                                </div>
                                {aiCatSuggestion && (
                                    <div className="flex items-center gap-2 mt-2 p-2.5 bg-violet-50 rounded-xl border border-violet-100">
                                        <span className="material-symbols-outlined text-violet-500 text-base">auto_awesome</span>
                                        <span className="text-xs text-violet-700 font-medium flex-1">AI suggests: <strong>{aiCatSuggestion}</strong></span>
                                        <button type="button" onClick={applyAiCategory} className="text-xs font-semibold text-violet-700 hover:underline">Apply</button>
                                        <button type="button" onClick={() => setAiCatSuggestion(null)}>
                                            <span className="material-symbols-outlined text-xs text-muted-green">close</span>
                                        </button>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Description */}
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the item — features, what's included, any wear, size or usage notes…"
                                        rows={3}
                                        {...field}
                                        className="rounded-xl resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Condition + Price/day */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="condition" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Condition <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value ?? ''}
                                            onValueChange={(value) => field.onChange(value || undefined)}
                                        >
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Select condition" />
                                            </SelectTrigger>
                                            <SelectContent sideOffset={8} className={DROPDOWN_CONTENT_CLASS}>
                                                {CONDITIONS.map((cond) => (
                                                    <SelectItem key={cond} value={cond} className={DROPDOWN_ITEM_CLASS}>
                                                        {cond}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price per day (₹) <span className="text-red-500">*</span></FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-green text-sm font-semibold">₹</span>
                                                <Input type="number" min={1} placeholder="0" {...field} className="pl-7 rounded-xl" />
                                            </div>
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={handleSuggestPrice}
                                            disabled={aiPriceLoading}
                                            className="flex items-center gap-1 h-10 px-3 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors disabled:opacity-60 whitespace-nowrap flex-shrink-0"
                                        >
                                            {aiPriceLoading
                                                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                                            AI
                                        </button>
                                    </div>
                                    {aiPriceSuggestion != null && (
                                        <div className="flex items-center gap-2 mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                            <span className="material-symbols-outlined text-amber-500 text-base">auto_awesome</span>
                                            <span className="text-xs text-amber-700 font-medium flex-1">Suggested: <strong>₹{aiPriceSuggestion}/day</strong></span>
                                            <button type="button" onClick={applyAiPrice} className="text-xs font-semibold text-amber-700 hover:underline">Use</button>
                                            <button type="button" onClick={() => setAiPriceSuggestion(null)}>
                                                <span className="material-symbols-outlined text-xs text-muted-green">close</span>
                                            </button>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* Availability Window */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <div>
                                <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-primary">event_available</span>
                                    Availability window
                                    <span className="text-xs font-normal text-muted-green">(optional)</span>
                                </p>
                                <p className="text-xs text-muted-green mt-0.5">Let borrowers know when this item is available to borrow</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <FormField control={form.control} name="availableFrom" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">From</FormLabel>
                                        <FormControl>
                                            <DatePickerInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                minDate={new Date().toISOString().split('T')[0]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="availableTo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">To</FormLabel>
                                        <FormControl>
                                            <DatePickerInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                minDate={selectedAvailableFrom || new Date().toISOString().split('T')[0]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Borrow-only notice */}
                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <span className="material-symbols-outlined text-primary text-xl mt-0.5">swap_horiz</span>
                            <div>
                                <p className="text-xs font-semibold text-charcoal">Borrow &amp; Lend only</p>
                                <p className="text-xs text-muted-green mt-0.5">Items are returned after use — no sale, no gifting. Building trust within your community.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => handleDialogOpenChange(false)}
                                className="px-5 py-2.5 text-sm font-medium text-charcoal border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="px-6 py-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                        {isEditMode ? 'Saving…' : 'Listing…'}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                        {isEditMode ? 'Save Changes' : 'List for Borrowing'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateItemModal;
