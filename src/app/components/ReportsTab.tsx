import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Paper,
  Chip, Avatar, LinearProgress, Alert, Select, MenuItem,
  FormControl, InputLabel, Tooltip, IconButton, CircularProgress,
} from '@mui/material';
import { Download, FileText, Users, TrendingUp, CheckCircle, Award } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { userService, courseService } from '../services';
import { Certificate, Course, CourseProgress, User } from '../data/types';
import {
  getCourseEnrollStatus,
  getCourseProgressPercent,
  getCompletedLessons,
  getTotalLessons,
  getBestFinalExamScore,
} from '../utils/helpers';

interface ReportsTabProps {
  allProgress: CourseProgress[];
  certificates: Certificate[];
  managedGroups: string[];
  onViewCertificate: (cert: Certificate) => void;
}

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

const PIE_COLORS = ['#E2E8F0', '#D97706', '#059669'];

export function ReportsTab({ allProgress, certificates, managedGroups, onViewCertificate }: ReportsTabProps) {
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userService.getAll(), courseService.getAll()]).then(([users, courses]) => {
      setAllUsers(users);
      setAllCourses(courses);
      setLoading(false);
    });
  }, []);

  const learners = allUsers.filter((u: User) => u.role === 'learner');
  const publishedCourses = allCourses.filter((c: Course) => c.status === 'published');
  const groups = ['all', ...managedGroups];
  const filteredLearners = learners.filter((u: User) => filterGroup === 'all' || u.group === filterGroup);

  // Summary stats across filtered learners × all published courses
  const summaryStats = filteredLearners.reduce(
    (acc, user: User) => {
      publishedCourses.forEach((course: Course) => {
        const s = getCourseEnrollStatus(course, user.id, allProgress);
        if (s === 'passed') acc.passed++;
        else if (s === 'in_progress' || s === 'completed' || s === 'failed') acc.inProgress++;
        else acc.notStarted++;
      });
      return acc;
    },
    { passed: 0, inProgress: 0, notStarted: 0 }
  );
  const totalCerts = certificates.filter((c: Certificate) => filteredLearners.some((u: User) => u.id === c.userId)).length;
  const pieData = [
    { name: 'ยังไม่เริ่ม', value: summaryStats.notStarted },
    { name: 'กำลังเรียน', value: summaryStats.inProgress },
    { name: 'สอบผ่าน', value: summaryStats.passed },
  ].filter((d) => d.value > 0);

  const allRows = filteredLearners.flatMap((user: User) =>
    publishedCourses
      .filter((c: Course) => filterCourse === 'all' || c.id === filterCourse)
      .map((course: Course) => ({ user, course }))
  );
  const pagedRows = allRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportCSV = () => {
    const headers = ['ชื่อ', 'อีเมล', 'รหัสพนักงาน', 'กลุ่ม', 'คอร์ส', 'สถานะ', 'ความคืบหน้า', 'คะแนนสูงสุด', 'ใบประกาศ'];
    const rows: string[][] = [];
    filteredLearners.forEach((user: User) => {
      publishedCourses
        .filter((c: Course) => filterCourse === 'all' || c.id === filterCourse)
        .forEach((course: Course) => {
          const status = getCourseEnrollStatus(course, user.id, allProgress);
          if (status === 'not_started') return;
          const progress = getCourseProgressPercent(course, user.id, allProgress);
          const score = getBestFinalExamScore(course.id, user.id, allProgress);
          const cert = certificates.find((c: Certificate) => c.courseId === course.id && c.userId === user.id);
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
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
        <CircularProgress size={28} sx={{ color: '#1E7A34' }} />
        <Typography sx={{ ml: 2, color: '#64748B' }}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>รายงานความคืบหน้าผู้เรียน</Typography>
        <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCSV}>ส่งออก CSV</Button>
      </Box>

      {/* ── Summary stat cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, mb: 3 }}>
        {[
          { value: filteredLearners.length, label: 'ผู้เรียนทั้งหมด', icon: <Users size={16} color="#1E7A34" />, bg: '#F0FDF4', border: '#D1FAE5', num: '#0F3D1A' },
          { value: summaryStats.inProgress, label: 'กำลังเรียน',      icon: <TrendingUp size={16} color="#D97706" />, bg: '#FFFBEB', border: '#FDE68A', num: '#92400E' },
          { value: summaryStats.passed,     label: 'สอบผ่านแล้ว',     icon: <CheckCircle size={16} color="#059669" />, bg: '#ECFDF5', border: '#A7F3D0', num: '#065F46' },
          { value: totalCerts,              label: 'ใบประกาศทั้งหมด', icon: <Award size={16} color="#B45309" />,      bg: '#FFFBEB', border: '#FDE68A', num: '#78350F' },
        ].map((s) => (
          <Box key={s.label} sx={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, p: 2.25 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              {s.icon}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: s.num, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, mt: 0.4 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Pie chart + filters row ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3, mb: 3 }}>
        {/* Pie */}
        <Box sx={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5 }}>สัดส่วนสถานะ</Typography>
          {pieData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: '#CBD5E1', fontSize: '0.8rem' }}>ไม่มีข้อมูล</Box>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>กรองข้อมูล</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>กลุ่ม</InputLabel>
              <Select value={filterGroup} label="กลุ่ม" onChange={(e) => { setFilterGroup(e.target.value); setPage(0); }}>
                {groups.map((g) => <MenuItem key={g} value={g}>{g === 'all' ? 'ทุกกลุ่ม' : g}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>คอร์ส</InputLabel>
              <Select value={filterCourse} label="คอร์ส" onChange={(e) => { setFilterCourse(e.target.value); setPage(0); }}>
                <MenuItem value="all">ทุกคอร์ส</MenuItem>
                {publishedCourses.map((c: Course) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          {/* Pass rate per course mini bars */}
          <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {publishedCourses.slice(0, 5).map((course: Course) => {
              const passed = filteredLearners.filter((u: User) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
              const rate = filteredLearners.length > 0 ? Math.round((passed / filteredLearners.length) * 100) : 0;
              return (
                <Box key={course.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" sx={{ color: '#475569', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: rate >= 70 ? '#059669' : '#B45309', ml: 1 }}>{rate}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={rate} sx={{ height: 4, borderRadius: 9999, backgroundColor: '#F1F5F9', '& .MuiLinearProgress-bar': { backgroundColor: rate >= 70 ? '#059669' : '#B45309', borderRadius: 9999 } }} />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── Table ── */}
      <TableContainer component={Paper} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>ผู้เรียน</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>กลุ่ม</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>คอร์ส</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>ความคืบหน้า</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>สถานะ</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>คะแนนสอบ</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 700 }}>ใบประกาศ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="text.secondary" fontSize="0.875rem">ไม่พบข้อมูล</Typography>
                </TableCell>
              </TableRow>
            ) : pagedRows.map(({ user, course }: { user: User; course: Course }) => {
              const status = getCourseEnrollStatus(course, user.id, allProgress);
              const progress = getCourseProgressPercent(course, user.id, allProgress);
              const completed = getCompletedLessons(course, user.id, allProgress);
              const total = getTotalLessons(course);
              const score = getBestFinalExamScore(course.id, user.id, allProgress);
              const cert = certificates.find((c: Certificate) => c.courseId === course.id && c.userId === user.id);
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
                      <LinearProgress variant="determinate" value={progress} aria-label={`ความคืบหน้า ${progress}%`}
                        sx={{ height: 4, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: '#1E7A34', borderRadius: 9999 } }} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={statusTh[status]} size="small" sx={{ fontSize: '0.7rem', ...(statusChipSx[status] ?? {}) }} />
                  </TableCell>
                  <TableCell>
                    {score !== null
                      ? <Typography variant="body2" sx={{ fontWeight: 700, color: score >= (course.finalExam?.passingScore ?? 80) ? '#059669' : '#d4183d' }}>{score}%</Typography>
                      : <Typography variant="caption" color="text.secondary">-</Typography>}
                  </TableCell>
                  <TableCell>
                    {cert ? (
                      <Tooltip title={cert.certificateNo}>
                        <IconButton size="small" aria-label={`ดูใบประกาศ ${cert.certificateNo}`} sx={{ color: '#B45309' }} onClick={() => onViewCertificate(cert)}>
                          <FileText size={14} />
                        </IconButton>
                      </Tooltip>
                    ) : <Typography variant="caption" color="text.secondary">-</Typography>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div" count={allRows.length} page={page} rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="แถวต่อหน้า"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
        sx={{ borderTop: '1px solid #E2E8F0' }}
      />
      <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
        ทั้งหมด {allRows.length} รายการ ({filteredLearners.length} ผู้เรียน × {filterCourse === 'all' ? publishedCourses.length : 1} คอร์ส)
      </Alert>
    </Box>
  );
}