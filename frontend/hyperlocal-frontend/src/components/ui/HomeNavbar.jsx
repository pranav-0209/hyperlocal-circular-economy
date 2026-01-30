import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * HomeNavbar Component
 * Sticky navbar for all protected pages.
 * Shows logo, communities, notifications, and profile avatar.
 * 
 * @param {boolean} hideNavLinks - Hide nav links (Home, My Communities, Help) for unverified users
 */
export default function HomeNavbar({ hideNavLinks = false }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /**
   * Determines the next verification step based on user state
   */
  const getVerificationRoute = () => {
    if (!user) return '/login';
    if (user.isVerified) return '/dashboard';
    if (user.hasSubmittedDocuments) return '/verify/pending';
    if (user.profileCompletion >= 50) return '/verify/documents';
    return '/verify/profile';
  };

  const handleProfileClick = () => {
    navigate(getVerificationRoute());
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-charcoal">ShareMore</span>
        </button>

        {/* Nav Links - Hidden when hideNavLinks is true */}
        {!hideNavLinks && (
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/home')}
              className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
            >
              My Communities
            </button>
            <a href="#" className="text-sm font-medium text-charcoal hover:text-primary transition-colors">
              Help
            </a>
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {/* <button className="relative p-2 text-charcoal hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
          </button> */}

          {/* Profile Avatar with Progress */}
          <button
            onClick={handleProfileClick}
            className="relative flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Click to continue verification"
          >
            {/* Avatar */}
            <div className="relative w-10 h-10">
              <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>

              {/* Progress Ring */}
              <svg
                className="absolute inset-0"
                viewBox="0 0 36 36"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 15.915}
                  strokeDashoffset={2 * Math.PI * 15.915 * (1 - (user?.profileCompletion || 0) / 100)}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Profile Dropdown */}
            <div className="hidden sm:block">
              <p className="text-xs text-muted-green">
                {user?.profileCompletion || 0}% Complete
              </p>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="ml-2 px-4 py-2 text-sm font-medium text-muted-green hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
