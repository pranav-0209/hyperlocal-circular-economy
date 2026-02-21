import { z } from 'zod';

/**
 * Validation schema for profile verification form
 * Used in VerifyProfilePage
 */
export const profileSchema = z.object({
    phoneNumber: z
        .string()
        .min(1, 'Phone number is required')
        .transform(val => val.replace(/\D/g, '')) // Remove non-digits
        .refine(val => val.length >= 10, {
            message: 'Please enter a valid 10-digit phone number',
        }),
    address: z
        .string()
        .min(3, 'Address must be at least 3 characters')
        .max(200, 'Address must be less than 200 characters')
        .trim(),
    bio: z
        .string()
        .min(10, 'Bio must be at least 10 characters')
        .max(500, 'Bio must be less than 500 characters')
        .trim(),
});

/**
 * Validation rules for document uploads
 * Used in VerifyDocumentsPage for file validation
 */
export const documentValidation = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],

    validateFile: (file) => {
        if (!file) {
            return { valid: false, error: 'File is required' };
        }

        if (file.size > documentValidation.maxSize) {
            return { valid: false, error: 'File must be less than 5MB' };
        }

        if (!documentValidation.allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Only JPG, PNG, or PDF files are allowed' };
        }

        return { valid: true };
    },
};
