package com.hyperlocal.backend.community.repository;

import com.hyperlocal.backend.community.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    Optional<Community> findByCode(String code);

    boolean existsByCode(String code);
}

