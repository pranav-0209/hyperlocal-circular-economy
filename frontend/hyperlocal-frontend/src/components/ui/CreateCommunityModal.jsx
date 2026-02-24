import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCommunity } from '../../hooks/useCommunityMutations';
import { createCommunitySchema, COMMUNITY_CATEGORIES } from '../../schemas/communitySchemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
                                        <Select
                                            modal={false}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={createMutation.isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select community type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="z-[300]">
                                                {COMMUNITY_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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

                    <Button onClick={() => setShowSuccess(false)} className="w-full mt-5" size="lg">
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
