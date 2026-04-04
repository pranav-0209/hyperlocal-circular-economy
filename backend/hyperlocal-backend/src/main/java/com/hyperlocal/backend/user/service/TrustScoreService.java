package com.hyperlocal.backend.user.service;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.marketplace.entity.BorrowRequest;
import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import com.hyperlocal.backend.marketplace.repository.BorrowRequestRepository;
import com.hyperlocal.backend.marketplace.repository.ReviewRepository;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import com.hyperlocal.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrustScoreService {

    private final UserRepository userRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public void recalculateAndPersist(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(CustomExceptions.UserNotFoundException::new);

        long completedRequests = borrowRequestRepository.countByRequesterIdAndStatus(userId, BorrowRequestStatus.COMPLETED);
        long cancelledRequests = borrowRequestRepository.countByRequesterIdAndStatus(userId, BorrowRequestStatus.CANCELLED);
        long totalRequests = completedRequests + cancelledRequests;
        long approvedPreStartCancellations = borrowRequestRepository
                .countByRequesterIdAndStatusAndApprovedAtIsNotNull(userId, BorrowRequestStatus.CANCELLED);

        List<BorrowRequest> completed = borrowRequestRepository.findByRequesterIdAndStatus(userId, BorrowRequestStatus.COMPLETED);
        long onTimeReturns = completed.stream()
                .filter(this::isOnTimeReturn)
                .count();
        long lateReturns = completed.size() - onTimeReturns;

        double completionRate = totalRequests == 0 ? 0.0 : (double) completedRequests / totalRequests;
        double onTimeRate = completedRequests == 0 ? 0.0 : (double) onTimeReturns / completedRequests;
        int verifiedBoost = user.getVerificationStatus() == VerificationStatus.VERIFIED ? 1 : 0;

        double penalty = (0.3 * approvedPreStartCancellations) + (0.2 * lateReturns);
        int trustIndex = clampTo0To100((int) Math.round(50 + (25 * completionRate) + (15 * onTimeRate) + (5 * verifiedBoost) - penalty));

        long positiveInteractions = reviewRepository.countByRevieweeUserIdAndRatingGreaterThanEqual(userId, 4);
        long lowRatingsReceived = reviewRepository.countByRevieweeUserIdAndRatingLessThanEqual(userId, 2);
        int trustXp = (int) Math.max(0,
                (120 * completedRequests)
                        + (40 * positiveInteractions)
                        + (20 * onTimeReturns)
                        - (60 * lateReturns)
                        - (80 * approvedPreStartCancellations)
                        - (40 * lowRatingsReceived));

        user.setTrustIndex(trustIndex);
        user.setTrustXp(trustXp);
        userRepository.save(user);
    }

    private boolean isOnTimeReturn(BorrowRequest borrowRequest) {
        if (borrowRequest.getReturnedAt() == null || borrowRequest.getEndDate() == null) {
            return false;
        }
        LocalDate completionDate = borrowRequest.getReturnedAt().toLocalDate();
        return !completionDate.isAfter(borrowRequest.getEndDate());
    }

    private int clampTo0To100(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
