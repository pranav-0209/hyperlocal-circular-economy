package com.hyperlocal.backend.marketplace.repository;

import com.hyperlocal.backend.marketplace.entity.Listing;
import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ListingSpecification {

    private ListingSpecification() {}

    /**
     * Builds predicates shared by both browse methods.
     * NOTE: enum fields (status, category) are compared with cb.equal() — never LOWER() —
     * to avoid the PostgreSQL "function lower(bytea) does not exist" error.
     */
    private static List<Predicate> buildPredicates(
            jakarta.persistence.criteria.Root<Listing> root,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            ListingStatus status,
            ListingCategory category,
            String search) {

        List<Predicate> predicates = new ArrayList<>();

        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }
        if (category != null) {
            predicates.add(cb.equal(root.get("category"), category));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }
        return predicates;
    }

    /** Multi-community browse */
    public static Specification<Listing> browse(
            List<Long> communityIds,
            ListingStatus status,
            ListingCategory category,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = buildPredicates(root, cb, status, category, search);
            predicates.add(0, root.get("communityId").in(communityIds));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Single-community browse */
    public static Specification<Listing> browseInCommunity(
            Long communityId,
            ListingStatus status,
            ListingCategory category,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = buildPredicates(root, cb, status, category, search);
            predicates.add(0, cb.equal(root.get("communityId"), communityId));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
