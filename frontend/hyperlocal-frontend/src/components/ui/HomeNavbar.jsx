import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import { ROUTES } from '../../constants';

/**
 * HomeNavbar Component
 * Sticky navbar for all protected pages.
 * Shows logo, communities, notifications, and profile avatar.
 * 
 * @param {boolean} hideNavLinks - Hide nav links (Home, My Communities, Help) for unverified users
 */
export default function HomeNavbar({ hideNavLinks = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // When viewing a specific community (/dashboard?community=xxx), treat My Communities as active
  const isCommunityView = location.pathname === ROUTES.DASHBOARD && !!searchParams.get('community');
  const isActive = (path) => {
    if (path === ROUTES.MY_COMMUNITIES && isCommunityView) return true;
    if (path === ROUTES.DASHBOARD && isCommunityView) return false;
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-lg font-bold text-charcoal">ShareMore</span>
        </button>

        {/* Nav Links - Hidden when hideNavLinks is true */}
        {!hideNavLinks && (
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className={`text-sm font-medium transition-colors relative pb-1 ${isActive(ROUTES.DASHBOARD)
                ? 'text-primary'
                : 'text-charcoal hover:text-primary'
                }`}
            >
              Dashboard
              {isActive(ROUTES.DASHBOARD) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate(ROUTES.MY_COMMUNITIES)}
              className={`text-sm font-medium transition-colors relative pb-1 ${isActive(ROUTES.MY_COMMUNITIES)
                ? 'text-primary'
                : 'text-charcoal hover:text-primary'
                }`}
            >
              My Communities
              {isActive(ROUTES.MY_COMMUNITIES) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate(ROUTES.DISCOVER)}
              className={`text-sm font-medium transition-colors relative pb-1 ${isActive(ROUTES.DISCOVER)
                ? 'text-primary'
                : 'text-charcoal hover:text-primary'
                }`}
            >
              Marketplace
              {isActive(ROUTES.DISCOVER) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Profile Avatar with Dropdown */}
          <ProfileAvatar user={user} onLogout={logout} />
        </div>
      </div>
    </header>
  );
}
