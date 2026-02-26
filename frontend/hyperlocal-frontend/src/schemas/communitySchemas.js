import { z } from 'zod';

const CATEGORY_VALUES = ['NEIGHBOURHOOD', 'SOCIETY', 'COLLEGE', 'OFFICE', 'INTEREST_GROUP', 'OTHER'];
const JOIN_POLICY_VALUES = ['OPEN', 'APPROVAL_REQUIRED'];
const STATUS_VALUES = ['ACTIVE', 'INACTIVE'];

export const COMMUNITY_CATEGORIES = [
    { value: 'NEIGHBOURHOOD', label: 'Neighbourhood' },
    { value: 'SOCIETY', label: 'Society / Apartment' },
    { value: 'COLLEGE', label: 'College / Campus' },
    { value: 'OFFICE', label: 'Office / Workplace' },
    { value: 'INTEREST_GROUP', label: 'Interest Group' },
    { value: 'OTHER', label: 'Other' },
];

/**
 * Schema for joining a community via invite code.
 * Format: ABC-1234
 */
export const joinCommunitySchema = z.object({
    code: z
        .string()
        .min(1, 'Community code is required')
        .regex(/^[A-Z]{3}-\d{4}$/, 'Code must be in format: ABC-1234 (e.g., GRN-8821)')
        .transform(val => val.toUpperCase()),
});

/**
 * Schema for creating a new community.
 * communityName maps to `name` in the API payload.
 */
export const createCommunitySchema = z.object({
    communityName: z
        .string()
        .min(3, 'Community name must be at least 3 characters')
        .max(100, 'Community name must be less than 100 characters')
        .trim(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be less than 1000 characters')
        .trim(),
    category: z
        .string({ required_error: 'Please select a community category' })
        .min(1, 'Please select a community category')
        .refine((val) => CATEGORY_VALUES.includes(val), {
            message: 'Please select a community category',
        }),
    joinPolicy: z
        .string()
        .refine((val) => JOIN_POLICY_VALUES.includes(val), {
            message: 'Please select a join policy',
        })
        .default('OPEN'),
});

/**
 * Schema for editing community details (PUT /api/communities/{id}).
 * Same as create but uses `name` directly (no alias needed here).
 */
export const updateCommunitySchema = z.object({
    name: z
        .string()
        .min(3, 'Community name must be at least 3 characters')
        .max(100, 'Community name must be less than 100 characters')
        .trim(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be less than 1000 characters')
        .trim(),
    category: z.enum(CATEGORY_VALUES, {
        errorMap: () => ({ message: 'Please select a community category' }),
    }),
});

/**
 * Schema for updating join policy (PATCH /api/communities/{id}/join-policy).
 */
export const updateJoinPolicySchema = z.object({
    joinPolicy: z.enum(JOIN_POLICY_VALUES, {
        errorMap: () => ({ message: 'Please select a join policy' }),
    }),
});

/**
 * Schema for updating community status (PATCH /api/communities/{id}/status).
 */
export const updateStatusSchema = z.object({
    status: z.enum(STATUS_VALUES, {
        errorMap: () => ({ message: 'Please select a status' }),
    }),
});
