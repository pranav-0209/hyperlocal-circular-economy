import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { adminLogin, saveAdminAuthData } from '../../services/authService';

/**
 * SuperAdminLogin Page (/superadmin/login)
 * Separate login page for super admin access
 */
export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
    requestAnimationFrame(() => {
      passwordInputRef.current?.focus();
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call backend admin login API
      const response = await adminLogin({
        email: formData.email,
        password: formData.password,
      });

      console.log('Admin login response:', response);

      // Save admin token and user data
      saveAdminAuthData(response.token, {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
      });

      // Navigate to admin dashboard
      navigate('/superadmin');
    } catch (error) {
      console.error('Admin login error:', error);
      setError(error.message || 'Invalid credentials. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="superadmin-theme min-h-screen bg-background-light text-charcoal font-display flex flex-col">
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <svg className="size-4 text-white" fill="none" viewBox="0 0 48 48">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-family-heading)' }}>
            ShareMore
          </span>
        </button>

        <button
          onClick={toggle}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-green hover:text-primary hover:bg-primary/8 transition-all border"
          style={{ borderColor: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb' }}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div
          className="w-full max-w-md rounded-2xl border p-8 sm:p-10"
          style={{
            background: dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
            borderColor: dark ? 'rgba(255,255,255,0.08)' : '#eeede9',
            boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.35)' : '0 4px 32px rgba(0,0,0,0.07)',
          }}
        >
          <div className="mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-3">
              <span className="material-symbols-outlined text-primary text-sm">admin_panel_settings</span>
              <span className="text-[0.7rem] font-bold text-primary uppercase tracking-widest">Super Admin</span>
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2 text-charcoal">Portal Sign In</h1>
            <p className="text-muted-green text-sm">Restricted access for authorized administrators.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">
                  mail
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background-light border border-gray-200 rounded-lg text-charcoal placeholder:text-muted-green/65 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">
                  lock
                </span>
                <input
                  ref={(el) => {
                    passwordInputRef.current = el;
                  }}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-background-light border border-gray-200 rounded-lg text-charcoal placeholder:text-muted-green/65 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-muted-green hover:text-primary transition-colors"
                >
                  <span className="relative w-5 h-5 block">
                    <span
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
                        showPassword ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                      }`}
                    >
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
                        showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      }`}
                    >
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-muted-green/70 text-center">
              This portal is restricted to authorized administrators only.
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
