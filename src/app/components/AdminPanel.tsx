import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Users,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses as staticCourses } from '../data/courses';
import { Certificate, CourseProgress, User } from '../data/types';
import { UserManagement } from './UserManagement';
import { CourseManagement } from './CourseManagement';
import { ReportsTab } from './ReportsTab';
import { CertificatesTab } from './CertificatesTab';
import { GroupManagement } from './GroupManagement';
import { CategoryManagement } from './CategoryManagement';
import { RoleManagement } from './RoleManagement';
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

export function AdminPanel({ currentUser, allProgress, certificates, onViewCertificate, defaultTab }: AdminPanelProps) {
  const [tab, setTab] = useState(defaultTab ?? 0);

  useEffect(() => {
    if (defaultTab !== undefined) setTab(defaultTab);
  }, [defaultTab]);

  const [managedGroups, setManagedGroups] = useState<string[]>([...ALL_GROUPS, 'Master']);
  const [managedCategories, setManagedCategories] = useState<string[]>([...ALL_CATEGORIES]);

  // ── Tab 0 derived values ──────────────────────────────────────────────────
  const learners = mockUsers.filter((u) => u.role === 'learner');
  const publishedCourses = staticCourses.filter((c) => c.status === 'published');
  const totalEnrollments = learners.reduce((sum, user) =>
    sum + publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) !== 'not_started').length, 0);
  const totalPassed = learners.reduce((sum, user) =>
    sum + publishedCourses.filter((c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed').length, 0);

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
                    <LinearProgress
                      variant="determinate"
                      value={passRate}
                      aria-label={`อัตราผ่าน ${passRate}%`}
                      sx={{ mb: 1, height: 6, borderRadius: 9999, backgroundColor: '#ececf0', '& .MuiLinearProgress-bar': { backgroundColor: passRate >= 70 ? '#059669' : '#B45309', borderRadius: 9999 } }}
                    />
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
        <CourseManagement
          allProgress={allProgress}
          certificates={certificates}
          managedGroups={managedGroups}
          managedCategories={managedCategories}
        />
      )}

      {/* ── Tab 3: Reports ── */}
      {tab === 3 && (
        <ReportsTab
          allProgress={allProgress}
          certificates={certificates}
          managedGroups={managedGroups}
          onViewCertificate={onViewCertificate}
        />
      )}

      {/* ── Tab 4: Certificates ── */}
      {tab === 4 && (
        <CertificatesTab
          certificates={certificates}
          onViewCertificate={onViewCertificate}
        />
      )}

      {/* ── Tab 5: Group Management ── */}
      {tab === 5 && (
        <GroupManagement
          groups={managedGroups}
          onGroupsChange={setManagedGroups}
          allProgress={allProgress}
        />
      )}

      {/* ── Tab 6: Category Management ── */}
      {tab === 6 && (
        <CategoryManagement
          categories={managedCategories}
          onCategoriesChange={setManagedCategories}
        />
      )}

      {/* ── Tab 7: Role & Permission Management ── */}
      {tab === 7 && <RoleManagement />}
    </Box>
  );
}
