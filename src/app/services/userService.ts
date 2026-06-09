import { User, UserRole } from '../data/types';
import { mockUsers } from '../data/users';

// In-memory store for users added at runtime (registered users, etc.)
let runtimeUsers: User[] = [];

export const userService = {
  // GET /users
  async getAll(extraUsers: User[] = []): Promise<User[]> {
    return [...mockUsers, ...runtimeUsers, ...extraUsers];
  },

  // GET /users/:id
  async getById(id: string, extraUsers: User[] = []): Promise<User | undefined> {
    const all = [...mockUsers, ...runtimeUsers, ...extraUsers];
    return all.find((u) => u.id === id);
  },

  // POST /users
  async create(data: Omit<User, 'id'>): Promise<User> {
    const user: User = { ...data, id: `user-${Date.now()}` };
    runtimeUsers.push(user);
    return user;
  },

  // PUT /users/:id
  async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    const idx = runtimeUsers.findIndex((u) => u.id === id);
    if (idx >= 0) {
      runtimeUsers[idx] = { ...runtimeUsers[idx], ...data };
      return runtimeUsers[idx];
    }
    // mockUsers are read-only in the mock layer; backend will handle real updates
    const base = mockUsers.find((u) => u.id === id);
    if (!base) return null;
    const patched = { ...base, ...data };
    runtimeUsers.push(patched);
    return patched;
  },

  // DELETE /users/:id
  async delete(id: string): Promise<boolean> {
    const before = runtimeUsers.length;
    runtimeUsers = runtimeUsers.filter((u) => u.id !== id);
    return runtimeUsers.length < before;
  },

  // GET /users?role=:role
  async getByRole(role: UserRole, extraUsers: User[] = []): Promise<User[]> {
    const all = await userService.getAll(extraUsers);
    return all.filter((u) => u.role === role);
  },

  // Utility: merge runtime users with a snapshot (used in App to keep state in sync)
  getRuntimeUsers(): User[] {
    return [...runtimeUsers];
  },

  replaceRuntimeUsers(users: User[]): void {
    runtimeUsers = [...users];
  },
};
