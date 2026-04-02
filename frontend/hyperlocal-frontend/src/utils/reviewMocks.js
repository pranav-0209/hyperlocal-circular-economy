const SAMPLE_COMMENTS = [
    {
        author: 'Meera T.',
        avatar: 'MT',
        rating: 5,
        date: '2026-03-18',
        text: 'Item was exactly as described, clean, and ready on time. Pickup was smooth.',
        recommend: true,
    },
    {
        author: 'Vikram N.',
        avatar: 'VN',
        rating: 4,
        date: '2026-03-10',
        text: 'Very useful listing. Communication was quick and return handoff was easy.',
        recommend: true,
    },
    {
        author: 'Priya S.',
        avatar: 'PS',
        rating: 4,
        date: '2026-02-26',
        text: 'Good overall experience. Item worked well but had minor wear, as expected.',
        recommend: true,
    },
    {
        author: 'Arjun K.',
        avatar: 'AK',
        rating: 3,
        date: '2026-02-11',
        text: 'Borrow went fine. Availability timing changed once, but owner informed early.',
        recommend: false,
    },
];

const PENDING_REVIEW_TASKS = [
    {
        id: 'pending-1',
        listingId: '1',
        listingTitle: 'DeWalt Cordless Drill',
        counterpartyName: 'Meera T.',
        role: 'Borrower',
        completedAt: '2026-03-20',
        dueBy: '2026-04-03',
    },
    {
        id: 'pending-2',
        listingId: '2',
        listingTitle: 'Camping Tent (4 Person)',
        counterpartyName: 'Vikram N.',
        role: 'Owner',
        completedAt: '2026-03-18',
        dueBy: '2026-04-01',
    },
    {
        id: 'pending-3',
        listingId: '3',
        listingTitle: 'Nikon DSLR Camera',
        counterpartyName: 'Sneha R.',
        role: 'Borrower',
        completedAt: '2026-03-12',
        dueBy: '2026-03-29',
    },
];

const MOCK_LISTING_REVIEWS = {
    '1': {
        averageRating: 4.7,
        totalRatings: 26,
        recommendRate: 94,
        reviews: SAMPLE_COMMENTS,
    },
    '2': {
        averageRating: 4.4,
        totalRatings: 18,
        recommendRate: 89,
        reviews: SAMPLE_COMMENTS.slice(0, 3),
    },
    '3': {
        averageRating: 4.2,
        totalRatings: 12,
        recommendRate: 84,
        reviews: SAMPLE_COMMENTS.slice(1),
    },
};

const clampRating = (value) => Math.max(1, Math.min(5, Number(value) || 0));

const idHash = (value) => {
    const source = String(value || 'listing');
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
        hash = (hash * 31 + source.charCodeAt(index)) % 997;
    }

    return hash;
};

const buildFallbackListingReviews = (listingId) => {
    const hash = idHash(listingId);
    const totalRatings = 10 + (hash % 33);
    const averageRating = Number((3.8 + ((hash % 13) * 0.08)).toFixed(1));
    const recommendRate = Math.min(98, Math.max(72, Math.round((averageRating / 5) * 100 + 6)));

    const reviews = SAMPLE_COMMENTS.map((comment, index) => ({
        ...comment,
        id: `mock-${listingId}-${index}`,
        rating: clampRating(comment.rating + (((hash + index) % 3) - 1) * 0.5),
    }));

    return {
        averageRating,
        totalRatings,
        recommendRate,
        reviews,
    };
};

export const getListingReviewData = (listingId) => {
    const key = String(listingId || '');
    const preset = MOCK_LISTING_REVIEWS[key];

    if (!preset) {
        return buildFallbackListingReviews(key || 'default');
    }

    return {
        averageRating: preset.averageRating,
        totalRatings: preset.totalRatings,
        recommendRate: preset.recommendRate,
        reviews: preset.reviews.map((review, index) => ({
            ...review,
            id: review.id || `mock-${key}-${index}`,
            rating: clampRating(review.rating),
        })),
    };
};

export const getListingReviewSummary = (listingId) => {
    const data = getListingReviewData(listingId);

    return {
        averageRating: data.averageRating,
        totalRatings: data.totalRatings,
        recommendRate: data.recommendRate,
    };
};

export const getPendingReviewTasks = () => PENDING_REVIEW_TASKS;

const TRUST_TIERS = [
    { label: 'New', min: 0, max: 39 },
    { label: 'Reliable', min: 40, max: 64 },
    { label: 'Trusted', min: 65, max: 84 },
    { label: 'Elite', min: 85, max: 100 },
];

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));

export const getUserTrustScoreSummary = (userId) => {
    const hash = idHash(userId || 'user');
    const score = clampScore(48 + (hash % 49));
    const xp = 320 + (hash % 1200);
    const tier = TRUST_TIERS.find((t) => score >= t.min && score <= t.max) || TRUST_TIERS[0];
    const nextTier = TRUST_TIERS.find((t) => t.min > tier.min) || tier;
    const progressToNext = nextTier === tier
        ? 1
        : Math.max(0, Math.min(1, (score - tier.min) / (nextTier.min - tier.min)));

    return {
        score,
        xp,
        tier: tier.label,
        nextTier: nextTier.label,
        progressToNext,
    };
};
