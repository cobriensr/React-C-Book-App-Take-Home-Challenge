// frontend/src/contexts/AuthContext.tsx

import React, { useState, useEffect } from 'react';
import type { User, AuthProviderProps } from '../types/auth';
import authService from '../services/authService';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const verifiedUser = await authService.verifyToken();
        setUser(verifiedUser);
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const response = await authService.login({ email, password });
      setUser(response.user);
    },
    []
  );

  const register = React.useCallback(
    async (email: string, password: string, name: string) => {
      const response = await authService.register({ email, password, name });
      setUser(response.user);
    },
    []
  );

  const logout = React.useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};