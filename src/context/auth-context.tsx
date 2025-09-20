
"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
    children, 
    isAuthenticated: initialIsAuthenticated 
}: { 
    children: ReactNode, 
    isAuthenticated: boolean 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

  useEffect(() => {
    setIsAuthenticated(initialIsAuthenticated);
  }, [initialIsAuthenticated]);
  
  const value = { isAuthenticated };

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
