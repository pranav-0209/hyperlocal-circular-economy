import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { getListingReviews, submitReview } from '../../services/marketplaceService';
import RatingStars from '../ui/RatingStars';

const formatReviewDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value || '';
    return parsed.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function ListingReviewsSection({ itemId, itemTitle, reviewContext, reviewsData, isLoading, isError, onRefresh }) {
    const queryClient = useQueryClient();
    const shouldFetch = !reviewsData;
    const { data: fetchedData, isLoading: isFetching, isError: fetchError, refetch } = useQuery({
        queryKey: ['listingReviews', itemId],
        queryFn: () => getListingReviews(itemId, { page: 0, size: 5, sort: 'createdAt,desc' }),
        enabled: shouldFetch && Boolean(itemId),
    });

    const resolvedData = reviewsData ?? fetchedData;
    const loadingState = isLoading ?? isFetching;
    const errorState = isError ?? fetchError;
    const summary = useMemo(
        () => resolvedData?.summary ?? { averageRating: 0, totalReviews: 0 },
        [resolvedData?.summary]
    );
    const reviews = useMemo(
        () => resolvedData?.content ?? [],
        [resolvedData?.content]
    );

    const [pendingRating, setPendingRating] = useState(5);
    const [pendingComment, setPendingComment] = useState('');
    const [pendingRecommend, setPendingRecommend] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const normalizedReviews = useMemo(() => reviews.map((review, index) => ({
        id: review.id ?? `review-${index}`,
        author: review.reviewerName ?? review.author ?? 'Community member',
        avatar: (review.reviewerName ?? review.author ?? 'CM').slice(0, 2).toUpperCase(),
        rating: Number(review.rating ?? 0),
        date: review.createdAt ?? review.date ?? '',
        text: review.comment ?? review.text ?? '',
        recommend: Boolean(review.recommend),
    })), [reviews]);

    const averageRating = Number(summary.averageRating ?? 0);
    const totalRatings = Number(summary.totalReviews ?? 0);
    const recommendRate = Number(
        summary.recommendRate
        ?? summary.recommendationRate
        ?? summary.recommendPercentage
        ?? (normalizedReviews.length
            ? Math.round((normalizedReviews.filter((review) => review.recommend).length / normalizedReviews.length) * 100)
            : 0)
    );
    const reviewsToRender = normalizedReviews;
    const canReview = Boolean(reviewContext?.transactionId && reviewContext?.revieweeUserId && itemId);
    const showTopEmptyHint = !loadingState && !errorState && totalRatings === 0;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!canReview) {
            toast.error('You can only review after completing a borrow request.');
            return;
        }

        if (pendingComment.trim().length < 12) {
            toast.error('Please share at least 12 characters of feedback.');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitReview({
                transactionId: reviewContext.transactionId,
                listingId: itemId,
                revieweeUserId: reviewContext.revieweeUserId,
                rating: pendingRating,
                comment: pendingComment.trim(),
                recommend: pendingRecommend,
            });

            setPendingComment('');
            setPendingRating(5);
            setPendingRecommend(true);

            if (reviewContext?.transactionId) {
                const cacheKey = 'submittedReviewTransactions';
                let existing = [];
                try {
                    const parsed = JSON.parse(sessionStorage.getItem(cacheKey) || '[]');
                    existing = Array.isArray(parsed) ? parsed : [];
                } catch {
                    existing = [];
                }

                if (!existing.includes(reviewContext.transactionId)) {
                    sessionStorage.setItem(cacheKey, JSON.stringify([...existing, reviewContext.transactionId]));
                }
            }

            toast.success('Review submitted successfully.');
            queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
            queryClient.invalidateQueries({ queryKey: ['listingReviews', itemId] });
            if (onRefresh) {
                await onRefresh();
            } else if (refetch) {
                await refetch();
            }
        } catch (error) {
            toast.error(error?.message ?? 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">reviews</span>
                        Item ratings and feedback
                    </h2>
                    <p className="text-xs text-muted-green mt-1">
                        Community feedback for {itemTitle || 'this listing'}
                    </p>
                </div>
            </div>

            {showTopEmptyHint && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                    No reviews yet. Be the first borrower to leave feedback for this listing.
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-green">Average rating</p>
                    <p className="text-2xl font-bold text-charcoal mt-1">{averageRating.toFixed(1)}</p>
                    <div className="mt-1">
                        <RatingStars rating={averageRating} size={18} />
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-green">Total ratings</p>
                    <p className="text-2xl font-bold text-charcoal mt-1">{totalRatings}</p>
                    <p className="text-xs text-muted-green mt-1">Includes recent community exchanges</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-green">Would recommend</p>
                    <p className="text-2xl font-bold text-charcoal mt-1">{recommendRate}%</p>
                    <p className="text-xs text-muted-green mt-1">Based on the latest reviews shown</p>
                </div>
            </div>

            <div className="space-y-3">
                {loadingState ? (
                    <div className="text-sm text-muted-green">Loading reviews...</div>
                ) : errorState ? (
                    <div className="text-sm text-red-600">Failed to load reviews.</div>
                ) : reviewsToRender.length === 0 ? (
                    <div className="text-sm text-muted-green bg-gray-50 rounded-xl p-4">No reviews yet.</div>
                ) : reviewsToRender.slice(0, 5).map((review) => (
                    <article key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                                {review.avatar || review.author.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-charcoal truncate">{review.author}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <RatingStars rating={review.rating} size={14} />
                                    <span className="text-xs text-muted-green">{formatReviewDate(review.date)}</span>
                                    {review.recommend && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                                            Recommends
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted-green leading-relaxed mt-3">{review.text}</p>
                    </article>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="text-sm font-bold text-charcoal">Leave feedback</h3>

                {!canReview && (
                    <div className="text-xs text-muted-green bg-gray-50 border border-gray-100 rounded-xl p-3">
                        Reviews are available after a completed borrow request.
                    </div>
                )}

                <div>
                    <p className="text-xs font-semibold text-muted-green mb-2">Your rating</p>
                    <div className="inline-flex items-center gap-1 rounded-xl bg-gray-50 border border-gray-200 px-2 py-1.5">
                        {Array.from({ length: 5 }, (_, index) => {
                            const starValue = index + 1;
                            const filled = starValue <= pendingRating;
                            return (
                                <button
                                    key={starValue}
                                    type="button"
                                    onClick={() => setPendingRating(starValue)}
                                    disabled={!canReview}
                                    className="p-0.5"
                                    aria-label={`Set rating to ${starValue}`}
                                >
                                    <Star
                                        size={20}
                                        strokeWidth={1.9}
                                        className={filled ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                                    />
                                </button>
                            );
                        })}
                        <span className="ml-1 text-xs font-semibold text-charcoal">{pendingRating}.0 / 5</span>
                    </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-charcoal font-medium">
                    <input
                        type="checkbox"
                        checked={pendingRecommend}
                        onChange={(event) => setPendingRecommend(event.target.checked)}
                        disabled={!canReview}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    I would recommend this listing to others
                </label>

                <div>
                    <label htmlFor="review-comment" className="text-xs font-semibold text-muted-green">Comment</label>
                    <textarea
                        id="review-comment"
                        value={pendingComment}
                        onChange={(event) => setPendingComment(event.target.value)}
                        rows={3}
                        placeholder="Share item condition, communication, and return experience..."
                        disabled={!canReview}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!canReview || isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-base">send</span>
                    {isSubmitting ? 'Submitting...' : 'Submit feedback'}
                </button>
            </form>
        </section>
    );
}
