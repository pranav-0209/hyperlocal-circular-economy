import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, VerificationRequiredRoute, AdminRoute } from './components/ProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import PageTransition from './components/ui/PageTransition';
import { Toaster } from 'sonner';
import { ROUTES } from './constants';

// Lazy load all pages for code splitting
// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Protected pages - Home & Dashboard
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MyCommunitiesPage = lazy(() => import('./pages/MyCommunitiesPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));

// Verification flow pages
const VerifyProfilePage = lazy(() => import('./pages/verification/VerifyProfilePage'));
const VerifyDocumentsPage = lazy(() => import('./pages/verification/VerifyDocumentsPage'));
const VerifyPendingPage = lazy(() => import('./pages/verification/VerifyPendingPage'));


// Admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Super Admin pages
const SuperAdminLogin = lazy(() => import('./pages/superadmin/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminVerifications = lazy(() => import('./pages/superadmin/SuperAdminVerifications'));
const SuperAdminVerificationDetail = lazy(() => import('./pages/superadmin/SuperAdminVerificationDetail'));
const SuperAdminUsers = lazy(() => import('./pages/superadmin/SuperAdminUsers'));
const SuperAdminCommunities = lazy(() => import('./pages/superadmin/SuperAdminCommunities'));

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="min-h-screen">
            <Routes location={location}>
              {/* Public Routes */}
              <Route path={ROUTES.HOME_PUBLIC} element={<LandingPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />

              {/* Post-login routes - Protected by authentication */}
              <Route
                path={ROUTES.HOME}
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              {/* Verification Flow - Protected by authentication but NOT by verification */}
              <Route
                path={ROUTES.VERIFY_PROFILE}
                element={
                  <ProtectedRoute>
                    <VerifyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.VERIFY_DOCUMENTS}
                element={
                  <ProtectedRoute>
                    <VerifyDocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.VERIFY_PENDING}
                element={
                  <ProtectedRoute>
                    <VerifyPendingPage />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard - Requires verification */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <VerificationRequiredRoute>
                    <DashboardPage />
                  </VerificationRequiredRoute>
                }
              />

              {/* My Communities - Requires verification */}
              <Route
                path={ROUTES.MY_COMMUNITIES}
                element={
                  <VerificationRequiredRoute>
                    <MyCommunitiesPage />
                  </VerificationRequiredRoute>
                }
              />

              {/* Discover - Requires verification */}
              <Route
                path={ROUTES.DISCOVER}
                element={
                  <VerificationRequiredRoute>
                    <DiscoverPage />
                  </VerificationRequiredRoute>
                }
              />

              {/* Admin Routes - Requires admin role + verification */}
              <Route
                path={`${ROUTES.ADMIN}/*`}
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route path={ROUTES.SUPERADMIN_LOGIN} element={<SuperAdminLogin />} />
              <Route
                path={ROUTES.SUPERADMIN}
                element={
                  <SuperAdminProtectedRoute>
                    <SuperAdminDashboard />
                  </SuperAdminProtectedRoute>
                }
              />
              <Route
                path={ROUTES.SUPERADMIN_VERIFICATIONS}
                element={
                  <SuperAdminProtectedRoute>
                    <SuperAdminVerifications />
                  </SuperAdminProtectedRoute>
                }
              />
              <Route
                path={ROUTES.SUPERADMIN_VERIFICATION_DETAIL}
                element={
                  <SuperAdminProtectedRoute>
                    <SuperAdminVerificationDetail />
                  </SuperAdminProtectedRoute>
                }
              />
              <Route
                path={ROUTES.SUPERADMIN_USERS}
                element={
                  <SuperAdminProtectedRoute>
                    <SuperAdminUsers />
                  </SuperAdminProtectedRoute>
                }
              />
              <Route
                path={ROUTES.SUPERADMIN_COMMUNITIES}
                element={
                  <SuperAdminProtectedRoute>
                    <SuperAdminCommunities />
                  </SuperAdminProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<div>404 - Page not found</div>} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
