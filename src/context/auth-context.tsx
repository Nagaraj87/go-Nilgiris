
"use client";

import { createContext, useContext, ReactNode } from 'react';

// Since login is removed, we provide a dummy context.
type AuthContextType = {
  user: { username: string } | null;
  loading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const value = { 
    user: { username: 'admin' }, 
    loading: false, 
    login: async () => true, 
    logout: () => {} 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
