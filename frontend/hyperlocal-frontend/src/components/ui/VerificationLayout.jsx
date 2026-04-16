import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useDarkMode } from "../../hooks/useDarkMode";
import HomeNavbar from "./HomeNavbar";

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
  const { user } = useAuth();
  const { dark } = useDarkMode();

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
      <HomeNavbar hideNavLinks />

      {/* Progress Section - Below Navbar */}
      <section className={`mt-[72px] border-b shrink-0 ${dark ? 'bg-white/6 border-white/12' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-charcoal">
              Step {stepNumber} of {totalSteps}: {title}
            </h2>
            <span className={`text-xs font-semibold text-primary uppercase tracking-wide px-2.5 py-1 rounded-full ${dark ? 'bg-primary/18' : 'bg-primary/8'}`}>
              {completionPercentage}% Complete
            </span>
          </div>
          {/* Progress Bar */}
          <div className={`w-full rounded-full h-2 ${dark ? 'bg-white/12' : 'bg-gray-200'}`}>
            <div
              className="bg-primary h-2 rounded-full transition-[width] duration-700 ease-out"
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
      <footer className={`border-t py-4 px-4 shrink-0 ${dark ? 'bg-white/6 border-white/12' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-muted-green">
          <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
          <p className="font-medium">Your information is securely encrypted and never shared without permission.</p>
        </div>
      </footer>
    </div>
  );
}
