import { Certificate, Course, CourseProgress, EnrollStatus, Quiz, User } from '../data/types';

export function sampleQuiz(quiz: Quiz): Quiz {
  const count = quiz.questionCount && quiz.questionCount > 0
    ? Math.min(quiz.questionCount, quiz.questions.length)
    : quiz.questions.length;
  const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
  return { ...quiz, questions: shuffled.slice(0, count) };
}

export function generateCertificate(course: Course, user: User, score: number): Certificate {
  const now = new Date();
  const expires = new Date(now);
  expires.setFullYear(expires.getFullYear() + 1);
  const seq = String(Date.now()).slice(-5);
  const certNo = `CERT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${seq}-${user.employeeId}`;
  return {
    id: `cert-${course.id}-${user.id}`,
    certificateNo: certNo,
    userId: user.id,
    userName: user.fullnameThai,
    courseId: course.id,
    courseTitle: course.title,
    category: course.category,
    issuedAt: now.toISOString(),
    score,
    expiresAt: expires.toISOString(),
  };
}

export function hasCertificate(courseId: string, userId: string, certs: Certificate[]): boolean {
  return certs.some((c) => c.courseId === courseId && c.userId === userId);
}

export function getCertificate(courseId: string, userId: string, certs: Certificate[]): Certificate | undefined {
  return certs.find((c) => c.courseId === courseId && c.userId === userId);
}

export function getCourseProgress(courseId: string, userId: string, allProgress: CourseProgress[]): CourseProgress | undefined {
  return allProgress.find((p) => p.courseId === courseId && p.userId === userId);
}

export function isLessonCompleted(courseId: string, userId: string, lessonId: string, allProgress: CourseProgress[]): boolean {
  const progress = getCourseProgress(courseId, userId, allProgress);
  if (!progress) return false;
  return progress.lessonProgress.some((lp) => lp.lessonId === lessonId && lp.completed);
}

export function isLessonLocked(course: Course, moduleIndex: number, lessonIndex: number, userId: string, allProgress: CourseProgress[]): boolean {
  if (moduleIndex === 0 && lessonIndex === 0) return false;
  if (lessonIndex > 0) {
    const prevLessonId = course.modules[moduleIndex].lessons[lessonIndex - 1].id;
    return !isLessonCompleted(course.id, userId, prevLessonId, allProgress);
  }
  // First lesson of non-first module: check last lesson of previous module
  const prevModule = course.modules[moduleIndex - 1];
  const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
  return !isLessonCompleted(course.id, userId, lastLesson.id, allProgress);
}

export function getTotalLessons(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function getCompletedLessons(course: Course, userId: string, allProgress: CourseProgress[]): number {
  const progress = getCourseProgress(course.id, userId, allProgress);
  if (!progress) return 0;
  const completedIds = new Set(progress.lessonProgress.filter((lp) => lp.completed).map((lp) => lp.lessonId));
  return course.modules.reduce((sum, m) => sum + m.lessons.filter((l) => completedIds.has(l.id)).length, 0);
}

export function getCourseProgressPercent(course: Course, userId: string, allProgress: CourseProgress[]): number {
  const total = getTotalLessons(course);
  if (total === 0) return 0;
  const completed = getCompletedLessons(course, userId, allProgress);
  return Math.round((completed / total) * 100);
}

export function areAllLessonsCompleted(course: Course, userId: string, allProgress: CourseProgress[]): boolean {
  const total = getTotalLessons(course);
  return getCompletedLessons(course, userId, allProgress) === total;
}

export function getBestFinalExamScore(courseId: string, userId: string, allProgress: CourseProgress[]): number | null {
  const progress = getCourseProgress(courseId, userId, allProgress);
  if (!progress || progress.finalExamAttempts.length === 0) return null;
  return Math.max(...progress.finalExamAttempts.map((a) => a.score));
}

export function getBestQuizScore(courseId: string, quizId: string, userId: string, allProgress: CourseProgress[]): number | null {
  const progress = getCourseProgress(courseId, userId, allProgress);
  if (!progress) return null;
  const attempts = progress.quizAttempts.filter((a) => a.quizId === quizId);
  if (attempts.length === 0) return null;
  return Math.max(...attempts.map((a) => a.score));
}

export function getQuizAttemptCount(courseId: string, quizId: string, userId: string, allProgress: CourseProgress[]): number {
  const progress = getCourseProgress(courseId, userId, allProgress);
  if (!progress) return 0;
  return progress.quizAttempts.filter((a) => a.quizId === quizId).length;
}

export function getFinalExamAttemptCount(courseId: string, userId: string, allProgress: CourseProgress[]): number {
  const progress = getCourseProgress(courseId, userId, allProgress);
  if (!progress) return 0;
  return progress.finalExamAttempts.length;
}

export function hasFinalExamPassed(courseId: string, userId: string, allProgress: CourseProgress[]): boolean {
  const progress = getCourseProgress(courseId, userId, allProgress);
  if (!progress) return false;
  return progress.finalExamAttempts.some((a) => a.passed);
}

export function getPreTestAttemptCount(courseId: string, userId: string, allProgress: CourseProgress[]): number {
  return getCourseProgress(courseId, userId, allProgress)?.preTestAttempts?.length ?? 0;
}

export function getBestPreTestScore(courseId: string, userId: string, allProgress: CourseProgress[]): number | null {
  const attempts = getCourseProgress(courseId, userId, allProgress)?.preTestAttempts;
  if (!attempts || attempts.length === 0) return null;
  return Math.max(...attempts.map((a) => a.score));
}

export function getCourseEnrollStatus(course: Course, userId: string, allProgress: CourseProgress[]): EnrollStatus {
  const progress = getCourseProgress(course.id, userId, allProgress);
  if (!progress || getCompletedLessons(course, userId, allProgress) === 0) return 'not_started';

  const allDone = areAllLessonsCompleted(course, userId, allProgress);

  if (!allDone) return 'in_progress';

  if (!course.finalExam) return 'completed';

  if (hasFinalExamPassed(course.id, userId, allProgress)) return 'passed';

  if (getFinalExamAttemptCount(course.id, userId, allProgress) > 0) return 'failed';

  return 'completed'; // all lessons done, exam not yet taken
}
