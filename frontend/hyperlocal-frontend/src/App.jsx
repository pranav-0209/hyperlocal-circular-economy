import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, VerificationRequiredRoute, AdminRoute } from './components/ProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import PageLoader from './components/ui/PageLoader';

// Lazy load all pages for code splitting
// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Protected pages - Home & Dashboard
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Post-login routes - Protected by authentication */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Verification Flow - Protected by authentication but NOT by verification */}
            <Route
              path="/verify/profile"
              element={
                <ProtectedRoute>
                  <VerifyProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify/documents"
              element={
                <ProtectedRoute>
                  <VerifyDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify/pending"
              element={
                <ProtectedRoute>
                  <VerifyPendingPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard - Requires verification, handles community selection if needed */}
            <Route
              path="/dashboard"
              element={
                <VerificationRequiredRoute>
                  <DashboardPage />
                </VerificationRequiredRoute>
              }
            />

            {/* Admin Routes - Requires admin role + verification */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
            <Route
              path="/superadmin"
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminDashboard />
                </SuperAdminProtectedRoute>
              }
            />
            <Route
              path="/superadmin/verifications"
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminVerifications />
                </SuperAdminProtectedRoute>
              }
            />
            <Route
              path="/superadmin/verifications/:id"
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminVerificationDetail />
                </SuperAdminProtectedRoute>
              }
            />
            <Route
              path="/superadmin/users"
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminUsers />
                </SuperAdminProtectedRoute>
              }
            />
            <Route
              path="/superadmin/communities"
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminCommunities />
                </SuperAdminProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<div>404 - Page not found</div>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
