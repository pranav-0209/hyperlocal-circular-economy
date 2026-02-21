import { z } from 'zod';

/**
 * Validation schema for registration form
 */
export const registerSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name must be less than 50 characters')
        .trim(),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .trim(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(50, 'Password must be less than 50 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    agreed: z
        .boolean()
        .refine((val) => val === true, {
            message: 'You must agree to the terms and privacy policy',
        }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // path of error
});

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .trim(),
    password: z
        .string()
        .min(1, 'Password is required'),
    // rememberMe is optional and not strictly validated beyond boolean type if used
});
