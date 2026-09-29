import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import ApiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(() => ApiClient.getToken());
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const storedToken = ApiClient.getToken();
      if (!storedToken) {
        setUser(null);
        setDriver(null);
        setLoading(false);
        return;
      }

      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setDriver(res.data.driver || null);
      } else {
        setUser(null);
        setDriver(null);
        ApiClient.setToken(null);
      }
    } catch (err) {
      console.warn('Authentication check failed:', err.message);
      ApiClient.setToken(null);
      setUser(null);
      setDriver(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      ApiClient.setToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setDriver(res.data.driver || null);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data) {
      ApiClient.setToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setDriver(res.data.driver || null);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout request errors
    } finally {
      ApiClient.setToken(null);
      setToken(null);
      setUser(null);
      setDriver(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driver,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isCustomer: user?.role === 'CUSTOMER',
        isDriver: user?.role === 'DRIVER',
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
