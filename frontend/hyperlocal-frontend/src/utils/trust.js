const toFiniteNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeTrustIndex = (value) => {
    const safe = toFiniteNumber(value, 0);
    return Math.max(0, Math.min(100, Math.round(safe)));
};

export const normalizeTrustXp = (value) => {
    const safe = toFiniteNumber(value, 0);
    return Math.max(0, Math.round(safe));
};

export const normalizeTrustValues = (trustIndex, trustXp) => ({
    trustIndex: normalizeTrustIndex(trustIndex),
    trustXp: normalizeTrustXp(trustXp),
});

export const getTrustTierLabel = (trustIndex) => {
    const safeTrustIndex = normalizeTrustIndex(trustIndex);
    if (safeTrustIndex >= 85) return 'Highly Trusted';
    if (safeTrustIndex >= 70) return 'Trusted';
    if (safeTrustIndex >= 50) return 'Moderate';
    return 'Low Trust';
};
