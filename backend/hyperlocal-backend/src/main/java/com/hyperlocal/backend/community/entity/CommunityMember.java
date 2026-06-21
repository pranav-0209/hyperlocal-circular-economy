package com.hyperlocal.backend.community.entity;

import com.hyperlocal.backend.community.enums.CommunityRole;
import com.hyperlocal.backend.community.enums.MemberStatus;
import com.hyperlocal.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "community_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"community_id", "user_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    /**
     * The user who is a member of this community.
     * Generates FK: community_members.user_id -> users.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'MEMBER'")
    @Column(nullable = false)
    @Builder.Default
    private CommunityRole role = CommunityRole.MEMBER;

    /**
     * Approval status of this membership.
     * APPROVED  – active member (default for OPEN communities and creator/admin).
     * PENDING   – awaiting admin approval (APPROVAL_REQUIRED communities).
     */
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'APPROVED'")
    @Column(nullable = false)
    @Builder.Default
    private MemberStatus status = MemberStatus.APPROVED;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    /** Convenience accessor — avoids eager-loading the full User just for the ID. */
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}
