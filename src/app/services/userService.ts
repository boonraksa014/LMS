import { User, UserRole } from '../data/types';
import { mockUsers } from '../data/users';
import { apiClient, IS_MOCK } from './apiClient';

export const USER_STORAGE_KEY = 'lms_users_v1';

export function getMockUsersSync(): User[] {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as User[];
  } catch { /* ignore */ }
  return [...mockUsers];
}

function saveMockUsers(users: User[]): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  async getAll(extraUsers: User[] = []): Promise<User[]> {
    if (!IS_MOCK) return apiClient.get<User[]>('/users');
    const base = getMockUsersSync();
    if (extraUsers.length === 0) return base;
    const ids = new Set(base.map((u) => u.id));
    return [...base, ...extraUsers.filter((u) => !ids.has(u.id))];
  },

  async getById(id: string, extraUsers: User[] = []): Promise<User | undefined> {
    if (!IS_MOCK) return apiClient.get<User>(`/users/${id}`);
    const base = getMockUsersSync();
    return base.find((u) => u.id === id) ?? extraUsers.find((u) => u.id === id);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    if (!IS_MOCK) return apiClient.post<User>('/users', data);
    const users = getMockUsersSync();
    const user: User = { ...data, id: `user_${Date.now()}` };
    saveMockUsers([...users, user]);
    return user;
  },

  async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    if (!IS_MOCK) return apiClient.put<User>(`/users/${id}`, data);
    const users = getMockUsersSync();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    saveMockUsers(users);
    return users[idx];
  },

  async delete(id: string): Promise<boolean> {
    if (!IS_MOCK) { await apiClient.delete(`/users/${id}`); return true; }
    const users = getMockUsersSync();
    const newUsers = users.filter((u) => u.id !== id);
    if (newUsers.length === users.length) return false;
    saveMockUsers(newUsers);
    return true;
  },

  async getByRole(role: UserRole, extraUsers: User[] = []): Promise<User[]> {
    if (!IS_MOCK) return apiClient.get<User[]>(`/users?role=${role}`);
    const all = await userService.getAll(extraUsers);
    return all.filter((u) => u.role === role);
  },
};