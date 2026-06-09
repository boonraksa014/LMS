import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Box,
  Typography,
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
  CheckCircle,
  UserCheck,
  UserX,
  Eye,
  Award,
  Upload,
  Pencil,
  Plus,
  X,
  Lock,
  Download,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService, courseService } from '../services';
import { Certificate, Course, CourseProgress, User, UserRole } from '../data/types';
import {
  getCourseEnrollStatus,
  getCourseProgressPercent,
  getCompletedLessons,
  getTotalLessons,
  getBestFinalExamScore,
} from '../utils/helpers';

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  manager: 'Manager',
  learner: 'ผู้เรียน',
};

const roleChipSx: Record<string, object> = {
  super_admin:     { backgroundColor: '#0F172A', color: '#F8FAFC' },
  training_admin:  { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
  manager:         { backgroundColor: '#FFFBEB', color: '#92400E' },
  learner:         { backgroundColor: '#F1F5F9', color: '#475569' },
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

const defaultUserForm = (): UserForm => ({
  name: '', email: '', employeeId: '', group: 'Sales', role: 'learner', active: true, password: '',
});

type ImportRow = { name: string; email: string; group: string; role: string };

interface UserManagementProps {
  currentUser: User;
  allProgress: CourseProgress[];
  certificates: Certificate[];
  managedGroups: string[];
}

export function UserManagement({ currentUser, allProgress, certificates, managedGroups }: UserManagementProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);

  const [userFormDialog, setUserFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; user?: User }>({ open: false, mode: 'create' });
  const [userForm, setUserForm] = useState<UserForm>(defaultUserForm());
  const [userFormErrors, setUserFormErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportRow[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importResult, setImportResult] = useState<{ success: ImportRow[]; failed: { row: ImportRow; reason: string }[] } | null>(null);

  const [learnerDetail, setLearnerDetail] = useState<User | null>(null);
  const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const importInputRef = useRef<HTMLInputElement>(null);

  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const uniqueGroups = Array.from(new Set(allUsers.map((u) => u.group))).sort();

  const filteredUsers = allUsers.filter((u) => {
    const q = searchText.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.employeeId.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchGroup = filterGroup === 'all' || u.group === filterGroup;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.active : !u.active);
    return matchSearch && matchRole && matchGroup && matchStatus;
  });

  useEffect(() => {
    Promise.all([userService.getAll(), courseService.getAll()]).then(([users, courses]) => {
      setAllUsers(users);
      setPublishedCourses(courses.filter((c) => c.status === 'published'));
    }).catch(() => {
      toast.error('โหลดข้อมูลผู้ใช้ไม่สำเร็จ');
    });
  }, []);

  const openCreateUser = () => {
    setUserForm(defaultUserForm());
    setUserFormErrors({});
    setUserFormDialog({ open: false, mode: 'create' });
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

  const handleSaveUser = async () => {
    if (!validateUserForm()) return;
    setSaving(true);
    try {
      if (userFormDialog.mode === 'create') {
        const newUser = await userService.create({
          name: userForm.name,
          email: userForm.email,
          employeeId: userForm.employeeId,
          group: userForm.group,
          role: userForm.role,
          active: userForm.active,
          password: userForm.password,
        });
        setAllUsers((prev) => [...prev, newUser]);
        toast.success(`สร้างผู้ใช้ "${userForm.name}" เรียบร้อยแล้ว`);
      } else if (userFormDialog.user) {
        const updates: Partial<Omit<User, 'id'>> = {
          name: userForm.name,
          email: userForm.email,
          employeeId: userForm.employeeId,
          group: userForm.group,
          role: userForm.role,
          active: userForm.active,
        };
        if (userForm.password) updates.password = userForm.password;
        const updated = await userService.update(userFormDialog.user.id, updates);
        if (updated) {
          setAllUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
        }
        toast.success(`บันทึกข้อมูล "${userForm.name}" เรียบร้อยแล้ว`);
      }
      setUserFormDialog({ open: false, mode: 'create' });
    } catch {
      toast.error('บันทึกข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.delete(deleteUserDialog.userId);
      setAllUsers((prev) => prev.filter((u) => u.id !== deleteUserDialog.userId));
      toast.success(`ลบผู้ใช้ "${deleteUserDialog.userName}" เรียบร้อยแล้ว`);
      setDeleteUserDialog({ open: false, userId: '', userName: '' });
    } catch {
      toast.error('ลบผู้ใช้ไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const parseImportFile = (file: File) => {
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      let rows: string[][] = [];
      if (isExcel) {
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
      } else {
        const text = data as string;
        rows = text.split('\n').filter((l) => l.trim()).map((line) =>
          line.split(',').map((s) => s.replace(/^"|"$/g, '').trim())
        );
      }
      const parsed = rows.slice(1).map(([name = '', email = '', group = '', role = 'learner']) =>
        ({ name, email, group, role })
      ).filter((r) => r.name && r.email);
      setImportPreview(parsed);
    };
    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file, 'UTF-8');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseImportFile(file);
    e.target.value = '';
  };

  const handleImportDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImportDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseImportFile(file);
  };

  const downloadTemplate = () => {
    const header = 'ชื่อ,อีเมล,กลุ่ม,บทบาท';
    const example = 'สมชาย ใจดี,somchai@company.com,Sales,learner';
    const blob = new Blob(['﻿' + [header, example].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'import_users_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    const validRoles = ['learner', 'manager', 'training_admin', 'super_admin'];
    const existingEmails = new Set(allUsers.map((u) => u.email));
    const seenInFile = new Set<string>();
    const success: ImportRow[] = [];
    const failed: { row: ImportRow; reason: string }[] = [];

    for (const row of importPreview) {
      if (!row.name.trim()) { failed.push({ row, reason: 'ไม่มีชื่อ' }); continue; }
      if (!row.email.trim()) { failed.push({ row, reason: 'ไม่มีอีเมล' }); continue; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) { failed.push({ row, reason: 'รูปแบบอีเมลไม่ถูกต้อง' }); continue; }
      if (existingEmails.has(row.email)) { failed.push({ row, reason: 'อีเมลซ้ำในระบบ' }); continue; }
      if (seenInFile.has(row.email)) { failed.push({ row, reason: 'อีเมลซ้ำในไฟล์' }); continue; }
      if (row.role && !validRoles.includes(row.role)) { failed.push({ row, reason: `บทบาท "${row.role}" ไม่ถูกต้อง` }); continue; }
      seenInFile.add(row.email);
      success.push(row);
    }

    setImportResult({ success, failed });
    setImportPreview([]);
    if (success.length > 0) {
      setImportDone(true);
      setTimeout(() => setImportDone(false), 5000);
    }
  };

  return (
    <Box>
      {/* Alerts */}
      {importDone && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportDone(false)}>นำเข้าผู้ใช้สำเร็จ (ต้องการ Backend เพื่อบันทึกถาวร)</Alert>}

      {/* ── User Table ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
          ผู้ใช้งานทั้งหมด{' '}
          <Typography component="span" variant="h6" sx={{ fontWeight: 400, color: '#64748B' }}>
            ({filteredUsers.length === allUsers.length ? allUsers.length : `${filteredUsers.length}/${allUsers.length}`} คน)
          </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentUser.role === 'super_admin' && (
            <Button variant="outlined" size="small" startIcon={<Upload size={15} />}
              onClick={() => { setImportPreview([]); setImportWizardOpen(true); }}>
              นำเข้า
            </Button>
          )}
          {currentUser.role === 'super_admin' && (
            <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateUser}>
              เพิ่มผู้ใช้ใหม่
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Filter Bar ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="ค้นหาชื่อ, อีเมล, รหัสพนักงาน..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: '1 1 220px', minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={15} color="#64748B" />
                </InputAdornment>
              ),
              ...(searchText && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ),
              }),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>บทบาท</InputLabel>
          <Select value={filterRole} label="บทบาท" onChange={(e) => setFilterRole(e.target.value)}>
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {ALL_ROLES.map((r) => <MenuItem key={r} value={r}>{roleLabel[r]}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>กลุ่ม</InputLabel>
          <Select value={filterGroup} label="กลุ่ม" onChange={(e) => setFilterGroup(e.target.value)}>
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {uniqueGroups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>สถานะ</InputLabel>
          <Select value={filterStatus} label="สถานะ" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="active">ใช้งาน</MenuItem>
            <MenuItem value="inactive">ระงับ</MenuItem>
          </Select>
        </FormControl>

        {(searchText || filterRole !== 'all' || filterGroup !== 'all' || filterStatus !== 'all') && (
          <Button
            size="small"
            startIcon={<SlidersHorizontal size={14} />}
            onClick={() => { setSearchText(''); setFilterRole('all'); setFilterGroup('all'); setFilterStatus('all'); }}
            sx={{ color: '#64748B', fontSize: '0.78rem', flexShrink: 0 }}
          >
            ล้างตัวกรอง
          </Button>
        )}
      </Box>

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
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                  ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((user) => {
              const passedCount = publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length;
              const certCount = certificates.filter((c) => c.userId === user.id).length;
              return (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', backgroundColor: user.active ? '#1E7A34' : '#CBD5E1' }}>
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
                  <TableCell><Chip label={roleLabel[user.role]} size="small" sx={{ ...(roleChipSx[user.role] ?? {}) }} /></TableCell>
                  <TableCell>
                    {user.active
                      ? <Chip label="ใช้งาน" size="small" color="success" icon={<UserCheck size={11} />} />
                      : <Chip label="ระงับ" size="small" color="error" icon={<UserX size={11} />} />}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: passedCount > 0 ? 700 : 400, color: passedCount > 0 ? '#059669' : undefined }}>
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
                      {currentUser.role === 'super_admin' && user.id !== currentUser.id && (
                        <Tooltip title="ลบผู้ใช้">
                          <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setDeleteUserDialog({ open: true, userId: user.id, userName: user.name })}>
                            <Trash2 size={14} />
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

      {/* ── Create / Edit User Dialog ── */}
      <Dialog
        open={userFormDialog.open}
        onClose={() => setUserFormDialog({ open: false, mode: 'create' })}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: userFormDialog.mode === 'create' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Users size={16} color="#64748B" /></InputAdornment> } }}
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
                  {managedGroups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
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
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock size={16} color="#64748B" /></InputAdornment> } }}
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
            disableElevation
            onClick={handleSaveUser}
            disabled={saving}
            startIcon={userFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
          >
            {userFormDialog.mode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Import Wizard Dialog ── */}
      <Dialog
        open={importWizardOpen}
        onClose={() => { setImportWizardOpen(false); setImportPreview([]); }}
        maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="white" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>นำเข้าผู้ใช้งาน</Typography>
                <Typography variant="caption" color="text.secondary">
                  {importResult ? `สำเร็จ ${importResult.success.length} · ไม่สำเร็จ ${importResult.failed.length} รายการ`
                    : importPreview.length > 0 ? `พบ ${importPreview.length} รายการ — ตรวจสอบก่อน Import`
                    : 'รองรับ CSV และ Excel (.xlsx/.xls)'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => { setImportWizardOpen(false); setImportPreview([]); setImportResult(null); }}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider sx={{ mt: 2 }} />

        <DialogContent sx={{ pt: 2.5 }}>
          <input ref={importInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />

          {importResult ? (
            /* ── Step 3: Result ── */
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#16A34A', lineHeight: 1.1 }}>{importResult.success.length}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600, mt: 0.25 }}>นำเข้าสำเร็จ</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: importResult.failed.length > 0 ? '#FFF7ED' : '#F8FAFC', border: `1px solid ${importResult.failed.length > 0 ? '#FED7AA' : '#E2E8F0'}`, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: importResult.failed.length > 0 ? '#EA580C' : '#717182', lineHeight: 1.1 }}>{importResult.failed.length}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: importResult.failed.length > 0 ? '#C2410C' : '#717182', fontWeight: 600, mt: 0.25 }}>ไม่สำเร็จ</Typography>
                </Box>
              </Box>

              {importResult.failed.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#C2410C', mb: 1 }}>รายการที่ไม่สำเร็จ</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 280 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>ชื่อ</TableCell>
                          <TableCell>อีเมล</TableCell>
                          <TableCell sx={{ color: '#C2410C' }}>สาเหตุ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importResult.failed.map(({ row, reason }, i) => (
                          <TableRow key={i} sx={{ backgroundColor: '#FFF7ED' }}>
                            <TableCell sx={{ color: '#717182', fontSize: '0.75rem' }}>{i + 1}</TableCell>
                            <TableCell><Typography variant="body2">{row.name || '—'}</Typography></TableCell>
                            <TableCell><Typography variant="caption" color="text.secondary">{row.email || '—'}</Typography></TableCell>
                            <TableCell>
                              <Chip label={reason} size="small" color="warning" sx={{ fontSize: '0.68rem' }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {importResult.success.length > 0 && importResult.failed.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D', mb: 1 }}>รายการที่สำเร็จ ({importResult.success.length} รายการ)</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
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
                        {importResult.success.slice(0, 30).map((row, i) => (
                          <TableRow key={i} sx={{ backgroundColor: '#F0FDF4' }}>
                            <TableCell sx={{ color: '#717182', fontSize: '0.75rem' }}>{i + 1}</TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{row.name}</Typography></TableCell>
                            <TableCell><Typography variant="caption" color="text.secondary">{row.email}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{row.group}</Typography></TableCell>
                            <TableCell><Chip label={row.role} size="small" color="success" sx={{ fontSize: '0.68rem' }} /></TableCell>
                          </TableRow>
                        ))}
                        {importResult.success.length > 30 && (
                          <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: '#717182', fontSize: '0.8rem' }}>...และอีก {importResult.success.length - 30} รายการ</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          ) : importPreview.length === 0 ? (
            /* ── Step 1: Upload ── */
            <Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="คลิกหรือลากไฟล์เพื่ออัปโหลด"
                onClick={() => importInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && importInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setImportDragOver(true); }}
                onDragLeave={() => setImportDragOver(false)}
                onDrop={handleImportDrop}
                sx={{
                  border: `2px dashed ${importDragOver ? '#1A5B2A' : '#D1D5DB'}`,
                  borderRadius: 3,
                  p: 5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: importDragOver ? '#F0FDF4' : '#FAFAFA',
                  transition: 'all 0.15s',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  '&:hover': { borderColor: '#1A5B2A', backgroundColor: '#F0FDF4' },
                  '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: 2 },
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                  <Upload size={22} color="#1A5B2A" />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                  {importDragOver ? 'วางไฟล์ที่นี่' : 'คลิกหรือลากไฟล์มาวางที่นี่'}
                </Typography>
                <Typography variant="caption" color="text.secondary">CSV, XLSX, XLS</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button size="small" startIcon={<Download size={14} />} onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                  sx={{ color: '#6B7280', fontSize: '0.78rem' }}>
                  ดาวน์โหลด Template CSV
                </Button>
              </Box>
            </Box>
          ) : (
            /* ── Step 2: Preview ── */
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip label={`${importPreview.length} รายการ`} color="success" size="small" />
                <Button size="small" startIcon={<Upload size={13} />} onClick={() => { setImportPreview([]); }}>
                  เปลี่ยนไฟล์
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 360 }}>
                <Table size="small" stickyHeader>
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
                    {importPreview.slice(0, 50).map((row, i) => (
                      <TableRow key={i} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell sx={{ color: '#717182', fontSize: '0.75rem' }}>{i + 1}</TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{row.name}</Typography></TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary">{row.email}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{row.group}</Typography></TableCell>
                        <TableCell>
                          <Chip label={row.role} size="small"
                            sx={{ fontSize: '0.68rem', ...(roleChipSx[row.role] ?? {}) }} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {importPreview.length > 50 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#717182', fontSize: '0.8rem' }}>
                          ...และอีก {importPreview.length - 50} รายการ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          {importResult ? (
            <>
              <Button onClick={() => { setImportPreview([]); setImportResult(null); }} startIcon={<Upload size={14} />}>
                Import ใหม่
              </Button>
              <Button variant="contained" onClick={() => { setImportWizardOpen(false); setImportResult(null); }}
                sx={{ backgroundColor: '#1A5B2A', '&:hover': { backgroundColor: '#155724' } }}>
                ปิด
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => { setImportWizardOpen(false); setImportPreview([]); }}>ยกเลิก</Button>
              <Button
                variant="contained" startIcon={<UserCheck size={14} />}
                disabled={importPreview.length === 0}
                onClick={handleConfirmImport}
                sx={{ backgroundColor: '#1A5B2A', '&:hover': { backgroundColor: '#155724' } }}
              >
                Import {importPreview.length > 0 ? `${importPreview.length} รายการ` : ''}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Delete User Confirm Dialog ── */}
      <Dialog open={deleteUserDialog.open} onClose={() => setDeleteUserDialog({ open: false, userId: '', userName: '' })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#d4183d" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>ยืนยันการลบผู้ใช้</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            คุณต้องการลบ <Typography component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>"{deleteUserDialog.userName}"</Typography> ออกจากระบบ?
          </Typography>
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteUserDialog({ open: false, userId: '', userName: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDeleteUser} sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b91c1c' } }}>
            ลบผู้ใช้
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Learner Detail Dialog ── */}
      <Dialog open={!!learnerDetail} onClose={() => setLearnerDetail(null)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {learnerDetail && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: '#1E7A34', fontWeight: 700, width: 44, height: 44 }}>{learnerDetail.name[0]}</Avatar>
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
                          <Chip label={statusTh[status]} size="small" sx={{ mt: 0.5, fontSize: '0.68rem', ...(statusChipSx[status] ?? {}) }} />
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          {score !== null && <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>{score}%</Typography>}
                          {cert && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Award size={12} color="#B45309" />
                              <Typography variant="caption" sx={{ color: '#B45309' }}>มีใบประกาศ</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {getCompletedLessons(course, learnerDetail.id, allProgress)}/{getTotalLessons(course)} บทเรียน
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: status === 'passed' ? '#059669' : '#1E7A34', borderRadius: 9999 } }} />
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
    </Box>
  );
}