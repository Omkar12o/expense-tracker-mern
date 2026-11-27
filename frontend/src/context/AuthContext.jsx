import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { setSessionExpiredHandler } from '../api/session';
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    authApi
      .me()
      .then((current) => {
        if (active) {
          setUser(current);
          setStoredUser(current);
        }
      })
      .catch(() => {
        if (active) {
          clearAuthStorage();
          setTokenState(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearAuthStorage();
      setTokenState(null);
      setUser(null);
      navigate('/login', { state: { sessionExpired: true }, replace: true });
    });
    return () => setSessionExpiredHandler(null);
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const session = await authApi.login(credentials);
    setToken(session.token);
    setStoredUser(session.user);
    setTokenState(session.token);
    setUser(session.user);
    return session;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await authApi.register(payload);
    setToken(session.token);
    setStoredUser(session.user);
    setTokenState(session.token);
    setUser(session.user);
    return session;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* client-side logout always succeeds */
    }
    clearAuthStorage();
    setTokenState(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({ user, token, login, register, logout, loading }),
    [user, token, login, register, logout, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
