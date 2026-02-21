package com.hyperlocal.backend.community.service;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.dto.CommunityResponse;
import com.hyperlocal.backend.community.dto.CreateCommunityRequest;
import com.hyperlocal.backend.community.dto.JoinCommunityRequest;
import com.hyperlocal.backend.community.entity.Community;
import com.hyperlocal.backend.community.entity.CommunityMember;
import com.hyperlocal.backend.community.enums.CommunityRole;
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

        Community community = Community.builder()
                .name(request.getName())
                .code(code)
                .description(request.getDescription())
                .category(request.getCategory())
                .createdByUserId(currentUser.getId())
                .build();

        community = communityRepository.save(community);

        CommunityMember adminMember = CommunityMember.builder()
                .community(community)
                .userId(currentUser.getId())
                .role(CommunityRole.ADMIN)
                .build();

        communityMemberRepository.save(adminMember);

        return buildCommunityResponse(community, currentUser.getId());
    }

    public CommunityResponse getCommunityById(Long communityId) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        if (!communityMemberRepository.existsByCommunityIdAndUserId(communityId, currentUser.getId())) {
            throw new CustomExceptions.NotCommunityMemberException();
        }

        return buildCommunityResponse(community, currentUser.getId());
    }

    @Transactional
    public CommunityResponse joinCommunity(JoinCommunityRequest request) {
        User currentUser = getAuthenticatedUser();

        Community community = communityRepository.findByCode(request.getCode().toUpperCase())
                .orElseThrow(CustomExceptions.InvalidCommunityCodeException::new);

        if (communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), currentUser.getId())) {
            throw new CustomExceptions.AlreadyMemberException();
        }

        CommunityMember member = CommunityMember.builder()
                .community(community)
                .userId(currentUser.getId())
                .role(CommunityRole.MEMBER)
                .build();

        communityMemberRepository.save(member);

        return buildCommunityResponse(community, currentUser.getId());
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
                        row -> (Long) row[0],
                        row -> (Long) row[1]
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
                            .admins(adminNamesByCommunityId.getOrDefault(cid, Collections.emptyList()))
                            .memberCount(memberCountByCommunityId.getOrDefault(cid, 0L))
                            .createdAt(community.getCreatedAt())
                            .inviteCode(isAdmin ? community.getCode() : null)
                            .isAdmin(isAdmin)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public PagedResponseDto<CommunityMemberResponse> getCommunityMembers(Long communityId, Pageable pageable) {
        User currentUser = getAuthenticatedUser();

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        if (!communityMemberRepository.existsByCommunityIdAndUserId(communityId, currentUser.getId())) {
            throw new CustomExceptions.NotCommunityMemberException();
        }

        Page<CommunityMember> membersPage = communityMemberRepository.findByCommunityId(communityId, pageable);

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

        long memberCount = communityMemberRepository.countByCommunityId(community.getId());

        boolean isAdmin = adminUserIds.contains(requestingUserId);

        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .code(community.getCode())
                .description(community.getDescription())
                .category(community.getCategory())
                .admins(adminNames)
                .memberCount(memberCount)
                .createdAt(community.getCreatedAt())
                .inviteCode(isAdmin ? community.getCode() : null)
                .isAdmin(isAdmin)
                .build();
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
