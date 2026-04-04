package com.hyperlocal.backend.marketplace.repository;

import com.hyperlocal.backend.marketplace.entity.Listing;
import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ListingSpecification {

    private ListingSpecification() {}

    /**
     * Builds predicates shared by both browse methods.
     * NOTE: enum field (category) is compared with cb.equal() — never LOWER() —
     * to avoid the PostgreSQL "function lower(bytea) does not exist" error.
     */
    private static List<Predicate> buildPredicates(
            jakarta.persistence.criteria.Root<Listing> root,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            ListingCategory category,
            String search) {

        List<Predicate> predicates = new ArrayList<>();

        if (category != null) {
            predicates.add(cb.equal(root.get("category"), category));
        }
        // Community browse excludes listings whose availability window has already ended.
        predicates.add(cb.greaterThanOrEqualTo(root.get("availableTo"), LocalDate.now()));
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
            ListingCategory category,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = buildPredicates(root, cb, category, search);
            predicates.add(0, root.get("communityId").in(communityIds));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Single-community browse */
    public static Specification<Listing> browseInCommunity(
            Long communityId,
            ListingCategory category,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = buildPredicates(root, cb, category, search);
            predicates.add(0, cb.equal(root.get("communityId"), communityId));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
