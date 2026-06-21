package com.hyperlocal.backend.marketplace.entity;

import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import com.hyperlocal.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long listingId;

    /**
     * The user who made the borrow request.
     * Generates FK: borrow_requests.requester_id -> users.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    /**
     * The listing owner at the time the request was made.
     * Generates FK: borrow_requests.owner_id -> users.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BorrowRequestStatus status = BorrowRequestStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    private LocalDateTime returnedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime cancelledAt;

    @Column(length = 500)
    private String rejectionReason;

    /** Convenience accessor — avoids eager-loading the full User just for the ID. */
    public Long getRequesterId() {
        return requester != null ? requester.getId() : null;
    }

    /** Convenience accessor — avoids eager-loading the full User just for the ID. */
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }
}
