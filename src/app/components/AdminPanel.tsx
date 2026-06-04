import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Users,
  BookOpen,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Download,
  UserCheck,
  UserX,
  Eye,
  Award,
  Upload,
  Copy,
  FileText,
  Pencil,
  Plus,
  X,
  Image as ImageIcon,
  Clock,
  Tag,
  Lock,
  LayoutList,
} from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses as staticCourses } from '../data/courses';
import { Certificate, Course, CourseProgress, User, UserRole, CourseStatus } from '../data/types';
import { CourseContentEditor } from './CourseContentEditor';
import {
  getCourseEnrollStatus,
  getCourseProgressPercent,
  getCompletedLessons,
  getTotalLessons,
  getBestFinalExamScore,
} from '../utils/helpers';

interface AdminPanelProps {
  currentUser: User;
  allProgress: CourseProgress[];
  certificates: Certificate[];
  onViewCertificate: (cert: Certificate) => void;
  defaultTab?: number;
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  manager: 'Manager',
  learner: 'ผู้เรียน',
};

const roleColor: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'success'> = {
  super_admin: 'secondary',
  training_admin: 'primary',
  manager: 'warning',
  learner: 'default',
};

const statusTh: Record<string, string> = {
  not_started: 'ยังไม่เริ่ม',
  in_progress: 'กำลังเรียน',
  completed: 'เรียนครบ',
  passed: 'สอบผ่าน',
  failed: 'สอบไม่ผ่าน',
};

const statusChipColor: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  not_started: 'default',
  in_progress: 'primary',
  completed: 'warning',
  passed: 'success',
  failed: 'error',
};

const courseStatusThai: Record<string, string> = { draft: 'Draft', published: 'Published', archived: 'Archived' };
const courseStatusColors: Record<string, 'default' | 'success' | 'warning'> = { draft: 'default', published: 'success', archived: 'warning' };

const ALL_GROUPS = ['Sales', 'Telesales', 'PC/BA', 'Live', 'Management', 'Operations'];
const ALL_CATEGORIES = ['Product Knowledge', 'Sales Script', 'Compliance', 'Soft Skills'];
const ALL_ROLES: UserRole[] = ['learner', 'manager', 'training_admin', 'super_admin'];

interface UserForm {
  name: string;
  email: string;
  employeeId: string;
  group: string;
  role: UserRole;
  active: boolean;
  password: string;
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  duration: string;
  image: string;
  allowedGroups: string;
}

const defaultUserForm = (): UserForm => ({
  name: '', email: '', employeeId: '', group: 'Sales', role: 'learner', active: true, password: '',
});

const defaultCourseForm = (): CourseForm => ({
  title: '', description: '', category: 'Product Knowledge', status: 'draft', duration: '', image: '', allowedGroups: '',
});

export function AdminPanel({ currentUser, allProgress, certificates, onViewCertificate, defaultTab }: AdminPanelProps) {
  const [tab, setTab] = useState(defaultTab ?? 0);

  // Sync when sidebar navigates to a specific tab
  useEffect(() => {
    if (defaultTab !== undefined) setTab(defaultTab);
  }, [defaultTab]);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  // User dialogs
  const [userFormDialog, setUserFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; user?: User }>({ open: false, mode: 'create' });
  const [userForm, setUserForm] = useState<UserForm>(defaultUserForm());
  const [userFormErrors, setUserFormErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [userSaveSuccess, setUserSaveSuccess] = useState('');

  // Course dialogs
  const [courseFormDialog, setCourseFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; courseId?: string }>({ open: false, mode: 'create' });
  const [courseForm, setCourseForm] = useState<CourseForm>(defaultCourseForm());
  const [courseFormErrors, setCourseFormErrors] = useState<Partial<Record<keyof CourseForm, string>>>({});
  const [courseSaveSuccess, setCourseSaveSuccess] = useState('');

  // Editable course list (content editor changes are stored here)
  const [editableCourses, setEditableCourses] = useState<Course[]>(() => JSON.parse(JSON.stringify(staticCourses)));
  const [contentEditor, setContentEditor] = useState<{ open: boolean; courseId: string | null }>({ open: false, courseId: null });

  // Other dialogs
  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; courseId: string; courseName: string }>({ open: false, courseId: '', courseName: '' });
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [duplicateSuccess, setDuplicateSuccess] = useState('');
  const [importDialog, setImportDialog] = useState(false);
  const [importPreview, setImportPreview] = useState<{ name: string; email: string; group: string; role: string }[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [learnerDetail, setLearnerDetail] = useState<User | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const learners = mockUsers.filter((u) => u.role === 'learner');
  const publishedCourses = staticCourses.filter((c) => c.status === 'published');
  const groups = ['all', ...Array.from(new Set(learners.map((u) => u.group)))];

  const totalEnrollments = learners.reduce((sum, user) =>
    sum + publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) !== 'not_started').length, 0);
  const totalPassed = learners.reduce((sum, user) =>
    sum + publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length, 0);

  const filteredLearners = learners.filter((u) => filterGroup === 'all' || u.group === filterGroup);

  // ─── User Form Handlers ───────────────────────────────────────────────────
  const openCreateUser = () => {
    setUserForm(defaultUserForm());
    setUserFormErrors({});
    setUserFormDialog({ open: false, mode: 'create' });
    // next tick to avoid flicker
    setTimeout(() => setUserFormDialog({ open: true, mode: 'create' }), 0);
  };

  const openEditUser = (user: User) => {
    setUserForm({
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      group: user.group,
      role: user.role,
      active: user.active,
      password: '',
    });
    setUserFormErrors({});
    setUserFormDialog({ open: true, mode: 'edit', user });
  };

  const validateUserForm = (): boolean => {
    const errs: Partial<Record<keyof UserForm, string>> = {};
    if (!userForm.name.trim()) errs.name = 'กรุณากรอกชื่อ';
    if (!userForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) errs.email = 'อีเมลไม่ถูกต้อง';
    if (!userForm.employeeId.trim()) errs.employeeId = 'กรุณากรอกรหัสพนักงาน';
    if (userFormDialog.mode === 'create' && !userForm.password.trim()) errs.password = 'กรุณากรอกรหัสผ่าน';
    setUserFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveUser = () => {
    if (!validateUserForm()) return;
    const msg = userFormDialog.mode === 'create'
      ? `สร้างผู้ใช้ "${userForm.name}" เรียบร้อยแล้ว`
      : `บันทึกข้อมูล "${userForm.name}" เรียบร้อยแล้ว`;
    setUserFormDialog({ open: false, mode: 'create' });
    setUserSaveSuccess(msg);
    setTimeout(() => setUserSaveSuccess(''), 5000);
  };

  // ─── Course Form Handlers ─────────────────────────────────────────────────
  const openCreateCourse = () => {
    setCourseForm(defaultCourseForm());
    setCourseFormErrors({});
    setCourseFormDialog({ open: true, mode: 'create' });
  };

  const openEditCourse = (courseId: string) => {
    const course = staticCourses.find((c) => c.id === courseId);
    if (!course) return;
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      status: course.status,
      duration: course.duration,
      image: course.image,
      allowedGroups: course.allowedGroups.join(', '),
    });
    setCourseFormErrors({});
    setCourseFormDialog({ open: true, mode: 'edit', courseId });
  };

  const validateCourseForm = (): boolean => {
    const errs: Partial<Record<keyof CourseForm, string>> = {};
    if (!courseForm.title.trim()) errs.title = 'กรุณากรอกชื่อคอร์ส';
    if (!courseForm.description.trim()) errs.description = 'กรุณากรอกคำอธิบาย';
    if (!courseForm.duration.trim()) errs.duration = 'กรุณากรอกระยะเวลา';
    setCourseFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCourse = () => {
    if (!validateCourseForm()) return;
    const msg = courseFormDialog.mode === 'create'
      ? `สร้างคอร์ส "${courseForm.title}" เรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึกถาวร)`
      : `บันทึกคอร์ส "${courseForm.title}" เรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึกถาวร)`;
    setCourseFormDialog({ open: false, mode: 'create' });
    setCourseSaveSuccess(msg);
    setTimeout(() => setCourseSaveSuccess(''), 5000);
  };

  // ─── CSV / Other Handlers ─────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['ชื่อ', 'อีเมล', 'รหัสพนักงาน', 'กลุ่ม', 'คอร์ส', 'สถานะ', 'ความคืบหน้า', 'คะแนนสูงสุด', 'ใบประกาศ'];
    const rows: string[][] = [];
    filteredLearners.forEach((user) => {
      publishedCourses
        .filter((c) => filterCourse === 'all' || c.id === filterCourse)
        .forEach((course) => {
          const status = getCourseEnrollStatus(course, user.id, allProgress);
          if (status === 'not_started') return;
          const progress = getCourseProgressPercent(course, user.id, allProgress);
          const score = getBestFinalExamScore(course.id, user.id, allProgress);
          const cert = certificates.find((c) => c.courseId === course.id && c.userId === user.id);
          rows.push([
            user.name, user.email, user.employeeId, user.group, course.title,
            statusTh[status] || status, `${progress}%`,
            score !== null ? `${score}%` : '-',
            cert ? cert.certificateNo : '-',
          ]);
        });
    });
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lms_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportCertCSV = () => {
    const headers = ['หมายเลขใบประกาศ', 'ชื่อผู้เรียน', 'คอร์ส', 'หมวดหมู่', 'คะแนน', 'วันที่ออก', 'วันหมดอายุ'];
    const rows = certificates.map((c) => [
      c.certificateNo, c.userName, c.courseTitle, c.category,
      `${c.score}%`,
      new Date(c.issuedAt).toLocaleDateString('th-TH'),
      new Date(c.expiresAt).toLocaleDateString('th-TH'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${x}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const parsed = lines.slice(1).map((line) => {
        const [name = '', email = '', group = '', role = 'learner'] = line.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
        return { name, email, group, role };
      }).filter((r) => r.name && r.email);
      setImportPreview(parsed);
      setImportDialog(true);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    setImportDone(true);
    setImportDialog(false);
    setImportPreview([]);
    setTimeout(() => setImportDone(false), 5000);
  };

  const handleDuplicate = () => {
    setDuplicateSuccess(`คอร์ส "${duplicateTitle}" ถูกสร้างเรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึก)`);
    setDuplicateDialog({ open: false, courseId: '', courseName: '' });
    setDuplicateTitle('');
    setTimeout(() => setDuplicateSuccess(''), 5000);
  };

  const statCards = [
    { label: 'ผู้ใช้งานทั้งหมด', value: mockUsers.length, icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #1E7A34, #43A047)', shadow: 'rgba(30,122,52,0.35)' },
    { label: 'คอร์สที่เปิดใช้', value: publishedCourses.length, icon: <BookOpen size={20} />, gradient: 'linear-gradient(135deg, #10B981, #34D399)', shadow: 'rgba(16,185,129,0.35)' },
    { label: 'การลงทะเบียนทั้งหมด', value: totalEnrollments, icon: <TrendingUp size={20} />, gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', shadow: 'rgba(245,158,11,0.35)' },
    { label: 'ใบประกาศที่ออก', value: certificates.length, icon: <Award size={20} />, gradient: 'linear-gradient(135deg, #388E3C, #66BB6A)', shadow: 'rgba(56,142,60,0.35)' },
    { label: 'สอบผ่านแล้ว', value: totalPassed, icon: <CheckCircle size={20} />, gradient: 'linear-gradient(135deg, #0EA5E9, #38BDF8)', shadow: 'rgba(14,165,233,0.35)' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F3D1A 0%, #1A5B2A 100%)', borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(30,122,52,0.15)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            {currentUser.role === 'super_admin' ? 'Super Admin' : 'Training Admin'} Dashboard
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.5, fontSize: '0.875rem' }}>
            ภาพรวมระบบ E-Learning · PK Learning
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
      {userSaveSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUserSaveSuccess('')}>{userSaveSuccess}</Alert>}
      {courseSaveSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCourseSaveSuccess('')}>{courseSaveSuccess}</Alert>}
      {duplicateSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDuplicateSuccess('')}>{duplicateSuccess}</Alert>}
      {importDone && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportDone(false)}>นำเข้าผู้ใช้สำเร็จ (ต้องการ Backend เพื่อบันทึกถาวร)</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { fontSize: '0.85rem' } }}>
        <Tab icon={<BarChart3 size={15} />} iconPosition="start" label="ภาพรวม" />
        <Tab icon={<Users size={15} />} iconPosition="start" label="ผู้ใช้งาน" />
        <Tab icon={<BookOpen size={15} />} iconPosition="start" label="คอร์ส" />
        <Tab icon={<TrendingUp size={15} />} iconPosition="start" label="รายงาน" />
        <Tab icon={<Award size={15} />} iconPosition="start" label={`ใบประกาศ (${certificates.length})`} />
      </Tabs>

      {/* ── Tab 0: Overview ── */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(5,1fr)' }, gap: 2, mb: 4 }}>
            {statCards.map((s) => (
              <Box key={s.label} sx={{ background: s.gradient, borderRadius: 3, p: 2.5, boxShadow: `0 8px 24px ${s.shadow}`, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.15 }}>{s.icon}</Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 600, mb: 0.5 }}>{s.label}</Typography>
                <Typography sx={{ color: 'white', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0F172A' }}>ความคืบหน้าแต่ละคอร์ส</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' }, gap: 2 }}>
            {publishedCourses.map((course) => {
              const enrolledCount = learners.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) !== 'not_started').length;
              const passedCount = learners.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
              const passRate = enrolledCount > 0 ? Math.round((passedCount / enrolledCount) * 100) : 0;
              const certCount = certificates.filter((c) => c.courseId === course.id).length;
              return (
                <Card key={course.id}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flexGrow: 1, pr: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 0.5 }}>{course.title}</Typography>
                        <Chip label={course.category} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem' }} />
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 800, lineHeight: 1 }}>{enrolledCount}</Typography>
                        <Typography variant="caption" color="text.secondary">ลงทะเบียน</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">อัตราผ่าน</Typography>
                      <Typography variant="caption" color={passRate >= 70 ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700 }}>
                        {passedCount}/{enrolledCount} ({passRate}%)
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={passRate} color={passRate >= 70 ? 'success' : 'warning'} sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Award size={12} color="#F59E0B" />
                      <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600 }}>ใบประกาศ: {certCount} ฉบับ</Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Tab 1: Users ── */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
              ผู้ใช้งานทั้งหมด ({mockUsers.length} คน)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input ref={csvInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVFile} />
              {currentUser.role === 'super_admin' && (
                <Button variant="outlined" size="small" startIcon={<Upload size={15} />} onClick={() => csvInputRef.current?.click()}>
                  Import CSV
                </Button>
              )}
              {currentUser.role === 'super_admin' && (
                <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateUser}>
                  เพิ่มผู้ใช้ใหม่
                </Button>
              )}
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
            รูปแบบ CSV: ชื่อ, อีเมล, กลุ่ม, บทบาท (learner/manager/training_admin)
          </Alert>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ-นามสกุล</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>กลุ่ม</TableCell>
                  <TableCell>บทบาท</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>คอร์สผ่าน</TableCell>
                  <TableCell>ใบประกาศ</TableCell>
                  <TableCell>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUsers.map((user) => {
                  const passedCount = publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length;
                  const certCount = certificates.filter((c) => c.userId === user.id).length;
                  return (
                    <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', background: user.active ? 'linear-gradient(135deg,#1E7A34,#155724)' : '#CBD5E1' }}>
                            {user.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.employeeId}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{user.email}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{user.group}</Typography></TableCell>
                      <TableCell><Chip label={roleLabel[user.role]} size="small" color={roleColor[user.role]} /></TableCell>
                      <TableCell>
                        {user.active
                          ? <Chip label="ใช้งาน" size="small" color="success" icon={<UserCheck size={11} />} />
                          : <Chip label="ระงับ" size="small" color="error" icon={<UserX size={11} />} />}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={passedCount > 0 ? 'success.main' : 'text.secondary'} sx={{ fontWeight: passedCount > 0 ? 700 : 400 }}>
                          {passedCount} คอร์ส
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={certCount > 0 ? 'warning.main' : 'text.secondary'} sx={{ fontWeight: certCount > 0 ? 700 : 400 }}>
                          {certCount} ฉบับ
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton size="small" onClick={() => setLearnerDetail(user)}>
                              <Eye size={15} />
                            </IconButton>
                          </Tooltip>
                          {currentUser.role === 'super_admin' && (
                            <Tooltip title="แก้ไขข้อมูลผู้ใช้">
                              <IconButton size="small" color="primary" onClick={() => openEditUser(user)}>
                                <Pencil size={14} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ── Tab 2: Courses ── */}
      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
              คอร์สทั้งหมด ({editableCourses.length} คอร์ส)
            </Typography>
            <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateCourse}>
              เพิ่มคอร์สใหม่
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อคอร์ส</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>บทเรียน</TableCell>
                  <TableCell>ผู้เรียน</TableCell>
                  <TableCell>ผ่าน</TableCell>
                  <TableCell>ใบประกาศ</TableCell>
                  <TableCell>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editableCourses.map((course) => {
                  const enrolled = learners.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) !== 'not_started').length;
                  const passed = learners.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
                  const certCount = certificates.filter((c) => c.courseId === course.id).length;
                  return (
                    <TableRow key={course.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box component="img" src={course.image} sx={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 1.5 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {course.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={course.category} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.68rem' }} /></TableCell>
                      <TableCell><Chip label={courseStatusThai[course.status]} size="small" color={courseStatusColors[course.status]} /></TableCell>
                      <TableCell><Typography variant="body2">{getTotalLessons(course)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{enrolled}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{passed}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="warning.main" sx={{ fontWeight: certCount > 0 ? 700 : 400 }}>{certCount}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="จัดการเนื้อหา">
                            <IconButton size="small" color="secondary" onClick={() => setContentEditor({ open: true, courseId: course.id })}>
                              <LayoutList size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="แก้ไขข้อมูลคอร์ส">
                            <IconButton size="small" color="primary" onClick={() => openEditCourse(course.id)}>
                              <Pencil size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate Course">
                            <IconButton size="small" onClick={() => { setDuplicateDialog({ open: true, courseId: course.id, courseName: course.title }); setDuplicateTitle(`${course.title} (Copy)`); }}>
                              <Copy size={14} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ── Tab 3: Reports ── */}
      {tab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>รายงานความคืบหน้าผู้เรียน</Typography>
            <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCSV}>Export CSV</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>กลุ่ม</InputLabel>
              <Select value={filterGroup} label="กลุ่ม" onChange={(e) => setFilterGroup(e.target.value)}>
                {groups.map((g) => <MenuItem key={g} value={g}>{g === 'all' ? 'ทุกกลุ่ม' : g}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>คอร์ส</InputLabel>
              <Select value={filterCourse} label="คอร์ส" onChange={(e) => setFilterCourse(e.target.value)}>
                <MenuItem key="all" value="all">ทุกคอร์ส</MenuItem>
                {publishedCourses.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ผู้เรียน</TableCell>
                  <TableCell>กลุ่ม</TableCell>
                  <TableCell>คอร์ส</TableCell>
                  <TableCell>ความคืบหน้า</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>คะแนน Final</TableCell>
                  <TableCell>ใบประกาศ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLearners.flatMap((user) =>
                  publishedCourses
                    .filter((c) => filterCourse === 'all' || c.id === filterCourse)
                    .map((course) => {
                      const status = getCourseEnrollStatus(course, user.id, allProgress);
                      const progress = getCourseProgressPercent(course, user.id, allProgress);
                      const completed = getCompletedLessons(course, user.id, allProgress);
                      const total = getTotalLessons(course);
                      const score = getBestFinalExamScore(course.id, user.id, allProgress);
                      const cert = certificates.find((c) => c.courseId === course.id && c.userId === user.id);
                      return (
                        <TableRow key={`${user.id}-${course.id}`} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', background: 'linear-gradient(135deg,#1E7A34,#155724)' }}>{user.name[0]}</Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{user.group}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 110 }}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                <Typography variant="caption" color="text.secondary">{completed}/{total}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
                            </Box>
                          </TableCell>
                          <TableCell><Chip label={statusTh[status]} size="small" color={statusChipColor[status]} sx={{ fontSize: '0.7rem' }} /></TableCell>
                          <TableCell>
                            {score !== null
                              ? <Typography variant="body2" color={score >= (course.finalExam?.passingScore ?? 80) ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }}>{score}%</Typography>
                              : <Typography variant="caption" color="text.secondary">-</Typography>}
                          </TableCell>
                          <TableCell>
                            {cert ? (
                              <Tooltip title={cert.certificateNo}>
                                <IconButton size="small" color="warning" onClick={() => onViewCertificate(cert)}>
                                  <FileText size={14} />
                                </IconButton>
                              </Tooltip>
                            ) : <Typography variant="caption" color="text.secondary">-</Typography>}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
            แสดง {filteredLearners.length} ผู้เรียน × {filterCourse === 'all' ? publishedCourses.length : 1} คอร์ส
          </Alert>
        </Box>
      )}

      {/* ── Tab 4: Certificates ── */}
      {tab === 4 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>ใบประกาศนียบัตรทั้งหมด ({certificates.length} ฉบับ)</Typography>
            <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCertCSV} disabled={certificates.length === 0}>Export CSV</Button>
          </Box>

          {certificates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <Award size={32} color="#CBD5E1" />
              </Box>
              <Typography color="text.secondary">ยังไม่มีใบประกาศที่ออกให้</Typography>
              <Typography variant="caption" color="text.secondary">ใบประกาศจะถูกออกอัตโนมัติเมื่อผู้เรียนสอบ Final Exam ผ่าน</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>หมายเลขใบประกาศ</TableCell>
                    <TableCell>ชื่อผู้เรียน</TableCell>
                    <TableCell>คอร์ส</TableCell>
                    <TableCell>หมวดหมู่</TableCell>
                    <TableCell>คะแนน</TableCell>
                    <TableCell>วันที่ออก</TableCell>
                    <TableCell>วันหมดอายุ</TableCell>
                    <TableCell>ดู</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...certificates].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()).map((cert) => (
                    <TableRow key={cert.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                      <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#1E7A34', fontWeight: 600 }}>{cert.certificateNo}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>{cert.userName[0]}</Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{cert.userName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.courseTitle}</Typography></TableCell>
                      <TableCell><Chip label={cert.category} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.68rem' }} /></TableCell>
                      <TableCell><Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>{cert.score}%</Typography></TableCell>
                      <TableCell><Typography variant="caption">{new Date(cert.issuedAt).toLocaleDateString('th-TH')}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="caption" color={new Date(cert.expiresAt) < new Date() ? 'error.main' : 'text.secondary'}>
                          {new Date(cert.expiresAt).toLocaleDateString('th-TH')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="ดูใบประกาศ">
                          <IconButton size="small" color="primary" onClick={() => onViewCertificate(cert)}>
                            <Eye size={14} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════════
          DIALOGS
      ════════════════════════════════════════════════════════════════ */}

      {/* ── Create / Edit User Dialog ── */}
      <Dialog
        open={userFormDialog.open}
        onClose={() => setUserFormDialog({ open: false, mode: 'create' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, background: userFormDialog.mode === 'create' ? 'linear-gradient(135deg,#1E7A34,#43A047)' : 'linear-gradient(135deg,#F59E0B,#FCD34D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {userFormDialog.mode === 'create' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  {userFormDialog.mode === 'create' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}
                </Typography>
                {userFormDialog.mode === 'edit' && userFormDialog.user && (
                  <Typography variant="caption" color="text.secondary">{userFormDialog.user.email}</Typography>
                )}
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setUserFormDialog({ open: false, mode: 'create' })}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider sx={{ mt: 2 }} />

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="ชื่อ-นามสกุล"
              fullWidth
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              error={!!userFormErrors.name}
              helperText={userFormErrors.name}
              InputProps={{ startAdornment: <InputAdornment position="start"><Users size={16} color="#94A3B8" /></InputAdornment> }}
            />

            <TextField
              label="อีเมล"
              type="email"
              fullWidth
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              error={!!userFormErrors.email}
              helperText={userFormErrors.email}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="รหัสพนักงาน"
                fullWidth
                required
                value={userForm.employeeId}
                onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                error={!!userFormErrors.employeeId}
                helperText={userFormErrors.employeeId}
                placeholder="EMP-001"
              />

              <FormControl fullWidth required>
                <InputLabel>กลุ่ม</InputLabel>
                <Select value={userForm.group} label="กลุ่ม" onChange={(e) => setUserForm({ ...userForm, group: e.target.value })}>
                  {ALL_GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth required>
              <InputLabel>บทบาท</InputLabel>
              <Select value={userForm.role} label="บทบาท" onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}>
                {ALL_ROLES.map((r) => <MenuItem key={r} value={r}>{roleLabel[r]}</MenuItem>)}
              </Select>
            </FormControl>

            {userFormDialog.mode === 'create' && (
              <TextField
                label="รหัสผ่าน"
                type="password"
                fullWidth
                required
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                error={!!userFormErrors.password}
                helperText={userFormErrors.password}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={16} color="#94A3B8" /></InputAdornment> }}
              />
            )}

            {userFormDialog.mode === 'edit' && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0', backgroundColor: '#FAFAFA' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>สถานะบัญชี</Typography>
                  <Typography variant="caption" color="text.secondary">{userForm.active ? 'บัญชีนี้ใช้งานได้ปกติ' : 'บัญชีนี้ถูกระงับ'}</Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={userForm.active} onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })} color="success" />}
                  label={userForm.active ? 'ใช้งาน' : 'ระงับ'}
                  labelPlacement="start"
                  sx={{ m: 0 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setUserFormDialog({ open: false, mode: 'create' })}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            startIcon={userFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ background: 'linear-gradient(135deg,#1E7A34,#155724)' }}
          >
            {userFormDialog.mode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Create / Edit Course Dialog ── */}
      <Dialog
        open={courseFormDialog.open}
        onClose={() => setCourseFormDialog({ open: false, mode: 'create' })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, background: courseFormDialog.mode === 'create' ? 'linear-gradient(135deg,#10B981,#34D399)' : 'linear-gradient(135deg,#1E7A34,#43A047)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {courseFormDialog.mode === 'create' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  {courseFormDialog.mode === 'create' ? 'สร้างคอร์สใหม่' : 'แก้ไขคอร์ส'}
                </Typography>
                {courseFormDialog.mode === 'edit' && (
                  <Typography variant="caption" color="text.secondary">แก้ไขข้อมูลและการตั้งค่าคอร์ส</Typography>
                )}
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setCourseFormDialog({ open: false, mode: 'create' })}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider sx={{ mt: 2 }} />

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="ชื่อคอร์ส"
              fullWidth
              required
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              error={!!courseFormErrors.title}
              helperText={courseFormErrors.title}
              placeholder="เช่น ความรู้ผลิตภัณฑ์ดูแลตับ"
              InputProps={{ startAdornment: <InputAdornment position="start"><BookOpen size={16} color="#94A3B8" /></InputAdornment> }}
            />

            <TextField
              label="คำอธิบายคอร์ส"
              fullWidth
              required
              multiline
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              error={!!courseFormErrors.description}
              helperText={courseFormErrors.description}
              placeholder="อธิบายสิ่งที่ผู้เรียนจะได้เรียนรู้จากคอร์สนี้..."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={courseForm.category}
                  label="หมวดหมู่"
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                >
                  {ALL_CATEGORIES.map((c) => <MenuItem key={c} value={c}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Tag size={14} color="#94A3B8" />{c}</Box></MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>สถานะ</InputLabel>
                <Select value={courseForm.status} label="สถานะ" onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as CourseStatus })}>
                  <MenuItem key="draft" value="draft"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Chip label="Draft" size="small" />ยังไม่เผยแพร่</Box></MenuItem>
                  <MenuItem key="published" value="published"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Chip label="Published" size="small" color="success" />เผยแพร่แล้ว</Box></MenuItem>
                  <MenuItem key="archived" value="archived"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Chip label="Archived" size="small" color="warning" />เก็บถาวร</Box></MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="ระยะเวลาเรียน"
                fullWidth
                required
                value={courseForm.duration}
                onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                error={!!courseFormErrors.duration}
                helperText={courseFormErrors.duration || 'เช่น 3 ชั่วโมง'}
                InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={15} color="#94A3B8" /></InputAdornment> }}
              />

              <TextField
                label="กลุ่มที่เข้าถึงได้"
                fullWidth
                value={courseForm.allowedGroups}
                onChange={(e) => setCourseForm({ ...courseForm, allowedGroups: e.target.value })}
                helperText="คั่นด้วยจุลภาค หรือเว้นว่าง = ทุกกลุ่ม"
                placeholder="Sales, Telesales"
                InputProps={{ startAdornment: <InputAdornment position="start"><Users size={15} color="#94A3B8" /></InputAdornment> }}
              />
            </Box>

            <TextField
              label="URL รูปปก"
              fullWidth
              value={courseForm.image}
              onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
              helperText="ใส่ URL รูปภาพสำหรับปกคอร์ส"
              placeholder="https://..."
              InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon size={15} color="#94A3B8" /></InputAdornment> }}
            />

            {courseForm.image && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', height: 120, border: '1px solid #E2E8F0' }}>
                <Box
                  component="img"
                  src={courseForm.image}
                  alt="preview"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setCourseFormDialog({ open: false, mode: 'create' })}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleSaveCourse}
            startIcon={courseFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ background: 'linear-gradient(135deg,#1E7A34,#155724)' }}
          >
            {courseFormDialog.mode === 'create' ? 'สร้างคอร์ส' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Duplicate Course Dialog ── */}
      <Dialog open={duplicateDialog.open} onClose={() => setDuplicateDialog({ open: false, courseId: '', courseName: '' })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Copy size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Duplicate Course
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            คัดลอกคอร์ส: <strong>{duplicateDialog.courseName}</strong>
          </Typography>
          <TextField fullWidth label="ชื่อคอร์สใหม่" value={duplicateTitle} onChange={(e) => setDuplicateTitle(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDuplicateDialog({ open: false, courseId: '', courseName: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDuplicate} disabled={!duplicateTitle.trim()}>Duplicate</Button>
        </DialogActions>
      </Dialog>

      {/* ── Import CSV Preview Dialog ── */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Upload size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          ตรวจสอบข้อมูลก่อน Import ({importPreview.length} รายการ)
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>ชื่อ</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>กลุ่ม</TableCell>
                  <TableCell>บทบาท</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importPreview.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.group}</TableCell>
                    <TableCell>{row.role}</TableCell>
                  </TableRow>
                ))}
                {importPreview.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                      ...และอีก {importPreview.length - 10} รายการ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setImportDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" startIcon={<UserCheck size={14} />} onClick={handleConfirmImport}>Confirm Import</Button>
        </DialogActions>
      </Dialog>

      {/* ── Learner Detail Dialog ── */}
      <Dialog open={!!learnerDetail} onClose={() => setLearnerDetail(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {learnerDetail && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg,#1E7A34,#155724)', fontWeight: 700, width: 44, height: 44 }}>{learnerDetail.name[0]}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{learnerDetail.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{learnerDetail.email} · {learnerDetail.group} · {learnerDetail.employeeId}</Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => setLearnerDetail(null)}><X size={18} /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#475569' }}>ความคืบหน้าทุกคอร์ส</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {publishedCourses.map((course) => {
                  const status = getCourseEnrollStatus(course, learnerDetail.id, allProgress);
                  const progress = getCourseProgressPercent(course, learnerDetail.id, allProgress);
                  const score = getBestFinalExamScore(course.id, learnerDetail.id, allProgress);
                  const cert = certificates.find((c) => c.courseId === course.id && c.userId === learnerDetail.id);
                  return (
                    <Box key={course.id} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', p: 2, backgroundColor: status === 'passed' ? '#F0FDF4' : '#FAFAFA' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{course.title}</Typography>
                          <Chip label={statusTh[status]} size="small" color={statusChipColor[status]} sx={{ mt: 0.5, fontSize: '0.68rem' }} />
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          {score !== null && <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>{score}%</Typography>}
                          {cert && <Typography variant="caption" sx={{ color: '#B45309', display: 'block' }}>📜 มีใบประกาศ</Typography>}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {getCompletedLessons(course, learnerDetail.id, allProgress)}/{getTotalLessons(course)} บทเรียน
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} color={status === 'passed' ? 'success' : 'primary'} />
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              {currentUser.role === 'super_admin' && (
                <Button
                  variant="outlined"
                  startIcon={<Pencil size={14} />}
                  onClick={() => { setLearnerDetail(null); openEditUser(learnerDetail); }}
                >
                  แก้ไขข้อมูล
                </Button>
              )}
              <Button onClick={() => setLearnerDetail(null)}>ปิด</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Course Content Editor ── */}
      {contentEditor.open && contentEditor.courseId && (() => {
        const targetCourse = editableCourses.find((c) => c.id === contentEditor.courseId);
        if (!targetCourse) return null;
        return (
          <CourseContentEditor
            course={targetCourse}
            open={contentEditor.open}
            onClose={() => setContentEditor({ open: false, courseId: null })}
            onSave={(updated) => {
              setEditableCourses(editableCourses.map((c) => c.id === updated.id ? updated : c));
            }}
          />
        );
      })()}
    </Box>
  );
}
