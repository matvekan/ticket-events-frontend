import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { api, clearToken, getToken, setToken } from '../lib/api';
import type { AuthTokenPayload } from '../types';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwtDecode<AuthTokenPayload>(token);
    if (payload.exp !== undefined && payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const payload = useMemo(() => (token ? decodeToken(token) : null), [token]);

  useEffect(() => {
    if (token && payload === null) {
      clearToken();
      setTokenState(null);
    }
  }, [token, payload]);

  useEffect(() => {
    const handleUnauthorized = () => setTokenState(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/auth/login', { email, password });
    setToken(data.token);
    setTokenState(data.token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.post('/auth/register', { name, email, password });
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isAdmin: payload?.roles.includes('ROLE_ADMIN') ?? false,
      userEmail: payload?.username ?? null,
      login,
      register,
      logout,
    }),
    [token, payload, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
