import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Container,
} from '@mui/material';
import { ThemeWrapper } from './components/ThemeWrapper';
import { Toaster, toast } from 'sonner';
import {
  Menu as MenuIcon,
  Home,
  BookOpen,
  BarChart3,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  Layers,
  AlertTriangle,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { LearnerDashboard } from './components/LearnerDashboard';
import { CourseCatalog } from './components/CourseCatalog';
import { CoursePage } from './components/CoursePage';
import { LessonPlayer } from './components/LessonPlayer';
import { QuizPage } from './components/QuizPage';
import { AdminPanel } from './components/AdminPanel';
import { ManagerDashboard } from './components/ManagerDashboard';
import { CertificatePage } from './components/CertificatePage';
import { NotificationCenter } from './components/NotificationCenter';
import { CertificateTemplateManager } from './components/CertificateTemplateManager';
import { courses } from './data/courses';
import { defaultCertTemplates } from './data/certTemplates';
import { User, CourseProgress, QuizAttempt, Certificate, AppNotification, InVideoAnswer, CertificateTemplate } from './data/types';
import { generateCertificate, hasCertificate, getCertificate, sampleQuiz } from './utils/helpers';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AccessDenied } from './components/AccessDenied';

type ViewType = 'dashboard' | 'catalog' | 'course' | 'lesson' | 'quiz' | 'admin' | 'manager' | 'certificate' | 'register' | 'cert-templates';

interface QuizContext {
  courseId: string;
  moduleId: string;
  lessonId: string;
  quizId: string;
  isFinalExam: boolean;
  isPreTest: boolean;
}

const PROGRESS_KEY = 'lms_progress_v2';
const CERT_KEY = 'lms_certs_v1';
const NOTIF_KEY = 'lms_notifs_v1';
const CERT_TMPL_KEY = 'lms_cert_templates_v1';
const SIDEBAR_WIDTH = 272;

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  manager: 'Manager',
  learner: 'ผู้เรียน',
};

const roleGradient: Record<string, string> = {
  super_admin: 'linear-gradient(135deg,#7B2FF7,#F107A3)',
  training_admin: 'linear-gradient(135deg,#1E7A34,#155724)',
  manager: 'linear-gradient(135deg,#F59E0B,#D97706)',
  learner: 'linear-gradient(135deg,#10B981,#059669)',
};

function makeNotif(type: AppNotification['type'], title: string, message: string, userId: string, courseId?: string): AppNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    userId,
    courseId,
  };
}

export default function App() {
  const { currentUser, loginDirect, logout: authLogout } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [allProgress, setAllProgress] = useState<CourseProgress[]>(() => loadJSON(PROGRESS_KEY, []));
  const [certificates, setCertificates] = useState<Certificate[]>(() => loadJSON(CERT_KEY, []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadJSON(NOTIF_KEY, []));
  const [certTemplates, setCertTemplates] = useState<CertificateTemplate[]>(() => loadJSON(CERT_TMPL_KEY, defaultCertTemplates));
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [quizContext, setQuizContext] = useState<QuizContext | null>(null);
  const [sampledQuiz, setSampledQuiz] = useState<ReturnType<typeof sampleQuiz> | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [adminDefaultTab, setAdminDefaultTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => { saveJSON(PROGRESS_KEY, allProgress); }, [allProgress]);
  useEffect(() => { saveJSON(CERT_KEY, certificates); }, [certificates]);
  useEffect(() => { saveJSON(NOTIF_KEY, notifications); }, [notifications]);
  useEffect(() => { saveJSON(CERT_TMPL_KEY, certTemplates); }, [certTemplates]);

  const updateProgress = (updater: (prev: CourseProgress[]) => CourseProgress[]) => {
    setAllProgress((prev) => {
      const updated = updater(prev);
      saveJSON(PROGRESS_KEY, updated);
      return updated;
    });
  };

  const addNotification = (notif: AppNotification) => {
    setNotifications((prev) => {
      const updated = [notif, ...prev].slice(0, 50);
      saveJSON(NOTIF_KEY, updated);
      return updated;
    });
  };

  const ensureCourseProgress = (courseId: string, userId: string) => {
    const existing = allProgress.find((p) => p.courseId === courseId && p.userId === userId);
    if (existing) return;
    updateProgress((prev) => [...prev, {
      courseId,
      userId,
      enrolledAt: new Date().toISOString(),
      lessonProgress: [],
      quizAttempts: [],
      finalExamAttempts: [],
    }]);
  };

  const handleLogin = (user: User) => {
    loginDirect(user);
    if (user.role === 'super_admin' || user.role === 'training_admin') setView('admin');
    else if (user.role === 'manager') setView('manager');
    else setView('dashboard');
  };

  const handleShowRegister = () => setView('register');

  const handleRegister = (user: User) => {
    setRegisteredUsers((prev) => [...prev, user]);
    loginDirect(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    authLogout();
    setView('dashboard');
    setSelectedCourseId(null);
    setUserMenuAnchor(null);
    setSelectedCertificate(null);
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setView('course');
  };

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    if (!selectedCourseId || !currentUser) return;
    ensureCourseProgress(selectedCourseId, currentUser.id);
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
    setView('lesson');
  };

  const handleMarkComplete = (_moduleId: string, lessonId: string) => {
    if (!selectedCourseId || !currentUser) return;
    updateProgress((prev) => {
      const idx = prev.findIndex((p) => p.courseId === selectedCourseId && p.userId === currentUser.id);
      if (idx === -1) {
        return [...prev, {
          courseId: selectedCourseId,
          userId: currentUser.id,
          enrolledAt: new Date().toISOString(),
          lessonProgress: [{ lessonId, completed: true, completedAt: new Date().toISOString() }],
          quizAttempts: [],
          finalExamAttempts: [],
        }];
      }
      const updated = [...prev];
      const cp = { ...updated[idx] };
      const existingLP = cp.lessonProgress.find((lp) => lp.lessonId === lessonId);
      if (!existingLP) {
        cp.lessonProgress = [...cp.lessonProgress, { lessonId, completed: true, completedAt: new Date().toISOString() }];
      } else {
        cp.lessonProgress = cp.lessonProgress.map((lp) =>
          lp.lessonId === lessonId ? { ...lp, completed: true, completedAt: new Date().toISOString() } : lp
        );
      }
      updated[idx] = cp;
      return updated;
    });
    setView('course');
  };

  const handleStartQuiz = (moduleId: string, lessonId: string, quizId: string) => {
    if (!selectedCourseId) return;
    setQuizContext({ courseId: selectedCourseId, moduleId, lessonId, quizId, isFinalExam: false, isPreTest: false });
    setSampledQuiz(null);
    setView('quiz');
  };

  const handleStartPreTest = () => {
    if (!selectedCourseId) return;
    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course?.preTest) return;
    ensureCourseProgress(selectedCourseId, currentUser!.id);
    const sampled = sampleQuiz(course.preTest);
    setSampledQuiz(sampled);
    setQuizContext({ courseId: selectedCourseId, moduleId: '', lessonId: '', quizId: course.preTest.id, isFinalExam: false, isPreTest: true });
    setView('quiz');
  };

  const handleStartFinalExam = () => {
    if (!selectedCourseId) return;
    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course?.finalExam) return;
    const sampled = sampleQuiz(course.finalExam);
    setSampledQuiz(sampled);
    setQuizContext({ courseId: selectedCourseId, moduleId: '', lessonId: '', quizId: course.finalExam.id, isFinalExam: true, isPreTest: false });
    setView('quiz');
  };

  const handleQuizSubmit = (attempt: Omit<QuizAttempt, 'attemptedAt'>) => {
    if (!currentUser || !quizContext) return;
    const fullAttempt: QuizAttempt = { ...attempt, attemptedAt: new Date().toISOString() };

    updateProgress((prev) => {
      const idx = prev.findIndex((p) => p.courseId === quizContext.courseId && p.userId === currentUser.id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const cp = { ...updated[idx] };

      if (quizContext.isPreTest) {
        cp.preTestAttempts = [...(cp.preTestAttempts ?? []), fullAttempt];
      } else if (quizContext.isFinalExam) {
        cp.finalExamAttempts = [...cp.finalExamAttempts, fullAttempt];
      } else {
        const existingLP = cp.lessonProgress.find((lp) => lp.lessonId === quizContext.lessonId);
        if (!existingLP) {
          cp.lessonProgress = [...cp.lessonProgress, { lessonId: quizContext.lessonId, completed: true, completedAt: new Date().toISOString() }];
        } else {
          cp.lessonProgress = cp.lessonProgress.map((lp) =>
            lp.lessonId === quizContext.lessonId ? { ...lp, completed: true } : lp
          );
        }
        cp.quizAttempts = [...cp.quizAttempts, fullAttempt];
      }
      updated[idx] = cp;
      return updated;
    });

    // Post-submit side effects
    const course = courses.find((c) => c.id === quizContext.courseId);
    if (!course) return;

    if (quizContext.isPreTest) {
      toast.success(`📋 ทำแบบทดสอบก่อนเรียนเสร็จแล้ว คะแนน ${attempt.score}%`, { duration: 4000 });
      addNotification(makeNotif('quiz_passed', '📋 ทำแบบทดสอบก่อนเรียนแล้ว', `คะแนน ${attempt.score}% — ${course.title}`, currentUser.id, quizContext.courseId));
    } else if (quizContext.isFinalExam) {
      if (attempt.passed) {
        // Issue certificate (if not already issued)
        if (!hasCertificate(quizContext.courseId, currentUser.id, certificates)) {
          const cert = generateCertificate(course, currentUser, attempt.score);
          setCertificates((prev) => {
            const updated = [...prev, cert];
            saveJSON(CERT_KEY, updated);
            return updated;
          });
          addNotification(makeNotif('cert_earned', '🏆 ได้รับใบประกาศนียบัตร!', `คุณผ่านการทดสอบ "${course.title}" และได้รับใบประกาศแล้ว`, currentUser.id, quizContext.courseId));
          toast.success(`🏆 ได้รับใบประกาศ! คะแนน ${attempt.score}%`, { duration: 5000 });
        } else {
          addNotification(makeNotif('quiz_passed', '✅ สอบผ่าน Final Exam', `คะแนน ${attempt.score}% — ${course.title}`, currentUser.id, quizContext.courseId));
          toast.success(`✅ สอบผ่าน! คะแนน ${attempt.score}%`, { duration: 4000 });
        }
      } else {
        addNotification(makeNotif('quiz_failed', '❌ ยังไม่ผ่านเกณฑ์', `คะแนน ${attempt.score}% (ต้องได้ ${course.finalExam?.passingScore ?? 80}%) — ${course.title}`, currentUser.id, quizContext.courseId));
        toast.error(`❌ คะแนน ${attempt.score}% — ยังไม่ผ่านเกณฑ์`, { duration: 4000 });
      }
    } else {
      if (attempt.passed) {
        toast.success(`✅ Quiz ผ่าน! คะแนน ${attempt.score}%`, { duration: 3000 });
      } else {
        toast.error(`Quiz คะแนน ${attempt.score}% — ยังไม่ผ่าน`, { duration: 3000 });
      }
    }
  };

  const handleQuizContinue = () => {
    setView('course');
    setQuizContext(null);
    setSampledQuiz(null);
  };

  const handleNavigateLesson = (moduleId: string, lessonId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setView('certificate');
  };

  const handleViewCertificateForCourse = (courseId: string) => {
    if (!currentUser) return;
    const cert = getCertificate(courseId, currentUser.id, certificates);
    if (cert) {
      setSelectedCertificate(cert);
      setView('certificate');
    }
  };

  const handleInVideoAnswer = (lessonId: string, answer: InVideoAnswer) => {
    if (!currentUser || !selectedCourseId) return;
    updateProgress((prev) => {
      const idx = prev.findIndex((p) => p.courseId === selectedCourseId && p.userId === currentUser.id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const cp = { ...updated[idx] };
      const lpIdx = cp.lessonProgress.findIndex((lp) => lp.lessonId === lessonId);
      if (lpIdx === -1) {
        cp.lessonProgress = [...cp.lessonProgress, { lessonId, completed: false, inVideoAnswers: [answer] }];
      } else {
        cp.lessonProgress = cp.lessonProgress.map((lp, i) =>
          i === lpIdx ? { ...lp, inVideoAnswers: [...(lp.inVideoAnswers ?? []), answer] } : lp
        );
      }
      updated[idx] = cp;
      return updated;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  if (!currentUser) {
    return (
      <div>
        <ThemeWrapper>
          <ErrorBoundary>
            <Toaster richColors position="top-right" />
            {view === 'register' ? (
              <RegisterPage onRegister={handleRegister} onBackToLogin={() => setView('dashboard')} />
            ) : (
              <LoginPage onLogin={handleLogin} onShowRegister={handleShowRegister} allUsers={registeredUsers} />
            )}
          </ErrorBoundary>
        </ThemeWrapper>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'training_admin';
  const isManager = currentUser.role === 'manager';

  const viewRequiredRole: Partial<Record<ViewType, string>> = {
    admin: 'super_admin / training_admin',
    'cert-templates': 'super_admin / training_admin',
    manager: 'manager',
  };
  const isDenied = (v: ViewType): boolean => {
    const req = viewRequiredRole[v];
    if (!req) return false;
    if (v === 'admin' || v === 'cert-templates') return !isAdmin;
    if (v === 'manager') return !isManager;
    return false;
  };

  // Navigate to admin panel at a specific tab
  const goAdmin = (tab: number) => {
    setView('admin');
    setAdminDefaultTab(tab);
    setMobileOpen(false);
  };

  const goView = (v: ViewType) => {
    setView(v);
    setMobileOpen(false);
  };

  const selectedCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) ?? null : null;

  let currentQuiz = null;
  let existingQuizAttempts: QuizAttempt[] = [];
  if (quizContext && currentUser) {
    const courseProgress = allProgress.find((p) => p.courseId === quizContext.courseId && p.userId === currentUser.id);
    if (quizContext.isPreTest) {
      currentQuiz = sampledQuiz;
      existingQuizAttempts = courseProgress?.preTestAttempts ?? [];
    } else if (quizContext.isFinalExam) {
      currentQuiz = sampledQuiz;
      existingQuizAttempts = courseProgress?.finalExamAttempts ?? [];
    } else {
      for (const course of courses) {
        for (const module of course.modules) {
          for (const lesson of module.lessons) {
            if (lesson.quiz?.id === quizContext.quizId) {
              currentQuiz = lesson.quiz;
              existingQuizAttempts = (courseProgress?.quizAttempts ?? []).filter((a) => a.quizId === quizContext.quizId);
            }
          }
        }
      }
    }
  }

  const userNotifications = notifications.filter((n) => n.userId === currentUser.id);

  // ── Sidebar nav item renderer ─────────────────────────────────────────────
  const SideNavItem = ({
    icon, label, description, isActive, onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    isActive: boolean;
    onClick: () => void;
    accent?: string;
  }) => (
    <ListItem disablePadding sx={{ mb: 0.25 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 1.5, py: 0.9, px: 1.25, gap: 1.25,
          bgcolor: isActive ? '#EBF9EE' : 'transparent',
          transition: 'all 0.12s',
          '&:hover': { bgcolor: isActive ? '#EBF9EE' : '#F5F6F7' },
        }}
      >
        {/* Icon container */}
        <Box sx={{
          width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: isActive ? '#1A5B2A' : '#F3F4F6',
          transition: 'all 0.12s',
          color: isActive ? '#FFFFFF' : '#6B7280',
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#1A5B2A' : '#374151', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF', mt: 0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {description}
            </Typography>
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );

  // ── Section header renderer ───────────────────────────────────────────────
  const SideSection = ({
    label, children,
  }: {
    icon?: React.ReactNode;
    label: string;
    color?: string;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', px: 2, mb: 0.5 }}>
        {label}
      </Typography>
      <List dense sx={{ px: 1, py: 0 }}>
        {children}
      </List>
    </Box>
  );

  const ViewError = ({ label, onBack }: { label: string; onBack: () => void }) => (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <AlertTriangle size={36} color="#CBD5E1" style={{ marginBottom: 16 }} aria-hidden="true" />
      <Typography sx={{ fontWeight: 600, color: '#0F172A', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.875rem', color: '#717182', mb: 3 }}>
        เนื้อหานี้ไม่พบหรืออาจถูกลบออกไปแล้ว
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={onBack}
        sx={{ borderColor: '#1E7A34', color: '#1E7A34', '&:hover': { borderColor: '#155225', backgroundColor: '#F0FDF4' } }}
      >
        กลับหน้าหลัก
      </Button>
    </Box>
  );

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', borderRight: '1px solid #EAECEF', overflow: 'hidden' }}>

      {/* ── Logo ── */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: '1px solid #F3F4F6' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.75, backgroundColor: '#1A5B2A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(26,91,42,0.3)',
            }}>
              <GraduationCap size={17} color="white" />
            </Box>
            <Box>
              <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>PK Learning</Typography>
              <Typography sx={{ color: '#B0B7C3', fontSize: '0.62rem' }}>Product Knowledge LMS</Typography>
            </Box>
          </Box>
          <NotificationCenter notifications={userNotifications} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllNotificationsRead} />
        </Box>


      </Box>

      {/* ── Nav sections ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 2 } }}>

        {isAdmin && (
          <SideSection label="ผู้ดูแลระบบ">
            <SideNavItem icon={<LayoutDashboard size={15} />} label="ภาพรวมระบบ" description="สถิติและตัวชี้วัด" isActive={view === 'admin' && adminDefaultTab === 0} onClick={() => goAdmin(0)} />
            <SideNavItem icon={<Users size={15} />} label="จัดการผู้ใช้งาน" description="เพิ่ม/แก้ไข/ระงับบัญชี" isActive={view === 'admin' && adminDefaultTab === 1} onClick={() => goAdmin(1)} />
            <SideNavItem icon={<BookOpen size={15} />} label="จัดการคอร์ส" description="เนื้อหา, สถานะ, กลุ่ม" isActive={view === 'admin' && adminDefaultTab === 2} onClick={() => goAdmin(2)} />
            <SideNavItem icon={<TrendingUp size={15} />} label="รายงานความก้าวหน้า" description="ติดตามผลการเรียนรู้" isActive={view === 'admin' && adminDefaultTab === 3} onClick={() => goAdmin(3)} />
            <SideNavItem icon={<Award size={15} />} label="ใบประกาศนียบัตร" description="ประวัติการออกใบประกาศ" isActive={view === 'admin' && adminDefaultTab === 4} onClick={() => goAdmin(4)} />
            <SideNavItem icon={<Layers size={15} />} label="จัดการกลุ่มผู้เรียน" description="เพิ่ม/แก้ไข/ลบกลุ่ม" isActive={view === 'admin' && adminDefaultTab === 5} onClick={() => goAdmin(5)} />
            <SideNavItem icon={<Tag size={15} />} label="จัดการหมวดหมู่" description="เพิ่ม/แก้ไข/ลบหมวดหมู่" isActive={view === 'admin' && adminDefaultTab === 6} onClick={() => goAdmin(6)} />
            <SideNavItem icon={<ShieldCheck size={15} />} label="จัดการบทบาทและสิทธิ์" description="กำหนดสิทธิ์การเข้าถึงเมนู" isActive={view === 'admin' && adminDefaultTab === 7} onClick={() => goAdmin(7)} />
            <SideNavItem icon={<Award size={15} />} label="เทมเพลตใบประกาศ" description="ออกแบบและจัดการรูปแบบ" isActive={view === 'cert-templates'} onClick={() => goView('cert-templates')} />
          </SideSection>
        )}

        {isManager && (
          <SideSection label="ผู้จัดการทีม">
            <SideNavItem icon={<BarChart3 size={15} />} label="รายงานทีม" description="ความก้าวหน้าของทีมงาน" isActive={view === 'manager'} onClick={() => goView('manager')} />
          </SideSection>
        )}

        {(isAdmin || isManager) && <Divider sx={{ borderColor: '#F3F4F6', mx: 2, my: 1.5 }} />}

        <SideSection label={isAdmin || isManager ? 'การเรียนรู้ส่วนตัว' : 'การเรียนรู้'}>
          <SideNavItem icon={<Home size={15} />} label="หน้าแรก" description="ภาพรวมการเรียนของฉัน" isActive={view === 'dashboard'} onClick={() => goView('dashboard')} />
          <SideNavItem icon={<BookOpen size={15} />} label="คอร์สทั้งหมด" description="เลือกเรียนตามที่สนใจ" isActive={view === 'catalog'} onClick={() => goView('catalog')} />
        </SideSection>
      </Box>

    </Box>
  );

  return (
    <div>
      <ThemeWrapper>
        <Toaster richColors position="top-right" />
        <ErrorBoundary>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F8FA' }}>
          {/* Permanent Sidebar — desktop */}
          {!isMobile && (
            <Box component="nav" sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1200 }}>
              {sidebarContent}
            </Box>
          )}

          {/* Mobile Drawer */}
          <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' } }}>
            {sidebarContent}
          </Drawer>

          {/* Main area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` }, minWidth: 0 }}>
            {/* Mobile AppBar */}
            {isMobile && (
              <AppBar position="sticky" elevation={0} sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                <Toolbar sx={{ gap: 1 }}>
                  <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: '#374151' }}>
                    <MenuIcon size={20} />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: 1.5, backgroundColor: '#1A5B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={14} color="white" />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>PK Learning</Typography>
                  </Box>
                  <NotificationCenter notifications={userNotifications} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllNotificationsRead} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                    <Avatar sx={{ width: 30, height: 30, backgroundColor: '#1A5B2A', fontSize: '0.78rem', fontWeight: 700 }}>{currentUser.name[0]}</Avatar>
                  </Box>
                </Toolbar>
              </AppBar>
            )}

            {/* Desktop top bar */}
            {!isMobile && (
              <Box sx={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(247,248,250,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #EAECEF', px: 4, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left: page label */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#1A5B2A' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>
                    {view === 'admin' ? 'ผู้ดูแลระบบ'
                      : view === 'manager' ? 'ผู้จัดการทีม'
                      : view === 'dashboard' ? 'การเรียนรู้'
                      : view === 'catalog' ? 'คอร์สทั้งหมด'
                      : view === 'course' ? 'รายละเอียดคอร์ส'
                      : view === 'lesson' ? 'เนื้อหาบทเรียน'
                      : view === 'quiz' ? 'แบบทดสอบ'
                      : view === 'certificate' ? 'ใบประกาศนียบัตร'
                      : view === 'cert-templates' ? 'เทมเพลตใบประกาศ'
                      : 'PK Learning'}
                  </Typography>
                </Box>

                {/* Right: user profile */}
                <Box
                  onClick={(e) => setUserMenuAnchor(e.currentTarget as HTMLElement)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: 2, transition: 'background 0.12s', '&:hover': { backgroundColor: '#EAECEF' } }}
                >
                  <Avatar sx={{ width: 30, height: 30, backgroundColor: '#1A5B2A', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 1px 4px rgba(26,91,42,0.25)' }}>
                    {currentUser.name[0]}
                  </Avatar>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                      {currentUser.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', lineHeight: 1.2 }}>
                      {currentUser.email}
                    </Typography>
                  </Box>
                  <ChevronDown size={13} color="#C4C9D4" />
                </Box>
              </Box>
            )}

            {/* User dropdown */}
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
              slotProps={{ paper: { sx: { mb: 0.5, minWidth: 220, borderRadius: 2.5, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', border: '1px solid #E2E8F0' } } }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ width: 38, height: 38, background: roleGradient[currentUser.role], fontSize: '0.9rem', fontWeight: 700 }}>
                  {currentUser.name[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{currentUser.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{currentUser.email}</Typography>
                  <br />
                  <Chip label={roleLabel[currentUser.role]} size="small" sx={{ background: roleGradient[currentUser.role], color: 'white', fontWeight: 600, fontSize: '0.63rem', height: 18, mt: 0.3 }} />
                </Box>
              </Box>
              <Divider />
              <Box sx={{ px: 2, py: 0.75 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>ข้อมูลบัญชี</Typography>
              </Box>
              <MenuItem sx={{ fontSize: '0.82rem', gap: 1, color: '#374151' }}>
                <Users size={15} color="#1E7A34" />
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>รหัสพนักงาน: {currentUser.employeeId || '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">ทีม: {currentUser.group || '-'}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: '0.875rem', gap: 1, py: 1.2 }}>
                <LogOut size={15} /> ออกจากระบบ
              </MenuItem>
            </Menu>

            {/* Page content */}
            <Box sx={{ flex: 1, py: { xs: 2.5, md: 4 }, px: { xs: 2, md: 4 } }}>
              <Container maxWidth="lg" disableGutters>
                {view === 'admin' && (isDenied('admin') ? (
                  <AccessDenied requiredRole={viewRequiredRole['admin']} onBack={() => setView('dashboard')} />
                ) : (
                  <AdminPanel
                    currentUser={currentUser}
                    allProgress={allProgress}
                    certificates={certificates}
                    onViewCertificate={handleViewCertificate}
                    defaultTab={adminDefaultTab}
                  />
                ))}

                {view === 'manager' && (isDenied('manager') ? (
                  <AccessDenied requiredRole={viewRequiredRole['manager']} onBack={() => setView('dashboard')} />
                ) : (
                  <ManagerDashboard
                    currentUser={currentUser}
                    allProgress={allProgress}
                    certificates={certificates}
                    onViewCertificate={handleViewCertificate}
                  />
                ))}

                {view === 'dashboard' && (
                  <LearnerDashboard
                    user={currentUser}
                    courses={courses}
                    allProgress={allProgress}
                    certificates={certificates}
                    onCourseClick={handleCourseClick}
                    onViewCertificate={handleViewCertificate}
                  />
                )}

                {view === 'catalog' && (
                  <CourseCatalog
                    user={currentUser}
                    courses={courses}
                    allProgress={allProgress}
                    onCourseClick={handleCourseClick}
                  />
                )}

                {view === 'course' && !selectedCourse && (
                  <ViewError label="ไม่พบคอร์สนี้" onBack={() => { setView('dashboard'); setSelectedCourseId(null); }} />
                )}

                {view === 'course' && selectedCourse && (
                  <CoursePage
                    user={currentUser}
                    course={selectedCourse}
                    allProgress={allProgress}
                    onBack={() => {
                      const prevView = isAdmin ? 'admin' : isManager ? 'manager' : 'dashboard';
                      setView(prevView);
                      setSelectedCourseId(null);
                    }}
                    onLessonClick={handleLessonClick}
                    onStartPreTest={handleStartPreTest}
                    onStartFinalExam={handleStartFinalExam}
                  />
                )}

                {view === 'lesson' && selectedCourse && selectedModuleId && selectedLessonId && (
                  <LessonPlayer
                    user={currentUser}
                    course={selectedCourse}
                    moduleId={selectedModuleId}
                    lessonId={selectedLessonId}
                    allProgress={allProgress}
                    onBack={() => setView('course')}
                    onMarkComplete={handleMarkComplete}
                    onNavigateLesson={handleNavigateLesson}
                    onStartQuiz={handleStartQuiz}
                    onInVideoAnswer={handleInVideoAnswer}
                  />
                )}

                {view === 'quiz' && (!currentQuiz || !quizContext || !selectedCourse) && (
                  <ViewError label="ไม่พบแบบทดสอบนี้" onBack={() => { setView('course'); setQuizContext(null); setSampledQuiz(null); }} />
                )}

                {view === 'quiz' && currentQuiz && quizContext && selectedCourse && (
                  <QuizPage
                    quiz={currentQuiz}
                    isFinalExam={quizContext.isFinalExam}
                    isPreTest={quizContext.isPreTest}
                    existingAttempts={existingQuizAttempts}
                    courseTitle={selectedCourse.title}
                    onSubmit={handleQuizSubmit}
                    onBack={() => setView(quizContext.isFinalExam || quizContext.isPreTest ? 'course' : 'lesson')}
                    onContinue={handleQuizContinue}
                    onViewCertificate={quizContext.isFinalExam ? () => handleViewCertificateForCourse(quizContext.courseId) : undefined}
                  />
                )}

                {view === 'certificate' && !selectedCertificate && (
                  <ViewError label="ไม่พบใบประกาศนี้" onBack={() => setView('dashboard')} />
                )}

                {view === 'certificate' && selectedCertificate && (
                  <CertificatePage
                    certificate={selectedCertificate}
                    certTemplates={certTemplates}
                    onBack={() => setView('course')}
                  />
                )}

                {view === 'cert-templates' && (isDenied('cert-templates') ? (
                  <AccessDenied requiredRole={viewRequiredRole['cert-templates']} onBack={() => setView('dashboard')} />
                ) : (
                  <CertificateTemplateManager
                    templates={certTemplates}
                    onSave={setCertTemplates}
                  />
                ))}
              </Container>
            </Box>
          </Box>
        </Box>
        </ErrorBoundary>
      </ThemeWrapper>
    </div>
  );
}
