import { Certificate } from '../data/types';

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
  // GET /certificates
  async getAll(): Promise<Certificate[]> {
    return load();
  },

  // GET /certificates?userId=:userId
  async getForUser(userId: string): Promise<Certificate[]> {
    return load().filter((c) => c.userId === userId);
  },

  // GET /certificates/:id
  async getById(id: string): Promise<Certificate | undefined> {
    return load().find((c) => c.id === id);
  },

  // POST /certificates
  async create(cert: Omit<Certificate, 'id'>): Promise<Certificate> {
    const all = load();
    const newCert: Certificate = { ...cert, id: `cert-${Date.now()}` };
    all.push(newCert);
    save(all);
    return newCert;
  },

  // DELETE /certificates/:id
  async delete(id: string): Promise<boolean> {
    const all = load();
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;
    save(filtered);
    return true;
  },

  // Batch replace (migration helper)
  async replaceAll(certs: Certificate[]): Promise<void> {
    save(certs);
  },
};