import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeNavbar from '../components/ui/HomeNavbar';
import { useJoinCommunity } from '../hooks/useCommunityMutations';
import { joinCommunitySchema } from '../schemas/communitySchemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import CreateCommunityModal from '../components/ui/CreateCommunityModal';

// Defined outside component to prevent recreation on each render
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

/** Card for communities where the user is an admin */
function AdminCommunityCard({ community, onNavigate }) {
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(community.code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
        <motion.div
            variants={itemVariants}
            onClick={() => onNavigate(community.id)}
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
            {/* Cyan admin header */}
            <div className="bg-linear-to-br from-cyan-800 to-cyan-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                        <span className="material-symbols-outlined text-4xl text-white/70">admin_panel_settings</span>
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-md text-xs font-bold tracking-wide">
                            ADMIN
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{community.name}</h3>
                    <p className="text-sm text-white/60">{community.memberCount ?? '?'} members</p>

                    {/* Invite code in header */}
                    <div className="mt-4 flex items-center gap-2">
                        <code className="flex-1 px-3 py-1.5 bg-white/10 rounded-lg font-mono text-sm font-bold tracking-widest text-white">
                            {community.code}
                        </code>
                        <button
                            onClick={handleCopy}
                            title="Copy invite code"
                            className={`p-1.5 rounded-lg transition-all text-xs font-medium flex items-center gap-1 ${
                                codeCopied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{codeCopied ? 'check' : 'content_copy'}</span>
                            {codeCopied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {community.description && (
                    <p className="text-sm text-muted-green mb-4 line-clamp-2">{community.description}</p>
                )}

                {/* Admin quick-actions */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-green">
                        <span className="material-symbols-outlined text-sm text-cyan-300">people</span>
                        View members
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-green">
                        <span className="material-symbols-outlined text-sm text-cyan-300">how_to_reg</span>
                        Approve joins
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-green">
                        <span className="material-symbols-outlined text-sm text-cyan-300">storefront</span>
                        Manage listings
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-green">
                        <span className="material-symbols-outlined text-sm text-cyan-300">bar_chart</span>
                        Analytics
                    </div>
                </div>

                <div className="w-full py-2.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-cyan-100 transition-colors">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Manage Community
                </div>
            </div>
        </motion.div>
    );
}

/** Card for communities where the user is a regular member */
function MemberCommunityCard({ community, onNavigate }) {
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(community.code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
        <motion.div
            variants={itemVariants}
            onClick={() => onNavigate(community.id)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
            {/* Green gradient header */}
            <div className="bg-linear-to-r from-primary to-primary/80 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                    <span className="material-symbols-outlined text-4xl">groups</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{community.name}</h3>
                <p className="text-sm text-white/80">{community.memberCount ?? '?'} members</p>

                {/* Invite code in header (matching admin card style) */}
                <div className="mt-4 flex items-center gap-2">
                    <code className="flex-1 px-3 py-1.5 bg-white/15 rounded-lg font-mono text-sm font-bold tracking-widest text-white">
                        {community.code}
                    </code>
                    <button
                        onClick={handleCopy}
                        title="Copy invite code"
                        className={`p-1.5 rounded-lg transition-all text-xs font-medium flex items-center gap-1 ${
                            codeCopied ? 'bg-white text-primary' : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{codeCopied ? 'check' : 'content_copy'}</span>
                        {codeCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {community.description && (
                    <p className="text-sm text-muted-green mb-4 line-clamp-2">{community.description}</p>
                )}

                <div className="py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-medium text-sm text-center group-hover:bg-primary/15 transition-colors">
                    View Dashboard
                </div>
            </div>
        </motion.div>
    );
}

/**
 * MyCommunitiesPage (/my-communities)
 * Manage all joined communities — split into admin-managed and member-joined sections
 */
export default function MyCommunitiesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const shouldReduceMotion = useReducedMotion();

    // React Query mutations
    const joinMutation = useJoinCommunity();

    // UI states
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // React Hook Form instance
    const joinForm = useForm({
        resolver: zodResolver(joinCommunitySchema),
        defaultValues: { code: '' },
    });

    const handleJoinCommunity = (data) => {
        joinMutation.mutate(data.code, {
            onSuccess: () => {
                joinForm.reset();
                setShowJoinModal(false);
            },
        });
    };

    if (!user?.communities || user.communities.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <HomeNavbar />
                <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">groups_off</span>
                        <h2 className="text-2xl font-bold text-charcoal mb-2">No Communities Yet</h2>
                        <p className="text-muted-green mb-6">Join or create a community to start sharing!</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const adminCommunities = user.communities.filter(c => c.role === 'admin');
    const memberCommunities = user.communities.filter(c => c.role === 'member');

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal mb-2">My Communities</h1>
                        <p className="text-muted-green">
                            {adminCommunities.length} managed · {memberCommunities.length} joined
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 bg-cyan-700 text-white rounded-lg font-bold hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-700/20"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Create Community
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">group_add</span>
                            Join Community
                        </button>
                    </div>
                </div>

                {/* ── Section 1: Communities I Manage ── */}
                {adminCommunities.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-cyan-700 rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-sm">admin_panel_settings</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-charcoal">Communities I Manage</h2>
                                <p className="text-xs text-muted-green">Full admin access — manage members, listings &amp; settings</p>
                            </div>
                        </div>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial={shouldReduceMotion ? false : 'hidden'}
                            animate="show"
                        >
                            {adminCommunities.map((community) => (
                                <AdminCommunityCard
                                    key={community.id}
                                    community={community}
                                    onNavigate={(id) => navigate(`/dashboard?community=${id}`)}
                                />
                            ))}
                        </motion.div>
                    </section>
                )}

                {/* ── Section 2: Communities I've Joined ── */}
                {memberCommunities.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-sm">groups</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-charcoal">Communities I&apos;ve Joined</h2>
                                <p className="text-xs text-muted-green">Participate in sharing &amp; browse listings</p>
                            </div>
                        </div>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial={shouldReduceMotion ? false : 'hidden'}
                            animate="show"
                        >
                            {memberCommunities.map((community) => (
                                <MemberCommunityCard
                                    key={community.id}
                                    community={community}
                                    onNavigate={(id) => navigate(`/dashboard?community=${id}`)}
                                />
                            ))}
                        </motion.div>
                    </section>
                )}
            </main>

            <CreateCommunityModal open={showCreateModal} onOpenChange={setShowCreateModal} />

            {/* Join Community Modal */}            <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Join Another Community</DialogTitle>
                        <DialogDescription>
                            Enter a community code to join another neighborhood group.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...joinForm}>
                        <form onSubmit={joinForm.handleSubmit(handleJoinCommunity)} className="space-y-4">
                            <FormField
                                control={joinForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Community Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. ABC-1234"
                                                disabled={joinMutation.isPending}
                                                autoFocus
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {joinMutation.isError && (
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                                    {joinMutation.error.message}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowJoinModal(false);
                                        joinForm.reset();
                                        joinMutation.reset();
                                    }}
                                    className="flex-1"
                                    disabled={joinMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={joinMutation.isPending}
                                    className="flex-1 shadow-lg"
                                >
                                    {joinMutation.isPending ? 'Joining...' : 'Join Community'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}