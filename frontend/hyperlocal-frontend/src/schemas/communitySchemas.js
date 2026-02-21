import { z } from 'zod';

/**
 * Schema for joining a community
 * Validates community code format: ABC-1234
 */
export const joinCommunitySchema = z.object({
    code: z
        .string()
        .min(1, 'Community code is required')
        .regex(/^[A-Z]{3}-\d{4}$/, 'Code must be in format: ABC-1234 (e.g., GRN-8821)')
        .transform(val => val.toUpperCase()),
});

export const COMMUNITY_CATEGORIES = [
    { value: 'NEIGHBOURHOOD', label: 'Neighbourhood' },
    { value: 'SOCIETY', label: 'Society / Apartment' },
    { value: 'COLLEGE', label: 'College / Campus' },
    { value: 'OFFICE', label: 'Office / Workplace' },
    { value: 'INTEREST_GROUP', label: 'Interest Group' },
    { value: 'OTHER', label: 'Other' },
];

/**
 * Schema for creating a new community
 * Validates name, description (required), and category
 */
export const createCommunitySchema = z.object({
    communityName: z
        .string()
        .min(3, 'Community name must be at least 3 characters')
        .max(50, 'Community name must be less than 50 characters')
        .trim(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(200, 'Description must be less than 200 characters')
        .trim(),
    category: z
        .enum(['NEIGHBOURHOOD', 'SOCIETY', 'COLLEGE', 'OFFICE', 'INTEREST_GROUP', 'OTHER'], {
            errorMap: () => ({ message: 'Please select a community category' }),
        }),
});
