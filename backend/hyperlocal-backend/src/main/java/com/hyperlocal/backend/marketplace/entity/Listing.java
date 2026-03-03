package com.hyperlocal.backend.marketplace.entity;

import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingCondition;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner (creator) of the listing */
    @Column(nullable = false)
    private Long ownerId;

    /** Community this listing is posted in */
    @Column(nullable = false)
    private Long communityId;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingCategory category;

    /** Rent price per day */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingCondition condition;

    /**
     * Stored image URLs (relative paths served by the app).
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "listing_images", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.AVAILABLE;

    /** Availability window — both required */
    @Column(nullable = false)
    private LocalDate availableFrom;

    @Column(nullable = false)
    private LocalDate availableTo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
