import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, LinearProgress,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Users, BookOpen, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { userService, courseService } from '../services';
import { Certificate, Course, CourseProgress, User } from '../data/types';
import { UserManagement } from './UserManagement';
import { CourseManagement } from './CourseManagement';
import { ReportsTab } from './ReportsTab';
import { CertificatesTab } from './CertificatesTab';
import { GroupManagement } from './GroupManagement';
import { CategoryManagement } from './CategoryManagement';
import { RoleManagement } from './RoleManagement';
import { EnrollmentManagement } from './EnrollmentManagement';
import { useEnrollments } from '../hooks/useEnrollments';
import { getCourseEnrollStatus } from '../utils/helpers';

interface AdminPanelProps {
  currentUser: User;
  allProgress: CourseProgress[];
  certificates: Certificate[];
  onViewCertificate: (cert: Certificate) => void;
  defaultTab?: number;
}

const ALL_GROUPS = ['Sales', 'Telesales', 'PC/BA', 'Live', 'Management', 'Operations'];
const ALL_CATEGORIES = ['Product Knowledge', 'Sales Script', 'Compliance', 'Soft Skills'];
const PIE_COLORS = ['#E2E8F0', '#D97706', '#059669'];

export function AdminPanel({ currentUser, allProgress, certificates, onViewCertificate, defaultTab }: AdminPanelProps) {
  const [tab, setTab] = useState(defaultTab ?? 0);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [managedGroups, setManagedGroups] = useState<string[]>([...ALL_GROUPS, 'Master']);
  const [managedCategories, setManagedCategories] = useState<string[]>([...ALL_CATEGORIES]);
  const { enrollments, setEnrollments } = useEnrollments();

  useEffect(() => {
    if (defaultTab !== undefined) setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    Promise.all([userService.getAll(), courseService.getAll()]).then(([users, courses]) => {
      setAllUsers(users);
      setAllCourses(courses);
    });
  }, []);

  const learners = allUsers.filter((u: User) => u.role === 'learner');
  const publishedCourses = allCourses.filter((c: Course) => c.status === 'published');

  const totalEnrollments = learners.reduce((sum, user: User) =>
    sum + publishedCourses.filter((c: Course) => getCourseEnrollStatus(c, user.id, allProgress) !== 'not_started').length, 0);
  const totalPassed = learners.reduce((sum, user: User) =>
    sum + publishedCourses.filter((c: Course) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length, 0);

  const summaryItems = [
    { label: 'ผู้ใช้งานทั้งหมด', value: allUsers.length, icon: <Users size={16} />, color: '#1E7A34' },
    { label: 'คอร์สที่เปิดใช้', value: publishedCourses.length, icon: <BookOpen size={16} />, color: '#1E7A34' },
    { label: 'ลงทะเบียนแล้ว', value: totalEnrollments, icon: <TrendingUp size={16} />, color: '#D97706' },
    { label: 'ใบประกาศที่ออก', value: certificates.length, icon: <Award size={16} />, color: '#1E7A34' },
    { label: 'สอบผ่านแล้ว', value: totalPassed, icon: <CheckCircle size={16} />, color: '#059669' },
  ];

  // Chart data
  const barData = publishedCourses.map((course: Course, idx: number) => {
    const passed = learners.filter((u: User) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
    const inProg = learners.filter((u: User) => {
      const s = getCourseEnrollStatus(course, u.id, allProgress);
      return s === 'in_progress' || s === 'completed' || s === 'failed';
    }).length;
    const notStarted = learners.length - passed - inProg;
    const short = course.title.length > 13 ? course.title.slice(0, 11) + '…' : course.title;
    return { name: `${idx + 1}. ${short}`, สอบผ่าน: passed, กำลังเรียน: inProg, ยังไม่เริ่ม: notStarted };
  });

  const totalRows = learners.length * publishedCourses.length || 1;
  const totalInProg = barData.reduce((s, d) => s + d['กำลังเรียน'], 0);
  const totalNotStarted = barData.reduce((s, d) => s + d['ยังไม่เริ่ม'], 0);
  const pieData = [
    { name: 'ยังไม่เริ่ม', value: totalNotStarted },
    { name: 'กำลังเรียน', value: totalInProg },
    { name: 'สอบผ่าน', value: totalPassed },
  ].filter((d) => d.value > 0);

  return (
    <Box>
      {/* Header */}
      {tab === 0 && (
        <Box sx={{ backgroundColor: '#0F3D1A', borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              {currentUser.role === 'super_admin' ? 'ผู้ดูแลระบบ' : 'ผู้ดูแลการฝึกอบรม'} — ภาพรวมระบบ
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.5, fontSize: '0.875rem' }}>
              ระบบ E-Learning · PK Learning
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Tab 0: Overview ── */}
      {tab === 0 && (
        <Box>
          {/* Summary strip */}
          <Box role="region" aria-label="สรุปภาพรวมระบบ" sx={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, display: 'flex', flexWrap: 'wrap', mb: 4 }}>
            {summaryItems.map((s, i) => (
              <Box key={s.label} aria-label={`${s.label}: ${s.value}`} sx={{ flex: '1 1 140px', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRight: i < summaryItems.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <Box sx={{ color: s.color, flexShrink: 0 }} aria-hidden="true">{s.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1, color: '#0F172A' }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#717182', mt: 0.25, lineHeight: 1.5 }}>{s.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ── Charts row ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
            {/* Bar chart */}
            <Card sx={{ border: '1px solid #E2E8F0' }} elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#0F172A' }}>
                  สถานะผู้เรียนแยกตามคอร์ส
                </Typography>
                {learners.length === 0 || publishedCourses.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: '#CBD5E1' }}>
                    <Typography fontSize="0.875rem" color="text.secondary">ยังไม่มีข้อมูล</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: 'rgba(30,122,52,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="สอบผ่าน" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="กำลังเรียน" fill="#D97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ยังไม่เริ่ม" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie + pass rate */}
            <Card sx={{ border: '1px solid #E2E8F0' }} elevation={0}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#0F172A' }}>
                  สัดส่วนสถานะทั้งระบบ
                </Typography>
                {pieData.length === 0 ? (
                  <Box sx={{ py: 6, color: '#CBD5E1' }}><Typography fontSize="0.875rem" color="text.secondary">ยังไม่มีข้อมูล</Typography></Box>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                    {Math.round((totalPassed / totalRows) * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">อัตราผ่านโดยรวม</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* ── Per-course cards ── */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0F172A' }}>ความคืบหน้าแต่ละคอร์ส</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' }, gap: 2 }}>
            {publishedCourses.map((course: Course) => {
              const enrolledCount = learners.filter((u: User) => getCourseEnrollStatus(course, u.id, allProgress) !== 'not_started').length;
              const passedCount = learners.filter((u: User) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
              const passRate = enrolledCount > 0 ? Math.round((passedCount / enrolledCount) * 100) : 0;
              const certCount = certificates.filter((c: Certificate) => c.courseId === course.id).length;
              return (
                <Card key={course.id} sx={{ border: '1px solid #E2E8F0' }} elevation={0}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flexGrow: 1, pr: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 0.5 }}>{course.title}</Typography>
                        <Chip label={course.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: '#1E7A34', color: '#1E7A34' }} />
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: '#1E7A34' }}>{enrolledCount}</Typography>
                        <Typography variant="caption" color="text.secondary">ลงทะเบียน</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">อัตราผ่าน</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: passRate >= 70 ? '#059669' : '#B45309' }}>
                        {passedCount}/{enrolledCount} ({passRate}%)
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={passRate} aria-label={`อัตราผ่าน ${passRate}%`}
                      sx={{ mb: 1, height: 6, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: passRate >= 70 ? '#059669' : '#B45309', borderRadius: 9999 } }} />
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

      {tab === 1 && <UserManagement currentUser={currentUser} allProgress={allProgress} certificates={certificates} managedGroups={managedGroups} />}
      {tab === 2 && <CourseManagement allProgress={allProgress} certificates={certificates} managedGroups={managedGroups} managedCategories={managedCategories} />}
      {tab === 3 && <ReportsTab allProgress={allProgress} certificates={certificates} managedGroups={managedGroups} onViewCertificate={onViewCertificate} />}
      {tab === 4 && <CertificatesTab certificates={certificates} onViewCertificate={onViewCertificate} />}
      {tab === 5 && <GroupManagement groups={managedGroups} onGroupsChange={setManagedGroups} allProgress={allProgress} />}
      {tab === 6 && <CategoryManagement categories={managedCategories} onCategoriesChange={setManagedCategories} />}
      {tab === 7 && <RoleManagement />}
      {tab === 8 && (
        <EnrollmentManagement
          currentUser={currentUser}
          allProgress={allProgress}
          enrollments={enrollments}
          onEnrollmentsChange={setEnrollments}
        />
      )}
    </Box>
  );
}