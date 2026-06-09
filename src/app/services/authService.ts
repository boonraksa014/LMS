import { User, UserRole } from '../data/types';
import { mockUsers } from '../data/users';

const SESSION_KEY = 'lms_session_v1';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

// Mock token generator — replace with real JWT from backend
function mockToken(userId: string): string {
  return `mock_${userId}_${Date.now().toString(36)}`;
}

export const authService = {
  // POST /auth/login
  async login(email: string, password: string, extraUsers: User[] = []): Promise<LoginResult> {
    const allUsers = [...mockUsers, ...extraUsers];
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    if (!user.active) throw new Error('บัญชีนี้ถูกระงับการใช้งาน');

    const session: Session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: mockToken(user.id),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    authService.saveSession(session);
    return { user, session };
  },

  logout(): void {
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

  // Extend expiry on activity (call on significant user actions)
  refreshSession(): void {
    const session = authService.getSession();
    if (!session) return;
    authService.saveSession({ ...session, expiresAt: Date.now() + SESSION_TTL_MS });
  },
};