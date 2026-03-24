'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else if (response.user) {
        // Handle case where user is directly in response
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      Cookies.remove('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    
    // Handle different response formats from backend
    let token: string | null = null;
    let userData: any = null;
    
    // Format 1: Standard success response with data.token
    if (response.success && response.data?.token) {
      token = response.data.token;
      userData = response.data.user;
    }
    // Format 2: Direct response with access_token (admin users)
    else if (response.access_token) {
      token = response.access_token;
      userData = response.profile || response.user;
    }
    // Format 3: Direct response with token (fallback)
    else if (response.token) {
      token = response.token;
      userData = response.user;
    }
    // Format 4: Response with data.access_token
    else if (response.data?.access_token) {
      token = response.data.access_token;
      userData = response.data.profile || response.data.user;
    }
    
    if (token) {
      Cookies.set('auth_token', token, { expires: 30 });
      if (userData) {
        setUser(userData);
      } else {
        await fetchUser();
      }
    } else {
      throw new Error(response.message || 'Login failed. Invalid response format.');
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

