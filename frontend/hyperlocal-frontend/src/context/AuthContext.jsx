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

export function AuthProvider({ children }) {
  // Mock user state - replace with actual auth logic after backend integration
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateProfileCompletion = (percentage) => {
    setUser((prev) => ({
      ...prev,
      profileCompletion: Math.min(percentage, 100),
    }));
  };

  const markDocumentsSubmitted = (percentageFromBackend) => {
    setUser((prev) => ({
      ...prev,
      hasSubmittedDocuments: true,
      profileCompletion: percentageFromBackend || 75,
    }));
  };

  const markVerified = () => {
    setUser((prev) => ({
      ...prev,
      isVerified: true,
      profileCompletion: 100,
    }));
  };

  const addCommunity = (community) => {
    setUser((prev) => ({
      ...prev,
      communities: [...prev.communities, community],
    }));
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
