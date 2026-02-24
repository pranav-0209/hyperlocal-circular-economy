package com.hyperlocal.backend.user.entity;

import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        })
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.NOT_VERIFIED;

    private String phone;

    private String address;

    @Column(length = 500)
    private String aboutMe;

    private String profilePhotoUrl;

    private String governmentIdUrl;

    private String addressProofUrl;

    @Column(length = 500)
    private String rejectionReason;

    @Builder.Default
    @Column(name = "profile_completion_percentage")
    private Integer profileCompletionPercentage = 25;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "current_profile_step")
    private ProfileStep currentStep = ProfileStep.PROFILE;

    /**
     * IDs of communities the user has joined as a member.
     * Populated automatically when a join request is approved (or immediately for OPEN communities).
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_joined_communities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "community_id")
    @Builder.Default
    private List<Long> joinedCommunityIds = new ArrayList<>();

    /**
     * IDs of communities the user has created (where they are the creator/admin).
     * Populated automatically when a community is created.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_created_communities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "community_id")
    @Builder.Default
    private List<Long> createdCommunityIds = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.profileCompletionPercentage == null) {
            this.profileCompletionPercentage = 25;
        }
        if (this.currentStep == null) {
            this.currentStep = ProfileStep.PROFILE;
        }
        if (this.verificationStatus == null) {
            this.verificationStatus = VerificationStatus.NOT_VERIFIED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
