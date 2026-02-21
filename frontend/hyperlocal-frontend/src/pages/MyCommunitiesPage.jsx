import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeNavbar from '../components/ui/HomeNavbar';
import { useJoinCommunity, useLeaveCommunity } from '../hooks/useCommunityMutations';
import { joinCommunitySchema } from '../schemas/communitySchemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Defined outside component to prevent recreation on each render
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

/**
 * MyCommunitiesPage (/my-communities)
 * Manage all joined communities
 */
export default function MyCommunitiesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const shouldReduceMotion = useReducedMotion();

    // React Query mutations
    const joinMutation = useJoinCommunity();
    const leaveMutation = useLeaveCommunity();

    // UI states
    const [showJoinModal, setShowJoinModal] = useState(false);

    const handleLeaveCommunity = (community) => {
        if (community.role === 'admin') return;
        if (!window.confirm(`Leave "${community.name}"? You will need the invite code to rejoin.`)) return;
        leaveMutation.mutate(community.id);
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal mb-2">My Communities</h1>
                        <p className="text-muted-green">Manage your {user.communities.length} {user.communities.length === 1 ? 'community' : 'communities'}</p>
                    </div>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Join Another
                    </button>
                </div>

                {/* Communities Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial={shouldReduceMotion ? false : 'hidden'}
                    animate="show"
                >
                    {user.communities.map((community) => (
                        <motion.div
                            key={community.id}
                            variants={itemVariants}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="material-symbols-outlined text-4xl">groups</span>
                                    {community.role === 'admin' && (
                                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-bold">
                                            ADMIN
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-1">{community.name}</h3>
                                <p className="text-sm text-white/80">{community.memberCount || '?'} members</p>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Community Code */}
                                <div className="mb-4">
                                    <p className="text-xs text-muted-green mb-1">Community Code</p>
                                    <div className="flex items-center gap-2">
                                        <code className="px-3 py-1.5 bg-gray-100 rounded-md font-mono text-sm font-bold text-charcoal">
                                            {community.code}
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(community.code)}
                                            className="p-1.5 text-muted-green hover:text-primary transition-colors"
                                            title="Copy code"
                                        >
                                            <span className="material-symbols-outlined text-sm">content_copy</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                {community.description && (
                                    <p className="text-sm text-muted-green mb-4 line-clamp-2">
                                        {community.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/dashboard?community=${community.id}`)}
                                        className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:brightness-110 transition-all"
                                    >
                                        View Dashboard
                                    </button>
                                    {community.role !== 'admin' && (
                                        <button
                                            onClick={() => handleLeaveCommunity(community)}
                                            className="px-3 py-2 border border-gray-200 text-muted-green rounded-lg hover:bg-gray-50 transition-colors"
                                            title="Leave community"
                                        >
                                            <span className="material-symbols-outlined text-sm">logout</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                    }
                </motion.div>
            </main>

            {/* Join Community Modal */}
            <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
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
