import { useState } from 'react';
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
  LinearProgress,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Users, CheckCircle, TrendingUp, Award, Download, BarChart3 } from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses } from '../data/courses';
import { Certificate, CourseProgress, User } from '../data/types';
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

const statusChipColor: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  not_started: 'default',
  in_progress: 'primary',
  completed: 'warning',
  passed: 'success',
  failed: 'error',
};

export function ManagerDashboard({ currentUser, allProgress, certificates, onViewCertificate }: ManagerDashboardProps) {
  const [tab, setTab] = useState(0);
  const teamMembers = mockUsers.filter((u) => u.role === 'learner' && u.group === currentUser.group);
  const publishedCourses = courses.filter((c) => c.status === 'published');

  const teamStats = teamMembers.reduce(
    (acc, user) => {
      const passed = publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length;
      const inProg = publishedCourses.filter((c) => {
        const s = getCourseEnrollStatus(c, user.id, allProgress);
        return s === 'in_progress' || s === 'completed' || s === 'failed';
      }).length;
      acc.totalPassed += passed;
      acc.totalInProgress += inProg;
      acc.totalCerts += certificates.filter((c) => c.userId === user.id).length;
      return acc;
    },
    { totalPassed: 0, totalInProgress: 0, totalCerts: 0 }
  );

  const overallCompletion = teamMembers.length > 0 && publishedCourses.length > 0
    ? Math.round((teamStats.totalPassed / (teamMembers.length * publishedCourses.length)) * 100)
    : 0;

  const statCards = [
    { label: 'สมาชิกทีม', value: teamMembers.length, icon: <Users size={20} />, gradient: 'linear-gradient(135deg,#1E7A34,#43A047)', shadow: 'rgba(30,122,52,0.35)' },
    { label: 'กำลังเรียน', value: teamStats.totalInProgress, icon: <TrendingUp size={20} />, gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', shadow: 'rgba(245,158,11,0.35)' },
    { label: 'สอบผ่านแล้ว', value: teamStats.totalPassed, icon: <CheckCircle size={20} />, gradient: 'linear-gradient(135deg,#10B981,#34D399)', shadow: 'rgba(16,185,129,0.35)' },
    { label: 'ใบประกาศ', value: teamStats.totalCerts, icon: <Award size={20} />, gradient: 'linear-gradient(135deg,#388E3C,#66BB6A)', shadow: 'rgba(56,142,60,0.35)' },
  ];

  // Bar chart data: completion per course
  const barData = publishedCourses.map((course, idx) => {
    const passed = teamMembers.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
    const inProg = teamMembers.filter((u) => {
      const s = getCourseEnrollStatus(course, u.id, allProgress);
      return s === 'in_progress' || s === 'completed' || s === 'failed';
    }).length;
    const notStarted = teamMembers.length - passed - inProg;
    const shortTitle = course.title.length > 14 ? course.title.slice(0, 12) + '…' : course.title;
    return {
      name: `${idx + 1}. ${shortTitle}`,
      สอบผ่าน: passed,
      กำลังเรียน: inProg,
      ยังไม่เริ่ม: notStarted,
    };
  });

  // Radial chart: overall KPI
  const radialData = [{ name: 'ผ่าน', value: overallCompletion, fill: '#10B981' }];

  const exportCSV = () => {
    const headers = ['ชื่อพนักงาน', 'รหัส', 'คอร์ส', 'สถานะ', 'คะแนน', 'ใบประกาศ'];
    const rows: string[][] = [];
    teamMembers.forEach((u) => {
      publishedCourses.forEach((c) => {
        const status = getCourseEnrollStatus(c, u.id, allProgress);
        const score = getBestFinalExamScore(c.id, u.id, allProgress);
        const cert = certificates.find((x) => x.courseId === c.id && x.userId === u.id);
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
      <Box sx={{ background: 'linear-gradient(135deg,#0F3D1A,#1A5B2A)', borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
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
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={14} />}
            onClick={exportCSV}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.08)' } }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 4 }}>
        {statCards.map((s) => (
          <Box key={s.label} sx={{ background: s.gradient, borderRadius: 3, p: 2.5, boxShadow: `0 8px 24px ${s.shadow}`, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -8, right: -8, opacity: 0.15 }}>{s.icon}</Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 600, mb: 0.5 }}>{s.label}</Typography>
            <Typography sx={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
          </Box>
        ))}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #E2E8F0' }}>
        <Tab icon={<BarChart3 size={15} />} iconPosition="start" label="กราฟ KPI" />
        <Tab icon={<Users size={15} />} iconPosition="start" label="ตารางสมาชิก" />
      </Tabs>

      {/* Tab 0: Charts */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
            {/* Bar chart */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#0F172A' }}>
                  ความคืบหน้าทีมแยกตามคอร์ส
                </Typography>
                {teamMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary" fontSize="0.875rem">ไม่มีสมาชิกในทีม</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
                        cursor={{ fill: 'rgba(30,122,52,0.05)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar key="passed" dataKey="สอบผ่าน" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar key="inprog" dataKey="กำลังเรียน" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar key="notstarted" dataKey="ยังไม่เริ่ม" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* KPI gauge */}
            <Card>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0F172A' }}>
                  อัตราผ่านโดยรวม
                </Typography>
                <Box sx={{ position: 'relative', height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%" cy="60%"
                      innerRadius="65%" outerRadius="85%"
                      data={radialData}
                      startAngle={180} endAngle={0}
                    >
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#F1F5F9' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                      {overallCompletion}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Team Completion</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                  {publishedCourses.map((course) => {
                    const passed = teamMembers.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
                    const rate = teamMembers.length > 0 ? Math.round((passed / teamMembers.length) * 100) : 0;
                    return (
                      <Box key={course.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" sx={{ color: '#475569', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {course.title}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: rate >= 70 ? '#10B981' : '#F59E0B' }}>{rate}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={rate} color={rate >= 70 ? 'success' : 'warning'} sx={{ height: 5 }} />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
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
                    {publishedCourses.map((c) => (
                      <TableCell key={c.id} sx={{ minWidth: 130 }}>
                        <Typography variant="caption" sx={{ display: 'block', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>
                          {c.title}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell sx={{ minWidth: 90 }}>ใบประกาศ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((user) => {
                    const userCerts = certificates.filter((c) => c.userId === user.id);
                    return (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', background: 'linear-gradient(135deg,#1E7A34,#155724)' }}>{user.name[0]}</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{user.employeeId}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {publishedCourses.map((course) => {
                          const status = getCourseEnrollStatus(course, user.id, allProgress);
                          const progress = getCourseProgressPercent(course, user.id, allProgress);
                          const score = getBestFinalExamScore(course.id, user.id, allProgress);
                          return (
                            <TableCell key={course.id}>
                              <Box>
                                <Chip label={statusTh[status]} size="small" color={statusChipColor[status]} sx={{ fontSize: '0.65rem', height: 20, mb: 0.5 }} />
                                {progress > 0 && (
                                  <LinearProgress variant="determinate" value={progress} sx={{ height: 4, width: 80, borderRadius: 2 }} color={status === 'passed' ? 'success' : 'primary'} />
                                )}
                                {score !== null && (
                                  <Typography variant="caption" color={score >= (course.finalExam?.passingScore ?? 80) ? 'success.main' : 'error.main'} sx={{ fontWeight: 700, display: 'block' }}>
                                    {score}%
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          {userCerts.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {userCerts.map((cert) => (
                                <Chip
                                  key={cert.id}
                                  label={`${cert.score}%`}
                                  size="small"
                                  icon={<Award size={10} />}
                                  onClick={() => onViewCertificate(cert)}
                                  sx={{ backgroundColor: '#FFFBEB', color: '#B45309', fontSize: '0.65rem', cursor: 'pointer', height: 20 }}
                                />
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
