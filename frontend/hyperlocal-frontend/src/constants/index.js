/**
 * Application Constants
 * Centralized constants for routes, roles, statuses, and configuration
 */

// Route paths
export const ROUTES = {
    // Public routes
    HOME_PUBLIC: '/',
    REGISTER: '/register',
    LOGIN: '/login',

    // Protected routes
    HOME: '/home',
    DASHBOARD: '/dashboard',

    // Verification flow
    VERIFY_PROFILE: '/verify/profile',
    VERIFY_DOCUMENTS: '/verify/documents',
    VERIFY_PENDING: '/verify/pending',

    // Admin routes
    ADMIN: '/admin',

    // Super Admin routes
    SUPERADMIN_LOGIN: '/superadmin/login',
    SUPERADMIN: '/superadmin',
    SUPERADMIN_VERIFICATIONS: '/superadmin/verifications',
    SUPERADMIN_VERIFICATION_DETAIL: '/superadmin/verifications/:id',
    SUPERADMIN_USERS: '/superadmin/users',
    SUPERADMIN_COMMUNITIES: '/superadmin/communities',
};

// User roles
export const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPERADMIN: 'SUPERADMIN',
};

// Verification status
export const VERIFICATION_STATUS = {
    NOT_VERIFIED: 'NOT_VERIFIED',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
};

// Profile completion percentages
export const PROFILE_COMPLETION = {
    INITIAL: 0,
    PROFILE_COMPLETE: 40,
    DOCUMENTS_SUBMITTED: 75,
    VERIFIED: 100,
};

// Verification steps
export const VERIFICATION_STEPS = {
    PROFILE: 'PROFILE',
    DOCUMENTS: 'DOCUMENTS',
    REVIEW: 'REVIEW',
    COMPLETE: 'COMPLETE',
};

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 10000, // 10 seconds
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
};

// React Query Configuration
export const QUERY_CONFIG = {
    STALE_TIME: 1000 * 60 * 5, // 5 minutes
    GC_TIME: 1000 * 60 * 10, // 10 minutes
    RETRY_COUNT: 1,
};

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER: 'user',
    ADMIN_TOKEN: 'adminToken',
    ADMIN_USER: 'adminUser',
};

// Error codes
export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
};
