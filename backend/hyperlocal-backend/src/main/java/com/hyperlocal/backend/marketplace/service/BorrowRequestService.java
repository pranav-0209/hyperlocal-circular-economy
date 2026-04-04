package com.hyperlocal.backend.marketplace.service;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.community.enums.MemberStatus;
import com.hyperlocal.backend.community.repository.CommunityMemberRepository;
import com.hyperlocal.backend.marketplace.dto.*;
import com.hyperlocal.backend.marketplace.entity.BorrowRequest;
import com.hyperlocal.backend.marketplace.entity.Listing;
import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import com.hyperlocal.backend.marketplace.repository.BorrowRequestRepository;
import com.hyperlocal.backend.marketplace.repository.ListingRepository;
import com.hyperlocal.backend.user.service.TrustScoreService;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final ListingRepository listingRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final TrustScoreService trustScoreService;

    @Transactional
    public BorrowRequestResponse createRequest(CreateBorrowRequestRequest request) {
        User currentUser = getAuthenticatedUser();
        validateDateRange(request.getStartDate(), request.getEndDate());

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        if (listing.getOwnerId().equals(currentUser.getId())) {
            throw new CustomExceptions.BorrowRequestAccessDeniedException("You cannot request your own listing.");
        }

        if (listing.getStatus() == ListingStatus.UNAVAILABLE) {
            throw new CustomExceptions.ListingUnavailableForBorrowException();
        }

        communityMemberRepository
                .findByCommunityIdAndUserId(listing.getCommunityId(), currentUser.getId())
                .filter(cm -> cm.getStatus() == MemberStatus.APPROVED)
                .orElseThrow(CustomExceptions.NotCommunityMemberException::new);

        validateWithinListingWindow(listing, request.getStartDate(), request.getEndDate());

        boolean overlapsApproved = borrowRequestRepository
                .existsByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        listing.getId(), BorrowRequestStatus.APPROVED, request.getEndDate(), request.getStartDate());
        if (overlapsApproved) {
            throw new CustomExceptions.BorrowRequestDateConflictException(
                    "Requested dates overlap with an approved borrow period.");
        }

        BorrowRequest borrowRequest = BorrowRequest.builder()
                .listingId(listing.getId())
                .requesterId(currentUser.getId())
                .ownerId(listing.getOwnerId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .message(request.getMessage())
                .status(BorrowRequestStatus.PENDING)
                .build();

        return toResponse(borrowRequestRepository.save(borrowRequest));
    }

    @Transactional
    public PagedResponseDto<BorrowRequestResponse> getMyRequests(BorrowRequestStatus status, int page, int size) {
        User currentUser = getAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());

        Page<BorrowRequest> requests = status == null
                ? borrowRequestRepository.findByRequesterIdOrderByRequestedAtDesc(currentUser.getId(), pageable)
                : borrowRequestRepository.findByRequesterIdAndStatusOrderByRequestedAtDesc(currentUser.getId(), status, pageable);

        return toPagedResponse(requests, true);
    }

    @Transactional
    public PagedResponseDto<BorrowRequestResponse> getIncomingRequests(
            BorrowRequestStatus status, Long listingId, int page, int size) {
        User currentUser = getAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());

        Page<BorrowRequest> requests;
        if (listingId != null && status != null) {
            requests = borrowRequestRepository.findByOwnerIdAndListingIdAndStatusOrderByRequestedAtDesc(
                    currentUser.getId(), listingId, status, pageable);
        } else if (listingId != null) {
            requests = borrowRequestRepository.findByOwnerIdAndListingIdOrderByRequestedAtDesc(
                    currentUser.getId(), listingId, pageable);
        } else if (status != null) {
            requests = borrowRequestRepository.findByOwnerIdAndStatusOrderByRequestedAtDesc(
                    currentUser.getId(), status, pageable);
        } else {
            requests = borrowRequestRepository.findByOwnerIdOrderByRequestedAtDesc(currentUser.getId(), pageable);
        }

        return toPagedResponse(requests, false);
    }

    @Transactional
    public BorrowRequestResponse getRequestById(Long requestId) {
        User currentUser = getAuthenticatedUser();
        BorrowRequest request = getRequestOrThrow(requestId);
        assertParticipant(request, currentUser.getId());
        return toResponse(request);
    }

    @Transactional
    public BorrowRequestResponse approveRequest(Long requestId) {
        User currentUser = getAuthenticatedUser();
        BorrowRequest request = getRequestOrThrow(requestId);
        assertOwner(request, currentUser.getId());
        assertStatus(request, BorrowRequestStatus.PENDING, "Only pending requests can be approved.");

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        boolean overlapsApproved = borrowRequestRepository
                .existsByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        request.getListingId(), BorrowRequestStatus.APPROVED, request.getEndDate(), request.getStartDate());
        if (overlapsApproved) {
            throw new CustomExceptions.BorrowRequestDateConflictException(
                    "Cannot approve. Dates overlap with another approved request.");
        }

        request.setStatus(BorrowRequestStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());

        listing.setStatus(ListingStatus.BORROWED);
        listingRepository.save(listing);

        List<BorrowRequest> overlappingPending = borrowRequestRepository
                .findByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        request.getListingId(), BorrowRequestStatus.PENDING, request.getEndDate(), request.getStartDate());

        for (BorrowRequest pending : overlappingPending) {
            if (!pending.getId().equals(request.getId())) {
                pending.setStatus(BorrowRequestStatus.REJECTED);
                pending.setRejectedAt(LocalDateTime.now());
                pending.setRejectionReason("Auto-rejected due to overlap with approved request #" + request.getId());
            }
        }

        borrowRequestRepository.saveAll(overlappingPending);
        return toResponse(borrowRequestRepository.save(request));
    }

    @Transactional
    public BorrowRequestResponse rejectRequest(Long requestId, RequestDecisionRequest requestBody) {
        User currentUser = getAuthenticatedUser();
        BorrowRequest request = getRequestOrThrow(requestId);
        assertOwner(request, currentUser.getId());
        assertStatus(request, BorrowRequestStatus.PENDING, "Only pending requests can be rejected.");

        request.setStatus(BorrowRequestStatus.REJECTED);
        request.setRejectedAt(LocalDateTime.now());
        if (requestBody != null) {
            request.setRejectionReason(requestBody.getReason());
        }

        return toResponse(borrowRequestRepository.save(request));
    }

    @Transactional
    public BorrowRequestResponse cancelRequest(Long requestId) {
        User currentUser = getAuthenticatedUser();
        BorrowRequest request = getRequestOrThrow(requestId);

        if (!request.getRequesterId().equals(currentUser.getId())) {
            throw new CustomExceptions.BorrowRequestAccessDeniedException(
                    "Only requester can cancel this borrow request.");
        }

        if (request.getStatus() == BorrowRequestStatus.PENDING) {
            request.setStatus(BorrowRequestStatus.CANCELLED);
            request.setCancelledAt(LocalDateTime.now());
            BorrowRequest savedRequest = borrowRequestRepository.save(request);
            trustScoreService.recalculateAndPersist(request.getRequesterId());
            return toResponse(savedRequest);
        }

        if (request.getStatus() == BorrowRequestStatus.APPROVED) {
            if (!LocalDate.now().isBefore(request.getStartDate())) {
                throw new CustomExceptions.BorrowRequestInvalidStateException(
                        "Approved requests can only be cancelled before startDate.");
            }

            request.setStatus(BorrowRequestStatus.CANCELLED);
            request.setCancelledAt(LocalDateTime.now());
            borrowRequestRepository.save(request);

            if (!borrowRequestRepository.existsByListingIdAndStatus(request.getListingId(), BorrowRequestStatus.APPROVED)) {
                listingRepository.findById(request.getListingId()).ifPresent(listing -> {
                    listing.setStatus(ListingStatus.AVAILABLE);
                    listingRepository.save(listing);
                });
            }

            trustScoreService.recalculateAndPersist(request.getRequesterId());
            return toResponse(request);
        }

        throw new CustomExceptions.BorrowRequestInvalidStateException(
                "Only pending or approved requests can be cancelled.");
    }

    @Transactional
    public BorrowRequestResponse completeRequest(Long requestId) {
        User currentUser = getAuthenticatedUser();
        BorrowRequest request = getRequestOrThrow(requestId);
        assertOwner(request, currentUser.getId());
        assertStatus(request, BorrowRequestStatus.APPROVED, "Only approved requests can be completed.");

        if (LocalDate.now().isBefore(request.getStartDate())) {
            throw new CustomExceptions.InvalidBorrowRequestDateException(
                    "You can only mark this request as complete on or after the start date.");
        }

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        request.setStatus(BorrowRequestStatus.COMPLETED);
        request.setReturnedAt(LocalDateTime.now());

        listing.setStatus(ListingStatus.AVAILABLE);
        listingRepository.save(listing);

        BorrowRequest savedRequest = borrowRequestRepository.save(request);
        trustScoreService.recalculateAndPersist(request.getRequesterId());

        return toResponse(savedRequest);
    }

    @Transactional
    public ListingAvailabilityResponse getListingAvailability(Long listingId, LocalDate fromDate, LocalDate toDate) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        if ((fromDate == null) != (toDate == null)) {
            throw new CustomExceptions.InvalidBorrowRequestDateException("Both fromDate and toDate are required together.");
        }
        if (fromDate != null) {
            validateDateRange(fromDate, toDate);
        }

        List<BorrowRequest> approved;
        if (fromDate == null) {
            approved = borrowRequestRepository.findByListingIdAndStatusOrderByStartDateAsc(
                    listingId, BorrowRequestStatus.APPROVED);
        } else {
            approved = borrowRequestRepository.findByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
                    listingId, BorrowRequestStatus.APPROVED, toDate, fromDate);
        }

        List<BlockedDateRangeResponse> blockedRanges = approved.stream()
                .map(r -> BlockedDateRangeResponse.builder()
                        .requestId(r.getId())
                        .startDate(r.getStartDate())
                        .endDate(r.getEndDate())
                        .build())
                .toList();

        Boolean requestedRangeAvailable = null;
        if (fromDate != null) {
            requestedRangeAvailable = !borrowRequestRepository
                    .existsByListingIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            listingId, BorrowRequestStatus.APPROVED, toDate, fromDate);
        }

        return ListingAvailabilityResponse.builder()
                .listingId(listingId)
                .availableFrom(listing.getAvailableFrom())
                .availableTo(listing.getAvailableTo())
                .requestedRangeAvailable(requestedRangeAvailable)
                .blockedRanges(blockedRanges)
                .build();
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new CustomExceptions.InvalidBorrowRequestDateException(
                    "endDate must be on or after startDate."
            );
        }
    }

    private void validateWithinListingWindow(Listing listing, LocalDate startDate, LocalDate endDate) {
        if (startDate.isBefore(listing.getAvailableFrom()) || endDate.isAfter(listing.getAvailableTo())) {
            throw new CustomExceptions.InvalidBorrowRequestDateException(
                    "Requested dates must be within listing availability window."
            );
        }
    }

    private BorrowRequest getRequestOrThrow(Long requestId) {
        return borrowRequestRepository.findById(requestId)
                .orElseThrow(CustomExceptions.BorrowRequestNotFoundException::new);
    }

    private void assertOwner(BorrowRequest request, Long userId) {
        if (!request.getOwnerId().equals(userId)) {
            throw new CustomExceptions.BorrowRequestAccessDeniedException(
                    "Only listing owner can perform this action.");
        }
    }

    private void assertParticipant(BorrowRequest request, Long userId) {
        if (!request.getOwnerId().equals(userId) && !request.getRequesterId().equals(userId)) {
            throw new CustomExceptions.BorrowRequestAccessDeniedException(
                    "Only requester or listing owner can access this borrow request.");
        }
    }

    private void assertStatus(BorrowRequest request, BorrowRequestStatus expected, String message) {
        if (request.getStatus() != expected) {
            throw new CustomExceptions.BorrowRequestInvalidStateException(message);
        }
    }

    private BorrowRequestResponse toResponse(BorrowRequest request) {
        return toResponse(request, null, null, null, null, null, true);
    }

    private BorrowRequestResponse toResponse(
            BorrowRequest request,
            String requesterName,
            String ownerName,
            String listingTitle,
            Integer requesterTrustIndex,
            Integer requesterTrustXp,
            boolean includeOwnerDetails
    ) {
        return BorrowRequestResponse.builder()
                .id(request.getId())
                .listingId(request.getListingId())
                .requesterId(request.getRequesterId())
                .requesterTrustIndex(requesterTrustIndex)
                .requesterTrustXp(requesterTrustXp)
                .ownerId(includeOwnerDetails ? request.getOwnerId() : null)
                .ownerName(includeOwnerDetails ? ownerName : null)
                .requesterName(requesterName)
                .listingTitle(listingTitle)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .message(request.getMessage())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .approvedAt(request.getApprovedAt())
                .returnedAt(request.getReturnedAt())
                .rejectionReason(request.getRejectionReason())
                .build();
    }

    private PagedResponseDto<BorrowRequestResponse> toPagedResponse(
            Page<BorrowRequest> requestPage,
            boolean includeOwnerDetails
    ) {
        List<BorrowRequest> requests = requestPage.getContent();
        if (requests.isEmpty()) {
            return PagedResponseDto.from(requestPage.map(this::toResponse));
        }

        var listingTitles = listingRepository.findAllById(extractListingIds(requests)).stream()
                .collect(Collectors.toMap(Listing::getId, Listing::getTitle));

        var requesterUsers = userRepository.findAllById(extractRequesterIds(requests)).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        var ownerNames = includeOwnerDetails
                ? userRepository.findAllById(extractOwnerIds(requests)).stream()
                        .collect(Collectors.toMap(User::getId, User::getName))
                : java.util.Collections.<Long, String>emptyMap();

        List<BorrowRequestResponse> content = requests.stream()
                .map(request -> toResponse(
                        request,
                        requesterUsers.get(request.getRequesterId()) != null
                                ? requesterUsers.get(request.getRequesterId()).getName()
                                : null,
                        ownerNames.get(request.getOwnerId()),
                        listingTitles.get(request.getListingId()),
                        requesterUsers.get(request.getRequesterId()) != null
                                ? requesterUsers.get(request.getRequesterId()).getTrustIndex()
                                : null,
                        requesterUsers.get(request.getRequesterId()) != null
                                ? requesterUsers.get(request.getRequesterId()).getTrustXp()
                                : null,
                        includeOwnerDetails
                ))
                .toList();

        return PagedResponseDto.<BorrowRequestResponse>builder()
                .content(content)
                .pageNumber(requestPage.getNumber())
                .pageSize(requestPage.getSize())
                .totalElements(requestPage.getTotalElements())
                .totalPages(requestPage.getTotalPages())
                .last(requestPage.isLast())
                .build();
    }

    private Set<Long> extractListingIds(List<BorrowRequest> requests) {
        return requests.stream()
                .map(BorrowRequest::getListingId)
                .collect(Collectors.toSet());
    }

    private Set<Long> extractRequesterIds(List<BorrowRequest> requests) {
        return requests.stream()
                .map(BorrowRequest::getRequesterId)
                .collect(Collectors.toSet());
    }

    private Set<Long> extractOwnerIds(List<BorrowRequest> requests) {
        return requests.stream()
                .map(BorrowRequest::getOwnerId)
                .collect(Collectors.toSet());
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

