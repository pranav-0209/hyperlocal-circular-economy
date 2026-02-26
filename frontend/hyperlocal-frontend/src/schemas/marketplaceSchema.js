import { z } from 'zod';

export const ITEM_CATEGORIES = [
    'Electronics',
    'Vehicles',
    'Appliances',
    'Books',
    'Fashion',
    'Tools',
    'Sports',
    'Kids',
    'Other',
];

// App only supports Borrow & Lend
export const LISTING_TYPES = [
    { value: 'RENT', label: 'Borrow / Lend' },
];

export const CONDITIONS = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor',
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
    type: z.literal('RENT').default('RENT'),
    price: z
        .coerce.number()
        .min(1, 'Price per day must be at least ₹1'),
    condition: z
        .enum(CONDITIONS, {
            errorMap: () => ({ message: 'Please select item condition' }),
        }),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
    images: z.any().optional(),
});
