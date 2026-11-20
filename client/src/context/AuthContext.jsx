import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('anksetu_user');
    const savedToken = localStorage.getItem('anksetu_token');
    if (savedUser && savedToken) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('anksetu_token') || null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Logout & Session Invalidation
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('anksetu_user');
    localStorage.removeItem('anksetu_token');
  };

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('anksetu_token', token);
    } else {
      localStorage.removeItem('anksetu_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('anksetu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('anksetu_user');
    }
  }, [user]);

  // Validate session on app initialization
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('anksetu_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          // If token expired or invalid, clear session
          logout();
        }
      }
      setInitializing(false);
    };

    verifySession();
  }, []);

  // Real Backend Login
  const login = async (email, password, expectedRole = null) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { email, password };
      if (expectedRole) payload.expectedRole = expectedRole;
      const res = await authAPI.login(payload);
      if (res.success && res.token && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('anksetu_token', res.token);
        localStorage.setItem('anksetu_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      } else {
        const msg = res.message || 'Login failed. Please check your credentials.';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Real Backend Registration
  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(formData);
      if (res.success && res.token && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('anksetu_token', res.token);
        localStorage.setItem('anksetu_user', JSON.stringify(res.user));
        return { success: true, user: res.user, message: res.message };
      } else {
        const msg = res.message || 'Registration failed.';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Request
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.forgotPassword({ email });
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to request password reset' };
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Execution
  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.resetPassword({
        token: resetToken,
        password: newPassword,
        confirmPassword,
      });
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to reset password' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initializing,
        error,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
