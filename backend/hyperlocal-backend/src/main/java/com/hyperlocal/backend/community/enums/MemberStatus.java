package com.hyperlocal.backend.community.enums;

/**
 * Membership status of a user within a community.
 * <ul>
 *   <li>{@code APPROVED} – full member; can see community content.</li>
 *   <li>{@code PENDING}  – join request submitted but not yet approved by an admin
 *       (only relevant when the community's {@link JoinPolicy} is
 *       {@code APPROVAL_REQUIRED}).</li>
 * </ul>
 */
public enum MemberStatus {
    APPROVED,
    PENDING
}

