package com.hyperlocal.backend.marketplace.service;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.common.storage.FileStorageService;
import com.hyperlocal.backend.community.entity.Community;
import com.hyperlocal.backend.community.enums.MemberStatus;
import com.hyperlocal.backend.community.repository.CommunityMemberRepository;
import com.hyperlocal.backend.community.repository.CommunityRepository;
import com.hyperlocal.backend.marketplace.dto.*;
import com.hyperlocal.backend.marketplace.entity.Listing;
import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import com.hyperlocal.backend.marketplace.repository.ListingRepository;
import com.hyperlocal.backend.marketplace.repository.ListingSpecification;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import com.hyperlocal.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final ListingRepository listingRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        User currentUser = getAuthenticatedUser();

        // Verify the user is an approved member of the target community
        communityMemberRepository
                .findByCommunityIdAndUserId(request.getCommunityId(), currentUser.getId())
                .filter(cm -> cm.getStatus() == MemberStatus.APPROVED)
                .orElseThrow(CustomExceptions.NotCommunityMemberForListingException::new);

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        List<String> imageUrls = uploadImages(request.getImages(), currentUser.getId());

        Listing listing = Listing.builder()
                .ownerId(currentUser.getId())
                .communityId(request.getCommunityId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .condition(request.getCondition())
                .images(imageUrls)
                .status(ListingStatus.AVAILABLE)
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .build();

        listing = listingRepository.save(listing);
        return buildListingResponse(listing, currentUser, community);
    }

    // ── Browse (scoped to user's communities) ────────────────────────────────

    @Transactional
    public PagedResponseDto<ListingResponse> getListings(
            String search, ListingCategory category, ListingStatus status,
            Long communityId, Pageable pageable) {

        User currentUser = getAuthenticatedUser();

        org.springframework.data.jpa.domain.Specification<Listing> spec;

        if (communityId != null) {
            // Specific community filter — user must be a member
            communityMemberRepository
                    .findByCommunityIdAndUserId(communityId, currentUser.getId())
                    .filter(cm -> cm.getStatus() == MemberStatus.APPROVED)
                    .orElseThrow(CustomExceptions.NotCommunityMemberException::new);

            spec = ListingSpecification.browseInCommunity(communityId, status, category, search);
        } else {
            // Query community_members directly — source of truth, never stale
            List<Long> communityIds = communityMemberRepository
                    .findApprovedCommunityIdsByUserId(currentUser.getId());

            if (communityIds.isEmpty()) {
                return PagedResponseDto.from(Page.empty(pageable));
            }
            spec = ListingSpecification.browse(communityIds, status, category, search);
        }

        // Get the accurate total count with a separate count query
        long totalElements = listingRepository.count(spec);

        // Fetch just the page of listings
        List<Listing> listings = listingRepository.findAll(spec, pageable).getContent();

        // Batch-load owners and communities
        List<Long> ownerIds = listings.stream().map(Listing::getOwnerId).distinct().collect(Collectors.toList());
        List<Long> communityIds = listings.stream().map(Listing::getCommunityId).distinct().collect(Collectors.toList());

        Map<Long, User> usersById = userRepository.findAllById(ownerIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, Community> communitiesById = communityRepository.findAllById(communityIds).stream()
                .collect(Collectors.toMap(Community::getId, c -> c));

        // Build responses inside the transaction (Hibernate session still open)
        List<ListingResponse> responses = listings.stream()
                .map(l -> buildListingResponse(l, usersById.get(l.getOwnerId()), communitiesById.get(l.getCommunityId())))
                .collect(Collectors.toList());

        Page<ListingResponse> responsePage = new PageImpl<>(responses, pageable, totalElements);
        return PagedResponseDto.from(responsePage);
    }

    // ── Single listing ────────────────────────────────────────────────────────

    @Transactional
    public ListingResponse getListingById(Long listingId) {
        User currentUser = getAuthenticatedUser();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        // User must be a member of the community the listing belongs to
        communityMemberRepository
                .findByCommunityIdAndUserId(listing.getCommunityId(), currentUser.getId())
                .filter(cm -> cm.getStatus() == MemberStatus.APPROVED)
                .orElseThrow(CustomExceptions.NotCommunityMemberException::new);

        Community community = communityRepository.findById(listing.getCommunityId())
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);
        User owner = userRepository.findById(listing.getOwnerId())
                .orElseThrow(CustomExceptions.UserNotFoundException::new);

        return buildListingResponse(listing, owner, community);
    }

    // ── My listings ───────────────────────────────────────────────────────────

    @Transactional
    public List<ListingResponse> getMyListings(ListingStatus status) {
        User currentUser = getAuthenticatedUser();

        List<Listing> listings = status != null
                ? listingRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(currentUser.getId(), status)
                : listingRepository.findByOwnerIdOrderByCreatedAtDesc(currentUser.getId());

        // Force-initialize lazy images while Hibernate session is still open
        listings.forEach(l -> l.getImages().size());

        List<Long> communityIds = listings.stream().map(Listing::getCommunityId).distinct().collect(Collectors.toList());
        Map<Long, Community> communitiesById = communityRepository.findAllById(communityIds).stream()
                .collect(Collectors.toMap(Community::getId, c -> c));

        return listings.stream()
                .map(l -> buildListingResponse(l, currentUser, communitiesById.get(l.getCommunityId())))
                .collect(Collectors.toList());
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public ListingResponse updateListing(Long listingId, UpdateListingRequest request) {
        User currentUser = getAuthenticatedUser();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        assertOwner(listing, currentUser.getId());

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());
        listing.setPrice(request.getPrice());
        listing.setCondition(request.getCondition());
        listing.setAvailableFrom(request.getAvailableFrom());
        listing.setAvailableTo(request.getAvailableTo());

        // Replace images only if new ones are sent
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<String> newUrls = uploadImages(request.getImages(), currentUser.getId());
            listing.getImages().clear();
            listing.getImages().addAll(newUrls);
        }

        listing = listingRepository.save(listing);

        Community community = communityRepository.findById(listing.getCommunityId())
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);
        return buildListingResponse(listing, currentUser, community);
    }

    // ── Toggle availability ───────────────────────────────────────────────────

    @Transactional
    public ListingStatusResponse toggleAvailability(Long listingId) {
        User currentUser = getAuthenticatedUser();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        assertOwner(listing, currentUser.getId());

        if (listing.getStatus() == ListingStatus.BORROWED) {
            throw new CustomExceptions.ListingAccessDeniedException(
                    "Cannot toggle availability while the item is currently borrowed.");
        }
        ListingStatus next = listing.getStatus() == ListingStatus.AVAILABLE
                ? ListingStatus.UNAVAILABLE
                : ListingStatus.AVAILABLE;

        listing.setStatus(next);
        listingRepository.save(listing);

        return ListingStatusResponse.builder()
                .id(listing.getId())
                .status(next)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteListing(Long listingId) {
        User currentUser = getAuthenticatedUser();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(CustomExceptions.ListingNotFoundException::new);

        assertOwner(listing, currentUser.getId());
        listingRepository.delete(listing);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertOwner(Listing listing, Long userId) {
        if (!listing.getOwnerId().equals(userId)) {
            throw new CustomExceptions.ListingAccessDeniedException();
        }
    }

    private List<String> uploadImages(List<MultipartFile> files, Long userId) {
        List<String> urls = new ArrayList<>();
        if (files == null || files.isEmpty()) return urls;

        for (int i = 0; i < Math.min(files.size(), 5); i++) {
            MultipartFile file = files.get(i);
            if (file != null && !file.isEmpty()) {
                try {
                    urls.add(fileStorageService.storeListingImage(file, userId, i));
                } catch (IOException e) {
                    throw new CustomExceptions.FileUploadException(e);
                }
            }
        }
        return urls;
    }

    private ListingResponse buildListingResponse(Listing listing, User owner, Community community) {
        ListingOwnerDto ownerDto = null;
        if (owner != null) {
            ownerDto = ListingOwnerDto.builder()
                    .userId(owner.getId())
                    .name(owner.getName())
                    .profilePhotoUrl(owner.getProfilePhotoUrl())
                    .averageRating(owner.getAverageRating())
                    .totalReviews(owner.getTotalReviews())
                    .verified(owner.getVerificationStatus() == VerificationStatus.VERIFIED)
                    .build();
        }

        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(listing.getCategory())
                .price(listing.getPrice())
                .condition(listing.getCondition())
                .images(new ArrayList<>(listing.getImages()))  // detach from Hibernate PersistentBag
                .status(listing.getStatus())
                .communityId(listing.getCommunityId())
                .communityName(community != null ? community.getName() : null)
                .owner(ownerDto)
                .availableFrom(listing.getAvailableFrom())
                .availableTo(listing.getAvailableTo())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
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

