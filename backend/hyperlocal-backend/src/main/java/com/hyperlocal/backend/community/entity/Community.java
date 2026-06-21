package com.hyperlocal.backend.community.entity;

import com.hyperlocal.backend.community.enums.CommunityCategory;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import com.hyperlocal.backend.community.enums.JoinPolicy;
import com.hyperlocal.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "communities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * Auto-generated unique invite code (e.g. "MPL-4421").
     * Format: first 3 uppercase letters of name + "-" + 4 random digits.
     */
    @Column(nullable = false, unique = true)
    private String code;

    @Column(length = 1000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityCategory category;

    /**
     * Controls how new members can join.
     * Defaults to {@link JoinPolicy#OPEN} so existing communities are unaffected.
     */
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'OPEN'")
    @Column(nullable = false)
    @Builder.Default
    private JoinPolicy joinPolicy = JoinPolicy.OPEN;

    /**
     * The user who created the community (always an ADMIN member).
     * Generates FK: communities.created_by_user_id -> users.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'ACTIVE'")
    @Column(nullable = false)
    @Builder.Default
    private CommunityStatus status = CommunityStatus.ACTIVE;

    @Builder.Default
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityMember> members = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Convenience accessor — avoids eager-loading the full User just for the ID. */
    public Long getCreatedByUserId() {
        return createdBy != null ? createdBy.getId() : null;
    }
}
