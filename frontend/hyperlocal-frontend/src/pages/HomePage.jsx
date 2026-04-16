import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
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
  const { dark } = useDarkMode();
  const isLocked = !user?.isVerified;

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
    <div className={`min-h-screen ${dark ? 'bg-[#0d1f1b]' : 'bg-background-light'}`}>
      <HomeNavbar hideNavLinks={!user.isVerified} />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border ${dark ? 'bg-primary/16 border-primary/25 text-primary' : 'bg-primary/8 border-primary/15 text-primary'}`}>
            <span className="material-symbols-outlined text-sm">shield_lock</span>
            <span className="text-[0.72rem] font-bold tracking-wider uppercase">Verification First</span>
          </div>
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
            <div className={`border-l-4 rounded-lg p-6 shadow-sm ${dark ? 'bg-red-950/35 border-red-500' : 'bg-red-50 border-red-500'}`}>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? 'bg-red-900/40' : 'bg-red-100'}`}>
                    <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-2 ${dark ? 'text-red-200' : 'text-red-900'}`}>Verification Documents Rejected</h3>
                  <p className={`text-sm mb-3 ${dark ? 'text-red-200/90' : 'text-red-800'}`}>
                    <strong>Reason:</strong> {user.rejectionReason}
                  </p>
                  <div className={`border rounded-md p-3 mb-3 ${dark ? 'bg-yellow-950/30 border-yellow-700/40' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5">info</span>
                      <p className={`text-sm ${dark ? 'text-yellow-100/90' : 'text-yellow-800'}`}>
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
        <section className={`mb-10 rounded-2xl p-6 sm:p-8 border shadow-sm ${dark ? 'bg-white/6 border-white/12 shadow-black/20' : 'bg-white border-gray-200'} backdrop-blur-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Icon */}
            <div className="shrink-0">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${dark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
              </div>
            </div>

            {/* Content */}
            <div className="grow">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="font-bold text-lg text-charcoal">Identity Verification</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-white/10 text-white/85' : 'bg-primary/8 text-primary'}`}>
                  {Math.round(user.profileCompletion ?? 0)}% complete
                </span>
              </div>
              <p className="text-sm text-muted-green mb-4">
                Verification required before joining communities
              </p>

              {/* Animated progress bar — no numbers, slider from 0 → actual */}
              <div className={`w-full h-2.5 rounded-full overflow-hidden my-3 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
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
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
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
          <div className={`rounded-2xl p-6 border shadow-sm text-center transition-all ${dark ? 'bg-white/6 border-white/12 shadow-black/20' : 'bg-white border-gray-200'} ${isLocked ? '' : 'hover:-translate-y-0.5 hover:shadow-lg'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <span className={`material-symbols-outlined text-3xl ${dark ? 'text-white/60' : 'text-gray-400'}`}>groups</span>
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-2">Join Community</h3>
            <p className="text-sm text-muted-green mb-6">
              Browse local neighborhoods and connect with people near you.
            </p>
            <button
              onClick={handleJoinCommunity}
              disabled={isLocked}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${isLocked ? (dark ? 'bg-white/10 text-white/65' : 'bg-gray-100 text-muted-green') : 'bg-primary text-white hover:brightness-110 shadow-sm shadow-primary/20'}`}
            >
              <span className="material-symbols-outlined text-sm">{isLocked ? 'lock' : 'groups'}</span>
              {isLocked ? 'LOCKED' : 'Explore Communities'}
            </button>
          </div>

          {/* Create Community Card */}
          <div className={`rounded-2xl p-6 border shadow-sm text-center transition-all ${dark ? 'bg-white/6 border-white/12 shadow-black/20' : 'bg-white border-gray-200'} ${isLocked ? '' : 'hover:-translate-y-0.5 hover:shadow-lg'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <span className={`material-symbols-outlined text-3xl ${dark ? 'text-white/60' : 'text-gray-400'}`}>add_home</span>
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-2">Create Community</h3>
            <p className="text-sm text-muted-green mb-11">
              Start a new sharing circle for your apartment or street.
            </p>
            <button
              onClick={handleCreateCommunity}
              disabled={isLocked}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${isLocked ? (dark ? 'bg-white/10 text-white/65' : 'bg-gray-100 text-muted-green') : 'bg-primary text-white hover:brightness-110 shadow-sm shadow-primary/20'}`}
            >
              <span className="material-symbols-outlined text-sm">{isLocked ? 'lock' : 'add_home'}</span>
              {isLocked ? 'LOCKED' : 'Create Now'}
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
