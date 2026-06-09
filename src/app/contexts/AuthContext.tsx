import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../data/types';
import { authService, Session } from '../services/authService';
import { mockUsers } from '../data/users';

interface AuthContextValue {
  session: Session | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, extraUsers?: User[]) => Promise<User>;
  loginDirect: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  extraUsers?: User[];
}

export function AuthProvider({ children, extraUsers = [] }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(() => authService.getSession());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const s = authService.getSession();
    if (!s) return null;
    return [...mockUsers, ...extraUsers].find((u) => u.id === s.userId) ?? null;
  });

  // Sync user whenever extraUsers list changes (e.g. after registration)
  useEffect(() => {
    if (session && !currentUser) {
      const found = [...mockUsers, ...extraUsers].find((u) => u.id === session.userId);
      if (found) setCurrentUser(found);
    }
  }, [extraUsers, session, currentUser]);

  const login = useCallback(async (email: string, password: string, extra: User[] = []): Promise<User> => {
    const { user, session: newSession } = await authService.login(email, password, [...extraUsers, ...extra]);
    setSession(newSession);
    setCurrentUser(user);
    return user;
  }, [extraUsers]);

  const loginDirect = useCallback((user: User) => {
    const newSession: Session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: `mock_${user.id}_${Date.now().toString(36)}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    authService.saveSession(newSession);
    setSession(newSession);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, currentUser, isAuthenticated: !!session, login, loginDirect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}