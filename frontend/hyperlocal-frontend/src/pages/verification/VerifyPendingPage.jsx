import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkVerificationStatus } from '../../services/authService';
import VerificationLayout from '../../components/ui/VerificationLayout';
import VerificationTimeline from '../../components/ui/VerificationTimeline';

/**
 * VerifyPendingPage (/verify/pending)
 * 
 * Step 3 of verification: Wait for admin review
 * - Shows status timeline
 * - Allows user to navigate away
 * - Check status anytime
 */
export default function VerifyPendingPage() {
  const navigate = useNavigate();
  const { user, markVerified, updateUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [rejectionReason, setRejectionReason] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Countdown timer for success modal auto-navigation
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessModal && countdown === 0) {
      navigate('/dashboard');
    }
  }, [showSuccessModal, countdown, navigate]);

  // Check verification status from backend
  const handleCheckStatus = async () => {
    setIsChecking(true);

    try {
      const response = await checkVerificationStatus();
      console.log('Verification status:', response);

      if (response.status === 'VERIFIED') {
        // User approved - mark as verified and show success modal
        markVerified();
        setShowSuccessModal(true);
      } else if (response.status === 'REJECTED') {
        // User rejected - update user context with new data from backend
        updateUser({
          profileCompletion: response.profileCompletionPercentage || 50,
          currentStep: 'DOCUMENT_VERIFICATION', // User needs to re-upload documents
          hasSubmittedDocuments: false,
          verificationStatus: 'REJECTED',
          isVerified: false,
          rejectionReason: response.rejectionReason,
        });
        // Show rejection modal
        setRejectionReason(response.rejectionReason || 'Your verification was rejected. Please contact support.');
        setShowRejectionModal(true);
      } else {
        // NOT_VERIFIED - still pending
        setShowPendingModal(true);
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
      alert('❌ Unable to check status. Please try again later.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRejectionClose = () => {
    setShowRejectionModal(false);
    navigate('/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <VerificationLayout stepNumber={3} totalSteps={3} title="Verification Under Review">
      <div className="max-w-3xl mx-auto">
        {/* Status Card */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-3xl">
                check_circle
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-charcoal mb-2">
            Documents Received
          </h2>

          <p className="text-muted-green mb-8">
            Thanks for joining ShareMore! We are currently verifying your neighborhood details to
            ensure our community stays trusted and safe.
          </p>

          {/* Timeline */}
          <VerificationTimeline />

          {/* Timeline Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-8 flex gap-3 items-start">
            <span className="material-symbols-outlined text-blue-600 flex-shrink-0 mt-0.5">
              info
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Estimated Time
              </p>
              <p className="text-sm text-blue-800">
                Usually completed within 24–48 hours. We'll notify you via email once verification
                is complete.
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-charcoal text-sm mb-6">
            You don't need to stay here. Feel free to explore or come back anytime to check your
            status.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </button>

            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">
            Why is verification required?
          </h3>
          <p className="text-sm text-muted-green">
            ShareMore is built on trust within local communities. We verify member identities to
            prevent fraud, ensure safety, and maintain the integrity of the sharing network. All
            personal data is encrypted and protected.
          </p>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-red-600">cancel</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Rejected</h3>
              <p className="text-gray-600 mb-6">{rejectionReason}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-yellow-600 text-sm">info</span>
                  <p className="text-sm text-yellow-800 text-left">
                    You can update your documents and resubmit for verification.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRejectionClose}
                className="w-full px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Status Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-blue-600">hourglass_empty</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Still Pending</h3>
              <p className="text-gray-600 mb-6">
                Your verification is still under review. We'll notify you via email once complete!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-sm">info</span>
                  <p className="text-sm text-blue-800 text-left">
                    Usually completed within 24–48 hours. Thank you for your patience!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="w-full px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Approved! 🎉</h3>
              <p className="text-gray-600 mb-6">
                Congratulations! Your identity has been verified. You can now access all features and join communities.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin">
                    <span className="material-symbols-outlined text-green-600 text-sm">progress_activity</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </VerificationLayout>
  );
}
