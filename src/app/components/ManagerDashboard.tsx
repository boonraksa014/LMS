import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Button, Tabs, Tab, Tooltip as MuiTooltip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Users, CheckCircle, TrendingUp, Award, Download, BarChart3 } from 'lucide-react';
import { userService, courseService } from '../services';
import { Certificate, Course, CourseProgress, User } from '../data/types';
import { getCourseEnrollStatus, getCourseProgressPercent, getBestFinalExamScore } from '../utils/helpers';

interface ManagerDashboardProps {
  currentUser: User;
  allProgress: CourseProgress[];
  certificates: Certificate[];
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
  in_progress: { backgroundColor: '#E8F5E9', color: '#155225' },
  completed: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  passed: { backgroundColor: '#ECFDF5', color: '#065F46' },
  failed: { backgroundColor: '#FEF2F2', color: '#991B1B' },
};

export function ManagerDashboard({ currentUser, allProgress, certificates, onViewCertificate }: ManagerDashboardProps) {
  const [tab, setTab] = useState(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    Promise.all([userService.getAll(), courseService.getAll()]).then(([users, courses]) => {
      setAllUsers(users);
      setAllCourses(courses);
    });
  }, []);

  const teamMembers = allUsers.filter((u: User) => u.role === 'learner' && u.group === currentUser.group);
  const publishedCourses = allCourses.filter((c: Course) => c.status === 'published');

  const teamStats = teamMembers.reduce(
    (acc: { totalPassed: number; totalInProgress: number; totalCerts: number }, user: User) => {
      const passed = publishedCourses.filter((c: Course) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length;
      const inProg = publishedCourses.filter((c: Course) => {
        const s = getCourseEnrollStatus(c, user.id, allProgress);
        return s === 'in_progress' || s === 'completed' || s === 'failed';
      }).length;
      acc.totalPassed += passed;
      acc.totalInProgress += inProg;
      acc.totalCerts += certificates.filter((c: Certificate) => c.userId === user.id).length;
      return acc;
    },
    { totalPassed: 0, totalInProgress: 0, totalCerts: 0 }
  );

  const overallCompletion = teamMembers.length > 0 && publishedCourses.length > 0
    ? Math.round((teamStats.totalPassed / (teamMembers.length * publishedCourses.length)) * 100)
    : 0;

  const summaryItems = [
    { label: 'สมาชิก', value: teamMembers.length, icon: <Users size={15} />, color: '#1E7A34' },
    { label: 'กำลังเรียน', value: teamStats.totalInProgress, icon: <TrendingUp size={15} />, color: '#D97706' },
    { label: 'สอบผ่าน', value: teamStats.totalPassed, icon: <CheckCircle size={15} />, color: '#059669' },
    { label: 'ใบประกาศ', value: teamStats.totalCerts, icon: <Award size={15} />, color: '#1E7A34' },
  ];

  const barData = publishedCourses.map((course: Course, idx: number) => {
    const passed = teamMembers.filter((u: User) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
    const inProg = teamMembers.filter((u: User) => {
      const s = getCourseEnrollStatus(course, u.id, allProgress);
      return s === 'in_progress' || s === 'completed' || s === 'failed';
    }).length;
    const notStarted = teamMembers.length - passed - inProg;
    const shortTitle = course.title.length > 14 ? course.title.slice(0, 12) + '…' : course.title;
    return { name: `${idx + 1}. ${shortTitle}`, สอบผ่าน: passed, กำลังเรียน: inProg, ยังไม่เริ่ม: notStarted };
  });

  const exportCSV = () => {
    const headers = ['ชื่อพนักงาน', 'รหัส', 'คอร์ส', 'สถานะ', 'คะแนน', 'ใบประกาศ'];
    const rows: string[][] = [];
    teamMembers.forEach((u: User) => {
      publishedCourses.forEach((c: Course) => {
        const status = getCourseEnrollStatus(c, u.id, allProgress);
        const score = getBestFinalExamScore(c.id, u.id, allProgress);
        const cert = certificates.find((x: Certificate) => x.courseId === c.id && x.userId === u.id);
        rows.push([u.name, u.employeeId, c.title, statusTh[status], score !== null ? `${score}%` : '-', cert ? cert.certificateNo : '-']);
      });
    });
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${x}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_${currentUser.group}_report.csv`;
    a.click();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ backgroundColor: '#0F3D1A', borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(30,122,52,0.15)' }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              รายงานทีม: {currentUser.group}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.5, fontSize: '0.875rem' }}>
              สมาชิก {teamMembers.length} คน · {publishedCourses.length} คอร์ส
            </Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<Download size={14} />} onClick={exportCSV}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.08)' } }}>
            ส่งออก CSV
          </Button>
        </Box>
      </Box>

      {/* Summary strip */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 4, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 3, backgroundColor: '#ffffff', overflow: 'hidden' }}>
        {summaryItems.map((stat, idx) => (
          <Box key={stat.label} sx={{ flex: '1 1 25%', px: { xs: 2, md: 3 }, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderRight: idx < summaryItems.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
            <Box sx={{ color: stat.color, flexShrink: 0 }} aria-hidden="true">{stat.icon}</Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A', lineHeight: 1.1 }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#717182', fontWeight: 500, mt: 0.25 }}>{stat.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #E2E8F0' }}>
        <Tab icon={<BarChart3 size={15} />} iconPosition="start" label="กราฟ KPI" />
        <Tab icon={<Users size={15} />} iconPosition="start" label="ตารางสมาชิก" />
      </Tabs>

      {/* Tab 0: Charts */}
      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#0F172A' }}>ความคืบหน้าทีมแยกตามคอร์ส</Typography>
              {teamMembers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary" fontSize="0.875rem">ไม่มีสมาชิกในทีม</Typography></Box>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: 'rgba(30,122,52,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="สอบผ่าน" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="กำลังเรียน" fill="#D97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ยังไม่เริ่ม" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0F172A' }}>อัตราผ่านโดยรวม</Typography>
              <Box sx={{ py: 3 }}>
                <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: '#059669', lineHeight: 1, mb: 0.5 }}>{overallCompletion}%</Typography>
                <Typography variant="body2" sx={{ color: '#717182', mb: 2 }}>ของทีมสอบผ่านแล้ว</Typography>
                <LinearProgress variant="determinate" value={overallCompletion} aria-label={`อัตราผ่านโดยรวม ${overallCompletion}%`}
                  sx={{ height: 8, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: '#059669', borderRadius: 9999 } }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                {publishedCourses.map((course: Course) => {
                  const passed = teamMembers.filter((u: User) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
                  const rate = teamMembers.length > 0 ? Math.round((passed / teamMembers.length) * 100) : 0;
                  return (
                    <Box key={course.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <MuiTooltip title={course.title} placement="top">
                          <Typography variant="caption" sx={{ color: '#475569', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</Typography>
                        </MuiTooltip>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: rate >= 70 ? '#059669' : '#B45309' }}>{rate}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={rate}
                        sx={{ height: 5, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: rate >= 70 ? '#059669' : '#B45309', borderRadius: 9999 } }} />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 1: Matrix table */}
      {tab === 1 && (
        <Box>
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Users size={48} color="#CBD5E1" />
                <Typography color="text.secondary" sx={{ mt: 2 }}>ไม่มีสมาชิกในทีม {currentUser.group}</Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 160 }}>ชื่อพนักงาน</TableCell>
                    {publishedCourses.map((c: Course) => (
                      <TableCell key={c.id} sx={{ minWidth: 130 }}>
                        <Typography variant="caption" sx={{ display: 'block', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>{c.title}</Typography>
                      </TableCell>
                    ))}
                    <TableCell sx={{ minWidth: 90 }}>ใบประกาศ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((user: User) => {
                    const userCerts = certificates.filter((c: Certificate) => c.userId === user.id);
                    return (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', backgroundColor: '#1E7A34' }}>{user.name[0]}</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{user.employeeId}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {publishedCourses.map((course: Course) => {
                          const status = getCourseEnrollStatus(course, user.id, allProgress);
                          const progress = getCourseProgressPercent(course, user.id, allProgress);
                          const score = getBestFinalExamScore(course.id, user.id, allProgress);
                          return (
                            <TableCell key={course.id}>
                              <Box>
                                <Chip label={statusTh[status]} size="small" sx={{ fontSize: '0.65rem', height: 20, mb: 0.5, ...(statusChipSx[status] ?? {}) }} />
                                {progress > 0 && (
                                  <LinearProgress variant="determinate" value={progress}
                                    sx={{ height: 4, width: 80, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: status === 'passed' ? '#059669' : '#1E7A34', borderRadius: 9999 } }} />
                                )}
                                {score !== null && (
                                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: score >= (course.finalExam?.passingScore ?? 80) ? '#059669' : '#d4183d' }}>{score}%</Typography>
                                )}
                              </Box>
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          {userCerts.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {userCerts.map((cert: Certificate) => (
                                <Chip key={cert.id} label={`${cert.score}%`} size="small" icon={<Award size={10} />} onClick={() => onViewCertificate(cert)}
                                  sx={{ backgroundColor: '#FFFBEB', color: '#B45309', fontSize: '0.65rem', cursor: 'pointer', height: 20 }} />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}