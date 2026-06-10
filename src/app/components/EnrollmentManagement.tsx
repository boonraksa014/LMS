import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Avatar,
  Chip, IconButton, Tooltip, Divider, Button, LinearProgress,
  Tabs, Tab, Checkbox, FormControl, InputLabel, Select, MenuItem,
  CircularProgress,
} from '@mui/material';
import { Search, UserCheck, UserX, BookOpen, CheckCircle, Lock, Users, Zap } from 'lucide-react';
import { userService, courseService } from '../services';
import { User, Course, CourseProgress } from '../data/types';
import { enrollmentService, ManualEnrollment } from '../services/enrollmentService';
import { getCourseEnrollStatus } from '../utils/helpers';

interface EnrollmentManagementProps {
  currentUser: User;
  allProgress: CourseProgress[];
  enrollments: ManualEnrollment[];
  onEnrollmentsChange: (updated: ManualEnrollment[]) => void;
}

const AVATAR_COLORS = ['#0F3D1A', '#1E7A34', '#0891B2', '#D97706', '#B45309', '#475569', '#1D4ED8'];
const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin', training_admin: 'Training Admin', manager: 'Manager', learner: 'ผู้เรียน',
};

export function EnrollmentManagement({ currentUser, allProgress, enrollments, onEnrollmentsChange }: EnrollmentManagementProps) {
  const [mode, setMode] = useState(0); // 0 = individual, 1 = bulk
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Individual mode state
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  // Bulk mode state
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkGroup, setBulkGroup] = useState('all');
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    Promise.all([userService.getAll(), courseService.getAll()]).then(([users, courses]) => {
      setAllUsers(users);
      setAllCourses(courses);
      setDataLoading(false);
    });
  }, []);

  const learners = allUsers.filter((u: User) => u.role === 'learner' || u.role === 'manager');
  const publishedCourses = allCourses.filter((c: Course) => c.status === 'published');
  const groups = ['all', ...Array.from(new Set(learners.map((u: User) => u.department)))];

  // ── Individual mode handlers ──
  const filteredUsers = learners.filter((u: User) =>
    u.fullnameThai.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredCourses = publishedCourses.filter((c: Course) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(courseSearch.toLowerCase())
  );

  useEffect(() => { setCourseSearch(''); }, [selectedUser]);

  const handleEnroll = useCallback(async (courseId: string) => {
    if (!selectedUser) return;
    setLoading(courseId);
    try {
      const record = await enrollmentService.enroll(courseId, selectedUser.id, currentUser.id);
      onEnrollmentsChange([...enrollments.filter((e) => !(e.courseId === courseId && e.userId === selectedUser.id)), record]);
    } finally { setLoading(null); }
  }, [selectedUser, currentUser.id, enrollments, onEnrollmentsChange]);

  const handleUnenroll = useCallback(async (courseId: string) => {
    if (!selectedUser) return;
    setLoading(courseId);
    try {
      await enrollmentService.unenroll(courseId, selectedUser.id);
      onEnrollmentsChange(enrollments.filter((e) => !(e.courseId === courseId && e.userId === selectedUser.id)));
    } finally { setLoading(null); }
  }, [selectedUser, enrollments, onEnrollmentsChange]);

  // ── Bulk mode handlers ──
  const bulkFilteredUsers = learners.filter((u: User) => bulkGroup === 'all' || u.department === bulkGroup);
  const selectedBulkCourse = publishedCourses.find((c: Course) => c.id === bulkCourseId);

  const toggleBulkUser = (userId: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const selectAllBulk = () => {
    setBulkSelected(new Set(bulkFilteredUsers.map((u: User) => u.id)));
  };

  const clearBulkSelection = () => setBulkSelected(new Set());

  const handleBulkAssign = async () => {
    if (!bulkCourseId || bulkSelected.size === 0) return;
    setBulkLoading(true);
    try {
      const results: ManualEnrollment[] = [];
      for (const userId of bulkSelected) {
        if (!enrollmentService.isEnrolled(bulkCourseId, userId, enrollments)) {
          const record = await enrollmentService.enroll(bulkCourseId, userId, currentUser.id);
          results.push(record);
        }
      }
      if (results.length > 0) {
        const newEnrollments = [
          ...enrollments.filter((e) => !(e.courseId === bulkCourseId && bulkSelected.has(e.userId))),
          ...results,
        ];
        onEnrollmentsChange(newEnrollments);
      }
      setBulkSelected(new Set());
    } finally { setBulkLoading(false); }
  };

  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={28} sx={{ color: '#1E7A34' }} />
        <Typography sx={{ ml: 2, color: '#64748B', alignSelf: 'center' }}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>มอบหมายคอร์สเรียน</Typography>
        <Typography variant="caption" color="text.secondary">กำหนดหรือยกเลิกการลงทะเบียนคอร์สให้ผู้ใช้</Typography>
      </Box>

      <Tabs value={mode} onChange={(_, v) => setMode(v)} sx={{ mb: 3, borderBottom: '1px solid #E2E8F0' }}>
        <Tab icon={<UserCheck size={14} />} iconPosition="start" label="รายคน" />
        <Tab icon={<Zap size={14} />} iconPosition="start" label="มอบหมายกลุ่ม (Bulk)" />
      </Tabs>

      {/* ══════════ Individual mode ══════════ */}
      {mode === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3, alignItems: 'start' }}>
          {/* User list */}
          <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 1.5 }}>เลือกผู้ใช้</Typography>
              <TextField fullWidth size="small" placeholder="ค้นหาชื่อ/อีเมล..."
                value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={14} color="#64748B" /></InputAdornment> } }} />
            </Box>
            <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">ไม่พบผู้ใช้</Typography></Box>
              ) : filteredUsers.map((user: User) => {
                const enrollCount = enrollments.filter((e) => e.userId === user.id).length;
                const avatarColor = AVATAR_COLORS[user.fullnameThai.charCodeAt(0) % AVATAR_COLORS.length];
                const isSelected = selectedUser?.id === user.id;
                return (
                  <Box key={user.id} onClick={() => setSelectedUser(isSelected ? null : user)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer', backgroundColor: isSelected ? '#E8F5E9' : 'transparent', borderLeft: isSelected ? '3px solid #1E7A34' : '3px solid transparent', transition: 'all 0.12s', '&:hover': { backgroundColor: isSelected ? '#E8F5E9' : '#F8FAFC' } }}>
                    <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, backgroundColor: user.isActive ? avatarColor : '#CBD5E1', flexShrink: 0 }}>{user.fullnameThai[0]}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.825rem', lineHeight: 1.2 }}>{user.fullnameThai}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.department} · {enrollCount > 0 ? `${enrollCount} คอร์ส` : 'ยังไม่มี'}
                      </Typography>
                    </Box>
                    {isSelected && <CheckCircle size={14} color="#1E7A34" />}
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* Course panel */}
          {!selectedUser ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, border: '1px dashed #E2E8F0', borderRadius: 2 }}>
              <UserCheck size={36} color="#CBD5E1" />
              <Typography color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>เลือกผู้ใช้ทางซ้ายเพื่อจัดการคอร์ส</Typography>
            </Box>
          ) : (
            <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 38, height: 38, fontSize: '0.9rem', fontWeight: 700, backgroundColor: '#1E7A34' }}>{selectedUser.fullnameThai[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedUser.fullnameThai}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedUser.email} · {roleLabel[selectedUser.role]}</Typography>
                </Box>
                <Chip label={selectedUser.department} size="small" sx={{ backgroundColor: '#E8F5E9', color: '#1E7A34', fontWeight: 600, fontSize: '0.7rem' }} />
              </Box>
              <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9' }}>
                <TextField fullWidth size="small" placeholder="ค้นหาคอร์ส..."
                  value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={14} color="#64748B" /></InputAdornment> } }} />
              </Box>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {filteredCourses.map((course: Course, idx: number) => {
                  const isManuallyEnrolled = enrollmentService.isEnrolled(course.id, selectedUser.id, enrollments);
                  const progressStatus = getCourseEnrollStatus(course, selectedUser.id, allProgress);
                  const hasGroupAccess = course.allowedGroups.length === 0 || course.allowedGroups.includes(selectedUser.department);
                  const isProcessing = loading === course.id;
                  return (
                    <Box key={course.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.75 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}>
                          <Box component="img" src={course.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.825rem', lineHeight: 1.3 }}>{course.title}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary">{course.category}</Typography>
                            {hasGroupAccess && <Chip label="กลุ่มเข้าได้" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#F0FDF4', color: '#059669', '& .MuiChip-label': { px: 0.75 } }} />}
                            {isManuallyEnrolled && <Chip label="ลงทะเบียนแล้ว" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', '& .MuiChip-label': { px: 0.75 } }} />}
                            {progressStatus !== 'not_started' && <Chip label={progressStatus === 'passed' ? 'สอบผ่าน' : 'กำลังเรียน'} size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: progressStatus === 'passed' ? '#ECFDF5' : '#E8F5E9', color: progressStatus === 'passed' ? '#059669' : '#1E7A34', '& .MuiChip-label': { px: 0.75 } }} />}
                          </Box>
                        </Box>
                        {isProcessing ? (
                          <Box sx={{ width: 80 }}><LinearProgress sx={{ height: 3, borderRadius: 9999 }} /></Box>
                        ) : isManuallyEnrolled ? (
                          <Tooltip title="ยกเลิกการลงทะเบียน">
                            <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => handleUnenroll(course.id)}><UserX size={15} /></IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={hasGroupAccess ? 'เพิ่มการลงทะเบียน' : 'ลงทะเบียน'}>
                            <Button size="small" variant={hasGroupAccess ? 'outlined' : 'contained'} disableElevation startIcon={<BookOpen size={13} />} onClick={() => handleEnroll(course.id)}
                              sx={hasGroupAccess ? { fontSize: '0.72rem', py: 0.4, color: '#1E7A34', borderColor: '#1E7A34' } : { fontSize: '0.72rem', py: 0.4, backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
                              มอบหมาย
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                      {idx < filteredCourses.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFAFA', display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ลงทะเบียน manual</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E7A34', lineHeight: 1.2 }}>
                    {enrollments.filter((e) => e.userId === selectedUser.id).length}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="caption" color="text.secondary">เข้าได้ผ่านกลุ่ม</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#D97706', lineHeight: 1.2 }}>
                    {publishedCourses.filter((c: Course) => c.allowedGroups.length === 0 || c.allowedGroups.includes(selectedUser.department)).length}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* ══════════ Bulk mode ══════════ */}
      {mode === 1 && (
        <Box>
          {/* Step 1: Course selector */}
          <Box sx={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 2, color: '#0F172A' }}>ขั้นที่ 1 — เลือกคอร์สที่ต้องการมอบหมาย</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel>เลือกคอร์ส</InputLabel>
                <Select value={bulkCourseId} label="เลือกคอร์ส" onChange={(e) => { setBulkCourseId(e.target.value); setBulkSelected(new Set()); }}>
                  {publishedCourses.map((c: Course) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>กรองกลุ่ม</InputLabel>
                <Select value={bulkGroup} label="กรองกลุ่ม" onChange={(e) => { setBulkGroup(e.target.value); setBulkSelected(new Set()); }}>
                  {groups.map((g) => <MenuItem key={g} value={g}>{g === 'all' ? 'ทุกกลุ่ม' : g}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            {selectedBulkCourse && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#F0FDF4', borderRadius: 2 }}>
                <Box component="img" src={selectedBulkCourse.image} alt="" sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: 'cover' }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>{selectedBulkCourse.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedBulkCourse.category} · {selectedBulkCourse.duration}</Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Step 2: User checkboxes */}
          {bulkCourseId && (
            <Box sx={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                  ขั้นที่ 2 — เลือกผู้ใช้ ({bulkSelected.size}/{bulkFilteredUsers.length} คน)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={selectAllBulk} sx={{ fontSize: '0.75rem', color: '#1E7A34' }}>เลือกทั้งหมด</Button>
                  <Button size="small" onClick={clearBulkSelection} sx={{ fontSize: '0.75rem', color: '#64748B' }}>ล้าง</Button>
                </Box>
              </Box>
              <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                {bulkFilteredUsers.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">ไม่มีผู้ใช้ในกลุ่มนี้</Typography></Box>
                ) : bulkFilteredUsers.map((user: User, idx: number) => {
                  const alreadyEnrolled = enrollmentService.isEnrolled(bulkCourseId, user.id, enrollments);
                  const isChecked = bulkSelected.has(user.id);
                  const avatarColor = AVATAR_COLORS[user.fullnameThai.charCodeAt(0) % AVATAR_COLORS.length];
                  return (
                    <Box key={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, opacity: alreadyEnrolled ? 0.5 : 1, cursor: alreadyEnrolled ? 'default' : 'pointer', '&:hover': { backgroundColor: alreadyEnrolled ? 'transparent' : '#F8FAFC' } }}
                        onClick={() => !alreadyEnrolled && toggleBulkUser(user.id)}>
                        <Checkbox size="small" checked={isChecked} disabled={alreadyEnrolled}
                          sx={{ p: 0.5, color: '#94A3B8', '&.Mui-checked': { color: '#1E7A34' } }} />
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', fontWeight: 700, backgroundColor: avatarColor, flexShrink: 0 }}>{user.fullnameThai[0]}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.825rem', lineHeight: 1.2 }}>{user.fullnameThai}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.department} · {user.employeeId}</Typography>
                        </Box>
                        {alreadyEnrolled && <Chip label="ลงทะเบียนแล้ว" size="small" sx={{ height: 18, fontSize: '0.62rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', '& .MuiChip-label': { px: 0.75 } }} />}
                      </Box>
                      {idx < bulkFilteredUsers.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Step 3: Assign button */}
          {bulkCourseId && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="contained" disableElevation size="large" startIcon={bulkLoading ? <CircularProgress size={15} color="inherit" /> : <Users size={16} />}
                disabled={bulkSelected.size === 0 || bulkLoading}
                onClick={handleBulkAssign}
                sx={{ backgroundColor: '#1E7A34', px: 3, '&:hover': { backgroundColor: '#155724' }, '&:disabled': { backgroundColor: '#E2E8F0' } }}>
                {bulkLoading ? 'กำลังมอบหมาย...' : `มอบหมายให้ ${bulkSelected.size} คน`}
              </Button>
              {bulkSelected.size > 0 && (
                <Typography variant="caption" color="text.secondary">
                  คอร์ส: {selectedBulkCourse?.title}
                </Typography>
              )}
            </Box>
          )}
          {!bulkCourseId && (
            <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed #E2E8F0', borderRadius: 2 }}>
              <Lock size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <Typography color="text.secondary" fontSize="0.875rem">เลือกคอร์สก่อนเพื่อดูรายชื่อผู้ใช้</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}