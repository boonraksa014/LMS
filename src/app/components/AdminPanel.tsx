import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  FormHelperText,
  Checkbox,
  ListItemText,
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
  CheckCircle,
  TrendingUp,
  Download,
  Eye,
  Award,
  Copy,
  FileText,
  Pencil,
  Plus,
  X,
  Image as ImageIcon,
  Clock,
  Tag,
  LayoutList,
  Trash2,
  Shield,
} from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses as staticCourses } from '../data/courses';
import { Certificate, Course, CourseProgress, User, UserRole, CourseStatus } from '../data/types';
import { CourseContentEditor } from './CourseContentEditor';
import { UserManagement } from './UserManagement';
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

const roleChipSx: Record<string, object> = {
  super_admin:    { backgroundColor: '#0F172A', color: '#F8FAFC' },
  training_admin: { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
  manager:        { backgroundColor: '#FFFBEB', color: '#92400E' },
  learner:        { backgroundColor: '#F1F5F9', color: '#475569' },
};

const statusTh: Record<string, string> = {
  not_started: 'ยังไม่เริ่ม',
  in_progress: 'กำลังเรียน',
  completed: 'เรียนครบ',
  passed: 'สอบผ่าน',
  failed: 'สอบไม่ผ่าน',
};

const statusChipSx: Record<string, object> = {
  not_started: { backgroundColor: '#F1F5F9', color: '#475569' },
  in_progress:  { backgroundColor: '#E8F5E9', color: '#155225' },
  completed:    { backgroundColor: '#FEF9C3', color: '#854D0E' },
  passed:       { backgroundColor: '#ECFDF5', color: '#065F46' },
  failed:       { backgroundColor: '#FEF2F2', color: '#991B1B' },
};

const courseStatusThai: Record<string, string> = { draft: 'ฉบับร่าง', published: 'เผยแพร่แล้ว', archived: 'เก็บถาวร' };
const courseStatusColors: Record<string, 'default' | 'success' | 'warning'> = { draft: 'default', published: 'success', archived: 'warning' };

const ALL_GROUPS = ['Sales', 'Telesales', 'PC/BA', 'Live', 'Management', 'Operations'];
const ALL_CATEGORIES = ['Product Knowledge', 'Sales Script', 'Compliance', 'Soft Skills'];
// ─── Role & Permission Definitions ───────────────────────────────────────────

interface ActionDef { id: string; label: string }
interface MenuDef   { id: string; label: string; section: string; actions: ActionDef[] }
export interface RoleConfig {
  id: string; label: string; description: string; isSystem: boolean;
  permissions: Record<string, Record<string, boolean>>;
}

const MENU_DEFS: MenuDef[] = [
  { id: 'admin.overview',     label: 'ภาพรวมระบบ',           section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูข้อมูล' }] },
  { id: 'admin.users',        label: 'จัดการผู้ใช้งาน',       section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายชื่อ' }, { id: 'create', label: 'เพิ่มผู้ใช้' }, { id: 'edit', label: 'แก้ไขข้อมูล' }, { id: 'import', label: 'นำเข้าไฟล์' }] },
  { id: 'admin.courses',      label: 'จัดการคอร์ส',           section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'create', label: 'สร้างคอร์ส' }, { id: 'edit', label: 'แก้ไข' }, { id: 'manage_content', label: 'จัดการเนื้อหา' }, { id: 'duplicate', label: 'ทำสำเนา' }] },
  { id: 'admin.reports',      label: 'รายงานความก้าวหน้า',    section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายงาน' }, { id: 'export', label: 'ส่งออก CSV' }] },
  { id: 'admin.certificates', label: 'ใบประกาศนียบัตร',        section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'export', label: 'ส่งออก CSV' }] },
  { id: 'admin.groups',       label: 'จัดการกลุ่มผู้เรียน',   section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'create', label: 'เพิ่มกลุ่ม' }, { id: 'edit', label: 'แก้ไข' }, { id: 'delete', label: 'ลบ' }] },
  { id: 'admin.categories',   label: 'จัดการหมวดหมู่',         section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'create', label: 'เพิ่ม' }, { id: 'edit', label: 'แก้ไข' }, { id: 'delete', label: 'ลบ' }] },
  { id: 'admin.roles',        label: 'จัดการบทบาทและสิทธิ์',  section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'edit', label: 'แก้ไขสิทธิ์' }] },
  { id: 'manager.dashboard',  label: 'รายงานทีม',              section: 'ผู้จัดการ',   actions: [{ id: 'view', label: 'ดูรายงาน' }, { id: 'export', label: 'ส่งออก CSV' }] },
  { id: 'learner.home',       label: 'หน้าแรก',                section: 'การเรียนรู้', actions: [{ id: 'view', label: 'ดูภาพรวม' }] },
  { id: 'learner.catalog',    label: 'คอร์สทั้งหมด',           section: 'การเรียนรู้', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'enroll', label: 'ลงทะเบียน' }] },
  { id: 'learner.lesson',     label: 'เนื้อหาบทเรียน',         section: 'การเรียนรู้', actions: [{ id: 'view', label: 'เข้าเรียน' }, { id: 'quiz', label: 'ทำแบบทดสอบ' }] },
];

const _sp = (allowed: Record<string, string[]>): Record<string, Record<string, boolean>> =>
  Object.fromEntries(MENU_DEFS.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, !!(allowed[m.id]?.includes(a.id))]))]));

const INITIAL_ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'super_admin', label: 'Super Admin',
    description: 'สิทธิ์สูงสุด — เข้าถึงและดำเนินการได้ทุกฟังก์ชัน', isSystem: true,
    permissions: Object.fromEntries(MENU_DEFS.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, true]))])),
  },
  {
    id: 'training_admin', label: 'Training Admin',
    description: 'จัดการคอร์ส รายงาน และเนื้อหาการเรียนรู้', isSystem: true,
    permissions: _sp({
      'admin.overview': ['view'], 'admin.courses': ['view','create','edit','manage_content','duplicate'],
      'admin.reports': ['view','export'], 'admin.certificates': ['view'],
      'admin.groups': ['view'], 'admin.categories': ['view','create','edit'],
      'learner.home': ['view'], 'learner.catalog': ['view','enroll'], 'learner.lesson': ['view','quiz'],
    }),
  },
  {
    id: 'manager', label: 'Manager',
    description: 'ติดตามความก้าวหน้าและดูรายงานของทีม', isSystem: true,
    permissions: _sp({
      'manager.dashboard': ['view','export'],
      'learner.home': ['view'], 'learner.catalog': ['view','enroll'], 'learner.lesson': ['view','quiz'],
    }),
  },
  {
    id: 'learner', label: 'ผู้เรียน',
    description: 'เข้าเรียนและทำแบบทดสอบตามคอร์สที่ได้รับมอบหมาย', isSystem: true,
    permissions: _sp({
      'learner.home': ['view'], 'learner.catalog': ['view','enroll'], 'learner.lesson': ['view','quiz'],
    }),
  },
];

interface CourseForm {
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  duration: string;
  image: string;
  allowedGroups: string[];
}

const defaultCourseForm = (): CourseForm => ({
  title: '', description: '', category: 'Product Knowledge', status: 'draft', duration: '', image: '', allowedGroups: [],
});

export function AdminPanel({ currentUser, allProgress, certificates, onViewCertificate, defaultTab }: AdminPanelProps) {
  const [tab, setTab] = useState(defaultTab ?? 0);

  // Sync when sidebar navigates to a specific tab
  useEffect(() => {
    if (defaultTab !== undefined) setTab(defaultTab);
  }, [defaultTab]);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

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

  // Group management
  const [managedGroups, setManagedGroups] = useState<string[]>([...ALL_GROUPS, 'Master']);
  const [groupDialog, setGroupDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; value: string; original: string }>({ open: false, mode: 'add', value: '', original: '' });
  const [groupDeleteConfirm, setGroupDeleteConfirm] = useState<string | null>(null);

  const handleSaveGroup = () => {
    const trimmed = groupDialog.value.trim();
    if (!trimmed) return;
    if (groupDialog.mode === 'add') {
      if (!managedGroups.includes(trimmed)) setManagedGroups([...managedGroups, trimmed]);
    } else {
      setManagedGroups(managedGroups.map((g) => (g === groupDialog.original ? trimmed : g)));
    }
    setGroupDialog({ ...groupDialog, open: false });
  };

  const handleDeleteGroup = () => {
    if (groupDeleteConfirm) {
      setManagedGroups(managedGroups.filter((g) => g !== groupDeleteConfirm));
      setGroupDeleteConfirm(null);
    }
  };

  const [groupViewDetail, setGroupViewDetail] = useState<string | null>(null);

  // Category management
  const [managedCategories, setManagedCategories] = useState<string[]>([...ALL_CATEGORIES]);
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; value: string; original: string }>({ open: false, mode: 'add', value: '', original: '' });
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState<string | null>(null);

  const handleSaveCategory = () => {
    const trimmed = categoryDialog.value.trim();
    if (!trimmed) return;
    if (categoryDialog.mode === 'add') {
      if (!managedCategories.includes(trimmed)) setManagedCategories([...managedCategories, trimmed]);
    } else {
      setManagedCategories(managedCategories.map((c) => (c === categoryDialog.original ? trimmed : c)));
      // keep courseForm in sync if currently editing that category
      if (courseForm.category === categoryDialog.original) setCourseForm({ ...courseForm, category: trimmed });
    }
    setCategoryDialog({ ...categoryDialog, open: false });
  };

  const handleDeleteCategory = () => {
    if (categoryDeleteConfirm) {
      setManagedCategories(managedCategories.filter((c) => c !== categoryDeleteConfirm));
      setCategoryDeleteConfirm(null);
    }
  };

  // Role & Permission management
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(INITIAL_ROLE_CONFIGS);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('super_admin');
  const [roleFormDialog, setRoleFormDialog] = useState<{
    open: boolean; mode: 'create' | 'edit'; label: string; description: string; copyFrom: string;
  }>({ open: false, mode: 'create', label: '', description: '', copyFrom: 'super_admin' });
  const [roleDeleteConfirm, setRoleDeleteConfirm] = useState<string | null>(null);
  const [roleSaved, setRoleSaved] = useState(false);

  const handleTogglePerm = (roleId: string, menuId: string, actionId: string) => {
    setRoleConfigs((prev) =>
      prev.map((r) =>
        r.id !== roleId ? r : {
          ...r,
          permissions: {
            ...r.permissions,
            [menuId]: { ...r.permissions[menuId], [actionId]: !r.permissions[menuId]?.[actionId] },
          },
        }
      )
    );
    setRoleSaved(true);
    setTimeout(() => setRoleSaved(false), 2500);
  };

  const handleToggleMenuAll = (roleId: string, menuId: string, value: boolean) => {
    const menu = MENU_DEFS.find((m) => m.id === menuId);
    if (!menu) return;
    setRoleConfigs((prev) =>
      prev.map((r) =>
        r.id !== roleId ? r : {
          ...r,
          permissions: {
            ...r.permissions,
            [menuId]: Object.fromEntries(menu.actions.map((a) => [a.id, value])),
          },
        }
      )
    );
    setRoleSaved(true);
    setTimeout(() => setRoleSaved(false), 2500);
  };

  const handleSaveRoleForm = () => {
    if (!roleFormDialog.label.trim()) return;
    if (roleFormDialog.mode === 'create') {
      const newId = `custom_${Date.now()}`;
      const template = roleConfigs.find((r) => r.id === roleFormDialog.copyFrom);
      const emptyPerms = Object.fromEntries(MENU_DEFS.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, false]))]));
      setRoleConfigs((prev) => [...prev, {
        id: newId,
        label: roleFormDialog.label.trim(),
        description: roleFormDialog.description.trim(),
        isSystem: false,
        permissions: template ? JSON.parse(JSON.stringify(template.permissions)) : emptyPerms,
      }]);
      setSelectedRoleId(newId);
    } else {
      setRoleConfigs((prev) => prev.map((r) =>
        r.id !== selectedRoleId ? r : { ...r, label: roleFormDialog.label.trim(), description: roleFormDialog.description.trim() }
      ));
    }
    setRoleFormDialog({ ...roleFormDialog, open: false });
  };

  const handleDeleteRole = () => {
    if (roleDeleteConfirm) {
      const remaining = roleConfigs.filter((r) => r.id !== roleDeleteConfirm);
      setRoleConfigs(remaining);
      if (selectedRoleId === roleDeleteConfirm) setSelectedRoleId(remaining[0]?.id ?? '');
      setRoleDeleteConfirm(null);
    }
  };

  const learners = mockUsers.filter((u) => u.role === 'learner');
  const publishedCourses = staticCourses.filter((c) => c.status === 'published');
  const groups = ['all', ...managedGroups];

  const totalEnrollments = learners.reduce((sum, user) =>
    sum + publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) !== 'not_started').length, 0);
  const totalPassed = learners.reduce((sum, user) =>
    sum + publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length, 0);

  const filteredLearners = learners.filter((u) => filterGroup === 'all' || u.group === filterGroup);

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
      allowedGroups: course.allowedGroups,
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

  const handleDuplicate = () => {
    setDuplicateSuccess(`คอร์ส "${duplicateTitle}" ถูกสร้างเรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึก)`);
    setDuplicateDialog({ open: false, courseId: '', courseName: '' });
    setDuplicateTitle('');
    setTimeout(() => setDuplicateSuccess(''), 5000);
  };

  const summaryItems = [
    { label: 'ผู้ใช้งานทั้งหมด', value: mockUsers.length, icon: <Users size={16} />, color: '#1E7A34' },
    { label: 'คอร์สที่เปิดใช้', value: publishedCourses.length, icon: <BookOpen size={16} />, color: '#1E7A34' },
    { label: 'ลงทะเบียนแล้ว', value: totalEnrollments, icon: <TrendingUp size={16} />, color: '#D97706' },
    { label: 'ใบประกาศที่ออก', value: certificates.length, icon: <Award size={16} />, color: '#1E7A34' },
    { label: 'สอบผ่านแล้ว', value: totalPassed, icon: <CheckCircle size={16} />, color: '#059669' },
  ];

  return (
    <Box>
      {/* Header — แสดงเฉพาะหน้าภาพรวมระบบ */}
      {tab === 0 && (
        <Box sx={{ backgroundColor: '#0F3D1A', borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              {currentUser.role === 'super_admin' ? 'Super Admin' : 'Training Admin'} Dashboard
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.5, fontSize: '0.875rem' }}>
              ภาพรวมระบบ E-Learning · PK Learning
            </Typography>
          </Box>
        </Box>
      )}

      {/* Alerts */}
      {courseSaveSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCourseSaveSuccess('')}>{courseSaveSuccess}</Alert>}
      {duplicateSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDuplicateSuccess('')}>{duplicateSuccess}</Alert>}


      {/* ── Tab 0: Overview ── */}
      {tab === 0 && (
        <Box>
          <Box sx={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, display: 'flex', flexWrap: 'wrap', mb: 4 }}>
            {summaryItems.map((s, i) => (
              <Box key={s.label} sx={{ flex: '1 1 140px', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRight: i < summaryItems.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <Box sx={{ color: s.color, flexShrink: 0 }}>{s.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1, color: '#0F172A' }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#717182', mt: 0.25, lineHeight: 1.5 }}>{s.label}</Typography>
                </Box>
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
                    <LinearProgress variant="determinate" value={passRate} sx={{ mb: 1, height: 6, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: passRate >= 70 ? '#059669' : '#B45309', borderRadius: 9999 } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Award size={12} color="#B45309" />
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
        <UserManagement
          currentUser={currentUser}
          allProgress={allProgress}
          certificates={certificates}
          managedGroups={managedGroups}
        />
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
                          <Box component="img" src={course.image} alt={course.title} loading="lazy" sx={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 1.5 }} />
                          <Tooltip title={course.title} placement="top">
                            <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {course.title}
                            </Typography>
                          </Tooltip>
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
                          <Tooltip title="ทำสำเนาคอร์ส">
                            <IconButton size="small" onClick={() => { setDuplicateDialog({ open: true, courseId: course.id, courseName: course.title }); setDuplicateTitle(`${course.title} (สำเนา)`); }}>
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
            <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCSV}>ส่งออก CSV</Button>
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
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', backgroundColor: '#1E7A34' }}>{user.name[0]}</Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{user.group}</Typography></TableCell>
                          <TableCell>
                            <Tooltip title={course.title} placement="top">
                              <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ minWidth: 110 }}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                <Typography variant="caption" color="text.secondary">{completed}/{total}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: '#1E7A34', borderRadius: 9999 } }} />
                            </Box>
                          </TableCell>
                          <TableCell><Chip label={statusTh[status]} size="small" sx={{ fontSize: '0.7rem', ...(statusChipSx[status] ?? {}) }} /></TableCell>
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
            <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCertCSV} disabled={certificates.length === 0}>ส่งออก CSV</Button>
          </Box>

          {certificates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <Award size={32} color="#CBD5E1" />
              </Box>
              <Typography color="text.secondary">ยังไม่มีใบประกาศที่ออกให้</Typography>
              <Typography variant="caption" color="text.secondary">ใบประกาศจะถูกออกอัตโนมัติเมื่อผู้เรียนสอบปลายภาคผ่าน</Typography>
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
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', backgroundColor: '#D97706' }}>{cert.userName[0]}</Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{cert.userName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={cert.courseTitle} placement="top">
                          <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.courseTitle}</Typography>
                        </Tooltip>
                      </TableCell>
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

      {/* ── Tab 5: Group Management ── */}
      {tab === 5 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการกลุ่มผู้เรียน</Typography>
              <Typography variant="caption" color="text.secondary">{managedGroups.length} กลุ่ม</Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<Plus size={15} />}
              onClick={() => setGroupDialog({ open: true, mode: 'add', value: '', original: '' })}>
              เพิ่มกลุ่มใหม่
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {managedGroups.map((g) => {
              const memberCount = mockUsers.filter((u) => u.group === g).length;
              return (
                <Paper key={g} sx={{ p: 2, borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LayoutList size={16} color="white" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{g}</Typography>
                      <Typography variant="caption" color="text.secondary">{memberCount} คน</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="ดูผู้เรียน">
                      <IconButton size="small" onClick={() => setGroupViewDetail(g)}>
                        <Eye size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="แก้ไข">
                      <IconButton size="small" color="primary" onClick={() => setGroupDialog({ open: true, mode: 'edit', value: g, original: g })}>
                        <Pencil size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                      <IconButton size="small" color="error" onClick={() => setGroupDeleteConfirm(g)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Tab 6: Category Management ── */}
      {tab === 6 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการหมวดหมู่</Typography>
              <Typography variant="caption" color="text.secondary">{managedCategories.length} หมวดหมู่</Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<Plus size={15} />}
              onClick={() => setCategoryDialog({ open: true, mode: 'add', value: '', original: '' })}>
              เพิ่มหมวดหมู่ใหม่
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
            {managedCategories.map((cat) => {
              const courseCount = editableCourses.filter((c) => c.category === cat).length;
              return (
                <Paper key={cat} sx={{ p: 2, borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Tag size={16} color="#1D4ED8" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{cat}</Typography>
                      <Typography variant="caption" color="text.secondary">{courseCount} คอร์ส</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="แก้ไข">
                      <IconButton size="small" color="primary" onClick={() => setCategoryDialog({ open: true, mode: 'edit', value: cat, original: cat })}>
                        <Pencil size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                      <IconButton size="small" color="error" onClick={() => setCategoryDeleteConfirm(cat)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Tab 7: Role & Permission Management ── */}
      {tab === 7 && (() => {
        const selectedRole = roleConfigs.find((r) => r.id === selectedRoleId) ?? null;
        const sections = [...new Set(MENU_DEFS.map((m) => m.section))];
        return (
          <Box sx={{ display: 'flex', gap: 2.5, minHeight: 540 }}>

            {/* ── Left: role list ── */}
            <Box sx={{ width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>บทบาทในระบบ</Typography>
                <Button size="small" startIcon={<Plus size={13} />}
                  onClick={() => setRoleFormDialog({ open: true, mode: 'create', label: '', description: '', copyFrom: 'super_admin' })}>
                  เพิ่ม
                </Button>
              </Box>
              {roleConfigs.map((role) => {
                const uCount = mockUsers.filter((u) => u.role === role.id).length;
                const isSel = selectedRoleId === role.id;
                return (
                  <Paper key={role.id} onClick={() => setSelectedRoleId(role.id)} sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer',
                    border: isSel ? '2px solid #1E7A34' : '1px solid #E2E8F0',
                    backgroundColor: isSel ? '#F0FDF4' : 'white',
                    '&:hover': { borderColor: '#1E7A34' }, transition: 'all 0.12s',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Box sx={{ width: 26, height: 26, borderRadius: 1.5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? '#1E7A34' : '#F1F5F9' }}>
                        <Shield size={13} color={isSel ? 'white' : '#64748B'} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: isSel ? '#1E7A34' : '#0F172A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.label}</Typography>
                      {role.isSystem && <Chip label="ระบบ" size="small" sx={{ fontSize: '0.58rem', height: 16, backgroundColor: '#F1F5F9', color: '#94A3B8', px: 0 }} />}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5, display: 'block', lineHeight: 1.4 }}>
                      {uCount > 0 ? `${uCount} ผู้ใช้` : 'ยังไม่มีผู้ใช้'}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>

            {/* ── Right: permission matrix ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {!selectedRole ? (
                <Box sx={{ textAlign: 'center', py: 10 }}><Typography color="text.secondary">เลือกบทบาทเพื่อดูสิทธิ์</Typography></Box>
              ) : (
                <Box>
                  {/* Role header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, p: 2, borderRadius: 2, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Shield size={15} color="#1E7A34" />
                        <Typography sx={{ fontWeight: 700, color: '#1E7A34', fontSize: '0.95rem' }}>{selectedRole.label}</Typography>
                        {selectedRole.isSystem && <Chip label="บทบาทระบบ" size="small" sx={{ fontSize: '0.62rem', height: 18, backgroundColor: '#DCFCE7', color: '#166534' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{selectedRole.description}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="แก้ไขชื่อและคำอธิบาย">
                        <IconButton size="small" color="primary" onClick={() => setRoleFormDialog({ open: true, mode: 'edit', label: selectedRole.label, description: selectedRole.description, copyFrom: '' })}>
                          <Pencil size={14} />
                        </IconButton>
                      </Tooltip>
                      {!selectedRole.isSystem && (
                        <Tooltip title="ลบบทบาท">
                          <IconButton size="small" color="error" onClick={() => setRoleDeleteConfirm(selectedRole.id)}>
                            <Trash2 size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {selectedRole.id === 'super_admin' && (
                    <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>Super Admin มีสิทธิ์ทุกอย่างและไม่สามารถแก้ไขได้</Alert>
                  )}

                  {/* Permission sections */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sections.map((section) => (
                      <Box key={section}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', mb: 1 }}>{section}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {MENU_DEFS.filter((m) => m.section === section).map((menu) => {
                            const mp = selectedRole.permissions[menu.id] ?? {};
                            const allOn = menu.actions.every((a) => mp[a.id]);
                            const anyOn = menu.actions.some((a) => mp[a.id]);
                            const locked = selectedRole.id === 'super_admin';
                            return (
                              <Paper key={menu.id} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                {/* menu header row */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, backgroundColor: anyOn ? '#FAFFFD' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: anyOn ? '#1E7A34' : '#CBD5E1', flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: anyOn ? '#0F172A' : '#94A3B8' }}>{menu.label}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">ทั้งหมด</Typography>
                                    <Switch
                                      size="small"
                                      checked={allOn}
                                      disabled={locked}
                                      onChange={(_, v) => handleToggleMenuAll(selectedRole.id, menu.id, v)}
                                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#1E7A34' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1E7A34' } }}
                                    />
                                  </Box>
                                </Box>
                                {/* action toggles */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 1.5, py: 1, gap: 0.5 }}>
                                  {menu.actions.map((action) => (
                                    <Box key={action.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5, borderRadius: 1.5, minWidth: 130, '&:hover': { backgroundColor: locked ? 'transparent' : '#F8FAFC' } }}>
                                      <Switch
                                        size="small"
                                        checked={!!mp[action.id]}
                                        disabled={locked}
                                        onChange={() => handleTogglePerm(selectedRole.id, menu.id, action.id)}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#059669' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#059669' } }}
                                      />
                                      <Typography variant="caption" sx={{ color: mp[action.id] ? '#374151' : '#94A3B8', fontWeight: mp[action.id] ? 500 : 400, userSelect: 'none' }}>
                                        {action.label}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {roleSaved && (
                    <Alert severity="success" sx={{ mt: 2, fontSize: '0.8rem' }}>บันทึกการเปลี่ยนแปลงสิทธิ์เรียบร้อยแล้ว</Alert>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════
          DIALOGS
      ════════════════════════════════════════════════════════════════ */}

      {/* ── Create / Edit Course Dialog ── */}
      <Dialog
        open={courseFormDialog.open}
        onClose={() => setCourseFormDialog({ open: false, mode: 'create' })}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: courseFormDialog.mode === 'create' ? '#059669' : '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><BookOpen size={16} color="#64748B" /></InputAdornment> } }}
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
                  {managedCategories.map((c) => <MenuItem key={c} value={c}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Tag size={14} color="#64748B" />{c}</Box></MenuItem>)}
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
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Clock size={15} color="#64748B" /></InputAdornment> } }}
              />

              <FormControl fullWidth>
                <InputLabel>กลุ่มที่เข้าถึงได้</InputLabel>
                <Select
                  multiple
                  value={courseForm.allowedGroups}
                  label="กลุ่มที่เข้าถึงได้"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCourseForm({ ...courseForm, allowedGroups: typeof val === 'string' ? val.split(',') : val });
                  }}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? <Typography variant="body2" color="text.secondary">ทุกกลุ่ม</Typography>
                      : selected.join(', ')
                  }
                >
                  {managedGroups.map((g) => (
                    <MenuItem key={g} value={g}>
                      <Checkbox checked={courseForm.allowedGroups.includes(g)} size="small" sx={{ py: 0 }} />
                      <ListItemText primary={g} />
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>ไม่เลือก = เข้าถึงได้ทุกกลุ่ม</FormHelperText>
              </FormControl>
            </Box>

            <TextField
              label="URL รูปปก"
              fullWidth
              value={courseForm.image}
              onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
              helperText="ใส่ URL รูปภาพสำหรับปกคอร์ส"
              placeholder="https://..."
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><ImageIcon size={15} color="#64748B" /></InputAdornment> } }}
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
            disableElevation
            onClick={handleSaveCourse}
            startIcon={courseFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
          >
            {courseFormDialog.mode === 'create' ? 'สร้างคอร์ส' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Duplicate Course Dialog ── */}
      <Dialog open={duplicateDialog.open} onClose={() => setDuplicateDialog({ open: false, courseId: '', courseName: '' })} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Copy size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          ทำสำเนาคอร์ส
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            คัดลอกคอร์ส: <strong>{duplicateDialog.courseName}</strong>
          </Typography>
          <TextField fullWidth label="ชื่อคอร์สใหม่" value={duplicateTitle} onChange={(e) => setDuplicateTitle(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDuplicateDialog({ open: false, courseId: '', courseName: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDuplicate} disabled={!duplicateTitle.trim()}>สร้างสำเนา</Button>
        </DialogActions>
      </Dialog>


      {/* ── Add / Edit Group Dialog ── */}
      <Dialog open={groupDialog.open} onClose={() => setGroupDialog({ ...groupDialog, open: false })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: groupDialog.mode === 'add' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {groupDialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>{groupDialog.mode === 'add' ? 'เพิ่มกลุ่มใหม่' : 'แก้ไขกลุ่ม'}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setGroupDialog({ ...groupDialog, open: false })}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth label="ชื่อกลุ่ม" value={groupDialog.value} autoFocus
            onChange={(e) => setGroupDialog({ ...groupDialog, value: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveGroup()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setGroupDialog({ ...groupDialog, open: false })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveGroup} disabled={!groupDialog.value.trim()}>
            {groupDialog.mode === 'add' ? 'เพิ่มกลุ่ม' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Group Confirm ── */}
      <Dialog open={!!groupDeleteConfirm} onClose={() => setGroupDeleteConfirm(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle>ยืนยันการลบกลุ่ม</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบกลุ่ม <strong>"{groupDeleteConfirm}"</strong> ใช่หรือไม่?</Typography>
          {groupDeleteConfirm && mockUsers.filter((u) => u.group === groupDeleteConfirm).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีผู้ใช้ {mockUsers.filter((u) => u.group === groupDeleteConfirm).length} คนอยู่ในกลุ่มนี้
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setGroupDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleDeleteGroup}>ลบกลุ่ม</Button>
        </DialogActions>
      </Dialog>

      {/* ── Group Members Dialog ── */}
      <Dialog open={!!groupViewDetail} onClose={() => setGroupViewDetail(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {groupViewDetail && (() => {
          const members = mockUsers.filter((u) => u.group === groupViewDetail);
          return (
            <>
              <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LayoutList size={16} color="white" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{groupViewDetail}</Typography>
                      <Typography variant="caption" color="text.secondary">{members.length} คน</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => setGroupViewDetail(null)}><X size={18} /></IconButton>
                </Box>
              </DialogTitle>
              <Divider sx={{ mt: 2 }} />
              <DialogContent sx={{ pt: 2, pb: 1 }}>
                {members.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Users size={36} color="#CBD5E1" />
                    <Typography color="text.secondary" sx={{ mt: 1.5 }}>ยังไม่มีผู้เรียนในกลุ่มนี้</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {members.map((u) => {
                      const passedCount = publishedCourses.filter((c) => getCourseEnrollStatus(c, u.id, allProgress) === 'passed').length;
                      return (
                        <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid #F0F1F3', '&:hover': { backgroundColor: '#F8FAFC' } }}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700, backgroundColor: u.active ? '#1E7A34' : '#CBD5E1' }}>
                            {u.name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>{u.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {u.email} · {u.employeeId}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                            <Chip label={roleLabel[u.role]} size="small" sx={{ ...(roleChipSx[u.role] ?? {}) }} />
                            <Typography variant="caption" color={passedCount > 0 ? 'success.main' : 'text.secondary'} sx={{ fontWeight: passedCount > 0 ? 700 : 400 }}>
                              ผ่าน {passedCount} คอร์ส
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setGroupViewDetail(null)}>ปิด</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* ── Add / Edit Category Dialog ── */}
      <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog({ ...categoryDialog, open: false })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: categoryDialog.mode === 'add' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {categoryDialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>{categoryDialog.mode === 'add' ? 'เพิ่มหมวดหมู่ใหม่' : 'แก้ไขหมวดหมู่'}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setCategoryDialog({ ...categoryDialog, open: false })}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="ชื่อหมวดหมู่"
            value={categoryDialog.value}
            autoFocus
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Tag size={15} color="#64748B" /></InputAdornment> } }}
            onChange={(e) => setCategoryDialog({ ...categoryDialog, value: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCategoryDialog({ ...categoryDialog, open: false })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveCategory} disabled={!categoryDialog.value.trim()}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
            {categoryDialog.mode === 'add' ? 'เพิ่มหมวดหมู่' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Category Confirm ── */}
      <Dialog open={!!categoryDeleteConfirm} onClose={() => setCategoryDeleteConfirm(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle>ยืนยันการลบหมวดหมู่</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบหมวดหมู่ <strong>"{categoryDeleteConfirm}"</strong> ใช่หรือไม่?</Typography>
          {categoryDeleteConfirm && editableCourses.filter((c) => c.category === categoryDeleteConfirm).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีคอร์ส {editableCourses.filter((c) => c.category === categoryDeleteConfirm).length} คอร์สที่ใช้หมวดหมู่นี้อยู่
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCategoryDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleDeleteCategory}>ลบหมวดหมู่</Button>
        </DialogActions>
      </Dialog>

      {/* ── Add / Edit Role Dialog ── */}
      <Dialog open={roleFormDialog.open} onClose={() => setRoleFormDialog({ ...roleFormDialog, open: false })} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: roleFormDialog.mode === 'create' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {roleFormDialog.mode === 'create' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>{roleFormDialog.mode === 'create' ? 'สร้างบทบาทใหม่' : 'แก้ไขบทบาท'}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setRoleFormDialog({ ...roleFormDialog, open: false })}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="ชื่อบทบาท"
              fullWidth
              required
              autoFocus
              value={roleFormDialog.label}
              onChange={(e) => setRoleFormDialog({ ...roleFormDialog, label: e.target.value })}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Shield size={15} color="#64748B" /></InputAdornment> } }}
              placeholder="เช่น Content Editor"
            />
            <TextField
              label="คำอธิบาย"
              fullWidth
              multiline
              rows={2}
              value={roleFormDialog.description}
              onChange={(e) => setRoleFormDialog({ ...roleFormDialog, description: e.target.value })}
              placeholder="อธิบายหน้าที่และขอบเขตของบทบาทนี้..."
            />
            {roleFormDialog.mode === 'create' && (
              <FormControl fullWidth>
                <InputLabel>คัดลอกสิทธิ์จาก</InputLabel>
                <Select value={roleFormDialog.copyFrom} label="คัดลอกสิทธิ์จาก" onChange={(e) => setRoleFormDialog({ ...roleFormDialog, copyFrom: e.target.value })}>
                  <MenuItem value="">ไม่คัดลอก (เริ่มด้วยสิทธิ์ว่าง)</MenuItem>
                  {roleConfigs.map((r) => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
                </Select>
                <FormHelperText>บทบาทใหม่จะได้รับสิทธิ์เดิมจากบทบาทที่เลือก แล้วสามารถปรับเพิ่มเติมได้</FormHelperText>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setRoleFormDialog({ ...roleFormDialog, open: false })}>ยกเลิก</Button>
          <Button
            variant="contained" disableElevation
            disabled={!roleFormDialog.label.trim()}
            onClick={handleSaveRoleForm}
            startIcon={roleFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
          >
            {roleFormDialog.mode === 'create' ? 'สร้างบทบาท' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Role Confirm ── */}
      <Dialog open={!!roleDeleteConfirm} onClose={() => setRoleDeleteConfirm(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle>ยืนยันการลบบทบาท</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบบทบาท <strong>"{roleConfigs.find((r) => r.id === roleDeleteConfirm)?.label}"</strong> ใช่หรือไม่?</Typography>
          {roleDeleteConfirm && mockUsers.filter((u) => u.role === roleDeleteConfirm).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีผู้ใช้ {mockUsers.filter((u) => u.role === roleDeleteConfirm).length} คนที่ใช้บทบาทนี้อยู่
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRoleDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRole}>ลบบทบาท</Button>
        </DialogActions>
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
