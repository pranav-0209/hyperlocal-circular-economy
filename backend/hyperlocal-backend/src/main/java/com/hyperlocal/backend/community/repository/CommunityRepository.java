package com.hyperlocal.backend.community.repository;

import com.hyperlocal.backend.community.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    Optional<Community> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByNameIgnoreCase(String name);

    @Query(
        value = """
            SELECT * FROM communities c
            WHERE (CAST(:status AS VARCHAR) IS NULL OR c.status = CAST(:status AS VARCHAR))
              AND (CAST(:search AS VARCHAR) IS NULL
                   OR lower(c.name) LIKE lower('%' || CAST(:search AS VARCHAR) || '%')
                   OR lower(c.code) LIKE lower('%' || CAST(:search AS VARCHAR) || '%'))
            ORDER BY c.created_at DESC
            """,
        countQuery = """
            SELECT COUNT(*) FROM communities c
            WHERE (CAST(:status AS VARCHAR) IS NULL OR c.status = CAST(:status AS VARCHAR))
              AND (CAST(:search AS VARCHAR) IS NULL
                   OR lower(c.name) LIKE lower('%' || CAST(:search AS VARCHAR) || '%')
                   OR lower(c.code) LIKE lower('%' || CAST(:search AS VARCHAR) || '%'))
            """,
        nativeQuery = true
    )
    Page<Community> findByStatusAndSearch(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);
}

