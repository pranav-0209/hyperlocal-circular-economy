package com.hyperlocal.backend.marketplace.entity;

import com.hyperlocal.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_review_transaction", columnNames = "transaction_id")
        },
        indexes = {
                @Index(name = "idx_reviews_listing", columnList = "listing_id"),
                @Index(name = "idx_reviews_reviewer", columnList = "reviewer_user_id"),
                @Index(name = "idx_reviews_reviewee", columnList = "reviewee_user_id")
        }
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, updatable = false)
    private Long transactionId;

    @Column(name = "listing_id", nullable = false, updatable = false)
    private Long listingId;

    /**
     * The user who wrote the review (the borrower).
     * Generates FK: reviews.reviewer_user_id -> users.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_user_id", nullable = false, updatable = false)
    private User reviewer;

    /**
     * The user being reviewed (the listing owner).
     * Generates FK: reviews.reviewee_user_id -> users.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewee_user_id", nullable = false, updatable = false)
    private User reviewee;

    @Column(nullable = false, updatable = false)
    private Integer rating;

    @Column(length = 1000, updatable = false)
    private String comment;

    @Column(nullable = false, updatable = false)
    private Boolean recommend;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Convenience accessor — avoids eager-loading the full User just for the ID. */
    public Long getReviewerUserId() {
        return reviewer != null ? reviewer.getId() : null;
    }

    /** Convenience accessor — avoids eager-loading the full User just for the ID. */
    public Long getRevieweeUserId() {
        return reviewee != null ? reviewee.getId() : null;
    }
}
