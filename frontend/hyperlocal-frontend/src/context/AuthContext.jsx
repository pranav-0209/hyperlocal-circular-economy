import { createContext, useContext, useState } from 'react';

/**
 * AuthContext manages user authentication and profile state
 * 
 * User object shape:
 * {
 *   id: string,
 *   email: string,
 *   isVerified: boolean,
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
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = (userData) => {
    setUser(userData);
    // Persist user to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfileCompletion = (percentage) => {
    setUser((prev) => {
      const updated = { ...prev, profileCompletion: Math.min(percentage, 100) };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const markDocumentsSubmitted = (percentageFromBackend) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        hasSubmittedDocuments: true,
        profileCompletion: percentageFromBackend || 75,
        currentStep: 'REVIEW',
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const markVerified = () => {
    setUser((prev) => {
      const updated = {
        ...prev,
        isVerified: true,
        profileCompletion: 100,
        currentStep: 'COMPLETE',
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const addCommunity = (community) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        communities: [...prev.communities, community],
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    isLoading,
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
