package com.hyperlocal.backend.community.repository;

import com.hyperlocal.backend.community.entity.CommunityMember;
import com.hyperlocal.backend.community.enums.CommunityRole;
import com.hyperlocal.backend.community.enums.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    boolean existsByCommunity_IdAndUser_Id(Long communityId, Long userId);

    Optional<CommunityMember> findByCommunity_IdAndUser_Id(Long communityId, Long userId);

    /** All communities a user belongs to (for "Get My Communities"), with community eagerly loaded. */
    @Query("SELECT cm FROM CommunityMember cm JOIN FETCH cm.community WHERE cm.user.id = :userId")
    List<CommunityMember> findByUser_Id(@Param("userId") Long userId);

    Page<CommunityMember> findByCommunity_Id(Long communityId, Pageable pageable);

    long countByCommunity_Id(Long communityId);

    long countByUser_Id(Long userId);

    /** All members of a community with a given status (e.g., PENDING). */
    List<CommunityMember> findByCommunity_IdAndStatus(Long communityId, MemberStatus status);

    /** Paged members of a community with a given status (e.g., APPROVED). */
    Page<CommunityMember> findByCommunity_IdAndStatus(Long communityId, MemberStatus status, Pageable pageable);

    /** Count members of a community with a given status. */
    long countByCommunity_IdAndStatus(Long communityId, MemberStatus status);

    /** Admins of a specific community. */
    List<CommunityMember> findByCommunity_IdAndRole(Long communityId, CommunityRole role);

    /** IDs of communities where the user is an ADMIN. */
    @Query("SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :userId AND cm.role = 'ADMIN'")
    List<Long> findAdminCommunityIdsByUserId(@Param("userId") Long userId);

    /** IDs of all communities where the user is an APPROVED member (any role). This is the source of truth. */
    @Query("SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :userId AND cm.status = 'APPROVED'")
    List<Long> findApprovedCommunityIdsByUserId(@Param("userId") Long userId);

    /**
     * Bulk member-count query.
     * Returns one Object[]{communityId, count} row per community so that
     * getMyCommunities() can resolve all counts in a single DB round-trip
     * instead of issuing N individual COUNT queries (N+1 problem).
     *
     * Usage: stream the result and collect to Map<Long, Long>
     *   communityId → memberCount
     */
    @Query("SELECT cm.community.id, COUNT(cm) FROM CommunityMember cm " +
           "WHERE cm.community.id IN :communityIds GROUP BY cm.community.id")
    List<Object[]> countByCommunityIdIn(@Param("communityIds") Collection<Long> communityIds);

    /** Bulk pending-count query per community. */
    @Query("SELECT cm.community.id, COUNT(cm) FROM CommunityMember cm " +
           "WHERE cm.community.id IN :communityIds AND cm.status = 'PENDING' GROUP BY cm.community.id")
    List<Object[]> countPendingByCommunityIdIn(@Param("communityIds") Collection<Long> communityIds);
}
