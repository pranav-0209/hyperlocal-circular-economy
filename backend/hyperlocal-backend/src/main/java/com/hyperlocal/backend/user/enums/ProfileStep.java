package com.hyperlocal.backend.user.enums;

public enum ProfileStep {
    PROFILE(25),      // Step 1: Complete profile (25% -> 50%)
    DOCUMENT_VERIFICATION(50), // Step 2: Upload documents (50% -> 75%)
    REVIEW(75),       // Step 3: Under admin review (75% -> 100%)
    COMPLETE(100);    // Fully verified by admin

    private final int percentage;

    ProfileStep(int percentage) {
        this.percentage = percentage;
    }

    public int getPercentage() {
        return percentage;
    }
}