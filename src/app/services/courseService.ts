import { Course } from '../data/types';
import { courses as staticCourses } from '../data/courses';

export const courseService = {
  // GET /courses
  async getAll(): Promise<Course[]> {
    return [...staticCourses];
  },

  // GET /courses?status=published
  async getPublished(): Promise<Course[]> {
    return staticCourses.filter((c) => c.status === 'published');
  },

  // GET /courses/:id
  async getById(id: string): Promise<Course | undefined> {
    return staticCourses.find((c) => c.id === id);
  },

  // GET /courses?group=:group
  async getForGroup(group: string): Promise<Course[]> {
    return staticCourses.filter(
      (c) => c.status === 'published' && (c.allowedGroups.length === 0 || c.allowedGroups.includes(group))
    );
  },
};