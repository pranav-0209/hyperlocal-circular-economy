import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppFooter from '../components/ui/AppFooter';
import HomeNavbar from '../components/ui/HomeNavbar';
import MarketplaceGrid from '../components/marketplace/MarketplaceGrid';
import CreateItemModal from '../components/marketplace/CreateItemModal';
import { getItems, getListingCategories } from '../services/marketplaceService';
import { getMyCommunities } from '../services/communityService';
import { ITEM_CATEGORIES } from '../schemas/marketplaceSchema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';

const SORT_OPTIONS = [
    { label: 'Newest first', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
];

const COMMUNITY_FILTER_ALL = 'ALL_COMMUNITIES';
const TOOLBAR_SELECT_CONTENT_CLASS =
    'z-[250] border border-gray-200 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-1';
const TOOLBAR_SELECT_ITEM_CLASS =
    'rounded-lg px-2.5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-gray-50 hover:!text-primary focus:bg-gray-50 focus:text-primary data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold';

const CATEGORY_ICONS = {
    'All': 'category',
    'Electronics': 'devices',
    'Vehicles': 'directions_car',
    'Furniture': 'chair_alt',
    'Appliances': 'kitchen',
    'Books': 'menu_book',
    'Fashion': 'checkroom',
    'Tools': 'hardware',
    'Sports': 'sports_soccer',
    'Kids': 'child_care',
    'Other': 'more_horiz',
};

/**
 * DiscoverPage (/discover)
 * Browse all items with hero search, type tabs, category pills, and sort
 */
export default function DiscoverPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const navigate = useNavigate();

    const syncCommunitySearchParam = useCallback((communityId) => {
        setSearchParams((prevParams) => {
            const nextParams = new URLSearchParams(prevParams);

            if (communityId === COMMUNITY_FILTER_ALL) {
                nextParams.delete('communityId');
            } else {
                nextParams.set('communityId', communityId);
            }

            return nextParams;
        }, { replace: true });
    }, [setSearchParams]);

    const { data: communities = [], isLoading: communitiesLoading } = useQuery({
        queryKey: ['communities', 'discover-filter'],
        queryFn: getMyCommunities,
        staleTime: 1000 * 60,
    });

    const communityOptions = useMemo(() => {
        const eligibleCommunities = communities
            .filter((community) => community.membershipStatus === 'APPROVED' && community.status === 'ACTIVE')
            .sort((a, b) => {
                const adminFirst = Number(b.isAdmin) - Number(a.isAdmin);
                if (adminFirst !== 0) return adminFirst;
                return a.name.localeCompare(b.name);
            })
            .map((community) => ({
                id: community.id,
                name: community.name,
                role: community.isAdmin ? 'Owner' : 'Member',
            }));

        return [
            { id: COMMUNITY_FILTER_ALL, name: 'All Communities', role: null },
            ...eligibleCommunities,
        ];
    }, [communities]);

    const selectedCommunityId = searchParams.get('communityId') || COMMUNITY_FILTER_ALL;

    const selectedCommunityValue = communityOptions.some((community) => community.id === selectedCommunityId)
        ? selectedCommunityId
        : COMMUNITY_FILTER_ALL;

    const selectedCommunity = useMemo(
        () => communityOptions.find((community) => community.id === selectedCommunityValue),
        [communityOptions, selectedCommunityValue]
    );

    useEffect(() => {
        if (communitiesLoading || selectedCommunityId === COMMUNITY_FILTER_ALL) {
            return;
        }

        const isKnownCommunity = communityOptions.some((community) => community.id === selectedCommunityId);
        if (!isKnownCommunity) {
            syncCommunitySearchParam(COMMUNITY_FILTER_ALL);
        }
    }, [communitiesLoading, communityOptions, selectedCommunityId, syncCommunitySearchParam]);

    const { data: items = [], isLoading, refetch } = useQuery({
        queryKey: ['marketplaceItems', searchQuery, selectedCategory, selectedCommunityId],
        queryFn: () => getItems({
            search: searchQuery,
            category: selectedCategory === 'All' ? undefined : selectedCategory,
            communityId: selectedCommunityId === COMMUNITY_FILTER_ALL ? undefined : selectedCommunityId,
        }),
    });

    const { data: categoryOptions = ITEM_CATEGORIES } = useQuery({
        queryKey: ['listingCategories'],
        queryFn: getListingCategories,
        staleTime: 1000 * 60 * 5,
    });

    const categories = ['All', ...(categoryOptions.length ? categoryOptions : ITEM_CATEGORIES)];

    const sortedItems = useMemo(() => {
        const copy = [...items];
        if (sortBy === 'price_asc') return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        if (sortBy === 'price_desc') return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        return copy.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    }, [items, sortBy]);

    const hasActiveFilters =
        selectedCategory !== 'All' ||
        Boolean(searchQuery) ||
        selectedCommunityId !== COMMUNITY_FILTER_ALL;

    const handleCommunityFilterChange = (communityId) => {
        syncCommunitySearchParam(communityId);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSortBy('newest');
        syncCommunitySearchParam(COMMUNITY_FILTER_ALL);
    };

    const openDetail = (item) => {
        navigate(`/discover/item/${item.id}`, { state: { item } });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <HomeNavbar />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="pt-16 bg-white border-b border-gray-100">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-14">

                        {/* Left: Text + Search */}
                        <div className="flex-1 min-w-0">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
                                <span className="material-symbols-outlined text-base">location_on</span>
                                Hyperlocal Marketplace
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3 leading-tight">
                                Borrow, Share &amp; Trade<br />
                                <span className="text-primary">within your community</span>
                            </h1>
                            <p className="text-muted-green text-base mb-8">
                                Find tools, books, gear and more from neighbours you can trust.
                            </p>

                            {/* Search Bar */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-green text-xl">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search for items, tools, books…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-green hover:text-charcoal"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-3.5 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    List Item
                                </button>
                            </div>

                            {/* Community scope notice — left aligned, under search */}
                            <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-green bg-gray-50 border border-gray-200 px-3 py-2 rounded-full">
                                <span className="material-symbols-outlined text-sm text-primary">groups</span>
                                Showing items from communities you&apos;ve joined or created
                            </div>
                        </div>

                        {/* Right: Visual Panel — desktop only */}
                        <div className="hidden lg:block w-[340px] flex-shrink-0">
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 rounded-2xl overflow-hidden">

                                {/* Compact stats row */}
                                <div className="grid grid-cols-3 divide-x divide-primary/15 border-b border-primary/15">
                                    {[
                                        { icon: 'inventory_2', value: '14', label: 'Items' },
                                        { icon: 'handshake', value: '9', label: 'Categories' },
                                        { icon: 'groups', value: '3', label: 'Communities' },
                                    ].map((s) => (
                                        <div key={s.label} className="flex flex-col items-center py-4 px-2 gap-1">
                                            <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
                                            <p className="text-lg font-bold text-charcoal leading-none">{s.value}</p>
                                            <p className="text-[10px] text-muted-green text-center">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* How it works */}
                                <div className="p-5">
                                    <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">How it works</p>
                                    <div className="space-y-4">
                                        {[
                                            { step: '1', icon: 'search', title: 'Browse', text: 'Find items shared by neighbours in your communities' },
                                            { step: '2', icon: 'send', title: 'Request', text: 'Send a borrow request with your preferred dates' },
                                            { step: '3', icon: 'handshake', title: 'Collect & Return', text: 'Pick up, use responsibly, and return on time' },
                                        ].map((s) => (
                                            <div key={s.step} className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                    {s.step}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-charcoal">{s.title}</p>
                                                    <p className="text-xs text-muted-green leading-relaxed mt-0.5">{s.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Verified badge */}
                                    <div className="mt-5 flex items-center gap-2 bg-white/60 border border-primary/15 rounded-xl px-3 py-2.5">
                                        <span className="material-symbols-outlined text-green-600 text-lg">verified_user</span>
                                        <p className="text-xs text-charcoal font-medium">Verified neighbours only — safe &amp; trusted</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Borrow & Lend banner strip ─────────────────────── */}
            <div className="bg-white border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary text-white flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">swap_horiz</span>
                        </span>
                        <span className="text-sm font-semibold text-charcoal">Borrow &amp; Lend</span>
                        <span className="hidden sm:inline text-sm text-muted-green">— build trust, reduce waste within your community</span>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="sm:hidden flex items-center gap-1 text-primary text-sm font-semibold"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        List
                    </button>
                </div>
            </div>

            {/* ── Main Layout ───────────────────────────────────────── */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-8">
                <div className="flex gap-8">

                    {/* Sidebar — desktop only */}
                    <aside className="hidden lg:block w-56 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-32">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold tracking-widest text-muted-green uppercase">Category</span>
                                {selectedCategory !== 'All' && (
                                    <button onClick={() => setSelectedCategory('All')} className="text-xs text-primary hover:underline">
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="space-y-0.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                                            selectedCategory === cat
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'text-charcoal hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${selectedCategory === cat ? 'text-primary' : 'text-muted-green'}`}>
                                            {CATEGORY_ICONS[cat] ?? 'label'}
                                        </span>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-5 border-t border-gray-100">
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    List an Item
                                </button>
                            </div>
                        </div>

                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0">

                        {/* Category pills — mobile */}
                        <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar mb-5 -mx-4 px-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-charcoal border-gray-200 hover:border-primary/50'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {CATEGORY_ICONS[cat] ?? 'label'}
                                    </span>
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Toolbar: count + sort + clear */}
                        <div className="flex items-center justify-between mb-5 gap-4">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-muted-green">
                                    {isLoading ? (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                            Loading…
                                        </span>
                                    ) : (
                                        <span>
                                            <span className="font-bold text-charcoal">{sortedItems.length}</span> result{sortedItems.length !== 1 ? 's' : ''}
                                            {selectedCategory !== 'All' && <span> in <strong className="text-charcoal">{selectedCategory}</strong></span>}
                                            {selectedCommunity && selectedCommunity.id !== COMMUNITY_FILTER_ALL && (
                                                <span> from <strong className="text-charcoal">{selectedCommunity.name}</strong></span>
                                            )}
                                        </span>
                                    )}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-muted-green transition-all duration-200 hover:border-primary/20 hover:bg-gray-100 hover:text-primary"
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">close</span>
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                                <div className="w-44 sm:w-48">
                                    <Select value={selectedCommunityValue} onValueChange={handleCommunityFilterChange}>
                                        <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                                            <SelectValue placeholder={communitiesLoading ? 'Loading communities...' : 'All Communities'} />
                                        </SelectTrigger>
                                        <SelectContent className={TOOLBAR_SELECT_CONTENT_CLASS} position="popper">
                                            {communityOptions.map((community) => (
                                                <SelectItem key={community.id} value={community.id} hideIndicator className={TOOLBAR_SELECT_ITEM_CLASS}>
                                                    <div className="grid w-full min-w-0 grid-cols-[1fr_auto] items-center gap-3">
                                                        <span className="block min-w-0 truncate text-left">{community.name}</span>
                                                        {community.role && (
                                                            <span className={`justify-self-end text-[10px] font-semibold uppercase tracking-wide ${
                                                                community.role === 'Owner' ? 'text-primary' : 'text-muted-green'
                                                            }`}>
                                                                {community.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-40 sm:w-44">
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                                            <SelectValue placeholder="Sort items" />
                                        </SelectTrigger>
                                        <SelectContent className={TOOLBAR_SELECT_CONTENT_CLASS} position="popper">
                                            {SORT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} hideIndicator className={TOOLBAR_SELECT_ITEM_CLASS}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <MarketplaceGrid
                            items={sortedItems}
                            isLoading={isLoading}
                            onRequest={openDetail}
                            onCreate={() => setIsCreateModalOpen(true)}
                        />
                    </div>
                </div>
            </main>

            {/* Modals */}
            <CreateItemModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => refetch()}
            />
            <AppFooter />
        </div>
    );
}
