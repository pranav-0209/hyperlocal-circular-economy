import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useDarkMode } from "../../hooks/useDarkMode";

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
  const { dark, toggle } = useDarkMode();

  // Use actual profile completion from backend, fallback to step-based calculation
  const completionPercentage = user?.profileCompletion ?? Math.round((stepNumber / totalSteps) * 100);

  // Animate the bar from 0 → target on mount (and whenever percentage changes)
  const [animatedWidth, setAnimatedWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(completionPercentage), 80);
    return () => clearTimeout(timer);
  }, [completionPercentage]);

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Navbar - Logo and Dark Mode only */}
      <nav className="bg-white border-b border-gray-200 shrink-0">
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

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-green hover:text-charcoal hover:bg-gray-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </nav>

      {/* Progress Section - Below Navbar */}
      <section className="bg-white mt-5 border-b border-gray-200 shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-charcoal">
              Step {stepNumber} of {totalSteps}: {title}
            </h2>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {completionPercentage}% Complete
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${animatedWidth}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 px-4 shrink-0">
        <div className="max-w-4xl mx-auto text-center text-xs text-muted-green">
          <p>✓ Your information is securely encrypted and never shared without permission.</p>
        </div>
      </footer>
    </div>
  );
}
