import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Set the token in axios headers FIRST
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(savedUser));
        console.log('✅ Auth initialized with token from localStorage');
      } catch (e) {
        console.error('❌ Error parsing saved user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      }
    } else {
      console.log('⚠️ No auth data found in localStorage');
    }
    
    setLoading(false);
    setIsInitialized(true);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token, user: userData } = response.data;
      
      // Save to localStorage FIRST (the interceptor will pick it up)
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // CRITICAL: Set the token in axios default headers immediately
      // This ensures all subsequent requests have the token
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Set user state
      setUser(userData);
      
      console.log('✅ Login successful, token set in axios headers');
      
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isEmployee: user?.role === 'Employee',
    isManager: user?.role === 'Manager' || user?.role === 'Admin',
    isAdmin: user?.role === 'Admin',
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
