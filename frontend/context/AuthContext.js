'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveSession, loadSession, clearSession, apiGetMe } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true until session is restored

  // Restore session from localStorage on first render
  useEffect(() => {
    const { token: storedToken, user: storedUser } = loadSession();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      // Re-verify token with server in the background
      apiGetMe(storedToken)
        .then((res) => setUser(res.user))
        .catch(() => { clearSession(); setToken(null); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token, user) => {
    saveSession(token, user);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin', isStaff: user?.role === 'staff' || user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
