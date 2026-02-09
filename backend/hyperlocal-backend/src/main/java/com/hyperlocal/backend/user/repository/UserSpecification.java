package com.hyperlocal.backend.user.repository;

import com.hyperlocal.backend.admin.dto.UserFilterDto;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> withFilters(UserFilterDto filter) {
        return Specification
                .where(hasEmail(filter.getEmail()))
                .and(hasName(filter.getName()))
                .and(hasRole(filter.getRole()))
                .and(isVerified(filter.getVerified()))
                .and(hasCurrentStep(filter.getCurrentStep()));
    }

    private static Specification<User> hasEmail(String email) {
        return (root, query, cb) ->
            email == null ? null : cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    }

    private static Specification<User> hasName(String name) {
        return (root, query, cb) ->
            name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    private static Specification<User> hasRole(Role role) {
        return (root, query, cb) ->
            role == null ? null : cb.equal(root.get("role"), role);
    }

    private static Specification<User> isVerified(Boolean verified) {
        return (root, query, cb) ->
            verified == null ? null : cb.equal(root.get("verified"), verified);
    }

    private static Specification<User> hasCurrentStep(ProfileStep step) {
        return (root, query, cb) ->
            step == null ? null : cb.equal(root.get("currentStep"), step);
    }

}