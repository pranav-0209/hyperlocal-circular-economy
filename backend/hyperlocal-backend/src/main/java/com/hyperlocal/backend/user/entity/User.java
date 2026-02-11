package com.hyperlocal.backend.user.entity;

import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    @Builder.Default
    @Column(nullable = false)
    private boolean verified = false;

    private String phone;

    private String address;

    @Column(length = 500)
    private String aboutMe;

    private String profilePhotoUrl;

    private String governmentIdUrl;

    private String addressProofUrl;

    @Builder.Default
    @Column(name = "profile_completion_percentage")
    private Integer profileCompletionPercentage = 25;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "current_profile_step")
    private ProfileStep currentStep = ProfileStep.PROFILE;

    private Long communityId;

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
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
