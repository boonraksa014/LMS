import { apiClient, IS_MOCK } from './apiClient';

const STORAGE_KEY = 'lms_enrollments_v1';

export interface ManualEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledBy: string;
  enrolledAt: string;
}

function load(): ManualEnrollment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ManualEnrollment[]) : [];
  } catch {
    return [];
  }
}

function save(records: ManualEnrollment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const enrollmentService = {
  async getAll(): Promise<ManualEnrollment[]> {
    if (!IS_MOCK) {
      const data = await apiClient.get<ManualEnrollment[]>('/enrollments');
      save(data);
      return data;
    }
    return load();
  },

  async getForUser(userId: string): Promise<ManualEnrollment[]> {
    if (!IS_MOCK) return apiClient.get<ManualEnrollment[]>(`/enrollments?userId=${userId}`);
    return load().filter((e) => e.userId === userId);
  },

  async getForCourse(courseId: string): Promise<ManualEnrollment[]> {
    if (!IS_MOCK) return apiClient.get<ManualEnrollment[]>(`/enrollments?courseId=${courseId}`);
    return load().filter((e) => e.courseId === courseId);
  },

  async enroll(courseId: string, userId: string, enrolledBy: string): Promise<ManualEnrollment> {
    const existing = load().find((e) => e.courseId === courseId && e.userId === userId);
    if (existing) return existing;

    if (!IS_MOCK) {
      return apiClient.post<ManualEnrollment>('/enrollments', { courseId, userId, enrolledBy });
    }
    const record: ManualEnrollment = {
      id: `enroll-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      courseId,
      userId,
      enrolledBy,
      enrolledAt: new Date().toISOString(),
    };
    const all = load();
    all.push(record);
    save(all);
    return record;
  },

  async unenroll(courseId: string, userId: string): Promise<void> {
    if (!IS_MOCK) {
      await apiClient.delete(`/enrollments/${courseId}/${userId}`);
      return;
    }
    save(load().filter((e) => !(e.courseId === courseId && e.userId === userId)));
  },

  isEnrolled(courseId: string, userId: string, enrollments: ManualEnrollment[]): boolean {
    return enrollments.some((e) => e.courseId === courseId && e.userId === userId);
  },
};