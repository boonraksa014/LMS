import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Download, FileText } from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses as staticCourses } from '../data/courses';
import { Certificate, CourseProgress } from '../data/types';
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

export function ReportsTab({ allProgress, certificates, managedGroups, onViewCertificate }: ReportsTabProps) {
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const learners = mockUsers.filter((u) => u.role === 'learner');
  const publishedCourses = staticCourses.filter((c) => c.status === 'published');
  const groups = ['all', ...managedGroups];
  const filteredLearners = learners.filter((u) => filterGroup === 'all' || u.group === filterGroup);

  const allRows = filteredLearners.flatMap((user) =>
    publishedCourses
      .filter((c) => filterCourse === 'all' || c.id === filterCourse)
      .map((course) => ({ user, course }))
  );
  const pagedRows = allRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>รายงานความคืบหน้าผู้เรียน</Typography>
        <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCSV}>ส่งออก CSV</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>กลุ่ม</InputLabel>
          <Select value={filterGroup} label="กลุ่ม" onChange={(e) => setFilterGroup(e.target.value)}>
            {groups.map((g) => <MenuItem key={g} value={g} onClick={() => setPage(0)}>{g === 'all' ? 'ทุกกลุ่ม' : g}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>คอร์ส</InputLabel>
          <Select value={filterCourse} label="คอร์ส" onChange={(e) => setFilterCourse(e.target.value)}>
            <MenuItem key="all" value="all" onClick={() => setPage(0)}>ทุกคอร์ส</MenuItem>
            {publishedCourses.map((c) => <MenuItem key={c.id} value={c.id} onClick={() => setPage(0)}>{c.title}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell scope="col">ผู้เรียน</TableCell>
              <TableCell scope="col">กลุ่ม</TableCell>
              <TableCell scope="col">คอร์ส</TableCell>
              <TableCell scope="col">ความคืบหน้า</TableCell>
              <TableCell scope="col">สถานะ</TableCell>
              <TableCell scope="col">คะแนนสอบปลายภาค</TableCell>
              <TableCell scope="col">ใบประกาศ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="text.secondary" fontSize="0.875rem">ไม่พบข้อมูล</Typography>
                </TableCell>
              </TableRow>
            ) : pagedRows.map(({ user, course }) => {
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
                      <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ minWidth: 110 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">{completed}/{total}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        aria-label={`ความคืบหน้า ${progress}%`}
                        sx={{ height: 4, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: '#1E7A34', borderRadius: 9999 } }}
                      />
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
        component="div"
        count={allRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="แถวต่อหน้า"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
        sx={{ borderTop: '1px solid #E2E8F0' }}
      />
      <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
        ทั้งหมด {allRows.length} รายการ ({filteredLearners.length} ผู้เรียน × {filterCourse === 'all' ? publishedCourses.length : 1} คอร์ส)
      </Alert>
    </Box>
  );
}