package com.hyperlocal.backend.marketplace.repository;

import com.hyperlocal.backend.marketplace.dto.ListingAverageRatingView;
import com.hyperlocal.backend.marketplace.dto.ListingReviewItemResponse;
import com.hyperlocal.backend.marketplace.dto.ListingReviewSummaryView;
import com.hyperlocal.backend.marketplace.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByTransactionId(Long transactionId);

    long countByRevieweeUserIdAndRatingGreaterThanEqual(Long revieweeUserId, Integer rating);

    long countByRevieweeUserIdAndRatingLessThanEqual(Long revieweeUserId, Integer rating);

    @Query("""
            select new com.hyperlocal.backend.marketplace.dto.ListingReviewItemResponse(
                reviewer.name,
                r.rating,
                r.comment,
                r.recommend,
                r.createdAt
            )
            from Review r
            join com.hyperlocal.backend.user.entity.User reviewer on reviewer.id = r.reviewerUserId
            where r.listingId = :listingId
            """)
    Page<ListingReviewItemResponse> findListingReviewItems(@Param("listingId") Long listingId, Pageable pageable);

    @Query("""
            select
                coalesce(avg(r.rating), 0.0) as averageRating,
                count(r) as totalReviews
            from Review r
            where r.listingId = :listingId
            """)
    ListingReviewSummaryView getListingReviewSummary(@Param("listingId") Long listingId);

    @Query("""
            select
                r.listingId as listingId,
                avg(r.rating) as averageRating,
                count(r) as totalReviews
            from Review r
            where r.listingId in :listingIds
            group by r.listingId
            """)
    List<ListingAverageRatingView> findAverageRatingsByListingIds(@Param("listingIds") List<Long> listingIds);
}
