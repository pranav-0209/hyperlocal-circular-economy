import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * VerificationLayout Component
 * Layout wrapper for all verification flow pages.
 * Shows progress indicator and step information.
 */
export default function VerificationLayout({
  stepNumber,
  totalSteps,
  title,
  children,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use actual profile completion from backend, fallback to step-based calculation
  const completionPercentage = user?.profileCompletion ?? Math.round((stepNumber / totalSteps) * 100);

  const handleLogout = () => {
    // Clear auth state and redirect to login
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navbar - Logo and Logout only */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-green hover:text-charcoal transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Progress Section - Below Navbar */}
      <section className="my-10 mx-60 bg-white border rounded-lg border-gray-200">
        <div className="max-w-5xl px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-charcoal">
              Step {stepNumber} of {totalSteps}: {title}
            </h2>
            <span className="text-sm text-muted-green">
              {completionPercentage}% COMPLETE
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="pb-16 px-4 max-w-6xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-green">
          <p>✓ Your information is securely encrypted and never shared without permission.</p>
        </div>
      </footer>
    </div>
  );
}
