package com.hyperlocal.backend.marketplace.dto;

import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class UpdateListingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ListingCategory category;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    @NotNull(message = "Condition is required")
    private ListingCondition condition;

    /** Optional: if sent, replaces existing images. If omitted, existing images are kept. */
    private List<MultipartFile> images;

    @NotNull(message = "Available from date is required")
    private LocalDate availableFrom;

    @NotNull(message = "Available to date is required")
    private LocalDate availableTo;
}
