import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const AuthContext = createContext();

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
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch user info from /api/domains to verify token is valid
      const userData = await apiService.getCurrentUser();
      setUser({
        email: userData.domain_email,
        name: userData.name,
        id: userData.id,
        domainEmail: userData.domain_email,
      });
    } catch (err) {
      console.error('Auth check failed:', err);
      // Token is invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Call login API - apiService.login handles token storage
      await apiService.login({ email, password });
      
      // Fetch user info after successful login
      const userData = await apiService.getCurrentUser();
      setUser({
        email: userData.domain_email,
        name: userData.name,
        id: userData.id,
        domainEmail: userData.domain_email,
      });
      
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.status === 401
        ? 'Invalid email or password'
        : err.response?.data?.detail || 'Unable to connect to server';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user state regardless of API success
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
