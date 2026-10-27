import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('anksetu_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return {
      id: 'demo-teacher-01',
      name: 'Aarav Sharma',
      email: 'teacher@anksetu.edu',
      role: 'teacher',
      schoolId: 'SCH-1001',
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('anksetu_token') || 'demo_token_123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && token !== 'demo_token_123') {
      localStorage.setItem('anksetu_token', token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('anksetu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('anksetu_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('anksetu_token', res.token);
        localStorage.setItem('anksetu_user', JSON.stringify(res.user));
        return { success: true };
      } else {
        setError(res.message || 'Login failed');
        return { success: false, message: res.message };
      }
    } catch (err) {
      // Fallback demo login if server unreachable or dev mode
      if (email.includes('teacher') || email.includes('admin') || email.includes('anksetu')) {
        const role = email.includes('admin') ? 'admin' : 'teacher';
        const demoUser = {
          id: `demo-${role}-01`,
          name: role === 'admin' ? 'Dr. Rajesh Verma (Principal)' : 'Aarav Sharma (Teacher)',
          email: `${role}@anksetu.edu`,
          role,
          schoolId: 'SCH-1001',
        };
        setUser(demoUser);
        setToken(`demo_token_${role}`);
        localStorage.setItem('anksetu_user', JSON.stringify(demoUser));
        localStorage.setItem('anksetu_token', `demo_token_${role}`);
        return { success: true };
      }
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (role = 'teacher') => {
    const demoUser = {
      id: `demo-${role}-01`,
      name: role === 'admin' ? 'Dr. Rajesh Verma (Principal)' : 'Aarav Sharma (Teacher)',
      email: `${role}@anksetu.edu`,
      role: role,
      schoolId: 'SCH-1001',
    };
    setUser(demoUser);
    setToken(`demo_token_${role}`);
    localStorage.setItem('anksetu_user', JSON.stringify(demoUser));
    localStorage.setItem('anksetu_token', `demo_token_${role}`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('anksetu_user');
    localStorage.removeItem('anksetu_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
