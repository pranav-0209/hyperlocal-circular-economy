import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';

/**
 * AuthContext manages user authentication and profile state
 *
 * User object shape:
 * {
 *   id: string,
 *   email: string,
 *   isVerified: boolean (derived from verificationStatus === 'VERIFIED'),
 *   verificationStatus: 'NOT_VERIFIED' | 'VERIFIED' | 'REJECTED',
 *   profileCompletion: number (0-100),
 *   role: 'USER' | 'ADMIN' | 'SUPERADMIN',
 *   communities: array,
 *   hasSubmittedDocuments: boolean,
 *   profile: { name, phone, address, bio }
 * }
 */

const AuthContext = createContext(null);

// Helper to get initial user from localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

/**
 * Clears previous-user stale data on LOGIN.
 * Removes the old user profile from localStorage and wipes sessionStorage
 * (which holds per-session caches like submittedReviewTransactions).
 *
 * IMPORTANT: does NOT remove AUTH_TOKEN — the caller (LoginForm) saves the
 * new session token into localStorage BEFORE calling login(), so we must not
 * wipe it here.  Token removal is handled by clearAllUserStorage() on logout.
 */
const clearPreviousUserData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  // Wipe session storage so per-session caches from the previous user
  // (e.g. submittedReviewTransactions) do not bleed into the new session.
  sessionStorage.clear();
};

/**
 * Clears ALL user-specific storage on LOGOUT.
 * Removes both the user profile AND the auth token from localStorage,
 * and clears sessionStorage.
 */
const clearAllUserStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  sessionStorage.clear();
};

/**
 * AuthProvider
 *
 * Accepts an optional `onClearCache` prop — a callback that the host component
 * (App.jsx) can pass to clear the React Query cache on logout. This keeps
 * AuthContext free of a direct React Query dependency while still ensuring
 * that ALL cached query data is wiped when the active user changes.
 */
export function AuthProvider({ children, onClearCache }) {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((userData) => {
    // Clear previous user's stale data (profile + sessionStorage) BEFORE setting
    // the new user.  We do NOT remove AUTH_TOKEN here because LoginForm saves the
    // new session token into localStorage before calling login() — wiping it here
    // would cause every subsequent authenticated API call (e.g. getMyCommunities)
    // to be sent without a token, receive a 401, and fail silently.
    clearPreviousUserData();
    if (onClearCache) {
      onClearCache();
    }
    setUser(userData);
    // Persist new user to localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  }, [onClearCache]);

  const logout = useCallback(() => {
    setUser(null);
    // Clear all user-specific storage (localStorage + sessionStorage)
    clearAllUserStorage();
    // Clear the React Query cache so no cached data from the previous user
    // is visible to the next user who logs in from the same browser session.
    if (onClearCache) {
      onClearCache();
    }
  }, [onClearCache]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfileCompletion = useCallback((percentage) => {
    setUser((prev) => {
      const updated = { ...prev, profileCompletion: Math.min(percentage, 100) };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markDocumentsSubmitted = useCallback((percentageFromBackend) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        hasSubmittedDocuments: true,
        profileCompletion: percentageFromBackend || 75,
        currentStep: 'REVIEW',
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markVerified = useCallback(() => {
    setUser((prev) => {
      const updated = {
        ...prev,
        isVerified: true,
        profileCompletion: 100,
        currentStep: 'COMPLETE',
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCommunity = useCallback((community) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        communities: [...prev.communities, community],
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    login,
    logout,
    updateUser,
    updateProfileCompletion,
    markDocumentsSubmitted,
    markVerified,
    addCommunity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
