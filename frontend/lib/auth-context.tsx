/**
 * Authentication Context
 * Manages user authentication state and role-based access
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import type { User } from '@/types';
import { getLocationFromIP, saveLocation } from '@/lib/location-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isCooperative: boolean;
  isFarmer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    // Get location from IP on first load
    const initLocation = async () => {
      const location = await getLocationFromIP();
      if (location) {
        saveLocation(location);
      }
    };
    initLocation();
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Call backend login API to get JWT token
      const loginResponse = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Đăng nhập thất bại');
      }

      const tokenData = await loginResponse.json();
      
      // Save JWT tokens
      localStorage.setItem('authToken', tokenData.access);
      localStorage.setItem('refreshToken', tokenData.refresh);

      // Construct user object from token response
      const userData = {
        id: tokenData.user_id,
        username: username,
        role: tokenData.role === 'farmer' ? 3 : (tokenData.role === 'cooperative_manager' ? 2 : 1),
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData as User);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 1;
  const isCooperative = user?.role === 2;
  const isFarmer = user?.role === 3;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isCooperative,
        isFarmer,
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
