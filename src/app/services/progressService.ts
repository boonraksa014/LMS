import { CourseProgress } from '../data/types';
import { apiClient, IS_MOCK } from './apiClient';

const STORAGE_KEY = 'lms_progress_v2';

function load(): CourseProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CourseProgress[]) : [];
  } catch {
    return [];
  }
}

function save(records: CourseProgress[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const progressService = {
  async getAll(): Promise<CourseProgress[]> {
    if (!IS_MOCK) {
      const data = await apiClient.get<CourseProgress[]>('/progress');
      save(data);
      return data;
    }
    return load();
  },

  async getForUser(userId: string): Promise<CourseProgress[]> {
    if (!IS_MOCK) {
      const data = await apiClient.get<CourseProgress[]>(`/progress?userId=${userId}`);
      return data;
    }
    return load().filter((p) => p.userId === userId);
  },

  async get(courseId: string, userId: string): Promise<CourseProgress | undefined> {
    if (!IS_MOCK) return apiClient.get<CourseProgress>(`/progress/${courseId}/${userId}`);
    return load().find((p) => p.courseId === courseId && p.userId === userId);
  },

  async upsert(record: CourseProgress): Promise<CourseProgress> {
    if (!IS_MOCK) return apiClient.put<CourseProgress>(`/progress/${record.courseId}/${record.userId}`, record);
    const all = load();
    const idx = all.findIndex((p) => p.courseId === record.courseId && p.userId === record.userId);
    if (idx >= 0) {
      all[idx] = record;
    } else {
      all.push(record);
    }
    save(all);
    return record;
  },

  async replaceAll(records: CourseProgress[]): Promise<void> {
    save(records);
  },
};