import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, VerificationRequiredRoute, AdminRoute } from './components/ProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Protected pages - Home & Dashboard
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

// Verification flow pages
import VerifyProfilePage from './pages/verification/VerifyProfilePage';
import VerifyDocumentsPage from './pages/verification/VerifyDocumentsPage';
import VerifyPendingPage from './pages/verification/VerifyPendingPage';

// Community flow
import CommunitySelectPage from './pages/CommunitySelectPage';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';

// Super Admin pages
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminVerifications from './pages/superadmin/SuperAdminVerifications';
import SuperAdminVerificationDetail from './pages/superadmin/SuperAdminVerificationDetail';
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers';
import SuperAdminCommunities from './pages/superadmin/SuperAdminCommunities';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          {/* Community Selection - Requires verification */}
          <Route
            path="/community/select"
            element={
              <VerificationRequiredRoute>
                <CommunitySelectPage />
              </VerificationRequiredRoute>
            }
          />

          {/* Dashboard - Requires verification + community */}
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
