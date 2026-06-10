import { User, UserRole } from '../data/types';
import { mockUsers } from '../data/users';
import { apiClient, IS_MOCK } from './apiClient';

const SESSION_KEY = 'lms_session_v1';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}

export interface LoginResult {
  user: User;
  session: Session;
}

function mockToken(userId: string): string {
  return `mock_${userId}_${Date.now().toString(36)}`;
}

function buildSession(user: User, token: string): Session {
  return {
    userId: user.id,
    name: user.fullnameThai,
    email: user.email,
    role: user.role,
    token,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export const authService = {
  async login(email: string, password: string, extraUsers: User[] = []): Promise<LoginResult> {
    if (!IS_MOCK) {
      const result = await apiClient.post<{ user: User; token: string }>('/auth/login', { email, password });
      const session = buildSession(result.user, result.token);
      authService.saveSession(session);
      return { user: result.user, session };
    }

    const allUsers = [...mockUsers, ...extraUsers];
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    if (!user.isActive) throw new Error('บัญชีนี้ถูกระงับการใช้งาน');

    const session = buildSession(user, mockToken(user.id));
    authService.saveSession(session);
    return { user, session };
  },

  logout(): void {
    if (!IS_MOCK) {
      apiClient.post('/auth/logout', {}).catch(() => {});
    }
    localStorage.removeItem(SESSION_KEY);
  },

  getSession(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: Session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        authService.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  saveSession(session: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  isAuthenticated(): boolean {
    return authService.getSession() !== null;
  },

  refreshSession(): void {
    const session = authService.getSession();
    if (!session) return;
    authService.saveSession({ ...session, expiresAt: Date.now() + SESSION_TTL_MS });
  },
};