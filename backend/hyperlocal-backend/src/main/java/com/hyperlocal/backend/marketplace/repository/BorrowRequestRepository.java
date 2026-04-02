package com.hyperlocal.backend.marketplace.repository;

import com.hyperlocal.backend.marketplace.dto.PendingReviewResponse;
import com.hyperlocal.backend.marketplace.entity.BorrowRequest;
import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    Page<BorrowRequest> findByRequesterIdOrderByRequestedAtDesc(Long requesterId, Pageable pageable);

    Page<BorrowRequest> findByRequesterIdAndStatusOrderByRequestedAtDesc(
            Long requesterId, BorrowRequestStatus status, Pageable pageable);

    Page<BorrowRequest> findByOwnerIdOrderByRequestedAtDesc(Long ownerId, Pageable pageable);

    Page<BorrowRequest> findByOwnerIdAndStatusOrderByRequestedAtDesc(
            Long ownerId, BorrowRequestStatus status, Pageable pageable);

    Page<BorrowRequest> findByOwnerIdAndListingIdOrderByRequestedAtDesc(Long ownerId, Long listingId, Pageable pageable);

    Page<BorrowRequest> findByOwnerIdAndListingIdAndStatusOrderByRequestedAtDesc(
            Long ownerId, Long listingId, BorrowRequestStatus status, Pageable pageable);

    boolean existsByListingIdAndStatusAndStartDateLessThanAndEndDateGreaterThan(
            Long listingId, BorrowRequestStatus status, LocalDate endDate, LocalDate startDate);

    List<BorrowRequest> findByListingIdAndStatusAndStartDateLessThanAndEndDateGreaterThan(
            Long listingId, BorrowRequestStatus status, LocalDate endDate, LocalDate startDate);

    boolean existsByListingIdAndStatus(Long listingId, BorrowRequestStatus status);

    List<BorrowRequest> findByListingIdAndStatusOrderByStartDateAsc(Long listingId, BorrowRequestStatus status);

    List<BorrowRequest> findByListingIdAndStatusAndStartDateLessThanAndEndDateGreaterThanOrderByStartDateAsc(
            Long listingId, BorrowRequestStatus status, LocalDate endDate, LocalDate startDate);

    @Query("""
            select new com.hyperlocal.backend.marketplace.dto.PendingReviewResponse(
                br.id,
                l.id,
                l.title,
                owner.id,
                owner.name
            )
            from BorrowRequest br
            join com.hyperlocal.backend.marketplace.entity.Listing l on l.id = br.listingId
            join com.hyperlocal.backend.user.entity.User owner on owner.id = br.ownerId
            where br.requesterId = :requesterId
              and br.status = :status
              and not exists (
                    select 1
                    from com.hyperlocal.backend.marketplace.entity.Review r
                    where r.transactionId = br.id
              )
            order by br.requestedAt desc
            """)
    List<PendingReviewResponse> findPendingReviewTransactions(
            @Param("requesterId") Long requesterId,
            @Param("status") BorrowRequestStatus status);
}
