import { useState, useEffect } from 'react';
import { ManualEnrollment, enrollmentService } from '../services/enrollmentService';

const STORAGE_KEY = 'lms_enrollments_v1';

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<ManualEnrollment[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Sync when another tab/component writes to localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setEnrollments(e.newValue ? JSON.parse(e.newValue) : []);
      } catch {
        setEnrollments([]);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const refresh = async () => {
    const data = await enrollmentService.getAll();
    setEnrollments(data);
  };

  return { enrollments, setEnrollments, refresh };
}