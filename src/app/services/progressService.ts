import { CourseProgress } from '../data/types';

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
  // GET /progress
  async getAll(): Promise<CourseProgress[]> {
    return load();
  },

  // GET /progress?userId=:userId
  async getForUser(userId: string): Promise<CourseProgress[]> {
    return load().filter((p) => p.userId === userId);
  },

  // GET /progress/:courseId/:userId
  async get(courseId: string, userId: string): Promise<CourseProgress | undefined> {
    return load().find((p) => p.courseId === courseId && p.userId === userId);
  },

  // POST /progress  (create or replace)
  async upsert(record: CourseProgress): Promise<CourseProgress> {
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

  // Batch replace (used when migrating from App-state localStorage snapshot)
  async replaceAll(records: CourseProgress[]): Promise<void> {
    save(records);
  },
};