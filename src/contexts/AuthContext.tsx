import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalAuth, LocalUser } from './LocalAuthContext';

interface AuthContextType {
  user: LocalUser | null;
  session: null;
  loading: boolean;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, signOut } = useLocalAuth();

  const value: AuthContextType = {
    user,
    session: null,
    loading,
    signOut: async () => { signOut(); return { error: null }; },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
