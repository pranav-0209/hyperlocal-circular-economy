import { z } from 'zod';

export const ITEM_CATEGORIES = [
    'Tools',
    'Electronics',
    'Home & Garden',
    'Books',
    'Sports',
    'Clothing',
    'Services',
    'Other'
];

export const LISTING_TYPES = [
    { value: 'GIFT', label: 'Gift / Free' },
    { value: 'RENT', label: 'Rent / Borrow' },
    { value: 'SALE', label: 'For Sale' }
];

export const CONDITIONS = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor'
];

export const marketplaceSchema = z.object({
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must be less than 100 characters')
        .trim(),
    description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(500, 'Description must be less than 500 characters')
        .trim(),
    category: z
        .enum(ITEM_CATEGORIES, {
            errorMap: () => ({ message: 'Please select a valid category' }),
        }),
    type: z
        .enum(['GIFT', 'RENT', 'SALE'], {
            errorMap: () => ({ message: 'Please select a listing type' }),
        }),
    price: z
        .coerce.number()
        .min(0, 'Price must be a positive number')
        .optional(),
    condition: z
        .enum(CONDITIONS, {
            errorMap: () => ({ message: 'Please select item condition' }),
        }),
    images: z
        .any()
        .optional(), // File upload handling will be separate or basic for now
}).refine((data) => {
    if ((data.type === 'RENT' || data.type === 'SALE') && (!data.price || data.price <= 0)) {
        return false;
    }
    return true;
}, {
    message: "Price is required for Rent or Sale items",
    path: ["price"],
});
