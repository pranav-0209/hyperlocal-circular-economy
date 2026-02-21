import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeNavbar from '../components/ui/HomeNavbar';

/**
 * HomePage (/home)
 * 
 * Post-login landing page for all authenticated users.
 * Shows verification status and community action cards.
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Animated progress bar — starts at 0, fills to actual value after mount
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(user?.profileCompletion ?? 0), 120);
    return () => clearTimeout(t);
  }, [user?.profileCompletion]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Determine the next verification step based on currentStep or profileCompletion
  const getNextVerificationRoute = () => {
    // If backend provides currentStep, use that
    if (user.currentStep) {
      const stepRoutes = {
        'PROFILE': '/verify/profile',
        'DOCUMENT_VERIFICATION': '/verify/documents',
        'REVIEW': '/verify/pending',
        'COMPLETE': '/dashboard',
      };
      return stepRoutes[user.currentStep] || '/verify/profile';
    }

    // Fallback: derive from profileCompletion percentage
    if (user.profileCompletion >= 75) return '/verify/pending';
    if (user.profileCompletion >= 50) return '/verify/documents';
    return '/verify/profile';
  };

  // Button text changes based on progress
  const verificationButtonText = user.profileCompletion > 25 ? 'Continue Verification' : 'Start Verification';

  const handleStartVerification = () => {
    navigate(getNextVerificationRoute());
  };

  const handleJoinCommunity = () => {
    if (!user.isVerified) {
      navigate('/verify/profile');
      return;
    }
    navigate('/dashboard');
  };

  const handleCreateCommunity = () => {
    if (!user.isVerified) {
      navigate('/verify/profile');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-primary/5">
      <HomeNavbar hideNavLinks={!user.isVerified} />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3 leading-tight">
            Welcome! Complete your profile to start sharing
          </h1>
          <p className="text-base text-muted-green max-w-2xl">
            ShareMore is built on verified connections. Finish setting up your account to unlock
            your local neighborhood and join the conversation.
          </p>
        </section>

        {/* Rejection Notice Banner */}
        {user.verificationStatus === 'REJECTED' && user.rejectionReason && (
          <section className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-red-900 mb-2">Verification Documents Rejected</h3>
                  <p className="text-sm text-red-800 mb-3">
                    <strong>Reason:</strong> {user.rejectionReason}
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5">info</span>
                      <p className="text-sm text-yellow-800">
                        Don't worry! You can re-upload your documents below. Please address the issue mentioned above when resubmitting.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartVerification}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">upload_file</span>
                    Re-upload Documents
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Verification Status Card */}
        <section className="mb-10 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Icon */}
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
              </div>
            </div>

            {/* Content */}
            <div className="grow">
              <h3 className="font-bold text-lg text-charcoal mb-1">Identity Verification</h3>
              <p className="text-sm text-muted-green mb-4">
                Verification required before joining communities
              </p>

              {/* Animated progress bar — no numbers, slider from 0 → actual */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden my-3">
                <div
                  className="h-full bg-primary rounded-full transition-[width] duration-1000 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 sm:ml-4">
              <button
                onClick={handleStartVerification}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                {verificationButtonText}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Join Community Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">groups</span>
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-2">Join Community</h3>
            <p className="text-sm text-muted-green mb-6">
              Browse local neighborhoods and connect with people near you.
            </p>
            <button
              onClick={handleJoinCommunity}
              disabled={!user.isVerified}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-muted-green rounded-full text-sm font-medium cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              LOCKED
            </button>
          </div>

          {/* Create Community Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">add_home</span>
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-2">Create Community</h3>
            <p className="text-sm text-muted-green mb-11">
              Start a new sharing circle for your apartment or street.
            </p>
            <button
              onClick={handleCreateCommunity}
              disabled={!user.isVerified}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-muted-green rounded-full text-sm font-medium cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              LOCKED
            </button>
          </div>
        </section>

        {/* Help Link */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 text-sm text-muted-green hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">help</span>
            Why is verification required?
          </button>
        </div>
      </main>
    </div>
  );
}
