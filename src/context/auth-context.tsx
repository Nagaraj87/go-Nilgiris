
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifyAdminCredentials } from '@/lib/firebase';

type AuthContextType = {
  user: { username: string } | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a session on initial load
    const checkSession = () => {
      setLoading(true);
      try {
        const storedUser = sessionStorage.getItem('adminUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from session storage", error);
        sessionStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (username: string, password?: string) => {
    setLoading(true);
    try {
      if (!password) {
          return false;
      }
      
      const isValid = await verifyAdminCredentials(username, password);
      
      if (isValid) {
        const userData = { username };
        sessionStorage.setItem('adminUser', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminUser');
    setUser(null);
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
