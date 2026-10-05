import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('kasirku_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/user');
      setUser(res.data.user);
      setTenant(res.data.tenant);
      setSettings(res.data.settings);
      setActiveShift(res.data.active_shift);
    } catch (err) {
      console.error('Failed to authenticate session:', err);
      localStorage.removeItem('kasirku_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser, tenant: loggedTenant, settings: loggedSettings, active_shift } = res.data;
    localStorage.setItem('kasirku_token', token);
    setUser(loggedUser);
    setTenant(loggedTenant);
    setSettings(loggedSettings);
    setActiveShift(active_shift);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('kasirku_token');
      setUser(null);
      setTenant(null);
      setSettings(null);
      setActiveShift(null);
    }
  };

  const refreshContext = async () => {
    try {
      const res = await api.get('/auth/user');
      setUser(res.data.user);
      setTenant(res.data.tenant);
      setSettings(res.data.settings);
      setActiveShift(res.data.active_shift);
    } catch (err) {
      console.error('Context refresh error:', err);
    }
  };

  const isOwner = user?.role === 'owner';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        settings,
        activeShift,
        setActiveShift,
        loading,
        login,
        logout,
        refreshContext,
        isOwner,
        isCashier,
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
