import { v4 as uuidv4 } from 'uuid';

// Mock Data
const MOCK_ITEMS = [
    {
        id: 'item-1',
        title: 'DeWalt Cordless Drill',
        description: 'Powerful 20V Max cordless drill. Comes with two batteries and a charger. Perfect for home DIY projects.',
        category: 'Tools',
        type: 'RENT',
        price: 150, // per day
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u2', name: 'Rahul M.', avatar: 'RM' },
        status: 'AVAILABLE',
        communityId: '1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'item-2',
        title: 'Camping Tent (4 Person)',
        description: 'Spacious 4-person tent. Waterproof and easy to set up. Used only twice.',
        category: 'Sports',
        type: 'RENT',
        price: 300,
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u3', name: 'Priya S.', avatar: 'PS' },
        status: 'AVAILABLE',
        communityId: '1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'item-3',
        title: 'Harry Potter Box Set',
        description: 'Complete collection of Harry Potter books. A bit worn but all pages intact.',
        category: 'Books',
        type: 'GIFT',
        price: 0,
        condition: 'Fair',
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u4', name: 'Amit K.', avatar: 'AK' },
        status: 'AVAILABLE',
        communityId: '1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'item-4',
        title: 'Ladder (6ft)',
        description: 'Aluminum household ladder. Lightweight and sturdy.',
        category: 'Tools',
        type: 'RENT',
        price: 50,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u2', name: 'Rahul M.', avatar: 'RM' },
        status: 'AVAILABLE',
        communityId: '1',
        createdAt: new Date().toISOString()
    }
];

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getItems = async ({ search, category, type }) => {
    await delay(800);

    // In a real app, this would be an API call
    let items = [...MOCK_ITEMS];

    // 1. Filter by Community (Mocking: All mock items belong to community '1' for now)
    // if (communityId) {
    //   items = items.filter(item => item.communityId === communityId);
    // }

    // 2. Search Filter
    if (search) {
        const query = search.toLowerCase();
        items = items.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
    }

    // 3. Category Filter
    if (category && category !== 'All') {
        items = items.filter(item => item.category === category);
    }

    // 4. Type Filter
    if (type && type !== 'All') {
        items = items.filter(item => item.type === type);
    }

    return items;
};

export const createItem = async (itemData) => {
    await delay(1500);

    // Mock response
    const newItem = {
        id: uuidv4(),
        ...itemData,
        owner: { id: 'current-user', name: 'You', avatar: 'ME' }, // Mock current user
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        images: ['https://placehold.co/600x400?text=New+Item'] // Placeholder for now
    };

    MOCK_ITEMS.unshift(newItem); // Add to local mock array (won't persist reload)
    console.log('Item created:', newItem);
    return newItem;
};

export const requestItem = async (itemId, message) => {
    await delay(1000);
    console.log(`Requested item ${itemId} with message: ${message}`);
    return { success: true };
};

export const getMyListings = async () => {
    await delay(600);
    // Mock: Filter by "current-user" or items created by the user in this session
    return MOCK_ITEMS.filter(item => item.owner.id === 'current-user' || item.owner.id === 'u2'); // Including 'u2' as 'me' for demo
};

export const getRecentRequests = async () => {
    await delay(600);
    // Mock data
    return [
        { id: 'r1', itemId: 'item-2', title: 'Camping Tent', requestor: 'Sarah J.', status: 'PENDING', date: '2 mins ago' },
        { id: 'r2', itemId: 'item-4', title: 'Ladder', requestor: 'Amit K.', status: 'ACCEPTED', date: '1 day ago' },
    ];
};
