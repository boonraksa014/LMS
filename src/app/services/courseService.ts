import { Course } from '../data/types';
import { courses as staticCourses } from '../data/courses';
import { apiClient, IS_MOCK } from './apiClient';

export const courseService = {
  async getAll(): Promise<Course[]> {
    if (!IS_MOCK) return apiClient.get<Course[]>('/courses');
    return [...staticCourses];
  },

  async getPublished(): Promise<Course[]> {
    if (!IS_MOCK) return apiClient.get<Course[]>('/courses?status=published');
    return staticCourses.filter((c) => c.status === 'published');
  },

  async getById(id: string): Promise<Course | undefined> {
    if (!IS_MOCK) return apiClient.get<Course>(`/courses/${id}`);
    return staticCourses.find((c) => c.id === id);
  },

  async getForGroup(group: string): Promise<Course[]> {
    if (!IS_MOCK) return apiClient.get<Course[]>(`/courses?group=${encodeURIComponent(group)}`);
    return staticCourses.filter(
      (c) => c.status === 'published' && (c.allowedGroups.length === 0 || c.allowedGroups.includes(group))
    );
  },
};