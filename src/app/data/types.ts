export type UserRole = 'super_admin' | 'training_admin' | 'manager' | 'learner';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollStatus = 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';

export interface User {
  id: string;
  fullnameThai: string;
  fullnameEng?: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  employeeId: string;
  isActive: boolean;
  phone?: string;
  registrantType?: number; // 1=พนักงานบริษัท 2=บุคคลภายนอก 3=ผู้ตรวจสอบ
  shopId?: number;
  positionText?: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface InVideoQuestion {
  id: string;
  atSecond: number;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
  correctIndex: number;
  mustCorrect: boolean;
}

export interface InVideoAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  answeredAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  questionCount?: number; // how many to draw per attempt; undefined = all
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'text' | 'video' | 'pdf' | 'link';
  content: string;
  videoUrl?: string;
  externalUrl?: string;
  quiz?: Quiz;
  inVideoQuestions?: InVideoQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  category: string;
  status: CourseStatus;
  allowedGroups: string[];
  modules: Module[];
  preTest?: Quiz;
  finalExam?: Quiz;
  createdAt: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  inVideoAnswers?: InVideoAnswer[];
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
  answers: number[];
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  enrolledAt: string;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  preTestAttempts?: QuizAttempt[];
  finalExamAttempts: QuizAttempt[];
  completedAt?: string;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  category: string;
  issuedAt: string;
  score: number;
  expiresAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  bgType: 'white' | 'solid' | 'gradient';
  bgColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  borderStyle: 'none' | 'single' | 'double' | 'ornate';
  borderColor: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  orgName: string;
  orgSubtitle: string;
  certTitle: string;
  certSubtitle: string;
  recipientPrefix: string;
  coursePrefix: string;
  showScore: boolean;
  scorePrefix: string;
  signerName: string;
  signerTitle: string;
  showDate: boolean;
  showCertNo: boolean;
  footerNote: string;
  assignedCourseIds: string[];
}

export type NotificationType = 'cert_earned' | 'quiz_passed' | 'quiz_failed' | 'course_assigned' | 'reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
  courseId?: string;
}
