import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const { user, markVerified } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  // Simulate checking verification status
  const handleCheckStatus = async () => {
    setIsChecking(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock: Mark as verified after delay
    // In real app, check actual verification status from backend
    markVerified();
    setIsChecking(false);
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
    </VerificationLayout>
  );
}
