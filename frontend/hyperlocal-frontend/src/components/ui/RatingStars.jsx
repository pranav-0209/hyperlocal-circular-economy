import { Star } from 'lucide-react';

const normalizeRating = (rating) => {
    const parsed = Number(rating);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(5, Math.round(parsed)));
};

export default function RatingStars({ rating = 0, size = 14, className = '' }) {
    const filledCount = normalizeRating(rating);

    return (
        <span className={`inline-flex items-center gap-0.5 ${className}`.trim()} aria-label={`Rating ${filledCount} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => {
                const filled = index < filledCount;
                return (
                    <Star
                        key={index}
                        size={size}
                        strokeWidth={1.9}
                        className={filled ? 'text-amber-500 fill-amber-500' : 'text-amber-300'}
                    />
                );
            })}
        </span>
    );
}
