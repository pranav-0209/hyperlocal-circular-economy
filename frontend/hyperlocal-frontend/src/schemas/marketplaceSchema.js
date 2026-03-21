import { z } from 'zod';

export const ITEM_CATEGORIES = [
    'Electronics',
    'Vehicles',
    'Furniture',
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
        .min(10, 'Description must be at least 10 characters')
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
    availableFrom: z
        .string()
        .min(1, 'Please select available from date'),
    availableTo: z
        .string()
        .min(1, 'Please select available to date'),
    images: z.any().optional(),
}).refine(
    (data) => new Date(data.availableTo) >= new Date(data.availableFrom),
    {
        message: 'Available to date must be on or after available from date',
        path: ['availableTo'],
    }
);
