import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AppFooter from '../components/ui/AppFooter';
import HomeNavbar from '../components/ui/HomeNavbar';
import { useJoinCommunity, useMyCommunities } from '../hooks/useCommunityMutations';
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
    return (
        <motion.div
            variants={itemVariants}
            onClick={() => onNavigate(community.id)}
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
            {/* Cyan admin header */}
            <div className="bg-linear-to-br from-cyan-800 to-cyan-600 p-7 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                        <span className="material-symbols-outlined text-5xl text-white/70">admin_panel_settings</span>
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-md text-xs font-bold tracking-wide">
                            ADMIN
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{community.name}</h3>
                    <p className="text-base text-white/60">{community.memberCount ?? '?'} members</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {community.description && (
                    <p className="text-base text-muted-green mb-3 line-clamp-2">{community.description}</p>
                )}

                {/* Join policy */}
                <div className="flex items-center gap-1.5 text-sm text-muted-green mb-4">
                    <span className="material-symbols-outlined text-sm text-cyan-600">
                        {community.joinPolicy === 'APPROVAL_REQUIRED' ? 'lock' : 'public'}
                    </span>
                    <span>Join Policy: <span className="font-semibold text-charcoal">{community.joinPolicy === 'APPROVAL_REQUIRED' ? 'Approval Required' : 'Open'}</span></span>
                </div>

                <div className="w-full py-3 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-lg font-semibold text-base flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                    Manage Community
                </div>
            </div>
        </motion.div>
    );
}

/** Card for communities where the user is a regular member */
function MemberCommunityCard({ community, onNavigate }) {
    return (
        <motion.div
            variants={itemVariants}
            onClick={() => onNavigate(community.id)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
            {/* Green gradient header */}
            <div className="bg-linear-to-r from-primary to-primary/80 p-7 text-white">
                <div className="flex items-start justify-between mb-3">
                    <span className="material-symbols-outlined text-5xl">groups</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{community.name}</h3>
                <p className="text-base text-white/80">{community.memberCount ?? '?'} members</p>
            </div>

            {/* Content */}
            <div className="p-6">
                {community.description && (
                    <p className="text-base text-muted-green mb-4 line-clamp-2">{community.description}</p>
                )}

                <div className="py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-medium text-base text-center group-hover:bg-primary/15 transition-colors">
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

    const { data: freshCommunities, isLoading } = useMyCommunities();
    const joinMutation = useJoinCommunity();

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    // null = auto (resolved after data loads)
    const [activeTab, setActiveTab] = useState(null);

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

    const communities = (freshCommunities ?? user?.communities ?? []).filter(c => c.id && c.name);

    if (isLoading && communities.length === 0) {
        return (
                <div className="min-h-screen bg-gray-50 flex flex-col">
                <HomeNavbar />
                <main className="pt-[88px] pb-8 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 animate-spin">progress_activity</span>
                        <p className="text-muted-green mt-4">Loading communities...</p>
                    </div>
                </main>
                <AppFooter />
            </div>
        );
    }

    if (!isLoading && communities.length === 0) {
        return (
                <div className="min-h-screen bg-gray-50 flex flex-col">
                <HomeNavbar />
                <main className="pt-[88px] pb-8 px-4 sm:px-6 lg:px-8 flex-1">
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
                <AppFooter />
            </div>
        );
    }

    const sortNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    const adminCommunities  = communities.filter(c => c.isAdmin === true).sort(sortNewest);
    const memberCommunities = communities.filter(c => !c.isAdmin && c.membershipStatus !== 'PENDING').sort(sortNewest);
    const pendingCommunities = communities.filter(c => c.membershipStatus === 'PENDING');

    // Smart default: if user has only one type, auto-select that tab
    const defaultTab = adminCommunities.length > 0 ? 'manage' : 'joined';
    const resolvedTab = activeTab ?? defaultTab;

    const tabItems = [
        {
            key: 'manage',
            label: 'Communities I Manage',
            count: adminCommunities.length,
            icon: 'admin_panel_settings',
            activeColor: 'bg-cyan-700 text-white',
            inactiveColor: 'text-gray-500 hover:text-charcoal hover:bg-gray-100',
        },
        {
            key: 'joined',
            label: "Communities I've Joined",
            count: memberCommunities.length,
            icon: 'groups',
            activeColor: 'bg-primary text-white',
            inactiveColor: 'text-gray-500 hover:text-charcoal hover:bg-gray-100',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <HomeNavbar />

            <main className="pt-[88px] pb-8 px-4 sm:px-6 lg:px-8 flex-1">
                {/* ── Header (unchanged) ── */
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-charcoal mb-2">My Communities</h1>
                        <p className="text-muted-green">
                            {adminCommunities.length} managed · {memberCommunities.length} joined{pendingCommunities.length > 0 ? ` · ${pendingCommunities.length} pending` : ''}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-cyan-700 text-white rounded-lg font-bold hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-700/20"
                        >
                            <span className="material-symbols-outlined text-xl">add_circle</span>
                            Create Community
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-xl">group_add</span>
                            Join Community
                        </button>
                    </div>
                </div>
                }
                {pendingCommunities.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-sm">hourglass_empty</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-charcoal">Awaiting Approval</h2>
                                <p className="text-xs text-muted-green">Your join requests are pending admin review</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingCommunities.map((community) => (
                                <div key={community.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                                    <div className="bg-linear-to-r from-amber-50 to-orange-50 p-5 border-b border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-charcoal">{community.name}</h3>
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>
                                        </div>
                                        <p className="text-xs text-muted-green mt-1">{community.category}</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-muted-green flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm text-amber-400">info</span>
                                            Waiting for the admin to approve your request.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Toggle Panel ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Tab bar */}
                    <div className="grid grid-cols-2 border-b border-gray-200">
                        {tabItems.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center justify-center gap-2 py-5 px-6 text-base font-semibold transition-all ${
                                    resolvedTab === tab.key
                                        ? tab.key === 'manage'
                                            ? 'text-cyan-700 border-b-2 border-cyan-700 bg-cyan-50/50'
                                            : 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-gray-400 hover:text-charcoal hover:bg-gray-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                                {tab.label}
                                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                                    resolvedTab === tab.key
                                        ? tab.key === 'manage' ? 'bg-cyan-100 text-cyan-700' : 'bg-primary/10 text-primary'
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-6">
                        {resolvedTab === 'manage' && (
                            adminCommunities.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-symbols-outlined text-gray-200 text-6xl">admin_panel_settings</span>
                                    <p className="text-muted-green mt-3 text-sm">You don't manage any communities yet.</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 px-5 py-2.5 bg-cyan-700 text-white rounded-lg font-semibold text-sm hover:bg-cyan-600 transition-colors"
                                    >
                                        Create a Community
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    variants={containerVariants}
                                    initial={shouldReduceMotion ? false : 'hidden'}
                                    animate="show"
                                    key="manage"
                                >
                                    {adminCommunities.map((community) => (
                                        <AdminCommunityCard
                                            key={community.id}
                                            community={community}
                                            onNavigate={(id) => navigate(`/dashboard?community=${id}`)}
                                        />
                                    ))}
                                </motion.div>
                            )
                        )}

                        {resolvedTab === 'joined' && (
                            memberCommunities.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-symbols-outlined text-gray-200 text-6xl">groups</span>
                                    <p className="text-muted-green mt-3 text-sm">You haven't joined any communities yet.</p>
                                    <button
                                        onClick={() => setShowJoinModal(true)}
                                        className="mt-4 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-colors"
                                    >
                                        Join a Community
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    variants={containerVariants}
                                    initial={shouldReduceMotion ? false : 'hidden'}
                                    animate="show"
                                    key="joined"
                                >
                                    {memberCommunities.map((community) => (
                                        <MemberCommunityCard
                                            key={community.id}
                                            community={community}
                                            onNavigate={(id) => navigate(`/dashboard?community=${id}`)}
                                        />
                                    ))}
                                </motion.div>
                            )
                        )}
                    </div>
                </div>
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
            <AppFooter />
        </div>
    );
}