import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, VerificationRequiredRoute, AdminRoute } from './components/ProtectedRoute';

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

          {/* 404 Fallback */}
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
