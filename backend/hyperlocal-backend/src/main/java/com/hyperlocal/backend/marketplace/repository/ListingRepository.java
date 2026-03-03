package com.hyperlocal.backend.marketplace.repository;

import com.hyperlocal.backend.marketplace.entity.Listing;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {

    /** All listings by a specific owner, optionally filtered by status */
    List<Listing> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<Listing> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, ListingStatus status);
}
