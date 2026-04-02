import api from './api';

const UI_TO_API_CATEGORY = {
    Electronics: 'ELECTRONICS',
    Vehicles: 'VEHICLES',
    Furniture: 'FURNITURE',
    Appliances: 'APPLIANCES',
    Books: 'BOOKS',
    Fashion: 'FASHION',
    Tools: 'TOOLS',
    Sports: 'SPORTS',
    Kids: 'KIDS',
    Other: 'OTHER',
};

const UI_TO_API_CONDITION = {
    New: 'NEW',
    'Like New': 'LIKE_NEW',
    Good: 'GOOD',
    Fair: 'FAIR',
    Poor: 'POOR',
};

const API_TO_UI_CATEGORY = Object.fromEntries(
    Object.entries(UI_TO_API_CATEGORY).map(([ui, apiValue]) => [apiValue, ui])
);

const API_TO_UI_CONDITION = Object.fromEntries(
    Object.entries(UI_TO_API_CONDITION).map(([ui, apiValue]) => [apiValue, ui])
);

const resolveAssetUrl = (value) => {
    if (!value || typeof value !== 'string') return null;
    if (/^https?:\/\//i.test(value)) return value;

    const baseUrl = api?.defaults?.baseURL;
    if (!baseUrl) return value;

    let normalizedBase = String(baseUrl).replace(/\/+$/, '');
    try {
        normalizedBase = new URL(baseUrl).origin;
    } catch {
        // Keep original baseUrl if URL parsing fails.
    }

    const normalizedPath = value.startsWith('/') ? value : `/${value}`;
    return `${normalizedBase}${normalizedPath}`;
};

const initialsFromName = (name = '') => {
    const parts = name
        .split(' ')
        .map((p) => p.trim())
        .filter(Boolean);

    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const toApiCategory = (category) => {
    if (!category) return undefined;
    if (UI_TO_API_CATEGORY[category]) return UI_TO_API_CATEGORY[category];
    return String(category).toUpperCase();
};

const fromApiCategory = (category) => {
    if (!category) return 'Other';
    if (API_TO_UI_CATEGORY[category]) return API_TO_UI_CATEGORY[category];

    const normalized = String(category).toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toApiCondition = (condition) => {
    if (!condition) return undefined;
    if (UI_TO_API_CONDITION[condition]) return UI_TO_API_CONDITION[condition];
    return String(condition).toUpperCase().replace(/\s+/g, '_');
};

const fromApiCondition = (condition) => {
    if (!condition) return 'Good';
    if (API_TO_UI_CONDITION[condition]) return API_TO_UI_CONDITION[condition];

    return String(condition)
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const normalizeOwner = (owner = {}) => {
    const name = owner.name || 'Unknown';

    return {
        id: String(owner.userId ?? owner.id ?? ''),
        userId: owner.userId ?? owner.id ?? null,
        name,
        avatarUrl: resolveAssetUrl(owner.profilePhotoUrl ?? owner.avatarUrl ?? null),
        avatar: initialsFromName(name),
        rating: owner.averageRating ?? owner.rating ?? 0,
        averageRating: owner.averageRating ?? owner.rating ?? 0,
        totalReviews: owner.totalReviews ?? 0,
        verified: Boolean(owner.verified),
        itemsListed: owner.itemsListed ?? 0,
        lendsCompleted: owner.totalLends ?? owner.lendsCompleted ?? 0,
    };
};

export const normalizeListing = (listing = {}) => ({
    id: String(listing.id ?? ''),
    title: listing.title ?? '',
    description: listing.description ?? '',
    category: fromApiCategory(listing.category),
    // Product currently supports borrow/lend only in UI
    type: 'RENT',
    price: Number(listing.price ?? 0),
    condition: fromApiCondition(listing.condition),
    images: Array.isArray(listing.images)
        ? listing.images.map((image) => resolveAssetUrl(image)).filter(Boolean)
        : (listing.thumbnailUrl ? [resolveAssetUrl(listing.thumbnailUrl)] : []),
    thumbnailUrl: resolveAssetUrl(listing.thumbnailUrl ?? (Array.isArray(listing.images) ? listing.images[0] ?? null : null)),
    status: listing.status ?? 'AVAILABLE',
    communityId: listing.communityId != null ? String(listing.communityId) : '',
    communityName: listing.communityName ?? '',
    owner: normalizeOwner(listing.owner),
    averageRating: Number(listing.averageRating ?? 0),
    totalReviews: Number(listing.totalReviews ?? 0),
    availableFrom: listing.availableFrom ?? '',
    availableTo: listing.availableTo ?? '',
    createdAt: listing.createdAt ?? '',
    updatedAt: listing.updatedAt ?? '',
});

const appendIfPresent = (formData, key, value) => {
    if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
    }
};

const isFileLike = (value) => {
    if (typeof Blob === 'undefined') return false;
    return value instanceof Blob;
};

const buildListingFormData = (listingData, { includeCommunityId = false } = {}) => {
    const formData = new FormData();

    appendIfPresent(formData, 'title', listingData.title?.trim?.() ?? listingData.title);
    appendIfPresent(formData, 'description', listingData.description?.trim?.() ?? listingData.description);
    appendIfPresent(formData, 'category', toApiCategory(listingData.category));
    appendIfPresent(formData, 'price', listingData.price);
    appendIfPresent(formData, 'condition', toApiCondition(listingData.condition));
    appendIfPresent(formData, 'availableFrom', listingData.availableFrom);
    appendIfPresent(formData, 'availableTo', listingData.availableTo);

    if (includeCommunityId) {
        appendIfPresent(formData, 'communityId', listingData.communityId);
    }

    const existingImages = Array.isArray(listingData.images) ? listingData.images : [];
    existingImages
        .filter((img) => typeof img === 'string' && img.trim())
        .forEach((img) => formData.append('images', img));

    const newImageFiles = Array.isArray(listingData.imageFiles) ? listingData.imageFiles : [];
    newImageFiles
        .filter((file) => isFileLike(file))
        .forEach((file) => formData.append('images', file));

    return formData;
};

const normalizeRecentRequest = (request = {}) => ({
    id: String(request.id ?? request.requestId ?? ''),
    itemId: String(request.itemId ?? request.listingId ?? ''),
    title: request.itemTitle ?? request.title ?? request.listingTitle ?? 'Listing',
    requestor:
        request.requesterName
        ?? request.requestorName
        ?? request.requestor
        ?? request.borrowerName
        ?? request.requester?.name
        ?? request.borrower?.name
        ?? 'Community Member',
    status: String(request.status ?? 'PENDING').toUpperCase(),
    date: request.createdAt
        ? new Date(request.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
        })
        : '',
});

const normalizeBorrowRequest = (request = {}) => ({
    id: String(request.id ?? request.requestId ?? ''),
    listingId: String(request.listingId ?? request.itemId ?? ''),
    listingTitle: request.listingTitle ?? request.itemTitle ?? request.title ?? '',
    requesterId: String(request.requesterId ?? request.borrowerId ?? request.requester?.id ?? request.borrower?.id ?? ''),
    requesterName:
        request.requesterName
        ?? request.requestorName
        ?? request.borrowerName
        ?? request.requestor
        ?? request.requester?.name
        ?? request.borrower?.name
        ?? '',
    ownerId: String(request.ownerId ?? ''),
    ownerName: request.ownerName ?? request.owner?.name ?? request.ownerFullName ?? '',
    status: String(request.status ?? 'PENDING').toUpperCase(),
    startDate: request.startDate ?? request.fromDate ?? '',
    endDate: request.endDate ?? request.toDate ?? '',
    message: request.message ?? '',
    exchangeStatus: String(request.exchangeStatus ?? '').toUpperCase(),
    completedAt: request.completedAt ?? null,
    returnedAt: request.returnedAt ?? null,
    actualReturnDate: request.actualReturnDate ?? null,
    createdAt: request.createdAt ?? '',
    updatedAt: request.updatedAt ?? '',
});

/**
 * GET /api/marketplace/listings
 */
export const getItems = async ({
    search,
    category,
    status,
    communityId,
    page = 0,
    size = 20,
} = {}) => {
    const response = await api.get('/api/marketplace/listings', {
        params: {
            ...(search ? { search } : {}),
            ...(category && category !== 'All' ? { category: toApiCategory(category) } : {}),
            ...(status && status !== 'All' ? { status } : {}),
            ...(communityId ? { communityId } : {}),
            page,
            size,
        },
    });

    const listings = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

    return listings.map(normalizeListing);
};

/**
 * GET /api/marketplace/listings/{listingId}
 */
export const getItemById = async (listingId) => {
    const response = await api.get(`/api/marketplace/listings/${listingId}`);
    return normalizeListing(response.data);
};

/**
 * POST /api/marketplace/listings
 */
export const createItem = async (itemData) => {
    const formData = buildListingFormData(itemData, { includeCommunityId: true });

    const response = await api.post('/api/marketplace/listings', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return normalizeListing(response.data);
};

/**
 * PUT /api/marketplace/listings/{listingId}
 */
export const updateItem = async (listingId, itemData) => {
    const formData = buildListingFormData(itemData, { includeCommunityId: false });

    const response = await api.put(`/api/marketplace/listings/${listingId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return normalizeListing(response.data);
};

/**
 * PATCH /api/marketplace/listings/{listingId}/toggle
 */
export const toggleListingAvailability = async (listingId) => {
    const response = await api.patch(`/api/marketplace/listings/${listingId}/toggle`);
    return response.data;
};

/**
 * DELETE /api/marketplace/listings/{listingId}
 */
export const deleteItem = async (listingId) => {
    await api.delete(`/api/marketplace/listings/${listingId}`);
};

/**
 * GET /api/marketplace/listings/me
 */
export const getMyListings = async (status) => {
    const response = await api.get('/api/marketplace/listings/me', {
        params: status && status !== 'All' ? { status } : {},
    });

    const listings = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.content)
            ? response.data.content
            : [];
    return listings.map(normalizeListing);
};

/**
 * GET /api/marketplace/listings/categories
 */
export const getListingCategories = async () => {
    const response = await api.get('/api/marketplace/listings/categories');
    const categories = Array.isArray(response.data) ? response.data : [];

    const normalized = categories
        .filter(Boolean)
        .map((category) => fromApiCategory(category));

    return Array.from(new Set(normalized));
};

/**
 * POST /api/marketplace/requests
 */
export const createBorrowRequest = async (payload) => {
    const requestBody = {
        listingId: payload.listingId,
        startDate: payload.startDate ?? payload.fromDate,
        endDate: payload.endDate ?? payload.toDate,
        message: payload.message,
    };

    const response = await api.post('/api/marketplace/requests', requestBody);
    return normalizeBorrowRequest(response.data);
};

/**
 * Backward-compatible wrapper used by current item detail flows.
 */
export const requestItem = async (listingId, payload) => {
    const requestPayload = typeof payload === 'string'
        ? { listingId, message: payload }
        : { listingId, ...payload };

    return createBorrowRequest(requestPayload);
};

/**
 * GET /api/marketplace/requests/me
 */
export const getMySentRequests = async ({ page = 0, size = 20 } = {}) => {
    const response = await api.get('/api/marketplace/requests/me', {
        params: { page, size },
    });

    const requests = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

    return requests.map(normalizeBorrowRequest);
};

/**
 * GET /api/marketplace/requests/incoming
 */
export const getIncomingRequests = async ({ status, page = 0, size = 20 } = {}) => {
    const response = await api.get('/api/marketplace/requests/incoming', {
        params: {
            ...(status ? { status } : {}),
            page,
            size,
        },
    });

    const requests = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

    return requests.map(normalizeBorrowRequest);
};

/**
 * GET /api/marketplace/requests/{requestId}
 */
export const getBorrowRequestById = async (requestId) => {
    const response = await api.get(`/api/marketplace/requests/${requestId}`);
    return normalizeBorrowRequest(response.data);
};

/**
 * PATCH /api/marketplace/requests/{requestId}/approve
 */
export const approveBorrowRequest = async (requestId) => {
    const response = await api.patch(`/api/marketplace/requests/${requestId}/approve`);
    return normalizeBorrowRequest(response.data);
};

/**
 * PATCH /api/marketplace/requests/{requestId}/reject
 */
export const rejectBorrowRequest = async (requestId, reason) => {
    const response = await api.patch(
        `/api/marketplace/requests/${requestId}/reject`,
        reason ? { reason } : undefined
    );
    return normalizeBorrowRequest(response.data);
};

/**
 * PATCH /api/marketplace/requests/{requestId}/complete
 */
export const completeBorrowRequest = async (requestId) => {
    const response = await api.patch(`/api/marketplace/requests/${requestId}/complete`);
    return normalizeBorrowRequest(response.data);
};

/**
 * PATCH /api/marketplace/requests/{requestId}/cancel
 */
export const cancelBorrowRequest = async (requestId) => {
    const response = await api.patch(`/api/marketplace/requests/${requestId}/cancel`);
    return normalizeBorrowRequest(response.data);
};

/**
 * GET /api/marketplace/requests/listings/{listingId}/availability
 */
export const getListingAvailability = async (listingId, { fromDate, toDate } = {}) => {
    const hasCompleteRange = Boolean(fromDate && toDate);

    const response = await api.get(`/api/marketplace/requests/listings/${listingId}/availability`, {
        params: hasCompleteRange
            ? { fromDate, toDate }
            : undefined,
    });
    return response.data;
};

/**
 * Attempts to fetch the owner's recent incoming requests.
 * Returns [] on 404 to keep dashboard stable if endpoint is not ready yet.
 */
export const getRecentRequests = async () => {
    try {
        const requests = await getIncomingRequests({ status: 'PENDING', page: 0, size: 5 });

        return requests.map(normalizeRecentRequest);
    } catch (error) {
        if (error?.statusCode === 404) {
            return [];
        }
        throw error;
    }
};

/**
 * REVIEWS & RATINGS (backend wiring stubs)
 */
export const getListingReviews = async (listingId, { page = 0, size = 10, sort } = {}) => {
    const response = await api.get(`/api/reviews/listings/${listingId}`, {
        params: { page, size, ...(sort ? { sort } : {}) },
    });
    return response.data;
};

export const getUserReviews = async (userId, { page = 0, size = 10, role } = {}) => {
    const response = await api.get(`/api/reviews/users/${userId}`, {
        params: { page, size, ...(role ? { role } : {}) },
    });
    return response.data;
};

export const getPendingReviews = async () => {
    const response = await api.get('/api/reviews/me/pending');
    return response.data;
};

export const submitReview = async (payload) => {
    const response = await api.post('/api/reviews', payload);
    return response.data;
};

export const updateReview = async (reviewId, payload) => {
    const response = await api.patch(`/api/reviews/${reviewId}`, payload);
    return response.data;
};

export const reportReview = async (reviewId, payload) => {
    const response = await api.post(`/api/reviews/${reviewId}/report`, payload);
    return response.data;
};

export const getListingRatingSummary = async (listingId) => {
    const response = await api.get(`/api/ratings/listings/${listingId}/summary`);
    return response.data;
};

export const getUserRatingSummary = async (userId) => {
    const response = await api.get(`/api/ratings/users/${userId}/summary`);
    return response.data;
};

export const getTrustScoreSummary = async (userId) => {
    const response = await api.get(`/api/trust-score/users/${userId}`);
    return response.data;
};
