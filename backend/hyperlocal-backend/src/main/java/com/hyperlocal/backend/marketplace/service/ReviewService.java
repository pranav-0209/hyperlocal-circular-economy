package com.hyperlocal.backend.marketplace.service;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.marketplace.dto.*;
import com.hyperlocal.backend.marketplace.entity.BorrowRequest;
import com.hyperlocal.backend.marketplace.entity.Review;
import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import com.hyperlocal.backend.marketplace.repository.BorrowRequestRepository;
import com.hyperlocal.backend.marketplace.repository.ListingRepository;
import com.hyperlocal.backend.marketplace.repository.ReviewRepository;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        User currentUser = getAuthenticatedUser();

        BorrowRequest transaction = borrowRequestRepository.findById(request.getTransactionId())
                .orElseThrow(CustomExceptions.BorrowRequestNotFoundException::new);

        // Status alone is the source of truth for review eligibility.
        if (transaction.getStatus() != BorrowRequestStatus.COMPLETED) {
            throw new CustomExceptions.ReviewInvalidStateException(
                    "Review can only be submitted after a completed transaction.");
        }

        if (!transaction.getRequesterId().equals(currentUser.getId())) {
            throw new CustomExceptions.ReviewAccessDeniedException(
                    "Only the borrower can submit a review for this transaction.");
        }

        if (reviewRepository.existsByTransactionId(transaction.getId())) {
            throw new CustomExceptions.ReviewAlreadyExistsException();
        }

        if (!transaction.getListingId().equals(request.getListingId())) {
            throw new CustomExceptions.ReviewPayloadMismatchException(
                    "listingId does not match the transaction.");
        }

        if (!transaction.getOwnerId().equals(request.getRevieweeUserId())) {
            throw new CustomExceptions.ReviewPayloadMismatchException(
                    "revieweeUserId must match the listing owner for the transaction.");
        }

        listingRepository.findById(request.getListingId())
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        User reviewee = userRepository.findById(request.getRevieweeUserId())
                .orElseThrow(CustomExceptions.UserNotFoundException::new);

        Review review = Review.builder()
                .transactionId(transaction.getId())
                .listingId(request.getListingId())
                .reviewerUserId(currentUser.getId())
                .revieweeUserId(reviewee.getId())
                .rating(request.getRating())
                .comment(request.getComment())
                .recommend(request.getRecommend())
                .build();

        Review saved = reviewRepository.save(review);
        updateRevieweeStats(reviewee, request.getRating());

        return toReviewResponse(saved, currentUser.getName(), reviewee.getName());
    }

    @Transactional
    public ListingReviewsResponse getListingReviews(Long listingId, Pageable pageable) {
        if (!listingRepository.existsById(listingId)) {
            throw new CustomExceptions.ListingNotFoundException();
        }

        Page<ListingReviewItemResponse> page = reviewRepository.findListingReviewItems(listingId, pageable);
        ListingReviewSummaryView summaryView = reviewRepository.getListingReviewSummary(listingId);

        ListingReviewSummaryResponse summary = ListingReviewSummaryResponse.builder()
                .averageRating(summaryView.getAverageRating())
                .totalReviews(summaryView.getTotalReviews())
                .build();

        return ListingReviewsResponse.builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .summary(summary)
                .build();
    }

    @Transactional
    public List<PendingReviewResponse> getMyPendingReviews() {
        User currentUser = getAuthenticatedUser();
        return borrowRequestRepository.findPendingReviewTransactions(currentUser.getId(), BorrowRequestStatus.COMPLETED);
    }

    private void updateRevieweeStats(User reviewee, int newRating) {
        int currentTotal = reviewee.getTotalReviews() == null ? 0 : reviewee.getTotalReviews();
        double currentAverage = reviewee.getAverageRating() == null ? 0.0 : reviewee.getAverageRating();

        int updatedTotal = currentTotal + 1;
        double updatedAverage = ((currentAverage * currentTotal) + newRating) / updatedTotal;

        reviewee.setTotalReviews(updatedTotal);
        reviewee.setAverageRating(updatedAverage);
        userRepository.save(reviewee);
    }

    private ReviewResponse toReviewResponse(Review review, String reviewerName, String revieweeName) {
        return ReviewResponse.builder()
                .id(review.getId())
                .transactionId(review.getTransactionId())
                .listingId(review.getListingId())
                .reviewerUserId(review.getReviewerUserId())
                .reviewerName(reviewerName)
                .revieweeUserId(review.getRevieweeUserId())
                .revieweeName(revieweeName)
                .rating(review.getRating())
                .comment(review.getComment())
                .recommend(review.getRecommend())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || "anonymousUser".equals(auth.getName())) {
            throw new CustomExceptions.UnauthorizedAccessException();
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(CustomExceptions.UserNotFoundException::new);
    }
}
