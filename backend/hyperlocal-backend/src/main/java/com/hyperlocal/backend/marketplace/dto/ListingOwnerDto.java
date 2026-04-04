package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListingOwnerDto {
    private Long userId;
    private String name;
    private String profilePhotoUrl;
    private boolean verified;
}

