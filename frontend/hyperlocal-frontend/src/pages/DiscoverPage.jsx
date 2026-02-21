import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '../components/ui/HomeNavbar';
import MarketplaceGrid from '../components/marketplace/MarketplaceGrid';
import CreateItemModal from '../components/marketplace/CreateItemModal';
import ItemDetailModal from '../components/marketplace/ItemDetailModal';
import { getItems } from '../services/marketplaceService';
import { ITEM_CATEGORIES } from '../schemas/marketplaceSchema';
import { Button } from "@/components/ui/button";

/**
 * DiscoverPage (/discover)
 * Browse all items from all communities with filters
 */
export default function DiscoverPage() {

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Fetch items using React Query
    const { data: items = [], isLoading, refetch } = useQuery({
        queryKey: ['marketplaceItems', searchQuery, selectedCategory, selectedType],
        queryFn: () => getItems({
            search: searchQuery,
            category: selectedCategory === 'All' ? undefined : selectedCategory,
            type: selectedType === 'All' ? undefined : selectedType,
        }),
    });

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedType('All');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <HomeNavbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-charcoal">Filters</h2>
                                {(searchQuery || selectedCategory !== 'All' || selectedType !== 'All') && (
                                    <button onClick={clearFilters} className="text-xs text-primary font-medium hover:underline">
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Type Filter */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-charcoal mb-3">LISTING TYPE</h3>
                                <div className="space-y-2">
                                    {['All', 'GIFT', 'RENT', 'SALE'].map((type) => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                checked={selectedType === type}
                                                onChange={() => setSelectedType(type)}
                                                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-sm text-charcoal capitalize">
                                                {type === 'GIFT' ? 'Gift / Free' : type.toLowerCase()}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-charcoal mb-3">CATEGORY</h3>
                                <div className="space-y-2">
                                    {['All', ...ITEM_CATEGORIES].map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-sm text-charcoal">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full mt-4">
                                List an Item
                            </Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search Bar & Mobile Actions */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-green">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search for items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary shadow-sm"
                                />
                            </div>
                            <Button
                                className="lg:hidden"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <span className="material-symbols-outlined mr-1">add</span> List
                            </Button>
                        </div>

                        {/* Results */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-charcoal">
                                    {isLoading ? 'Loading items...' : `${items.length} Items Found`}
                                </h2>
                            </div>

                            <MarketplaceGrid
                                items={items}
                                isLoading={isLoading}
                                onRequest={(item) => {
                                    setSelectedItem(item);
                                    setIsDetailModalOpen(true);
                                }}
                                onCreate={() => setIsCreateModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <CreateItemModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                communityId="1" // Mock ID for now
                onSuccess={() => {
                    refetch();
                }}
            />

            <ItemDetailModal
                item={selectedItem}
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
            />
        </div>
    );
}
