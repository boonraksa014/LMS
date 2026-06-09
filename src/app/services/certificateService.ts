import { Certificate } from '../data/types';
import { apiClient, IS_MOCK } from './apiClient';

const STORAGE_KEY = 'lms_certs_v1';

function load(): Certificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Certificate[]) : [];
  } catch {
    return [];
  }
}

function save(certs: Certificate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}

export const certificateService = {
  async getAll(): Promise<Certificate[]> {
    if (!IS_MOCK) {
      const data = await apiClient.get<Certificate[]>('/certificates');
      save(data);
      return data;
    }
    return load();
  },

  async getForUser(userId: string): Promise<Certificate[]> {
    if (!IS_MOCK) return apiClient.get<Certificate[]>(`/certificates?userId=${userId}`);
    return load().filter((c) => c.userId === userId);
  },

  async getById(id: string): Promise<Certificate | undefined> {
    if (!IS_MOCK) return apiClient.get<Certificate>(`/certificates/${id}`);
    return load().find((c) => c.id === id);
  },

  async create(cert: Omit<Certificate, 'id'>): Promise<Certificate> {
    if (!IS_MOCK) return apiClient.post<Certificate>('/certificates', cert);
    const all = load();
    const newCert: Certificate = { ...cert, id: `cert-${Date.now()}` };
    all.push(newCert);
    save(all);
    return newCert;
  },

  async delete(id: string): Promise<boolean> {
    if (!IS_MOCK) {
      await apiClient.delete(`/certificates/${id}`);
      return true;
    }
    const all = load();
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;
    save(filtered);
    return true;
  },

  async replaceAll(certs: Certificate[]): Promise<void> {
    save(certs);
  },
};