/**
 * Mock Marketplace Service
 * Provides community-specific mock items for testing
 */

// Mock marketplace items organized by community
const MOCK_ITEMS = {
    comm_001: [ // Green Valley Neighbors
        {
            id: 'item_001',
            title: 'Electric Lawn Mower',
            description: 'Eco-friendly electric mower, perfect for small to medium lawns.',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            category: 'Garden & Outdoor',
            owner: { id: 'user_101', name: 'Sarah Johnson', verified: true },
            distance: '0.2 mi away',
            status: 'Available',
            communityId: 'comm_001',
        },
        {
            id: 'item_002',
            title: 'Camping Tent (4-Person)',
            description: 'Waterproof family tent, easy setup, includes carrying bag.',
            image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
            category: 'Sports & Recreation',
            owner: { id: 'user_102', name: 'Mike Thompson', verified: false },
            distance: '0.5 mi away',
            status: 'Available',
            communityId: 'comm_001',
        },
        {
            id: 'item_003',
            title: 'Bicycle Repair Kit',
            description: 'Complete toolkit with pump, patches, and essential tools.',
            image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
            category: 'Tools & Equipment',
            owner: { id: 'user_103', name: 'Emma Wilson', verified: true },
            distance: '0.1 mi away',
            status: 'Available',
            communityId: 'comm_001',
        },
    ],
    comm_002: [ // Maple Street Circle
        {
            id: 'item_004',
            title: 'Cordless Power Drill',
            description: 'Professional-grade drill with multiple bits and battery.',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
            category: 'Tools & Equipment',
            owner: { id: 'user_201', name: 'David Lee', verified: true },
            distance: '0.3 mi away',
            status: 'Available',
            communityId: 'comm_002',
        },
        {
            id: 'item_005',
            title: 'Board Games Collection',
            description: 'Catan, Ticket to Ride, Pandemic, and more family favorites.',
            image: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400',
            category: 'Entertainment',
            owner: { id: 'user_202', name: 'Lisa Chen', verified: true },
            distance: '0.2 mi away',
            status: 'Available',
            communityId: 'comm_002',
        },
    ],
    comm_003: [ // Downtown Sharers
        {
            id: 'item_006',
            title: 'Projector & Screen',
            description: 'HD projector with 100" portable screen for movie nights.',
            image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
            category: 'Electronics',
            owner: { id: 'user_301', name: 'James Rodriguez', verified: true },
            distance: '0.4 mi away',
            status: 'Available',
            communityId: 'comm_003',
        },
        {
            id: 'item_007',
            title: 'Folding Chairs (Set of 6)',
            description: 'Sturdy folding chairs, great for parties and events.',
            image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400',
            category: 'Furniture',
            owner: { id: 'user_302', name: 'Rachel Green', verified: false },
            distance: '0.6 mi away',
            status: 'Available',
            communityId: 'comm_003',
        },
        {
            id: 'item_008',
            title: 'Pressure Washer',
            description: 'High-powered washer for driveways, decks, and siding.',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
            category: 'Tools & Equipment',
            owner: { id: 'user_303', name: 'Tom Anderson', verified: true },
            distance: '0.3 mi away',
            status: 'Available',
            communityId: 'comm_003',
        },
    ],
    comm_004: [ // Riverside Apartments
        {
            id: 'item_009',
            title: 'Vacuum Cleaner (Dyson)',
            description: 'Powerful cordless vacuum, perfect for apartments.',
            image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
            category: 'Home Appliances',
            owner: { id: 'user_401', name: 'Nina Patel', verified: true },
            distance: '0.1 mi away',
            status: 'Available',
            communityId: 'comm_004',
        },
        {
            id: 'item_010',
            title: 'Ladder (6ft)',
            description: 'Lightweight aluminum ladder for indoor use.',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            category: 'Tools & Equipment',
            owner: { id: 'user_402', name: 'Kevin Park', verified: false },
            distance: '0.2 mi away',
            status: 'Available',
            communityId: 'comm_004',
        },
    ],
    comm_005: [ // Tech Hub Collective
        {
            id: 'item_011',
            title: 'DSLR Camera Kit',
            description: 'Canon EOS with lenses, tripod, and accessories.',
            image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
            category: 'Electronics',
            owner: { id: 'user_501', name: 'Alex Turner', verified: true },
            distance: '0.5 mi away',
            status: 'Available',
            communityId: 'comm_005',
        },
        {
            id: 'item_012',
            title: 'Soldering Station',
            description: 'Professional soldering kit for electronics projects.',
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
            category: 'Tools & Equipment',
            owner: { id: 'user_502', name: 'Maya Singh', verified: true },
            distance: '0.3 mi away',
            status: 'Available',
            communityId: 'comm_005',
        },
    ],
};

/**
 * Get items for a specific community
 */
export const getItemsByCommunity = (communityId) => {
    return MOCK_ITEMS[communityId] || [];
};

/**
 * Get all items (for testing)
 */
export const getAllItems = () => {
    return Object.values(MOCK_ITEMS).flat();
};

/**
 * Get item by ID
 */
export const getItemById = (itemId) => {
    const allItems = getAllItems();
    return allItems.find((item) => item.id === itemId);
};

/**
 * Search items within a community
 */
export const searchItems = (communityId, query) => {
    const items = getItemsByCommunity(communityId);
    const lowerQuery = query.toLowerCase();

    return items.filter((item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Filter items by category
 */
export const filterItemsByCategory = (communityId, category) => {
    const items = getItemsByCommunity(communityId);
    return items.filter((item) => item.category === category);
};

/**
 * Get available categories for a community
 */
export const getCategories = (communityId) => {
    const items = getItemsByCommunity(communityId);
    const categories = [...new Set(items.map((item) => item.category))];
    return categories.sort();
};
