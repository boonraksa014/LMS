import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
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
  Shield,
  ChevronRight,
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
import { generateCertificate, hasCertificate, getCertificate, sampleQuiz, getPreTestAttemptCount, getBestPreTestScore } from './utils/helpers';

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
  training_admin: 'linear-gradient(135deg,#6366F1,#4F46E5)',
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
    setCurrentUser(user);
    setView('dashboard');
    if (user.role === 'super_admin' || user.role === 'training_admin') setView('admin');
    else if (user.role === 'manager') setView('manager');
    else setView('dashboard');
  };

  const handleShowRegister = () => setView('register');

  const handleRegister = (user: User) => {
    setRegisteredUsers((prev) => [...prev, user]);
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
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

  const handleMarkComplete = (moduleId: string, lessonId: string) => {
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
          <Toaster richColors position="top-right" />
          {view === 'register' ? (
            <RegisterPage onRegister={handleRegister} onBackToLogin={() => setView('dashboard')} />
          ) : (
            <LoginPage onLogin={handleLogin} onShowRegister={handleShowRegister} allUsers={registeredUsers} />
          )}
        </ThemeWrapper>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'training_admin';
  const isManager = currentUser.role === 'manager';

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
    icon, label, description, isActive, onClick, accent = '#6366F1',
  }: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    isActive: boolean;
    onClick: () => void;
    accent?: string;
  }) => (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2, py: description ? 1 : 1.1, px: 1.5, gap: 1,
          bgcolor: isActive ? `${accent}28` : 'transparent',
          border: `1px solid ${isActive ? `${accent}50` : 'transparent'}`,
          transition: 'all 0.15s',
          '&:hover': { bgcolor: isActive ? `${accent}30` : 'rgba(255,255,255,0.055)' },
        }}
      >
        {/* Left accent bar */}
        <Box sx={{ width: 3, height: description ? 34 : 22, borderRadius: 2, bgcolor: isActive ? accent : 'transparent', flexShrink: 0, transition: 'all 0.15s' }} />
        <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? accent : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 400, color: isActive ? 'white' : 'rgba(255,255,255,0.7)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.3)', mt: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {description}
            </Typography>
          )}
        </Box>
        {isActive && <ChevronRight size={12} color={accent} style={{ flexShrink: 0 }} />}
      </ListItemButton>
    </ListItem>
  );

  // ── Section header renderer ───────────────────────────────────────────────
  const SideSection = ({
    icon, label, color, children,
  }: {
    icon: React.ReactNode;
    label: string;
    color: string;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 1, bgcolor: `${color}20` }}>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        </Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${color}CC` }}>
          {label}
        </Typography>
      </Box>
      <List dense sx={{ px: 1.5, py: 0 }}>
        {children}
      </List>
    </Box>
  );

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0F0D2E 0%,#1E1B4B 55%,#1E1B4B 100%)', overflow: 'hidden' }}>

      {/* ── Logo ── */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2.5, background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.55)', flexShrink: 0 }}>
            <GraduationCap size={21} color="white" />
          </Box>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}>PK Learning</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.02em' }}>Product Knowledge LMS</Typography>
          </Box>
        </Box>

        {/* Role badge */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: roleGradient[currentUser.role], flexShrink: 0, boxShadow: '0 0 6px currentColor' }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', fontWeight: 600, flex: 1 }}>
            {roleLabel[currentUser.role]}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <NotificationCenter
              notifications={userNotifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2, mb: 1 }} />

      {/* ── Nav sections ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2 } }}>

        {/* ── ADMIN section ── */}
        {isAdmin && (
          <SideSection icon={<Shield size={13} />} label="ผู้ดูแลระบบ" color="#A78BFA">
            <SideNavItem
              icon={<LayoutDashboard size={16} />}
              label="ภาพรวมระบบ"
              description="สถิติและตัวชี้วัด"
              isActive={view === 'admin' && adminDefaultTab === 0}
              onClick={() => goAdmin(0)}
              accent="#A78BFA"
            />
            <SideNavItem
              icon={<Users size={16} />}
              label="จัดการผู้ใช้งาน"
              description="เพิ่ม/แก้ไข/ระงับบัญชี"
              isActive={view === 'admin' && adminDefaultTab === 1}
              onClick={() => goAdmin(1)}
              accent="#A78BFA"
            />
            <SideNavItem
              icon={<BookOpen size={16} />}
              label="จัดการคอร์ส"
              description="เนื้อหา, สถานะ, กลุ่ม"
              isActive={view === 'admin' && adminDefaultTab === 2}
              onClick={() => goAdmin(2)}
              accent="#A78BFA"
            />
            <SideNavItem
              icon={<TrendingUp size={16} />}
              label="รายงานความก้าวหน้า"
              description="ติดตามผลการเรียนรู้"
              isActive={view === 'admin' && adminDefaultTab === 3}
              onClick={() => goAdmin(3)}
              accent="#A78BFA"
            />
            <SideNavItem
              icon={<Award size={16} />}
              label="ใบประกาศนียบัตร"
              description="ประวัติการออกใบประกาศ"
              isActive={view === 'admin' && adminDefaultTab === 4}
              onClick={() => goAdmin(4)}
              accent="#A78BFA"
            />
            <SideNavItem
              icon={<Award size={16} />}
              label="เทมเพลตใบประกาศ"
              description="ออกแบบและจัดการรูปแบบ"
              isActive={view === 'cert-templates'}
              onClick={() => goView('cert-templates')}
              accent="#A78BFA"
            />
          </SideSection>
        )}

        {/* ── MANAGER section ── */}
        {isManager && (
          <SideSection icon={<BarChart3 size={13} />} label="ผู้จัดการทีม" color="#FCD34D">
            <SideNavItem
              icon={<BarChart3 size={16} />}
              label="รายงานทีม"
              description="ความก้าวหน้าของทีมงาน"
              isActive={view === 'manager'}
              onClick={() => goView('manager')}
              accent="#FCD34D"
            />
          </SideSection>
        )}

        {(isAdmin || isManager) && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, my: 1 }} />}

        {/* ── LEARNER section (all roles) ── */}
        <SideSection
          icon={<GraduationCap size={13} />}
          label={isAdmin || isManager ? 'การเรียนรู้ส่วนตัว' : 'การเรียนรู้'}
          color="#34D399"
        >
          <SideNavItem
            icon={<Home size={16} />}
            label="หน้าแรก"
            description="ภาพรวมการเรียนของฉัน"
            isActive={view === 'dashboard'}
            onClick={() => goView('dashboard')}
            accent="#34D399"
          />
          <SideNavItem
            icon={<BookOpen size={16} />}
            label="คอร์สทั้งหมด"
            description="เลือกเรียนตามที่สนใจ"
            isActive={view === 'catalog'}
            onClick={() => goView('catalog')}
            accent="#34D399"
          />
        </SideSection>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2 }} />

      {/* ── User profile footer ── */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ borderRadius: 2.5, p: 1.5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { background: 'rgba(255,255,255,0.08)' }, transition: 'all 0.15s' }}
          onClick={(e) => setUserMenuAnchor(e.currentTarget as HTMLElement)}
        >
          <Avatar sx={{ width: 34, height: 34, background: roleGradient[currentUser.role], fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>
            {currentUser.name[0]}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography sx={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, flexShrink: 0 }}>
            <Box sx={{ width: 16, height: 1.5, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
            <Box sx={{ width: 12, height: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
            <Box sx={{ width: 10, height: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <div>
      <ThemeWrapper>
        <Toaster richColors position="top-right" />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
          {/* Permanent Sidebar — desktop */}
          {!isMobile && (
            <Box component="nav" sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1200, boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}>
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
              <AppBar position="sticky" elevation={0} sx={{ background: 'linear-gradient(90deg,#1E1B4B,#312E81)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Toolbar sx={{ gap: 1 }}>
                  <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)}>
                    <MenuIcon size={22} />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={15} color="white" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>PK Learning</Typography>
                  </Box>
                  <NotificationCenter notifications={userNotifications} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllNotificationsRead} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                    <Avatar sx={{ width: 32, height: 32, background: roleGradient[currentUser.role], fontSize: '0.8rem', fontWeight: 700 }}>{currentUser.name[0]}</Avatar>
                    <ChevronDown size={14} color="rgba(255,255,255,0.6)" />
                  </Box>
                </Toolbar>
              </AppBar>
            )}

            {/* Desktop top bar — minimal breadcrumb/page title */}
            {!isMobile && (
              <Box sx={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(241,245,249,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', px: 4, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={roleLabel[currentUser.role]} size="small" sx={{ background: roleGradient[currentUser.role], color: 'white', fontWeight: 600, fontSize: '0.68rem', height: 20 }} />
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
              PaperProps={{ sx: { mb: 0.5, minWidth: 220, borderRadius: 2.5, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', border: '1px solid #E2E8F0' } }}
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
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ข้อมูลบัญชี</Typography>
              </Box>
              <MenuItem sx={{ fontSize: '0.82rem', gap: 1, color: '#374151' }}>
                <Users size={15} color="#6366F1" />
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
                {view === 'admin' && isAdmin && (
                  <AdminPanel
                    currentUser={currentUser}
                    allProgress={allProgress}
                    certificates={certificates}
                    onViewCertificate={handleViewCertificate}
                    defaultTab={adminDefaultTab}
                  />
                )}

                {view === 'manager' && isManager && (
                  <ManagerDashboard
                    currentUser={currentUser}
                    allProgress={allProgress}
                    certificates={certificates}
                    onViewCertificate={handleViewCertificate}
                  />
                )}

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

                {view === 'certificate' && selectedCertificate && (
                  <CertificatePage
                    certificate={selectedCertificate}
                    certTemplates={certTemplates}
                    onBack={() => setView('course')}
                  />
                )}

                {view === 'cert-templates' && isAdmin && (
                  <CertificateTemplateManager
                    templates={certTemplates}
                    onSave={setCertTemplates}
                  />
                )}
              </Container>
            </Box>
          </Box>
        </Box>
      </ThemeWrapper>
    </div>
  );
}
