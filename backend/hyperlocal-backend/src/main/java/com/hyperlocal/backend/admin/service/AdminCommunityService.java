package com.hyperlocal.backend.admin.service;

import com.hyperlocal.backend.admin.dto.AdminCommunityDetailDto;
import com.hyperlocal.backend.admin.dto.AdminCommunityListDto;
import com.hyperlocal.backend.admin.dto.UpdateCommunityStatusRequest;
import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.entity.Community;
import com.hyperlocal.backend.community.entity.CommunityMember;
import com.hyperlocal.backend.community.enums.CommunityRole;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import com.hyperlocal.backend.community.repository.CommunityMemberRepository;
import com.hyperlocal.backend.community.repository.CommunityRepository;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;

    /**
     * Returns a paginated, filterable list of all communities.
     *
     * @param page   zero-based page index
     * @param size   number of records per page
     * @param status optional filter – only communities with this status are returned;
     *               when null every status is included
     * @param search optional search term matched case-insensitively against community
     *               name and invite code
     * @return paginated list of lightweight {@link AdminCommunityListDto}
     */
    public PagedResponseDto<AdminCommunityListDto> getAllCommunities(
            int page, int size, CommunityStatus status, String search) {

        Pageable pageable = PageRequest.of(page, size);

        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String statusStr = (status != null) ? status.name() : null;

        Page<Community> communityPage = communityRepository
                .findByStatusAndSearch(statusStr, trimmedSearch, pageable);

        List<Long> communityIds = communityPage.getContent().stream()
                .map(Community::getId)
                .collect(Collectors.toList());

        Map<Long, Long> memberCountMap = communityMemberRepository
                .countByCommunityIdIn(communityIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        Page<AdminCommunityListDto> dtoPage = communityPage.map(community ->
                AdminCommunityListDto.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .code(community.getCode())
                        .description(community.getDescription())
                        .category(community.getCategory())
                        .status(community.getStatus())
                        .memberCount(memberCountMap.getOrDefault(community.getId(), 0L))
                        .createdAt(community.getCreatedAt())
                        .updatedAt(community.getUpdatedAt())
                        .build()
        );

        return PagedResponseDto.from(dtoPage);
    }

    /**
     * Returns full details of a single community including its complete member list.
     *
     * @param communityId the community's primary key
     * @return {@link AdminCommunityDetailDto} containing community metadata and all members
     * @throws CustomExceptions.CommunityNotFoundException if no community matches the id
     */
    public AdminCommunityDetailDto getCommunityDetail(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        List<CommunityMember> adminMembers = communityMemberRepository
                .findByCommunityIdAndRole(communityId, CommunityRole.ADMIN);

        List<Long> adminUserIds = adminMembers.stream()
                .map(CommunityMember::getUserId)
                .collect(Collectors.toList());

        Map<Long, User> adminUsersById = userRepository.findAllById(adminUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<String> adminNames = adminMembers.stream()
                .map(m -> {
                    User u = adminUsersById.get(m.getUserId());
                    return u != null ? u.getName() : "Unknown";
                })
                .collect(Collectors.toList());

        long memberCount = communityMemberRepository.countByCommunityId(communityId);

        List<CommunityMemberResponse> members = buildMemberResponses(communityId);

        return AdminCommunityDetailDto.builder()
                .id(community.getId())
                .name(community.getName())
                .code(community.getCode())
                .description(community.getDescription())
                .category(community.getCategory())
                .status(community.getStatus())
                .memberCount(memberCount)
                .admins(adminNames)
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .members(members)
                .build();
    }

    /**
     * Toggles a community's status between ACTIVE and INACTIVE.
     *
     * <p>If the incoming status equals the current status the update is a no-op
     * (idempotent). This prevents spurious dirty-writes and is safe to retry.</p>
     *
     * @param communityId the community's primary key
     * @param request     contains the target {@link CommunityStatus}
     * @return updated {@link AdminCommunityListDto}
     * @throws CustomExceptions.CommunityNotFoundException if no community matches the id
     */
    @Transactional
    public AdminCommunityListDto updateCommunityStatus(Long communityId, UpdateCommunityStatusRequest request) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(CustomExceptions.CommunityNotFoundException::new);

        community.setStatus(request.getStatus());
        community = communityRepository.save(community);

        long memberCount = communityMemberRepository.countByCommunityId(communityId);

        return AdminCommunityListDto.builder()
                .id(community.getId())
                .name(community.getName())
                .code(community.getCode())
                .description(community.getDescription())
                .category(community.getCategory())
                .status(community.getStatus())
                .memberCount(memberCount)
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .build();
    }

    /**
     * Permanently removes a community and all its membership records via cascading
     * delete (configured on the entity relationship).
     *
     * @param communityId the community's primary key
     * @throws CustomExceptions.CommunityNotFoundException if no community matches the id
     */
    @Transactional
    public void deleteCommunity(Long communityId) {
        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }
        communityRepository.deleteById(communityId);
    }

    /**
     * Returns a paginated list of members for a given community.
     *
     * <p>Resolves user details (name, email, profile photo) in a single batch query
     * to avoid the N+1 problem.</p>
     *
     * @param communityId the community's primary key
     * @param page        zero-based page index
     * @param size        number of records per page
     * @return paginated {@link CommunityMemberResponse} list
     * @throws CustomExceptions.CommunityNotFoundException if no community matches the id
     */
    public PagedResponseDto<CommunityMemberResponse> getCommunityMembers(
            Long communityId, int page, int size) {

        if (!communityRepository.existsById(communityId)) {
            throw new CustomExceptions.CommunityNotFoundException();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("joinedAt").ascending());
        Page<CommunityMember> membersPage = communityMemberRepository
                .findByCommunityId(communityId, pageable);

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

    private List<CommunityMemberResponse> buildMemberResponses(Long communityId) {
        List<CommunityMember> members = communityMemberRepository
                .findByCommunityId(communityId, Pageable.unpaged())
                .getContent();

        List<Long> userIds = members.stream()
                .map(CommunityMember::getUserId)
                .collect(Collectors.toList());

        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return members.stream()
                .map(member -> {
                    User user = usersById.get(member.getUserId());
                    return CommunityMemberResponse.builder()
                            .userId(member.getUserId())
                            .name(user != null ? user.getName() : "Unknown")
                            .email(user != null ? user.getEmail() : null)
                            .role(member.getRole())
                            .joinedAt(member.getJoinedAt())
                            .profilePhotoUrl(user != null ? user.getProfilePhotoUrl() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }
}

