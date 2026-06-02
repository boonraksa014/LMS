import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import { BookOpen, TrendingUp, CheckCircle, Clock, Award, ArrowRight, Play, FileText } from 'lucide-react';
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
  in_progress: { label: 'กำลังเรียน', color: '#6366F1', bg: '#EEF2FF' },
  completed: { label: 'เรียนครบ', color: '#F59E0B', bg: '#FFFBEB' },
  passed: { label: 'สอบผ่าน ✓', color: '#10B981', bg: '#ECFDF5' },
  failed: { label: 'สอบไม่ผ่าน', color: '#EF4444', bg: '#FEF2F2' },
};

const statCards = [
  { key: 'total', label: 'คอร์สทั้งหมด', icon: BookOpen, gradient: 'linear-gradient(135deg, #6366F1, #818CF8)', shadow: 'rgba(99,102,241,0.35)' },
  { key: 'inProgress', label: 'กำลังเรียน', icon: TrendingUp, gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', shadow: 'rgba(245,158,11,0.35)' },
  { key: 'passed', label: 'สอบผ่านแล้ว', icon: CheckCircle, gradient: 'linear-gradient(135deg, #10B981, #34D399)', shadow: 'rgba(16,185,129,0.35)' },
  { key: 'notStarted', label: 'ยังไม่เริ่ม', icon: Clock, gradient: 'linear-gradient(135deg, #64748B, #94A3B8)', shadow: 'rgba(100,116,139,0.35)' },
];

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

  const statValues: Record<string, number> = stats;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.2)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, right: '20%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(139,92,246,0.15)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '1.3rem', backdropFilter: 'blur(10px)' }}>
              {user.name[0]}
            </Avatar>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', mb: 0.3 }}>
                {user.group} · {user.employeeId}
              </Typography>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.01em' }}>
                สวัสดี, {user.name.split(' ')[0]}! 👋
              </Typography>
            </Box>
          </Box>
          {inProgressCourses.length > 0 ? (
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              คุณมี <Box component="span" sx={{ color: '#A5B4FC', fontWeight: 700 }}>{inProgressCourses.length} คอร์ส</Box> ที่กำลังเรียนอยู่
            </Typography>
          ) : (
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              เริ่มเรียนคอร์สแรกของคุณได้เลย!
            </Typography>
          )}
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 5 }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Box
              key={card.key}
              sx={{
                background: card.gradient,
                borderRadius: 3,
                p: 2.5,
                boxShadow: `0 8px 24px ${card.shadow}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', top: -12, right: -12, opacity: 0.15 }}>
                <Icon size={72} color="white" />
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', fontWeight: 500, mb: 0.5 }}>
                {card.label}
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                {statValues[card.key]}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* In Progress */}
      {inProgressCourses.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
              เรียนต่อจากที่ค้างไว้
            </Typography>
          </Box>
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
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' },
                    overflow: 'hidden',
                  }}
                  onClick={() => onCourseClick(course.id)}
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
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                        <Box sx={{ backgroundColor: s.bg, color: s.color, borderRadius: 1.5, px: 1, py: 0.3, fontSize: '0.7rem', fontWeight: 600 }}>
                          {s.label}
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Chip label={course.category} size="small" variant="outlined" color="primary" sx={{ mb: 1.5, fontSize: '0.7rem' }} />
                      <Typography sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3, color: '#0F172A', fontSize: '0.95rem' }}>
                        {course.title}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{completed}/{total} บทเรียน</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366F1' }}>{progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} color="primary" sx={{ height: 5 }} />
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Play size={14} />}
                        sx={{ mt: 0.5, px: 2, py: 0.5, fontSize: '0.78rem' }}
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

      {/* Passed Courses */}
      {passedCourses.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0F172A' }}>
            <Award size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: '#F59E0B' }} />
            ผ่านแล้ว · รอรับ Certificate
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {passedCourses.map((course) => {
              const score = getBestFinalExamScore(course.id, user.id, allProgress);
              const cert = getCertificate(course.id, user.id, certificates);
              return (
                <Box
                  key={course.id}
                  sx={{
                    border: '2px solid #D1FAE5',
                    borderRadius: 3,
                    p: 2.5,
                    background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(16,185,129,0.2)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CheckCircle size={16} color="#10B981" />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#10B981' }}>สอบผ่าน</Typography>
                    {score !== null && (
                      <Box sx={{ ml: 'auto', backgroundColor: '#10B981', color: 'white', borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.68rem', fontWeight: 800 }}>
                        {score}%
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#065F46', lineHeight: 1.4, mb: 2, cursor: 'pointer' }} onClick={() => onCourseClick(course.id)}>
                    {course.title}
                  </Typography>
                  {cert ? (
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      startIcon={<FileText size={13} />}
                      onClick={() => onViewCertificate(cert)}
                      sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', fontSize: '0.75rem', py: 0.8, '&:hover': { boxShadow: '0 4px 12px rgba(245,158,11,0.4)' } }}
                    >
                      ดูใบประกาศนียบัตร
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<Award size={13} />}
                      onClick={() => onCourseClick(course.id)}
                      sx={{ borderColor: '#10B981', color: '#059669', fontSize: '0.75rem', py: 0.8 }}
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

      {/* Available Courses */}
      {notStartedCourses.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
              คอร์สที่รอคุณอยู่
            </Typography>
            <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 600 }}>
              {notStartedCourses.length} คอร์ส
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
            {notStartedCourses.map((course) => (
              <Card
                key={course.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,0.1)', borderColor: '#C7D2FE' },
                  overflow: 'hidden',
                }}
                onClick={() => onCourseClick(course.id)}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box component="img" src={course.image} sx={{ width: '100%', height: 150, objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Chip label={course.category} size="small" color="primary" variant="outlined" sx={{ mb: 1.5, fontSize: '0.7rem' }} />
                  <Typography sx={{ fontWeight: 700, mb: 0.5, color: '#0F172A', lineHeight: 1.3, fontSize: '0.95rem' }}>
                    {course.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                    <BookOpen size={12} />
                    {getTotalLessons(course)} บทเรียน · {course.duration}
                  </Typography>
                  <Button size="small" endIcon={<ArrowRight size={14} />} sx={{ p: 0, fontWeight: 600, color: '#6366F1' }}>
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
