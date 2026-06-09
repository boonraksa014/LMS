import { Course } from '../data/types';
import { courses as staticCourses } from '../data/courses';
import { apiClient, IS_MOCK } from './apiClient';

const COURSE_STORAGE_KEY = 'lms_courses_v1';

function getMockCourses(): Course[] {
  try {
    const stored = localStorage.getItem(COURSE_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Course[];
  } catch { /* ignore */ }
  return [...staticCourses];
}

function saveMockCourses(courses: Course[]): void {
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
  window.dispatchEvent(new CustomEvent('lms-courses-updated'));
}

export const courseService = {
  async getAll(): Promise<Course[]> {
    if (!IS_MOCK) return apiClient.get<Course[]>('/courses');
    return getMockCourses();
  },

  async getPublished(): Promise<Course[]> {
    if (!IS_MOCK) return apiClient.get<Course[]>('/courses?status=published');
    return getMockCourses().filter((c) => c.status === 'published');
  },

  async getById(id: string): Promise<Course | undefined> {
    if (!IS_MOCK) return apiClient.get<Course>(`/courses/${id}`);
    return getMockCourses().find((c) => c.id === id);
  },

  async getForGroup(group: string): Promise<Course[]> {
    if (!IS_MOCK) return apiClient.get<Course[]>(`/courses?group=${encodeURIComponent(group)}`);
    return getMockCourses().filter(
      (c) => c.status === 'published' && (c.allowedGroups.length === 0 || c.allowedGroups.includes(group))
    );
  },

  async saveAll(courses: Course[]): Promise<void> {
    if (!IS_MOCK) return;
    saveMockCourses(courses);
  },

  async create(data: Omit<Course, 'id'>): Promise<Course> {
    if (!IS_MOCK) return apiClient.post<Course>('/courses', data);
    const courses = getMockCourses();
    const newCourse: Course = { ...data, id: `course_${Date.now()}` };
    saveMockCourses([...courses, newCourse]);
    return newCourse;
  },

  async update(id: string, data: Partial<Course>): Promise<Course | undefined> {
    if (!IS_MOCK) return apiClient.patch<Course>(`/courses/${id}`, data);
    const courses = getMockCourses();
    const idx = courses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    courses[idx] = { ...courses[idx], ...data };
    saveMockCourses(courses);
    return courses[idx];
  },

  async deleteCourse(id: string): Promise<void> {
    if (!IS_MOCK) { await apiClient.delete(`/courses/${id}`); return; }
    saveMockCourses(getMockCourses().filter((c) => c.id !== id));
  },
};