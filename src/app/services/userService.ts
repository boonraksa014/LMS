import { User, UserRole } from '../data/types';
import { mockUsers } from '../data/users';
import { apiClient, IS_MOCK } from './apiClient';

let runtimeUsers: User[] = [];

export const userService = {
  async getAll(extraUsers: User[] = []): Promise<User[]> {
    if (!IS_MOCK) return apiClient.get<User[]>('/users');
    return [...mockUsers, ...runtimeUsers, ...extraUsers];
  },

  async getById(id: string, extraUsers: User[] = []): Promise<User | undefined> {
    if (!IS_MOCK) return apiClient.get<User>(`/users/${id}`);
    return [...mockUsers, ...runtimeUsers, ...extraUsers].find((u) => u.id === id);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    if (!IS_MOCK) return apiClient.post<User>('/users', data);
    const user: User = { ...data, id: `user-${Date.now()}` };
    runtimeUsers.push(user);
    return user;
  },

  async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    if (!IS_MOCK) return apiClient.put<User>(`/users/${id}`, data);
    const idx = runtimeUsers.findIndex((u) => u.id === id);
    if (idx >= 0) {
      runtimeUsers[idx] = { ...runtimeUsers[idx], ...data };
      return runtimeUsers[idx];
    }
    const base = mockUsers.find((u) => u.id === id);
    if (!base) return null;
    const patched = { ...base, ...data };
    runtimeUsers.push(patched);
    return patched;
  },

  async delete(id: string): Promise<boolean> {
    if (!IS_MOCK) {
      await apiClient.delete(`/users/${id}`);
      return true;
    }
    const before = runtimeUsers.length;
    runtimeUsers = runtimeUsers.filter((u) => u.id !== id);
    return runtimeUsers.length < before;
  },

  async getByRole(role: UserRole, extraUsers: User[] = []): Promise<User[]> {
    if (!IS_MOCK) return apiClient.get<User[]>(`/users?role=${role}`);
    const all = await userService.getAll(extraUsers);
    return all.filter((u) => u.role === role);
  },

  getRuntimeUsers(): User[] {
    return [...runtimeUsers];
  },

  replaceRuntimeUsers(users: User[]): void {
    runtimeUsers = [...users];
  },
};