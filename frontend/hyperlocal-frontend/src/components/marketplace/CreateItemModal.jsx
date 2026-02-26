import React, { useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { marketplaceSchema, ITEM_CATEGORIES, CONDITIONS } from '../../schemas/marketplaceSchema';
import { createItem } from '../../services/marketplaceService';
import { toast } from 'sonner';

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
                    Photos <span className="text-xs font-normal text-muted-green">(up to 5)</span>
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

const CreateItemModal = ({ open, onOpenChange, communityId, onSuccess }) => {
    const [photos, setPhotos] = useState([]);
    const [aiPriceLoading, setAiPriceLoading] = useState(false);
    const [aiPriceSuggestion, setAiPriceSuggestion] = useState(null);
    const [aiCatLoading, setAiCatLoading] = useState(false);
    const [aiCatSuggestion, setAiCatSuggestion] = useState(null);
    const [availFromMin, setAvailFromMin] = useState('');

    const form = useForm({
        resolver: zodResolver(marketplaceSchema),
        defaultValues: { title: '', description: '', category: undefined, type: 'RENT', price: '', condition: undefined, availableFrom: '', availableTo: '' },
    });

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
        try {
            await createItem({ ...data, communityId });
            toast.success('Item listed for borrowing!');
            form.reset();
            form.reset({ title: '', description: '', category: undefined, type: 'RENT', price: '', condition: undefined, availableFrom: '', availableTo: '' });
            setPhotos([]);
            setAiPriceSuggestion(null);
            setAiCatSuggestion(null);
            setAvailFromMin('');
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch {
            toast.error('Failed to list item');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary">add_box</span>
                        </div>
                        <div>
                            <DialogTitle className="text-left text-lg">List an Item for Borrowing</DialogTitle>
                            <DialogDescription className="text-left text-xs">
                                Share with your community &mdash; earn trust, reduce waste.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">

                        {/* Photos */}
                        <PhotoUploader photos={photos} setPhotos={setPhotos} />

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
                                            <select
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value || undefined)}
                                                className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-charcoal focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select category</option>
                                                {ITEM_CATEGORIES.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
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
                                        <select
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value || undefined)}
                                            className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-charcoal focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select condition</option>
                                            {CONDITIONS.map((cond) => (
                                                <option key={cond} value={cond}>{cond}</option>
                                            ))}
                                        </select>
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
                                    <FormDescription className="text-xs">Borrower pays per day</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* Availability Window */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <div>
                                <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-primary">event_available</span>
                                    Availability window
                                    <span className="text-xs font-normal text-muted-green">(optional)</span>
                                </p>
                                <p className="text-xs text-muted-green mt-0.5">Let borrowers know when this item is available to borrow</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="availableFrom" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">From</FormLabel>
                                        <FormControl>
                                            <input
                                                type="date"
                                                value={field.value}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    setAvailFromMin(e.target.value);
                                                }}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-charcoal focus:outline-none focus:border-primary cursor-pointer"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="availableTo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">To</FormLabel>
                                        <FormControl>
                                            <input
                                                type="date"
                                                {...field}
                                                min={availFromMin || new Date().toISOString().split('T')[0]}
                                                className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-charcoal focus:outline-none focus:border-primary cursor-pointer"
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
                                onClick={() => onOpenChange(false)}
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
                                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Listing…</>
                                ) : (
                                    <><span className="material-symbols-outlined text-base">check_circle</span>List for Borrowing</>
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
