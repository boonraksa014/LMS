import type { ReactNode } from 'react';
import {
  Box,
  Typography,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  BookOpen, CheckCircle, Award, ArrowRight, Play,
  FileText, Star, AlertCircle, Calendar, TrendingUp, Clock,
} from 'lucide-react';
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
  in_progress:  { label: 'กำลังเรียน', color: '#1E7A34', bg: '#E8F5E9' },
  completed:    { label: 'เรียนครบ',   color: '#B45309', bg: '#FFFBEB' },
  passed:       { label: 'สอบผ่าน ✓', color: '#059669', bg: '#ECFDF5' },
  failed:       { label: 'สอบไม่ผ่าน', color: '#B91C1C', bg: '#FEF2F2' },
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  'Product Knowledge': { color: '#1E7A34', bg: '#E8F5E9' },
  'Sales Script':       { color: '#059669', bg: '#ECFDF5' },
  'Claim & Compliance': { color: '#D97706', bg: '#FFFBEB' },
  'Objection Handling': { color: '#EF4444', bg: '#FEF2F2' },
  'New Product Launch':  { color: '#388E3C', bg: '#F1F8F2' },
};

const interactiveSx = {
  cursor: 'pointer',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: 2 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'อรุณสวัสดิ์';
  if (h < 17) return 'สวัสดีตอนบ่าย';
  return 'สวัสดีตอนเย็น';
}

// ── Section header accent ─────────────────────────────────────────────────────
function SectionLabel({ icon, label, count, accentColor = '#1E7A34' }: { icon: ReactNode; label: string; count?: number; accentColor?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
        {label}
      </Typography>
      {count !== undefined && (
        <Box sx={{ ml: 0.5, backgroundColor: '#F1F5F9', color: '#475569', borderRadius: 10, px: 1.25, py: 0.2, fontSize: '0.72rem', fontWeight: 700 }}>
          {count}
        </Box>
      )}
    </Box>
  );
}

export function LearnerDashboard({ user, courses, allProgress, certificates, onCourseClick, onViewCertificate }: LearnerDashboardProps) {
  const publishedCourses = courses.filter((c) => {
    if (c.status !== 'published') return false;
    if (c.allowedGroups.length > 0 && !c.allowedGroups.includes(user.group)) return false;
    return true;
  });

  const stats = publishedCourses.reduce(
    (acc, course) => {
      const s = getCourseEnrollStatus(course, user.id, allProgress);
      acc.total++;
      if (s === 'passed') acc.passed++;
      else if (s === 'in_progress' || s === 'completed' || s === 'failed') acc.inProgress++;
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
  const overallPct = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  return (
    <Box>

      {/* ══════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════ */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F3D1A 0%, #1A5B2A 55%, #1E7A34 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 4.5 },
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, right: '15%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '30%', left: '-30px', width: 120, height: 120, borderRadius: '50%', background: 'rgba(30,122,52,0.25)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top row: avatar + name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Box sx={{ width: 4, height: 56, borderRadius: 9999, backgroundColor: '#A5D6A7', position: 'absolute', left: -12, top: 0 }} />
              <Avatar
                sx={{ width: 56, height: 56, background: 'linear-gradient(135deg,rgba(255,255,255,0.25),rgba(255,255,255,0.1))', fontWeight: 800, fontSize: '1.4rem', border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}
                aria-label={`รูปโปรไฟล์ของ ${user.name}`}
              >
                {firstName[0]}
              </Avatar>
            </Box>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase', mb: 0.4 }}>
                {timeGreeting()}
              </Typography>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {firstName}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', mt: 0.3 }}>
                {user.group} · {user.employeeId}
              </Typography>
            </Box>
          </Box>

          {/* Motivational message */}
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', mb: 3, maxWidth: 420 }}>
            {stats.passed > 0
              ? `ยอดเยี่ยม! คุณผ่านไปแล้ว ${stats.passed} คอร์ส ${inProgressCourses.length > 0 ? `และกำลังเรียน ${inProgressCourses.length} คอร์ส` : ''}`
              : inProgressCourses.length > 0
              ? `คุณมี ${inProgressCourses.length} คอร์สที่กำลังเรียนอยู่ ไปต่อกันเลย!`
              : 'ยินดีต้อนรับสู่ PK Learning — เลือกคอร์สที่สนใจแล้วเริ่มได้เลย'}
          </Typography>

          {/* Inline stat chips */}
          {stats.total > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {[
                { value: stats.passed,    label: 'ผ่านแล้ว',    bg: 'rgba(5,150,105,0.25)',      border: 'rgba(5,150,105,0.4)',      text: '#A7F3D0' },
                { value: stats.inProgress,label: 'กำลังเรียน',  bg: 'rgba(255,255,255,0.08)',    border: 'rgba(255,255,255,0.15)',   text: 'rgba(255,255,255,0.85)' },
                { value: userCertificates.length, label: 'ใบประกาศ', bg: 'rgba(217,119,6,0.2)', border: 'rgba(217,119,6,0.35)',     text: '#FCD34D' },
              ].map((s) => (
                <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: 2, px: 1.75, py: 0.7 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: s.text, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{s.label}</Typography>
                </Box>
              ))}
              {stats.total > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, px: 1.75, py: 0.7 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>{overallPct}%</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>ภาพรวม</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════
          STAT TILES
      ══════════════════════════════════════════════ */}
      {stats.total > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
          {[
            { value: stats.total,              label: 'คอร์สทั้งหมด',    icon: <BookOpen size={17} color="#1E7A34" />,  bg: '#F0FDF4', border: '#D1FAE5', num: '#0F3D1A' },
            { value: stats.inProgress,         label: 'กำลังเรียน',       icon: <TrendingUp size={17} color="#D97706" />, bg: '#FFFBEB', border: '#FDE68A', num: '#92400E' },
            { value: stats.passed,             label: 'สอบผ่านแล้ว',      icon: <CheckCircle size={17} color="#059669" />,bg: '#ECFDF5', border: '#A7F3D0', num: '#065F46' },
            { value: userCertificates.length,  label: 'ใบประกาศ',         icon: <Award size={17} color="#B45309" />,      bg: '#FFFBEB', border: '#FDE68A', num: '#78350F' },
          ].map((s) => (
            <Box key={s.label} sx={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, p: { xs: 1.75, md: 2.25 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.8rem' }, color: s.num, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, lineHeight: 1.2 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ mb: 4, py: 7, px: 3, textAlign: 'center', borderRadius: 3, border: '1px dashed #E2E8F0', backgroundColor: '#FAFAFA' }}>
          <BookOpen size={36} color="#E2E8F0" style={{ marginBottom: 16 }} aria-hidden="true" />
          <Typography sx={{ fontWeight: 600, color: '#0F172A', mb: 1 }}>ยังไม่มีคอร์สที่เปิดให้เรียน</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#717182', maxWidth: 320, mx: 'auto' }}>
            คอร์สของคุณจะปรากฏที่นี่เมื่อผู้ดูแลระบบกำหนดให้
          </Typography>
        </Box>
      )}

      {/* ══════════════════════════════════════════════
          CERTIFICATES — horizontal scroll
      ══════════════════════════════════════════════ */}
      <Box sx={{ mb: 5 }}>
        <SectionLabel icon={<Award size={16} color="white" />} label="ใบประกาศนียบัตรของฉัน" count={userCertificates.length || undefined} accentColor="#D97706" />

        {userCertificates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, border: '1px dashed #FDE68A', borderRadius: 3, backgroundColor: '#FFFDF5' }}>
            <Box sx={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#FDE68A,#FCD34D)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <Award size={24} color="#92400E" />
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#0F172A', mb: 0.5 }}>ยังไม่มีใบประกาศ</Typography>
            <Typography variant="caption" color="text.secondary">สอบผ่าน Final Exam เพื่อรับใบประกาศนียบัตร</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1.5, mx: -0.5, px: 0.5, scrollSnapType: 'x mandatory', '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: 9999 } }}>
            {userCertificates.map((cert) => {
              const isExpired = new Date(cert.expiresAt) < new Date();
              const catStyle = categoryColors[cert.category] ?? { color: '#1E7A34', bg: '#E8F5E9' };
              return (
                <Box
                  key={cert.id}
                  sx={{
                    minWidth: 260, maxWidth: 260, flexShrink: 0, scrollSnapAlign: 'start',
                    borderRadius: 3, overflow: 'hidden',
                    border: isExpired ? '1px solid #FCA5A5' : '1px solid #FDE68A',
                    backgroundColor: 'white',
                    ...interactiveSx,
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(217,119,6,0.18)' },
                  }}
                >
                  {/* Top accent strip */}
                  <Box sx={{ height: 5, background: isExpired ? 'linear-gradient(90deg,#FCA5A5,#F87171)' : 'linear-gradient(90deg,#D97706,#FCD34D,#D97706)' }} />
                  <Box sx={{ p: 2.25 }}>
                    {/* Icon + score */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ width: 42, height: 42, borderRadius: '50%', background: isExpired ? 'linear-gradient(135deg,#FCA5A5,#F87171)' : 'linear-gradient(135deg,#D97706,#FCD34D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={20} color="white" />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        {isExpired ? (
                          <Chip label="หมดอายุ" size="small" icon={<AlertCircle size={10} />} sx={{ backgroundColor: '#FEF2F2', color: '#d4183d', fontWeight: 700, fontSize: '0.62rem', height: 18, '& .MuiChip-icon': { color: '#d4183d', ml: '5px' } }} />
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.3 }}>
                            {[0,1,2].map((i) => <Star key={i} size={10} fill="#D97706" color="#D97706" />)}
                          </Box>
                        )}
                        <Box sx={{ backgroundColor: isExpired ? '#FEE2E2' : '#059669', color: isExpired ? '#d4183d' : 'white', borderRadius: 1.5, px: 1, py: 0.15, fontSize: '0.72rem', fontWeight: 800 }}>
                          {cert.score}%
                        </Box>
                      </Box>
                    </Box>

                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem', lineHeight: 1.4, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cert.courseTitle}
                    </Typography>
                    <Chip label={cert.category} size="small" sx={{ mb: 1.5, height: 20, backgroundColor: catStyle.bg, color: catStyle.color, fontWeight: 600, fontSize: '0.65rem' }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Calendar size={11} color="#94A3B8" />
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>ออกวันที่ {formatDate(cert.issuedAt)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Clock size={11} color={isExpired ? '#d4183d' : '#94A3B8'} />
                        <Typography sx={{ fontSize: '0.7rem', color: isExpired ? '#d4183d' : '#64748B' }}>
                          หมดอายุ {formatDate(cert.expiresAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title={`หมายเลขใบประกาศ: ${cert.certificateNo}`}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#CBD5E1', letterSpacing: '0.03em', mb: 1.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{cert.certificateNo}
                      </Typography>
                    </Tooltip>

                    <Button fullWidth size="small" variant={isExpired ? 'outlined' : 'contained'} startIcon={<FileText size={13} />} disableElevation
                      onClick={() => onViewCertificate(cert)}
                      sx={isExpired
                        ? { fontSize: '0.775rem', py: 0.75, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { backgroundColor: '#F8FAFC' } }
                        : { fontSize: '0.775rem', py: 0.75, backgroundColor: '#D97706', '&:hover': { backgroundColor: '#B45309' } }}
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

      {/* ══════════════════════════════════════════════
          IN-PROGRESS COURSES
      ══════════════════════════════════════════════ */}
      {inProgressCourses.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <SectionLabel icon={<Play size={15} color="white" />} label="เรียนต่อจากที่ค้างไว้" count={inProgressCourses.length} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
            {inProgressCourses.map((course) => {
              const progress = getCourseProgressPercent(course, user.id, allProgress);
              const completed = getCompletedLessons(course, user.id, allProgress);
              const total = getTotalLessons(course);
              const status = getCourseEnrollStatus(course, user.id, allProgress);
              const s = statusConfig[status];
              return (
                <Box
                  key={course.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`เรียนต่อ: ${course.title}, ${completed}/${total} บทเรียน (${progress}%)`}
                  onClick={() => onCourseClick(course.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onCourseClick(course.id)}
                  sx={{
                    borderRadius: 3, overflow: 'hidden', backgroundColor: 'white',
                    border: '1px solid #E2E8F0', display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                    ...interactiveSx,
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderColor: '#A5D6A7' },
                  }}
                >
                  {/* Thumbnail */}
                  <Box sx={{ width: { xs: '100%', sm: 140 }, height: { xs: 140, sm: 'auto' }, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                    <Box component="img" src={course.image} alt={course.title} loading="lazy"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {/* Progress overlay at bottom of image */}
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <Box sx={{ height: '100%', width: `${progress}%`, backgroundColor: '#4ADE80', transition: 'width 0.5s ease' }} />
                    </Box>
                    <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                      <Box sx={{ backgroundColor: s.bg, color: s.color, borderRadius: 1.5, px: 1, py: 0.3, fontSize: '0.65rem', fontWeight: 700 }}>
                        {s.label}
                      </Box>
                    </Box>
                    {/* % badge on image */}
                    <Box sx={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(15,61,26,0.85)', borderRadius: 1.5, px: 1, py: 0.3 }}>
                      <Typography sx={{ color: '#4ADE80', fontSize: '0.72rem', fontWeight: 800 }}>{progress}%</Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Chip label={course.category} size="small" variant="outlined"
                        sx={{ mb: 1.25, fontSize: '0.68rem', borderColor: '#E2E8F0', color: '#64748B', height: 20 }} />
                      <Typography sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.35, color: '#0F172A', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.title}
                      </Typography>
                      <Box sx={{ mb: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{completed}/{total} บทเรียน</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 9999, backgroundColor: '#E8F5E9', '& .MuiLinearProgress-bar': { backgroundColor: '#1E7A34', borderRadius: 9999 } }} />
                      </Box>
                    </Box>
                    <Button size="small" variant="contained" startIcon={<Play size={13} />} disableElevation
                      onClick={(e) => { e.stopPropagation(); onCourseClick(course.id); }}
                      sx={{ mt: 1.75, alignSelf: 'flex-start', backgroundColor: '#1E7A34', px: 2.25, py: 0.6, fontSize: '0.78rem', '&:hover': { backgroundColor: '#155724' } }}
                    >
                      เรียนต่อ
                    </Button>
                  </CardContent>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════════════
          PASSED COURSES
      ══════════════════════════════════════════════ */}
      {passedCourses.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <SectionLabel icon={<CheckCircle size={15} color="white" />} label="คอร์สที่ผ่านแล้ว" count={passedCourses.length} accentColor="#059669" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {passedCourses.map((course) => {
              const score = getBestFinalExamScore(course.id, user.id, allProgress);
              const cert = getCertificate(course.id, user.id, certificates);
              return (
                <Box key={course.id} sx={{ border: '1px solid #D1FAE5', borderRadius: 3, overflow: 'hidden', backgroundColor: 'white', ...interactiveSx, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(5,150,105,0.12)', borderColor: '#6EE7B7' } }}>
                  {/* Green top bar */}
                  <Box sx={{ height: 4, background: 'linear-gradient(90deg,#059669,#34D399)' }} />
                  <Box sx={{ p: 2.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={14} color="#059669" />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: '#059669', fontSize: '0.75rem' }}>สอบผ่าน</Typography>
                      {score !== null && (
                        <Box sx={{ ml: 'auto', backgroundColor: '#059669', color: 'white', borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.7rem', fontWeight: 700 }} aria-label={`คะแนน ${score}%`}>
                          {score}%
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.45, mb: 1.75, cursor: 'pointer', '&:hover': { color: '#1E7A34' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      onClick={() => onCourseClick(course.id)} onKeyDown={(e) => e.key === 'Enter' && onCourseClick(course.id)} tabIndex={0} role="button" aria-label={`ดูคอร์ส ${course.title}`}>
                      {course.title}
                    </Typography>
                    {cert ? (
                      <Button fullWidth size="small" variant="contained" startIcon={<FileText size={13} />} disableElevation onClick={() => onViewCertificate(cert)}
                        sx={{ fontSize: '0.75rem', py: 0.75, backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
                        ดูใบรับรอง
                      </Button>
                    ) : (
                      <Button fullWidth size="small" variant="outlined" startIcon={<Award size={13} />} onClick={() => onCourseClick(course.id)}
                        sx={{ fontSize: '0.75rem', py: 0.75, borderColor: '#A7F3D0', color: '#059669', '&:hover': { borderColor: '#059669', backgroundColor: '#F0FDF4' } }}>
                        ดูผลการเรียน
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════════════
          NOT STARTED COURSES
      ══════════════════════════════════════════════ */}
      {notStartedCourses.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={15} color="white" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                คอร์สที่รอคุณอยู่
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, px: 1.25, py: 0.3 }}>
              {notStartedCourses.length} คอร์ส
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
            {notStartedCourses.map((course) => {
              const catStyle = categoryColors[course.category] ?? { color: '#1E7A34', bg: '#E8F5E9' };
              return (
                <Box key={course.id} role="button" tabIndex={0} aria-label={`เริ่มเรียน: ${course.title}`}
                  onClick={() => onCourseClick(course.id)} onKeyDown={(e) => e.key === 'Enter' && onCourseClick(course.id)}
                  sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: 'white', border: '1px solid #E2E8F0', ...interactiveSx, '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 36px rgba(0,0,0,0.1)', borderColor: 'rgba(30,122,52,0.25)' } }}>
                  {/* Thumbnail */}
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={course.image} alt={course.title} loading="lazy"
                      sx={{ width: '100%', height: 154, objectFit: 'cover', display: 'block' }} />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 55%)' }} />
                    {/* Category badge */}
                    <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
                      <Box sx={{ backgroundColor: catStyle.bg, color: catStyle.color, borderRadius: 1.5, px: 1.25, py: 0.4, fontSize: '0.68rem', fontWeight: 700 }}>
                        {course.category}
                      </Box>
                    </Box>
                    {/* Duration on image */}
                    <Box sx={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 1.5, px: 1, py: 0.35 }}>
                      <Clock size={11} color="rgba(255,255,255,0.8)" />
                      <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', fontWeight: 600 }}>{course.duration}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 2.25 }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.75, color: '#0F172A', lineHeight: 1.35, fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: '#94A3B8' }}>
                      <BookOpen size={12} />
                      <Typography variant="caption" color="text.secondary">{getTotalLessons(course)} บทเรียน</Typography>
                      {course.finalExam && (
                        <>
                          <Box component="span" sx={{ color: '#E2E8F0', mx: 0.5 }}>·</Box>
                          <Award size={11} color="#D97706" />
                          <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>มี Final Exam</Typography>
                        </>
                      )}
                    </Box>
                    <Button size="small" variant="contained" endIcon={<ArrowRight size={14} />} disableElevation fullWidth
                      sx={{ fontSize: '0.78rem', py: 0.75, backgroundColor: '#0F3D1A', '&:hover': { backgroundColor: '#1E7A34' } }}>
                      เริ่มเรียน
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}