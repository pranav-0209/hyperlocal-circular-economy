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

    Page<BorrowRequest> findByRequester_IdOrderByRequestedAtDesc(Long requesterId, Pageable pageable);

    Page<BorrowRequest> findByRequester_IdAndStatusOrderByRequestedAtDesc(
            Long requesterId, BorrowRequestStatus status, Pageable pageable);

    Page<BorrowRequest> findByOwner_IdOrderByRequestedAtDesc(Long ownerId, Pageable pageable);

    Page<BorrowRequest> findByOwner_IdAndStatusOrderByRequestedAtDesc(
            Long ownerId, BorrowRequestStatus status, Pageable pageable);

    Page<BorrowRequest> findByOwner_IdAndListingIdOrderByRequestedAtDesc(Long ownerId, Long listingId, Pageable pageable);

    Page<BorrowRequest> findByOwner_IdAndListingIdAndStatusOrderByRequestedAtDesc(
            Long ownerId, Long listingId, BorrowRequestStatus status, Pageable pageable);

    boolean existsByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long listingId, BorrowRequestStatus status, LocalDate endDate, LocalDate startDate);

    List<BorrowRequest> findByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long listingId, BorrowRequestStatus status, LocalDate endDate, LocalDate startDate);

    boolean existsByListingIdAndStatus(Long listingId, BorrowRequestStatus status);

    List<BorrowRequest> findByListingIdAndStatusOrderByStartDateAsc(Long listingId, BorrowRequestStatus status);

    List<BorrowRequest> findByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
            Long listingId, BorrowRequestStatus status, LocalDate endDate, LocalDate startDate);

    List<BorrowRequest> findByListingIdInAndStatusInOrderByListingIdAscStartDateAsc(
            List<Long> listingIds, List<BorrowRequestStatus> statuses);

    long countByRequester_Id(Long requesterId);

    long countByRequester_IdAndStatus(Long requesterId, BorrowRequestStatus status);

    long countByRequester_IdAndStatusAndApprovedAtIsNotNull(Long requesterId, BorrowRequestStatus status);

    List<BorrowRequest> findByRequester_IdAndStatus(Long requesterId, BorrowRequestStatus status);

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
            join br.owner owner
            where br.requester.id = :requesterId
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
