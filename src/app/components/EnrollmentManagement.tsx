import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  LinearProgress,
} from '@mui/material';
import { Search, UserCheck, UserX, BookOpen, CheckCircle, Lock } from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses as staticCourses } from '../data/courses';
import { User, CourseProgress } from '../data/types';
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
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  manager: 'Manager',
  learner: 'ผู้เรียน',
};

export function EnrollmentManagement({ currentUser, allProgress, enrollments, onEnrollmentsChange }: EnrollmentManagementProps) {
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const learners = mockUsers.filter((u) => u.role === 'learner' || u.role === 'manager');
  const publishedCourses = staticCourses.filter((c) => c.status === 'published');

  const filteredUsers = learners.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCourses = publishedCourses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleEnroll = useCallback(async (courseId: string) => {
    if (!selectedUser) return;
    setLoading(courseId);
    try {
      const record = await enrollmentService.enroll(courseId, selectedUser.id, currentUser.id);
      onEnrollmentsChange([...enrollments.filter((e) => !(e.courseId === courseId && e.userId === selectedUser.id)), record]);
    } finally {
      setLoading(null);
    }
  }, [selectedUser, currentUser.id, enrollments, onEnrollmentsChange]);

  const handleUnenroll = useCallback(async (courseId: string) => {
    if (!selectedUser) return;
    setLoading(courseId);
    try {
      await enrollmentService.unenroll(courseId, selectedUser.id);
      onEnrollmentsChange(enrollments.filter((e) => !(e.courseId === courseId && e.userId === selectedUser.id)));
    } finally {
      setLoading(null);
    }
  }, [selectedUser, enrollments, onEnrollmentsChange]);

  // Reset course search when user changes
  useEffect(() => { setCourseSearch(''); }, [selectedUser]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการการลงทะเบียนเรียน</Typography>
        <Typography variant="caption" color="text.secondary">
          เลือกผู้ใช้เพื่อกำหนดหรือยกเลิกการลงทะเบียนคอร์ส
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3, alignItems: 'start' }}>
        {/* Left: User list */}
        <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 1.5 }}>เลือกผู้ใช้</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="ค้นหาชื่อ/อีเมล..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={14} color="#64748B" /></InputAdornment> } }}
            />
          </Box>
          <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">ไม่พบผู้ใช้</Typography>
              </Box>
            ) : (
              filteredUsers.map((user) => {
                const enrollCount = enrollments.filter((e) => e.userId === user.id).length;
                const avatarColor = AVATAR_COLORS[user.name.charCodeAt(0) % AVATAR_COLORS.length];
                const isSelected = selectedUser?.id === user.id;
                return (
                  <Box
                    key={user.id}
                    onClick={() => setSelectedUser(isSelected ? null : user)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer',
                      backgroundColor: isSelected ? '#E8F5E9' : 'transparent',
                      borderLeft: isSelected ? '3px solid #1E7A34' : '3px solid transparent',
                      transition: 'all 0.12s',
                      '&:hover': { backgroundColor: isSelected ? '#E8F5E9' : '#F8FAFC' },
                    }}
                  >
                    <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, backgroundColor: user.active ? avatarColor : '#CBD5E1', flexShrink: 0 }}>
                      {user.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.825rem', lineHeight: 1.2 }}>{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.group} · {enrollCount > 0 ? `${enrollCount} คอร์ส` : 'ยังไม่มี'}
                      </Typography>
                    </Box>
                    {isSelected && <CheckCircle size={14} color="#1E7A34" />}
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>

        {/* Right: Course enrollment */}
        {!selectedUser ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, border: '1px dashed #E2E8F0', borderRadius: 2 }}>
            <UserCheck size={36} color="#CBD5E1" />
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>เลือกผู้ใช้ทางซ้ายเพื่อจัดการคอร์ส</Typography>
          </Box>
        ) : (
          <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
            {/* Selected user header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 38, height: 38, fontSize: '0.9rem', fontWeight: 700, backgroundColor: '#1E7A34' }}>
                {selectedUser.name[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedUser.name}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedUser.email} · {roleLabel[selectedUser.role]}</Typography>
              </Box>
              <Chip label={selectedUser.group} size="small" sx={{ backgroundColor: '#E8F5E9', color: '#1E7A34', fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>

            {/* Course search */}
            <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="ค้นหาคอร์ส..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={14} color="#64748B" /></InputAdornment> } }}
              />
            </Box>

            {/* Course list */}
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredCourses.map((course, idx) => {
                const isManuallyEnrolled = enrollmentService.isEnrolled(course.id, selectedUser.id, enrollments);
                const progressStatus = getCourseEnrollStatus(course, selectedUser.id, allProgress);
                const hasGroupAccess = course.allowedGroups.length === 0 || course.allowedGroups.includes(selectedUser.group);
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
                          {hasGroupAccess && (
                            <Chip label="กลุ่มเข้าได้" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#F0FDF4', color: '#059669', '& .MuiChip-label': { px: 0.75 } }} />
                          )}
                          {isManuallyEnrolled && (
                            <Chip label="ลงทะเบียนแล้ว" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', '& .MuiChip-label': { px: 0.75 } }} />
                          )}
                          {progressStatus !== 'not_started' && (
                            <Chip label={progressStatus === 'passed' ? 'สอบผ่าน' : 'กำลังเรียน'} size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: progressStatus === 'passed' ? '#ECFDF5' : '#E8F5E9', color: progressStatus === 'passed' ? '#059669' : '#1E7A34', '& .MuiChip-label': { px: 0.75 } }} />
                          )}
                        </Box>
                      </Box>

                      {isProcessing ? (
                        <Box sx={{ width: 80 }}>
                          <LinearProgress sx={{ height: 3, borderRadius: 9999 }} />
                        </Box>
                      ) : isManuallyEnrolled ? (
                        <Tooltip title="ยกเลิกการลงทะเบียน">
                          <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => handleUnenroll(course.id)}>
                            <UserX size={15} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={hasGroupAccess ? 'เพิ่มการลงทะเบียน (กลุ่มเข้าได้อยู่แล้ว)' : 'ลงทะเบียน'}>
                          <Button
                            size="small"
                            variant={hasGroupAccess ? 'outlined' : 'contained'}
                            disableElevation
                            startIcon={<BookOpen size={13} />}
                            onClick={() => handleEnroll(course.id)}
                            sx={hasGroupAccess ? { fontSize: '0.72rem', py: 0.4, color: '#1E7A34', borderColor: '#1E7A34' } : { fontSize: '0.72rem', py: 0.4, backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
                          >
                            ลงทะเบียน
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                    {idx < filteredCourses.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Box>

            {/* Summary */}
            <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFAFA', display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">ลงทะเบียนแบบ manual</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E7A34', lineHeight: 1.2 }}>
                  {enrollments.filter((e) => e.userId === selectedUser.id).length}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" color="text.secondary">เข้าได้ผ่านกลุ่ม</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#D97706', lineHeight: 1.2 }}>
                  {publishedCourses.filter((c) => c.allowedGroups.length === 0 || c.allowedGroups.includes(selectedUser.group)).length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}