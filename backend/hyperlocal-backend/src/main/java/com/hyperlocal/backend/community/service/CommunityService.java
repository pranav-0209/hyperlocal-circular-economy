package com.hyperlocal.backend.community.service;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.dto.CommunityResponse;
import com.hyperlocal.backend.community.dto.CreateCommunityRequest;
import com.hyperlocal.backend.community.dto.JoinCommunityRequest;
import com.hyperlocal.backend.community.dto.PendingMemberResponse;
import com.hyperlocal.backend.community.dto.UpdateCommunityRequest;
import com.hyperlocal.backend.community.dto.UpdateCommunityStatusRequest;
import com.hyperlocal.backend.community.dto.UpdateJoinPolicyRequest;
import com.hyperlocal.backend.community.entity.Community;
import com.hyperlocal.backend.community.entity.CommunityMember;
import com.hyperlocal.backend.community.enums.CommunityRole;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import com.hyperlocal.backend.community.enums.JoinPolicy;
import com.hyperlocal.backend.community.enums.MemberStatus;
import com.hyperlocal.backend.community.repository.CommunityMemberRepository;
import com.hyperlocal.backend.community.repository.CommunityRepository;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommunityResponse createCommunity(CreateCommunityRequest request) {
        User currentUser = getAuthenticatedUser();

        if (communityRepository.existsByNameIgnoreCase(request.getName())) {
            throw new CustomExceptions.CommunityNameAlreadyExistsException(request.getName());
        }

        String code = generateUniqueCode(request.getName());

        JoinPolicy joinPolicy = request.getJoinPolicy() != null ? request.getJoinPolicy() : JoinPolicy.OPEN;

        Community community = Community.builder()
                .name(request.getName())
                .code(code)
                .description(request.getDescription())
                .category(request.getCategory())
                .joinPolicy(joinPolicy)
                .createdByUserId(currentUser.getId())
                .build();

        community = communityRepository.save(community);

        // Creator is always an APPROVED ADMIN
        CommunityMember adminMember = CommunityMember.builder()
                .community(community)
                .userId(currentUser.getId())
                .role(CommunityRole.ADMIN)
                .status(MemberStatus.APPROVED)
                .build();

        communityMemberRepository.save(adminMember);

        // Update user's community lists
        if (!currentUser.getCreatedCommunityIds().contains(community.getId())) {
            currentUser.getCreatedCommunityIds().add(community.getId());
        }
        if (!currentUser.getJoinedCommunityIds().contains(community.getId())) {
            currentUser.getJoinedCommunityIds().add(community.getId());
        }
        userRepository.save(currentUser);

        return buildCommunityResponse(community, currentUser.getId());
    }

    public CommunityResponse getCommunityById(Long communityId) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        Optional<CommunityMember> membershipOpt =
                communityMemberRepository.findByCommunityIdAndUserId(communityId, currentUser.getId());

        if (membershipOpt.isEmpty()) {
            throw new CustomExceptions.NotCommunityMemberException();
        }

        // Allow pending members to see basic info but signal their status
        return buildCommunityResponse(community, currentUser.getId());
    }

    @Transactional
    public CommunityResponse joinCommunity(JoinCommunityRequest request) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findByCode(request.getCode().toUpperCase())
                .orElseThrow(CustomExceptions.InvalidCommunityCodeException::new);

        Optional<CommunityMember> existing =
                communityMemberRepository.findByCommunityIdAndUserId(community.getId(), currentUser.getId());

        if (existing.isPresent()) {
            CommunityMember existingMember = existing.get();
            if (existingMember.getStatus() == MemberStatus.PENDING) {
                throw new CustomExceptions.JoinRequestPendingException();
            }
            throw new CustomExceptions.AlreadyMemberException();
        }

        MemberStatus initialStatus = community.getJoinPolicy() == JoinPolicy.APPROVAL_REQUIRED
                ? MemberStatus.PENDING
                : MemberStatus.APPROVED;

        CommunityMember member = CommunityMember.builder()
                .community(community)
                .userId(currentUser.getId())
                .role(CommunityRole.MEMBER)
                .status(initialStatus)
                .build();

        communityMemberRepository.save(member);

        // Only update user's joined list if immediately approved
        if (initialStatus == MemberStatus.APPROVED) {
            if (!currentUser.getJoinedCommunityIds().contains(community.getId())) {
                currentUser.getJoinedCommunityIds().add(community.getId());
                userRepository.save(currentUser);
            }
        }

        return buildCommunityResponse(community, currentUser.getId());
    }

    /**
     * Returns all pending join requests for a community (admin only).
     */
    public List<PendingMemberResponse> getPendingMembers(Long communityId) {
        User currentUser = getAuthenticatedUser();

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        assertIsAdmin(communityId, currentUser.getId());

        List<CommunityMember> pending =
                communityMemberRepository.findByCommunityIdAndStatus(communityId, MemberStatus.PENDING);

        List<Long> userIds = pending.stream().map(CommunityMember::getUserId).collect(Collectors.toList());
        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return pending.stream()
                .map(cm -> {
                    User u = usersById.get(cm.getUserId());
                    return PendingMemberResponse.builder()
                            .membershipId(cm.getId())
                            .userId(cm.getUserId())
                            .name(u != null ? u.getName() : "Unknown")
                            .email(u != null ? u.getEmail() : null)
                            .profilePhotoUrl(u != null ? u.getProfilePhotoUrl() : null)
                            .status(cm.getStatus())
                            .requestedAt(cm.getJoinedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Admin approves a pending join request.
     */
    @Transactional
    public void approveMember(Long communityId, Long membershipId) {
        User currentUser = getAuthenticatedUser();

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        assertIsAdmin(communityId, currentUser.getId());

        CommunityMember membership = communityMemberRepository.findById(membershipId)
                .orElseThrow(CustomExceptions.JoinRequestNotFoundException::new);

        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new CustomExceptions.JoinRequestNotFoundException();
        }

        membership.setStatus(MemberStatus.APPROVED);
        communityMemberRepository.save(membership);

        // Update the approved user's joinedCommunityIds
        userRepository.findById(membership.getUserId()).ifPresent(user -> {
            if (!user.getJoinedCommunityIds().contains(communityId)) {
                user.getJoinedCommunityIds().add(communityId);
                userRepository.save(user);
            }
        });
    }

    /**
     * Admin rejects (removes) a pending join request.
     */
    @Transactional
    public void rejectMember(Long communityId, Long membershipId) {
        User currentUser = getAuthenticatedUser();

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        assertIsAdmin(communityId, currentUser.getId());

        CommunityMember membership = communityMemberRepository.findById(membershipId)
                .orElseThrow(CustomExceptions.JoinRequestNotFoundException::new);

        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new CustomExceptions.JoinRequestNotFoundException();
        }

        communityMemberRepository.delete(membership);
    }

    public List<CommunityResponse> getMyCommunities() {
        User currentUser = getAuthenticatedUser();
        Long userId = currentUser.getId();

        List<CommunityMember> memberships = communityMemberRepository.findByUserId(userId);
        if (memberships.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> communityIds = memberships.stream()
                .map(cm -> cm.getCommunity().getId())
                .collect(Collectors.toList());

        Map<Long, Long> memberCountByCommunityId = communityMemberRepository
                .countByCommunityIdIn(communityIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) ((Object[]) row)[0],
                        row -> (Long) ((Object[]) row)[1]
                ));

        Map<Long, Long> pendingCountByCommunityId = communityMemberRepository
                .countPendingByCommunityIdIn(communityIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) ((Object[]) row)[0],
                        row -> (Long) ((Object[]) row)[1]
                ));

        Set<Long> adminCommunityIds = new HashSet<>(
                communityMemberRepository.findAdminCommunityIdsByUserId(userId));

        List<CommunityMember> allAdminMembers = communityIds.stream()
                .flatMap(cid -> communityMemberRepository
                        .findByCommunityIdAndRole(cid, CommunityRole.ADMIN).stream())
                .collect(Collectors.toList());

        List<Long> allAdminUserIds = allAdminMembers.stream()
                .map(CommunityMember::getUserId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, User> allAdminUsers = userRepository.findAllById(allAdminUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        Map<Long, List<String>> adminNamesByCommunityId = allAdminMembers.stream()
                .collect(Collectors.groupingBy(
                        cm -> cm.getCommunity().getId(),
                        Collectors.mapping(cm -> {
                            User u = allAdminUsers.get(cm.getUserId());
                            return u != null ? u.getName() : "Unknown";
                        }, Collectors.toList())
                ));

        return memberships.stream()
                .map(membership -> {
                    Community community = membership.getCommunity();
                    Long cid = community.getId();
                    boolean isAdmin = adminCommunityIds.contains(cid);

                    return CommunityResponse.builder()
                            .id(cid)
                            .name(community.getName())
                            .code(community.getCode())
                            .description(community.getDescription())
                            .category(community.getCategory())
                            .status(community.getStatus())
                            .joinPolicy(community.getJoinPolicy())
                            .admins(adminNamesByCommunityId.getOrDefault(cid, Collections.emptyList()))
                            .memberCount(memberCountByCommunityId.getOrDefault(cid, 0L))
                            .pendingCount(isAdmin ? pendingCountByCommunityId.getOrDefault(cid, 0L) : 0L)
                            .createdAt(community.getCreatedAt())
                            .inviteCode(isAdmin ? community.getCode() : null)
                            .isAdmin(isAdmin)
                            .membershipStatus(membership.getStatus().name())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public PagedResponseDto<CommunityMemberResponse> getCommunityMembers(Long communityId, Pageable pageable) {
        User currentUser = getAuthenticatedUser();

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        Optional<CommunityMember> membership =
                communityMemberRepository.findByCommunityIdAndUserId(communityId, currentUser.getId());

        if (membership.isEmpty() || membership.get().getStatus() == MemberStatus.PENDING) {
            throw new CustomExceptions.NotCommunityMemberException();
        }

        // Only show approved members
        Page<CommunityMember> membersPage =
                communityMemberRepository.findByCommunityIdAndStatus(communityId, MemberStatus.APPROVED, pageable);

        List<Long> userIds = membersPage.getContent().stream()
                .map(CommunityMember::getUserId)
                .collect(Collectors.toList());

        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        Page<CommunityMemberResponse> responsePage = membersPage.map(member -> {
            User user = usersById.get(member.getUserId());
            return CommunityMemberResponse.builder()
                    .userId(member.getUserId())
                    .name(user != null ? user.getName() : "Unknown")
                    .email(user != null ? user.getEmail() : null)
                    .role(member.getRole())
                    .joinedAt(member.getJoinedAt())
                    .profilePhotoUrl(user != null ? user.getProfilePhotoUrl() : null)
                    .build();
        });

        return PagedResponseDto.from(responsePage);
    }

    /**
     * Admin removes an approved member from the community.
     * The admin cannot remove themselves.
     */
    @Transactional
    public void removeMember(Long communityId, Long membershipId) {
        User currentUser = getAuthenticatedUser();

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        assertIsAdmin(communityId, currentUser.getId());

        CommunityMember membership = communityMemberRepository.findById(membershipId)
                .orElseThrow(CustomExceptions.JoinRequestNotFoundException::new);

        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new CustomExceptions.JoinRequestNotFoundException();
        }

        // Admin cannot remove themselves
        if (membership.getUserId().equals(currentUser.getId())) {
            throw new CustomExceptions.AccessDeniedException();
        }

        communityMemberRepository.delete(membership);

        // Remove communityId from the removed user's joinedCommunityIds
        userRepository.findById(membership.getUserId()).ifPresent(user -> {
            user.getJoinedCommunityIds().remove(communityId);
            userRepository.save(user);
        });
    }

    /**
     * Admin edits community name, description, and category.
     */
    @Transactional
    public CommunityResponse updateCommunity(Long communityId, UpdateCommunityRequest request) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        assertIsAdmin(communityId, currentUser.getId());

        // Check name uniqueness only if the name actually changed
        if (!community.getName().equalsIgnoreCase(request.getName())
                && communityRepository.existsByNameIgnoreCase(request.getName())) {
            throw new CustomExceptions.CommunityNameAlreadyExistsException(request.getName());
        }

        community.setName(request.getName());
        community.setDescription(request.getDescription());
        community.setCategory(request.getCategory());
        communityRepository.save(community);

        return buildCommunityResponse(community, currentUser.getId());
    }

    /**
     * Admin changes the join policy (OPEN / APPROVAL_REQUIRED).
     */
    @Transactional
    public CommunityResponse updateJoinPolicy(Long communityId, UpdateJoinPolicyRequest request) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        assertIsAdmin(communityId, currentUser.getId());

        community.setJoinPolicy(request.getJoinPolicy());
        communityRepository.save(community);

        return buildCommunityResponse(community, currentUser.getId());
    }

    /**
     * Admin changes the community status (ACTIVE / INACTIVE).
     */
    @Transactional
    public CommunityResponse updateStatus(Long communityId, UpdateCommunityStatusRequest request) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        assertIsAdmin(communityId, currentUser.getId());

        community.setStatus(request.getStatus());
        communityRepository.save(community);

        return buildCommunityResponse(community, currentUser.getId());
    }

    private CommunityResponse buildCommunityResponse(Community community, Long requestingUserId) {
        List<CommunityMember> adminMembers = communityMemberRepository
                .findByCommunityIdAndRole(community.getId(), CommunityRole.ADMIN);

        List<Long> adminUserIds = adminMembers.stream()
                .map(CommunityMember::getUserId)
                .collect(Collectors.toList());

        Map<Long, User> adminUsers = userRepository.findAllById(adminUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<String> adminNames = adminMembers.stream()
                .map(m -> {
                    User u = adminUsers.get(m.getUserId());
                    return u != null ? u.getName() : "Unknown";
                })
                .collect(Collectors.toList());

        long memberCount = communityMemberRepository.countByCommunityIdAndStatus(community.getId(), MemberStatus.APPROVED);

        boolean isAdmin = adminUserIds.contains(requestingUserId);

        long pendingCount = isAdmin
                ? communityMemberRepository.countByCommunityIdAndStatus(community.getId(), MemberStatus.PENDING)
                : 0L;

        Optional<CommunityMember> myMembership =
                communityMemberRepository.findByCommunityIdAndUserId(community.getId(), requestingUserId);

        String membershipStatus = myMembership.map(cm -> cm.getStatus().name()).orElse(null);

        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .code(community.getCode())
                .description(community.getDescription())
                .category(community.getCategory())
                .joinPolicy(community.getJoinPolicy())
                .admins(adminNames)
                .memberCount(memberCount)
                .pendingCount(pendingCount)
                .createdAt(community.getCreatedAt())
                .inviteCode(isAdmin ? community.getCode() : null)
                .isAdmin(isAdmin)
                .membershipStatus(membershipStatus)
                .status(community.getStatus())
                .build();
    }

    /** Throws {@link CustomExceptions.NotCommunityAdminException} if the user is not an ADMIN. */
    private void assertIsAdmin(Long communityId, Long userId) {
        boolean isAdmin = communityMemberRepository
                .findByCommunityIdAndUserId(communityId, userId)
                .map(cm -> cm.getRole() == CommunityRole.ADMIN)
                .orElse(false);
        if (!isAdmin) {
            throw new CustomExceptions.NotCommunityAdminException();
        }
    }

    private String generateUniqueCode(String name) {
        String prefix = name.toUpperCase().replaceAll("[^A-Z]", "");
        if (prefix.length() < 3) {
            prefix = (prefix + "XXX").substring(0, 3);
        } else {
            prefix = prefix.substring(0, 3);
        }

        Random random = new Random();
        String code;
        int attempts = 0;
        do {
            int digits = 1000 + random.nextInt(9000);
            code = prefix + "-" + digits;
            attempts++;
            if (attempts > 100) {
                prefix = String.valueOf((char) ('A' + random.nextInt(26)))
                        + (char) ('A' + random.nextInt(26))
                        + (char) ('A' + random.nextInt(26));
            }
        } while (communityRepository.existsByCode(code));

        return code;
    }

    private User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new CustomExceptions.UnauthorizedAccessException();
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(CustomExceptions.UserNotFoundException::new);
    }
}
