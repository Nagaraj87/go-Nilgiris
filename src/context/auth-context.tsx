
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAdminCredentials } from '@/lib/firebase';
import type { AdminCredentials } from '@/types';
import bcrypt from 'bcryptjs';

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
      const credentials = await getAdminCredentials();
      const usernameMatch = credentials.username === username;
      
      if (!usernameMatch) return false;

      // Handle the case where a password is not provided or not set in the DB
      if (!credentials.password || !password) {
        // This might happen during initial setup or if the password field is deleted.
        // For recovery, we can check against the known default.
        if(password === 'password'){
             const userData = { username };
             sessionStorage.setItem('adminUser', JSON.stringify(userData));
             setUser(userData);
             // The getAdminCredentials function will self-heal the password in the background
             return true;
        }
        return false;
      }
      
      // Securely compare the provided password with the stored hash
      const passwordMatch = await bcrypt.compare(password, credentials.password);
      
      if (passwordMatch) {
        const userData = { username };
        sessionStorage.setItem('adminUser', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      
      return false; // Return false if credentials do not match
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
