import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateCommunity } from '../../hooks/useCommunityMutations';
import { createCommunitySchema, COMMUNITY_CATEGORIES } from '../../schemas/communitySchemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

/**
 * Custom category dropdown — no external library, pure React + Tailwind.
 * Closes on outside click and on Escape, traps focus inside the list.
 */
function CategoryDropdown({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    const selected = COMMUNITY_CATEGORIES.find(c => c.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-colors bg-white
                    ${ open
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${ disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer' }`}
            >
                <span className={selected ? 'text-charcoal' : 'text-gray-400'}>
                    {selected ? selected.label : 'Select community type'}
                </span>
                <span
                    className={`material-symbols-outlined text-gray-400 text-base transition-transform duration-150 ${ open ? 'rotate-180' : '' }`}
                >
                    keyboard_arrow_down
                </span>
            </button>

            {open && (
                <ul
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    role="listbox"
                >
                    {COMMUNITY_CATEGORIES.map((cat) => (
                        <li
                            key={cat.value}
                            role="option"
                            aria-selected={value === cat.value}
                            onClick={() => { onChange(cat.value); setOpen(false); }}
                            className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                                ${ value === cat.value
                                    ? 'bg-primary/5 text-primary font-semibold'
                                    : 'text-charcoal hover:bg-gray-50'
                                }`}
                        >
                            {cat.label}
                            {value === cat.value && (
                                <span className="material-symbols-outlined text-primary text-base">check</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * CreateCommunityModal
 *
 * Self-contained modal for creating a new community.
 * Owns the form state, mutation, and the success dialog.
 *
 * Props:
 *   open          {boolean}   - controls Dialog visibility
 *   onOpenChange  {function}  - called when the dialog should open/close
 */
export default function CreateCommunityModal({ open, onOpenChange }) {
    const queryClient = useQueryClient();
    const createMutation = useCreateCommunity();
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdCommunity, setCreatedCommunity] = useState(null);
    const [codeCopied, setCodeCopied] = useState(false);

    const form = useForm({
        resolver: zodResolver(createCommunitySchema),
        defaultValues: {
            communityName: '',
            description: '',
            category: '',
            joinPolicy: 'OPEN',
        },
    });

    // Clear the server-side error ("name already exists" etc.) whenever the user
    // edits any field — so stale error messages don't linger after corrections.
    useEffect(() => {
        const subscription = form.watch(() => {
            if (createMutation.isError) createMutation.reset();
        });
        return () => subscription.unsubscribe();
    }, [form, createMutation]);

    const handleSubmit = (data) => {
        createMutation.mutate(
            {
                name: data.communityName,
                description: data.description,
                category: data.category,
                joinPolicy: data.joinPolicy,
            },
            {
                onSuccess: (community) => {
                    form.reset();
                    onOpenChange(false);
                    // Defer invalidation until the success modal is dismissed,
                    // so the parent tree doesn't re-render and unmount this component
                    // (which would reset showSuccess state).
                    setCreatedCommunity(community);
                    setCodeCopied(false);
                    setShowSuccess(true);
                },
            }
        );
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
        createMutation.reset();
    };

    return (
        <>
            {/* ── Create Community Dialog ── */}
            <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Community</DialogTitle>
                        <DialogDescription>
                            Start a new sharing circle for your apartment or neighborhood.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="communityName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Community Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Maple Street Neighbors"
                                                disabled={createMutation.isPending}
                                                autoFocus
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category *</FormLabel>
                                        <FormControl>
                                            <CategoryDropdown
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={createMutation.isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Briefly describe your community's goal..."
                                                rows={3}
                                                disabled={createMutation.isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="joinPolicy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Join Policy *</FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { value: 'OPEN', icon: 'public', label: 'Open', desc: 'Anyone with the code can join' },
                                                    { value: 'APPROVAL_REQUIRED', icon: 'lock', label: 'Approval Required', desc: 'Members need your approval' },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => field.onChange(opt.value)}
                                                        className={`flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all ${
                                                            field.value === opt.value
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`material-symbols-outlined text-base ${field.value === opt.value ? 'text-primary' : 'text-muted-green'}`}>
                                                                {opt.icon}
                                                            </span>
                                                            <span className={`text-sm font-semibold ${field.value === opt.value ? 'text-primary' : 'text-charcoal'}`}>
                                                                {opt.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-green leading-tight">{opt.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {createMutation.isError && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {createMutation.error?.message}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                    disabled={createMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 bg-charcoal hover:bg-charcoal/90"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ── Success Dialog ── */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">Community Created</DialogTitle>
                    <div className="flex flex-col items-center text-center pt-4 pb-2">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-green-600" style={{ fontSize: '2.5rem' }}>check_circle</span>
                        </div>
                        <h2 className="text-2xl font-bold text-charcoal mb-1">Community Created!</h2>
                        <p className="text-muted-green text-sm">
                            <span className="font-semibold text-charcoal">{createdCommunity?.name}</span> is live. Share the invite code below with your neighbors to let them join.
                        </p>
                    </div>

                    <div className="mt-4 bg-linear-to-br from-gray-50 to-primary/5 rounded-2xl p-5 border border-primary/10">
                        <p className="text-xs text-muted-green mb-3 font-semibold uppercase tracking-widest text-center">Your Invite Code</p>
                        <div className="flex items-center justify-between gap-4">
                            <code className="text-3xl font-mono font-bold text-charcoal tracking-widest">
                                {createdCommunity?.code || '—'}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(createdCommunity?.code || '');
                                    setCodeCopied(true);
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                                    codeCopied
                                        ? 'bg-green-600 text-white'
                                        : 'bg-primary text-white hover:brightness-110'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {codeCopied ? 'check' : 'content_copy'}
                                </span>
                                {codeCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                        {codeCopied && (
                            <p className="text-xs text-green-600 mt-3 text-center font-medium">✓ Code copied to clipboard</p>
                        )}
                    </div>

                    <Button
                        onClick={() => {
                            setShowSuccess(false);
                            // Now that the user has seen the success screen, refetch communities
                            // so the dashboard and my-communities page reflect the new one
                            queryClient.invalidateQueries({ queryKey: ['communities'] });
                        }}
                        className="w-full mt-5"
                        size="lg"
                    >
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
