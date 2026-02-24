package com.hyperlocal.backend.community.entity;

import com.hyperlocal.backend.community.enums.CommunityRole;
import com.hyperlocal.backend.community.enums.MemberStatus;
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

    /** References User.id */
    @Column(nullable = false)
    private Long userId;

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
}

