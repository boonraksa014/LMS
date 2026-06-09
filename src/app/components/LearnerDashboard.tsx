import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import { BookOpen, CheckCircle, Award, ArrowRight, Play, FileText, Star, AlertCircle, Calendar } from 'lucide-react';
import { Certificate, Course, CourseProgress, User } from '../data/types';
import {
  getCourseEnrollStatus,
  getCourseProgressPercent,
  getTotalLessons,
  getCompletedLessons,
  getBestFinalExamScore,
  getCertificate,
} from '../utils/helpers';

interface LearnerDashboardProps {
  user: User;
  courses: Course[];
  allProgress: CourseProgress[];
  certificates: Certificate[];
  onCourseClick: (courseId: string) => void;
  onViewCertificate: (cert: Certificate) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  not_started: { label: 'ยังไม่เริ่ม', color: '#64748B', bg: '#F1F5F9' },
  in_progress: { label: 'กำลังเรียน', color: '#1E7A34', bg: '#E8F5E9' },
  completed: { label: 'เรียนครบ', color: '#B45309', bg: '#FFFBEB' },
  passed: { label: 'สอบผ่าน ✓', color: '#059669', bg: '#ECFDF5' },
  failed: { label: 'สอบไม่ผ่าน', color: '#B91C1C', bg: '#FEF2F2' },
};

const greenProgressSx = {
  height: 5,
  borderRadius: 9999,
  backgroundColor: '#ececf0',
  '& .MuiLinearProgress-bar': { backgroundColor: '#1E7A34', borderRadius: 9999 },
};

const greenBtnSx = {
  backgroundColor: '#1E7A34',
  color: '#ffffff',
  '&:hover': { backgroundColor: '#155225', boxShadow: 'none' },
  '&:focus-visible': { outline: '3px solid rgba(30,122,52,0.4)', outlineOffset: 2 },
  '&.Mui-disabled': { backgroundColor: '#ececf0', color: '#717182' },
};

const cardInteractiveSx = {
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
  '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: 2 },
  overflow: 'hidden',
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  'Product Knowledge': { color: '#1E7A34', bg: '#E8F5E9' },
  'Sales Script':      { color: '#059669', bg: '#ECFDF5' },
  'Claim & Compliance':{ color: '#D97706', bg: '#FFFBEB' },
  'Objection Handling':{ color: '#EF4444', bg: '#FEF2F2' },
  'New Product Launch':{ color: '#388E3C', bg: '#F1F8F2' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function LearnerDashboard({ user, courses, allProgress, certificates, onCourseClick, onViewCertificate }: LearnerDashboardProps) {
  const publishedCourses = courses.filter((c) => {
    if (c.status !== 'published') return false;
    if (c.allowedGroups.length > 0 && !c.allowedGroups.includes(user.group)) return false;
    return true;
  });

  const stats = publishedCourses.reduce(
    (acc, course) => {
      const status = getCourseEnrollStatus(course, user.id, allProgress);
      acc.total++;
      if (status === 'passed') acc.passed++;
      else if (status === 'in_progress' || status === 'completed' || status === 'failed') acc.inProgress++;
      else acc.notStarted++;
      return acc;
    },
    { total: 0, passed: 0, inProgress: 0, notStarted: 0 }
  );

  const inProgressCourses = publishedCourses.filter((c) => {
    const s = getCourseEnrollStatus(c, user.id, allProgress);
    return s === 'in_progress' || s === 'completed' || s === 'failed';
  });

  const notStartedCourses = publishedCourses.filter(
    (c) => getCourseEnrollStatus(c, user.id, allProgress) === 'not_started'
  );

  const passedCourses = publishedCourses.filter(
    (c) => getCourseEnrollStatus(c, user.id, allProgress) === 'passed'
  );

  const userCertificates = certificates
    .filter((c) => c.userId === user.id)
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

  const firstName = user.name?.split(' ')[0] || user.name || 'คุณ';

  return (
    <Box>
      {/* ── Hero Header ── */}
      <Box
        sx={{
          backgroundColor: '#0F3D1A',
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(30,122,52,0.2)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -30, right: '20%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(56,142,60,0.15)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '1.3rem' }}
              aria-label={`รูปโปรไฟล์ของ ${user.name}`}
            >
              {firstName[0]}
            </Avatar>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', mb: 0.3 }}>
                {user.group} · {user.employeeId}
              </Typography>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.01em' }}>
                สวัสดี, {firstName}!
              </Typography>
            </Box>
          </Box>
          {inProgressCourses.length > 0 ? (
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              คุณมี{' '}
              <Box component="span" sx={{ color: '#A5D6A7', fontWeight: 700 }}>
                {inProgressCourses.length} คอร์ส
              </Box>{' '}
              ที่กำลังเรียนอยู่
            </Typography>
          ) : (
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              {stats.total > 0 ? 'เลือกคอร์สที่สนใจแล้วเริ่มเรียนได้เลย' : 'ยินดีต้อนรับสู่ระบบการเรียนรู้'}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Progress Summary ── replaces hero-metric stat cards */}
      {stats.total > 0 ? (
        <Box
          sx={{
            mb: 4,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>
              ความคืบหน้าการเรียน
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#1E7A34', fontSize: '0.875rem' }}>
              {stats.passed}/{stats.total} คอร์สที่ผ่านแล้ว
            </Typography>
          </Box>
          {/* Stacked progress bar */}
          <Box
            sx={{ height: 8, borderRadius: 9999, backgroundColor: '#ececf0', overflow: 'hidden', display: 'flex', mb: 2 }}
            role="progressbar"
            aria-label={`ความคืบหน้าการเรียน: ผ่านแล้ว ${stats.passed} จาก ${stats.total} คอร์ส`}
            aria-valuenow={stats.passed}
            aria-valuemax={stats.total}
          >
            <Box
              sx={{
                width: `${stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}%`,
                backgroundColor: '#059669',
              }}
            />
            <Box
              sx={{
                width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`,
                backgroundColor: '#1E7A34',
                opacity: 0.55,
              }}
            />
          </Box>
          {/* Stat legend row */}
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
            {[
              { dot: '#059669', label: 'สอบผ่าน', value: stats.passed },
              { dot: '#1E7A34', label: 'กำลังเรียน', value: stats.inProgress, opacity: 0.7 },
              { dot: '#ececf0', label: 'ยังไม่เริ่ม', value: stats.notStarted, border: '1px solid #cbd5e1' },
            ].map(({ dot, label, value, opacity, border }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dot, opacity: opacity ?? 1, border: border ?? 'none', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#717182' }}>
                  {label}{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{value}</Box>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        /* ── Empty State ── */
        <Box
          sx={{
            mb: 4,
            py: 7,
            px: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            backgroundColor: '#ffffff',
          }}
        >
          <BookOpen size={36} color="#ececf0" style={{ marginBottom: 16 }} aria-hidden="true" />
          <Typography sx={{ fontWeight: 600, color: '#0F172A', mb: 1 }}>
            ยังไม่มีคอร์สที่เปิดให้เรียน
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#717182', maxWidth: 320, mx: 'auto' }}>
            คอร์สของคุณจะปรากฏที่นี่เมื่อผู้จัดการกำหนดให้ หากมีข้อสงสัย ติดต่อ HR หรือผู้จัดการโดยตรง
          </Typography>
        </Box>
      )}

      {/* ── My Certificates ── */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Award size={18} color="#D97706" aria-hidden="true" />
            ใบประกาศนียบัตรของฉัน
          </Typography>
          {userCertificates.length > 0 && (
            <Box sx={{ backgroundColor: '#FFFBEB', color: '#B45309', borderRadius: 10, px: 1.5, py: 0.3, fontSize: '0.75rem', fontWeight: 700 }}>
              {userCertificates.length} ใบ
            </Box>
          )}
        </Box>

        {userCertificates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 7, border: '1px dashed #E2E8F0', borderRadius: 3, backgroundColor: '#FAFAFA' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#FEF9EC', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <Award size={26} color="#D97706" aria-hidden="true" />
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#0F172A', mb: 0.5 }}>ยังไม่มีใบประกาศ</Typography>
            <Typography variant="caption" color="text.secondary">
              สอบผ่าน Final Exam เพื่อรับใบประกาศนียบัตร
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
            {userCertificates.map((cert) => {
              const isExpired = new Date(cert.expiresAt) < new Date();
              const catStyle = categoryColors[cert.category] ?? { color: '#1E7A34', bg: '#E8F5E9' };
              return (
                <Box
                  key={cert.id}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: isExpired ? '1px solid #FCA5A5' : '1px solid #FDE68A',
                    backgroundColor: 'white',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(217,119,6,0.15)' },
                  }}
                >
                  {/* Top gold strip */}
                  <Box sx={{ height: 5, background: isExpired ? 'linear-gradient(90deg,#FCA5A5,#F87171)' : 'linear-gradient(90deg,#D97706,#FCD34D,#D97706)' }} />

                  <Box sx={{ p: 2.5 }}>
                    {/* Icon + badges row */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: isExpired ? 'linear-gradient(135deg,#FCA5A5,#F87171)' : 'linear-gradient(135deg,#D97706,#FCD34D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={20} color="white" />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        {isExpired ? (
                          <Chip label="หมดอายุแล้ว" size="small" icon={<AlertCircle size={11} />} sx={{ backgroundColor: '#FEF2F2', color: '#d4183d', fontWeight: 700, fontSize: '0.65rem', height: 20, '& .MuiChip-icon': { color: '#d4183d', ml: '6px' } }} />
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.25 }}>
                            {[...Array(3)].map((_, i) => <Star key={i} size={10} fill="#D97706" color="#D97706" />)}
                          </Box>
                        )}
                        <Box sx={{ backgroundColor: isExpired ? '#FEF2F2' : '#059669', color: 'white', borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.72rem', fontWeight: 700 }}>
                          {cert.score}%
                        </Box>
                      </Box>
                    </Box>

                    {/* Course title */}
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem', lineHeight: 1.4, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cert.courseTitle}
                    </Typography>

                    {/* Category */}
                    <Chip label={cert.category} size="small" sx={{ mb: 1.5, backgroundColor: catStyle.bg, color: catStyle.color, fontWeight: 600, fontSize: '0.68rem', height: 20 }} />

                    {/* Dates */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Calendar size={12} color="#64748B" />
                        <Typography variant="caption" color="text.secondary">ออกวันที่ {formatDate(cert.issuedAt)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Calendar size={12} color={isExpired ? '#d4183d' : '#64748B'} />
                        <Typography variant="caption" sx={{ color: isExpired ? '#d4183d' : 'text.secondary' }}>
                          หมดอายุ {formatDate(cert.expiresAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Cert number */}
                    <Tooltip title="หมายเลขใบประกาศ">
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#94A3B8', mb: 2, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{cert.certificateNo}
                      </Typography>
                    </Tooltip>

                    {/* CTA */}
                    <Button
                      fullWidth
                      size="small"
                      variant={isExpired ? 'outlined' : 'contained'}
                      startIcon={<FileText size={13} />}
                      disableElevation
                      onClick={() => onViewCertificate(cert)}
                      sx={isExpired
                        ? { fontSize: '0.78rem', py: 0.8, borderColor: '#CBD5E1', color: '#64748B', '&:hover': { backgroundColor: '#F8FAFC' } }
                        : { fontSize: '0.78rem', py: 0.8, backgroundColor: '#D97706', color: 'white', '&:hover': { backgroundColor: '#B45309' } }
                      }
                    >
                      ดูใบประกาศ
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── In Progress Courses ── */}
      {inProgressCourses.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2.5 }}>
            เรียนต่อจากที่ค้างไว้
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {inProgressCourses.map((course) => {
              const progress = getCourseProgressPercent(course, user.id, allProgress);
              const completed = getCompletedLessons(course, user.id, allProgress);
              const total = getTotalLessons(course);
              const status = getCourseEnrollStatus(course, user.id, allProgress);
              const s = statusConfig[status];
              return (
                <Card
                  key={course.id}
                  sx={cardInteractiveSx}
                  onClick={() => onCourseClick(course.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onCourseClick(course.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`เรียนต่อ: ${course.title}, ${completed}/${total} บทเรียน (${progress}%)`}
                >
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box
                      sx={{
                        width: { xs: '100%', sm: 130 },
                        height: { xs: 130, sm: 'auto' },
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={course.image}
                        alt={course.title}
                        loading="lazy"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                        <Box sx={{ backgroundColor: s.bg, color: s.color, borderRadius: 1.5, px: 1, py: 0.3, fontSize: '0.7rem', fontWeight: 600 }}>
                          {s.label}
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Chip
                        label={course.category}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1.5, fontSize: '0.7rem', borderColor: '#cbd5e1', color: '#64748B' }}
                      />
                      <Typography sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3, color: '#0F172A', fontSize: '0.95rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {course.title}
                      </Typography>
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{completed}/{total} บทเรียน</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={greenProgressSx} />
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Play size={14} />}
                        disableElevation
                        onClick={(e) => { e.stopPropagation(); onCourseClick(course.id); }}
                        sx={{ ...greenBtnSx, mt: 0.5, px: 2, py: 0.5, fontSize: '0.78rem' }}
                      >
                        เรียนต่อ
                      </Button>
                    </CardContent>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Passed Courses ── */}
      {passedCourses.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Award size={18} color="#059669" aria-hidden="true" />
            คอร์สที่ผ่านแล้ว
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {passedCourses.map((course) => {
              const score = getBestFinalExamScore(course.id, user.id, allProgress);
              const cert = getCertificate(course.id, user.id, certificates);
              return (
                <Box
                  key={course.id}
                  sx={{
                    border: '1px solid #D1FAE5',
                    borderRadius: 3,
                    p: 2.5,
                    backgroundColor: '#F0FDF4',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(5,150,105,0.15)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CheckCircle size={16} color="#059669" aria-hidden="true" />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>สอบผ่าน</Typography>
                    {score !== null && (
                      <Box
                        sx={{ ml: 'auto', backgroundColor: '#059669', color: 'white', borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.72rem', fontWeight: 700 }}
                        aria-label={`คะแนน ${score} เปอร์เซ็นต์`}
                      >
                        {score}%
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#065F46', lineHeight: 1.5, mb: 2, cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                    onClick={() => onCourseClick(course.id)}
                    onKeyDown={(e) => e.key === 'Enter' && onCourseClick(course.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`ดูรายละเอียดคอร์ส ${course.title}`}
                  >
                    {course.title}
                  </Typography>
                  {cert ? (
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      startIcon={<FileText size={13} />}
                      disableElevation
                      onClick={() => onViewCertificate(cert)}
                      sx={{ ...greenBtnSx, fontSize: '0.75rem', py: 0.8 }}
                    >
                      ดูใบรับรอง
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<Award size={13} />}
                      onClick={() => onCourseClick(course.id)}
                      sx={{ borderColor: '#059669', color: '#059669', fontSize: '0.75rem', py: 0.8, '&:hover': { borderColor: '#059669', backgroundColor: '#F0FDF4' } }}
                    >
                      ดูผลการเรียน
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Not Started Courses ── */}
      {notStartedCourses.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
              คอร์สที่รอคุณอยู่
            </Typography>
            <Typography variant="caption" sx={{ color: '#1E7A34', fontWeight: 600 }}>
              {notStartedCourses.length} คอร์ส
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
            {notStartedCourses.map((course) => (
              <Card
                key={course.id}
                sx={{
                  ...cardInteractiveSx,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', borderColor: 'rgba(30,122,52,0.3)' },
                }}
                onClick={() => onCourseClick(course.id)}
                onKeyDown={(e) => e.key === 'Enter' && onCourseClick(course.id)}
                tabIndex={0}
                role="button"
                aria-label={`เริ่มเรียน: ${course.title}`}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={course.image}
                    alt={course.title}
                    loading="lazy"
                    sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Chip
                    label={course.category}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1.5, fontSize: '0.7rem', borderColor: '#cbd5e1', color: '#64748B' }}
                  />
                  <Typography sx={{ fontWeight: 700, mb: 0.5, color: '#0F172A', lineHeight: 1.3, fontSize: '0.95rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {course.title}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, color: '#717182' }}>
                    <BookOpen size={12} aria-hidden="true" />
                    {getTotalLessons(course)} บทเรียน · {course.duration}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowRight size={14} />}
                    sx={{ p: 0, fontWeight: 600, color: '#1E7A34', '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    เริ่มเรียน
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}