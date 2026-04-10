import SidebarBenefits from '../components/ui/SidebarBenefits';
import LoginForm from '../components/ui/LoginForm';
import { useDarkMode } from '../hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';

const LoginPage = () => {
  const { dark, toggle } = useDarkMode();

  return (
    /* h-screen + overflow-hidden → full viewport, no page scroll */
    <div className="h-screen bg-background-light font-display text-charcoal flex overflow-hidden">

      {/* Sidebar — fixed dark panel, never scrolls */}
      <SidebarBenefits />

      {/* Right panel — fills remaining width, scrolls only if content overflows */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">

        {/* Top bar — dark-mode toggle always visible, top-right */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6' }}
        >
          {/* Mobile: show logo; Desktop: invisible spacer so toggle stays right */}
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <svg className="size-3.5 text-white" fill="none" viewBox="0 0 48 48">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-sm font-bold text-charcoal" style={{ fontFamily: 'var(--font-family-heading)' }}>
              ShareMore
            </span>
          </div>

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-green hover:text-primary hover:bg-primary/8 transition-all border"
            style={{ borderColor: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb' }}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div
            className="w-full max-w-md rounded-2xl border p-8 sm:p-10"
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
              borderColor: dark ? 'rgba(255,255,255,0.08)' : '#eeede9',
              boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.35)' : '0 4px 32px rgba(0,0,0,0.07)',
            }}
          >
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
