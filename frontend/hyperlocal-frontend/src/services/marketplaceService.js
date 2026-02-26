import { v4 as uuidv4 } from 'uuid';

// Mock Data — Borrow & Lend only (RENT type)
const MOCK_ITEMS = [
    {
        id: 'item-1',
        title: 'DeWalt 20V Cordless Drill',
        description: 'Powerful 20V Max cordless drill with two batteries and a charger. Perfect for home DIY projects — drilling, screwing, assembling furniture. Bit set included.',
        category: 'Tools',
        type: 'RENT',
        price: 150,
        condition: 'Good',
        images: [
            'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800',
        ],
        owner: { id: 'u2', name: 'Rahul M.', avatar: 'RM', rating: 4.8, itemsListed: 6 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'item-2',
        title: 'Camping Tent (4 Person)',
        description: 'Spacious 4-person tent, waterproof and easy to set up. Used only twice — comes with stakes, poles, and carrying bag. Great for weekend trips.',
        category: 'Sports',
        type: 'RENT',
        price: 300,
        condition: 'Like New',
        images: [
            'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&q=80&w=800',
        ],
        owner: { id: 'u3', name: 'Priya S.', avatar: 'PS', rating: 4.6, itemsListed: 3 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 'item-3',
        title: 'Harry Potter Complete Box Set',
        description: 'All 7 Harry Potter books in a collector box set. A bit worn on the covers but all pages are intact and readable. Perfect for any Potterhead!',
        category: 'Books',
        type: 'GIFT',
        price: 0,
        condition: 'Fair',
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u4', name: 'Amit K.', avatar: 'AK' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
        id: 'item-4',
        title: 'Aluminium Step Ladder (6ft)',
        description: 'Lightweight, sturdy 6-foot aluminium ladder. Great for painting, changing light bulbs, and ceiling work. Folds flat for easy storage.',
        category: 'Tools',
        type: 'RENT',
        price: 80,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u2', name: 'Rahul M.', avatar: 'RM' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 345600000).toISOString()
    },
    {
        id: 'item-5',
        title: 'Nikon DSLR Camera D3500',
        description: 'Entry-level DSLR with 18-55mm and 70-300mm lenses, 2 batteries, charger, and camera bag. Excellent for travel and portrait photography.',
        category: 'Electronics',
        type: 'RENT',
        price: 500,
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u5', name: 'Sneha R.', avatar: 'SR' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Indiranagar Tech Hub',
        createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
        id: 'item-6',
        title: 'Yoga Mat & Blocks Set',
        description: 'Premium non-slip yoga mat (6mm thick) with 2 foam blocks and a strap. Lightly used, washed and ready to re-home. Ideal for home practice.',
        category: 'Sports',
        type: 'GIFT',
        price: 0,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u6', name: 'Meera T.', avatar: 'MT' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 21600000).toISOString()
    },
    {
        id: 'item-7',
        title: 'Pressure Cooker (7 Litre)',
        description: 'Hawkins 7L stainless steel pressure cooker, works perfectly. Selling because we upgraded to an instant pot. Includes original gasket and safety valve.',
        category: 'Home & Garden',
        type: 'SALE',
        price: 1200,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u7', name: 'Vikram N.', avatar: 'VN' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Koramangala Families',
        createdAt: new Date(Date.now() - 108000000).toISOString()
    },
    {
        id: 'item-8',
        title: 'Board Games Bundle (5 games)',
        description: 'Catan, Ticket to Ride, Pandemic, Codenames, and Bananagrams. All complete with pieces. Perfect for game nights. Selling as a bundle only.',
        category: 'Other',
        type: 'SALE',
        price: 2500,
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u8', name: 'Ritu P.', avatar: 'RP' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Koramangala Families',
        createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: 'item-9',
        title: 'Badminton Rackets Set (4 pcs)',
        description: '4 intermediate-level badminton rackets with 2 shuttlecock tubes. Perfect for a family game in the park or building rooftop. Rackets are in great shape.',
        category: 'Sports',
        type: 'RENT',
        price: 100,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1464983308776-3c7215084895?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u3', name: 'Priya S.', avatar: 'PS' },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'item-10',
        title: 'Study Table Lamp (LED)',
        description: 'Philips LED table lamp with adjustable neck. Giving away since I switched to a ceiling lamp.',
        category: 'Electronics',
        type: 'RENT',
        price: 40,
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u9', name: 'Aditya B.', avatar: 'AB', rating: 4.2, itemsListed: 5 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Indiranagar Tech Hub',
        createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 'item-11',
        title: 'Philips LED Study Lamp',
        description: 'Philips LED table lamp with adjustable neck and 5 brightness levels. USB charging port on the base. Borrow it for an exam season or work-from-home setup.',
        category: 'Electronics',
        type: 'RENT',
        price: 40,
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u10', name: 'Karan J.', avatar: 'KJ', rating: 4.9, itemsListed: 1 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Indiranagar Tech Hub',
        createdAt: new Date(Date.now() - 900000).toISOString()
    },
    {
        id: 'item-12',
        title: 'Folding Chairs (Set of 6)',
        description: 'Steel folding chairs, load capacity 150kg each. Used for one event. Great for parties, pujas, or extra seating. Stack flat for easy storage.',
        category: 'Appliances',
        type: 'RENT',
        price: 50,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u11', name: 'Divya S.', avatar: 'DS', rating: 4.3, itemsListed: 9 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Koramangala Families',
        createdAt: new Date(Date.now() - 450000).toISOString()
    },
    {
        id: 'item-13',
        title: 'Honda Activa 6G (Scooty)',
        description: 'Honda Activa 6G in good running condition. Available for short-term borrow within the locality. Fuel cost on borrower. Helmet included.',
        category: 'Vehicles',
        type: 'RENT',
        price: 400,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u12', name: 'Pooja M.', avatar: 'PM', rating: 4.7, itemsListed: 2 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Green Valley Residents',
        createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
        id: 'item-14',
        title: 'Baby Stroller (Mamas & Papas)',
        description: 'Lightweight foldable baby stroller, suitable for 0-3 years. Easy one-click fold. Canopy included. Sanitised before lending. Great for short outings.',
        category: 'Kids',
        type: 'RENT',
        price: 250,
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u13', name: 'Nikhil A.', avatar: 'NA', rating: 4.8, itemsListed: 3 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Koramangala Families',
        createdAt: new Date(Date.now() - 300000).toISOString()
    },
    {
        id: 'item-15',
        title: 'Designer Lehenga (Bridal)',
        description: 'Beautiful heavy embroidered lehenga in deep red and gold. Worn once for a wedding. Comes with blouse (size 36) and dupatta. Dry-cleaned and ready to rent.',
        category: 'Fashion',
        type: 'RENT',
        price: 1500,
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800'],
        owner: { id: 'u14', name: 'Alka R.', avatar: 'AR', rating: 4.6, itemsListed: 12 },
        status: 'AVAILABLE',
        communityId: '1',
        communityName: 'Indiranagar Tech Hub',
        createdAt: new Date(Date.now() - 120000).toISOString()
    },
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
