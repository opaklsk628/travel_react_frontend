import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authService } from '../services/api';

export type Role = 'customer' | 'operator' | 'admin' | null;
interface UserInfo {
  email: string;
  username?: string;
  role?: Role;
}

export interface AuthContextType {
  token: string | null;
  role: Role;
  user: UserInfo | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole]   = useState<Role>(null);
  const [user, setUser]   = useState<UserInfo | null>(null);

  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const tk = localStorage.getItem('token');
    const rl = localStorage.getItem('role') as Role | null;
    const em = localStorage.getItem('email');
    const un = localStorage.getItem('username');
    if (tk) setToken(tk);
    if (rl) setRole(rl);
    if (em) setUser({ email: em, username: un || undefined, role: rl });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await authService.login({ email, password });
      const { token: jwt, user } = res.data;

      setToken(jwt);
      setRole(user.role);
      setUser({ email: user.email, username: user.username, role: user.role });

      localStorage.setItem('token', jwt);
      localStorage.setItem('role', user.role ?? '');
      localStorage.setItem('email', user.email);
      localStorage.setItem('username', user.username ?? '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Register failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    token,
    role,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    error,

    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
