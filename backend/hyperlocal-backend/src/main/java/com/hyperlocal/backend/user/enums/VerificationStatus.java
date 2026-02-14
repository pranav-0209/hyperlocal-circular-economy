package com.hyperlocal.backend.user.enums;

public enum VerificationStatus {
    NOT_VERIFIED,   // Documents not reviewed yet (under review)
    VERIFIED,       // Documents approved by admin
    REJECTED        // Documents rejected by admin
}

