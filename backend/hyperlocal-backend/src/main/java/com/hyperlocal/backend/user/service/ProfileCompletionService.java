package com.hyperlocal.backend.user.service;

import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileCompletionService {

    private static final int REGISTRATION_PERCENT = 25;
    private static final int PROFILE_PERCENT = 25;
    private static final int DOCUMENTS_PERCENT = 25;
    private static final int VERIFICATION_PERCENT = 25;

    public int calculatePercentage(User user) {
        int completion = REGISTRATION_PERCENT;

        if (hasProfileDetails(user)) {
            completion += PROFILE_PERCENT;
        }
        if (hasDocumentsUploaded(user)) {
            completion += DOCUMENTS_PERCENT;
        }
        if (isVerified(user)) {
            completion += VERIFICATION_PERCENT;
        }

        return completion;
    }

    public String getCurrentStep(User user) {
        if (isVerified(user)) return "COMPLETE";
        if (hasDocumentsUploaded(user)) return "REVIEW";
        if (hasProfileDetails(user)) return "DOCUMENT_VERIFICATION";
        return "PROFILE";
    }

    public List<String> getPendingSteps(User user) {
        List<String> pendingSteps = new ArrayList<>();

        if (!hasProfileDetails(user)) {
            pendingSteps.add("COMPLETE_PROFILE");
        }
        if (!hasDocumentsUploaded(user)) {
            pendingSteps.add("UPLOAD_DOCUMENTS");
        }
        if (!isVerified(user)) {
            pendingSteps.add("AWAIT_VERIFICATION");
        }

        return pendingSteps;
    }

    public boolean isProfileComplete(User user) {
        return calculatePercentage(user) == 100;
    }

    private boolean hasProfileDetails(User user) {
        return user.getPhone() != null && !user.getPhone().trim().isEmpty()
                && user.getAddress() != null && !user.getAddress().trim().isEmpty()
                && user.getAboutMe() != null && !user.getAboutMe().trim().isEmpty();
                // Note: profilePhotoUrl is optional for profile completion
    }

    private boolean hasDocumentsUploaded(User user) {
        return user.getGovernmentIdUrl() != null && !user.getGovernmentIdUrl().trim().isEmpty();
    }

    private boolean isVerified(User user) {
        return user.getVerificationStatus() == VerificationStatus.VERIFIED;
    }
}