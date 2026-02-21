package com.hyperlocal.backend.community.repository;

import com.hyperlocal.backend.community.entity.CommunityMember;
import com.hyperlocal.backend.community.enums.CommunityRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);

    Optional<CommunityMember> findByCommunityIdAndUserId(Long communityId, Long userId);

    /** All communities a user belongs to (for "Get My Communities"), with community eagerly loaded. */
    @Query("SELECT cm FROM CommunityMember cm JOIN FETCH cm.community WHERE cm.userId = :userId")
    List<CommunityMember> findByUserId(@Param("userId") Long userId);

    Page<CommunityMember> findByCommunityId(Long communityId, Pageable pageable);

    long countByCommunityId(Long communityId);

    long countByUserId(Long userId);

    /** Admins of a specific community. */
    List<CommunityMember> findByCommunityIdAndRole(Long communityId, CommunityRole role);

    /** IDs of communities where the user is an ADMIN. */
    @Query("SELECT cm.community.id FROM CommunityMember cm WHERE cm.userId = :userId AND cm.role = 'ADMIN'")
    List<Long> findAdminCommunityIdsByUserId(@Param("userId") Long userId);

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
}


