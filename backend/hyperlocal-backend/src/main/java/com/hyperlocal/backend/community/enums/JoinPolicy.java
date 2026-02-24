package com.hyperlocal.backend.community.enums;

/**
 * Controls how users can join a community.
 * <ul>
 *   <li>{@code OPEN} – anyone with the invite code joins immediately.</li>
 *   <li>{@code APPROVAL_REQUIRED} – the join request stays PENDING until a
 *       community admin explicitly approves it.</li>
 * </ul>
 */
public enum JoinPolicy {
    OPEN,
    APPROVAL_REQUIRED
}

