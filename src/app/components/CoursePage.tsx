import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ArrowLeft, CheckCircle, Circle, Lock, Play, FileText, ChevronDown, Award, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { Course, CourseProgress, User } from '../data/types';
import {
  getCourseEnrollStatus,
  getCourseProgressPercent,
  getCompletedLessons,
  getTotalLessons,
  isLessonCompleted,
  isLessonLocked,
  areAllLessonsCompleted,
  hasFinalExamPassed,
  getFinalExamAttemptCount,
  getBestFinalExamScore,
  getPreTestAttemptCount,
  getBestPreTestScore,
} from '../utils/helpers';

interface CoursePageProps {
  user: User;
  course: Course;
  allProgress: CourseProgress[];
  onBack: () => void;
  onLessonClick: (moduleId: string, lessonId: string) => void;
  onStartPreTest?: () => void;
  onStartFinalExam: () => void;
}

const categoryColors: Record<string, { color: string; chip: string }> = {
  'Product Knowledge': { color: '#1E7A34', chip: '#E8F5E9' },
  'Sales Script': { color: '#059669', chip: '#ECFDF5' },
  'Claim & Compliance': { color: '#D97706', chip: '#FFFBEB' },
  'Objection Handling': { color: '#DC2626', chip: '#FEF2F2' },
  'New Product Launch': { color: '#388E3C', chip: '#F1F8F2' },
};

export function CoursePage({ user, course, allProgress, onBack, onLessonClick, onStartPreTest, onStartFinalExam }: CoursePageProps) {
  const status = getCourseEnrollStatus(course, user.id, allProgress);
  const progress = getCourseProgressPercent(course, user.id, allProgress);
  const completed = getCompletedLessons(course, user.id, allProgress);
  const total = getTotalLessons(course);
  const allDone = areAllLessonsCompleted(course, user.id, allProgress);
  const finalPassed = hasFinalExamPassed(course.id, user.id, allProgress);
  const examAttempts = getFinalExamAttemptCount(course.id, user.id, allProgress);
  const bestScore = getBestFinalExamScore(course.id, user.id, allProgress);
  const preTestAttempts = getPreTestAttemptCount(course.id, user.id, allProgress);
  const bestPreTestScore = getBestPreTestScore(course.id, user.id, allProgress);
  const catStyle = categoryColors[course.category] ?? { color: '#1E7A34', chip: '#E8F5E9' };

  return (
    <Box>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        sx={{ mb: 3, color: '#64748B', '&:hover': { color: '#0F172A' } }}
      >
        กลับ
      </Button>

      {/* Course Hero */}
      <Box sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
        {/* Banner */}
        <Box sx={{ position: 'relative', height: { xs: 180, md: 240 } }}>
          <Box component="img" src={course.image} alt={course.title} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: { xs: 2.5, md: 4 }, maxWidth: '70%' }}>
            <Box sx={{ display: 'inline-block', backgroundColor: catStyle.color, borderRadius: 2, px: 1.5, py: 0.4, mb: 1.5 }}>
              <Typography sx={{ color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>{course.category}</Typography>
            </Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
              {course.title}
            </Typography>
          </Box>
        </Box>

        {/* Course Info */}
        <Box sx={{ backgroundColor: 'white', p: { xs: 2.5, md: 3 } }}>
          <Typography color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7, fontSize: '0.9rem' }}>
            {course.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, mb: 2.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <BookOpen size={16} color="#64748B" />
              <Typography variant="body2" color="text.secondary">{total} บทเรียน</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Clock size={16} color="#64748B" />
              <Typography variant="body2" color="text.secondary">{course.duration}</Typography>
            </Box>
            {course.allowedGroups.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#717182' }}>สำหรับ:</Typography>
                {course.allowedGroups.map((g) => (
                  <Chip key={g} label={g} size="small" sx={{ fontSize: '0.68rem', height: 20 }} />
                ))}
              </Box>
            )}
          </Box>

          {/* Progress */}
          <Box sx={{ backgroundColor: '#F8FAFC', borderRadius: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>ความคืบหน้า</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E7A34' }}>
                  {completed}/{total} บทเรียน ({progress}%)
                </Typography>
                {status === 'passed' && <CheckCircle size={16} color="#059669" />}
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 9999,
                backgroundColor: '#ececf0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: status === 'passed' ? '#059669' : '#1E7A34',
                  borderRadius: 9999,
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Pre-test Banner */}
      {course.preTest && (
        <Box sx={{ mb: 3 }}>
          {preTestAttempts > 0 ? (
            <Box sx={{ backgroundColor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={22} color="white" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#15803D' }}>ทำแบบทดสอบก่อนเรียนแล้ว ✓</Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A' }}>
                    {course.preTest.title} · คะแนน {bestPreTestScore ?? 0}% · เกณฑ์ผ่าน {course.preTest.passingScore}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ background: bestPreTestScore !== null && bestPreTestScore >= course.preTest.passingScore ? '#059669' : '#D97706', borderRadius: 2, px: 2, py: 0.8 }}>
                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{bestPreTestScore ?? 0}%</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} color="white" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#92400E' }}>แบบทดสอบก่อนเรียน</Typography>
                  <Typography variant="caption" sx={{ color: '#B45309' }}>
                    {course.preTest.questionCount ?? course.preTest.questions.length} ข้อ (สุ่มจากคลัง {course.preTest.questions.length} ข้อ) · เกณฑ์ผ่าน {course.preTest.passingScore}%
                  </Typography>
                </Box>
              </Box>
              {onStartPreTest && (
                <Button
                  variant="contained"
                  disableElevation
                  onClick={onStartPreTest}
                  sx={{ backgroundColor: '#D97706', '&:hover': { backgroundColor: '#B45309' } }}
                >
                  ทำแบบทดสอบก่อนเรียน
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Final Exam Banner */}
      {course.finalExam && (
        <Box sx={{ mb: 3 }}>
          {finalPassed ? (
            <Box sx={{ backgroundColor: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={22} color="white" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#065F46' }}>ยินดีด้วย! สอบผ่านแล้ว 🎉</Typography>
                  <Typography variant="caption" sx={{ color: '#059669' }}>{course.finalExam.title}</Typography>
                </Box>
              </Box>
              <Box sx={{ background: '#059669', borderRadius: 2, px: 2, py: 0.8 }}>
                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{bestScore}%</Typography>
              </Box>
            </Box>
          ) : allDone ? (
            <Box sx={{
              backgroundColor: examAttempts > 0 ? '#FEF2F2' : '#F0FDF4',
              border: `1.5px solid ${examAttempts > 0 ? '#FECACA' : '#A7F3D0'}`,
              borderRadius: 3,
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: examAttempts > 0 ? '#EF4444' : '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {examAttempts > 0 ? <AlertTriangle size={22} color="white" /> : <FileText size={22} color="white" />}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: examAttempts > 0 ? '#991B1B' : '#1B5E20' }}>
                    {examAttempts > 0 ? `สอบไม่ผ่าน (คะแนนสูงสุด: ${bestScore}%)` : 'พร้อมสอบ Final Exam แล้ว!'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: examAttempts > 0 ? '#DC2626' : '#155724' }}>
                    เกณฑ์ผ่าน {course.finalExam.passingScore}% · {course.finalExam.maxAttempts === 0 ? 'ไม่จำกัดครั้ง' : `เหลือ ${course.finalExam.maxAttempts - examAttempts} ครั้ง`}
                  </Typography>
                </Box>
              </Box>
              {(examAttempts < course.finalExam.maxAttempts || course.finalExam.maxAttempts === 0) && (
                <Button
                  variant="contained"
                  disableElevation
                  onClick={onStartFinalExam}
                  sx={{
                    backgroundColor: examAttempts > 0 ? '#EF4444' : '#1E7A34',
                    '&:hover': { backgroundColor: examAttempts > 0 ? '#DC2626' : '#155724' },
                  }}
                >
                  {examAttempts > 0 ? 'สอบซ้ำ' : 'เริ่มสอบ'}
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Lock size={18} color="#64748B" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                  Final Exam: {course.finalExam.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  เรียนครบทุกบทเรียนก่อนเพื่อปลดล็อค · เกณฑ์ผ่าน {course.finalExam.passingScore}%
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Modules */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F172A' }}>
        เนื้อหาคอร์ส
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {course.modules.map((module, mIdx) => {
          const modCompleted = module.lessons.filter((l) => isLessonCompleted(course.id, user.id, l.id, allProgress)).length;
          return (
            <Accordion key={module.id} defaultExpanded>
              <AccordionSummary expandIcon={<ChevronDown size={18} color="#64748B" />} sx={{ py: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, backgroundColor: catStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.8rem' }}>{mIdx + 1}</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>{module.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#717182' }}>
                      {modCompleted}/{module.lessons.length} บทเรียน
                    </Typography>
                  </Box>
                  {modCompleted === module.lessons.length && modCompleted > 0 && (
                    <CheckCircle size={16} color="#059669" />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {module.lessons.map((lesson, lIdx) => {
                  const lessonDone = isLessonCompleted(course.id, user.id, lesson.id, allProgress);
                  const locked = isLessonLocked(course, mIdx, lIdx, user.id, allProgress);
                  return (
                    <Box
                      key={lesson.id}
                      role="button"
                      tabIndex={locked ? -1 : 0}
                      aria-label={`${lesson.title}${lessonDone ? ' (เสร็จสิ้น)' : locked ? ' (ล็อค)' : ''}`}
                      aria-disabled={locked}
                      onClick={() => !locked && onLessonClick(module.id, lesson.id)}
                      onKeyDown={(e) => e.key === 'Enter' && !locked && onLessonClick(module.id, lesson.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 2.5,
                        py: 1.8,
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.45 : 1,
                        borderTop: '1px solid #F1F5F9',
                        transition: 'background 0.15s',
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                        '&:hover': locked ? {} : { backgroundColor: '#F8FAFC' },
                        '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: -2 },
                      }}
                    >
                      <Box sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: lessonDone ? '#ECFDF5' : locked ? '#F1F5F9' : '#E8F5E9' }}>
                        {locked ? <Lock size={12} color="#CBD5E1" /> : lessonDone ? <CheckCircle size={14} color="#059669" /> : <Circle size={14} color="#A5D6A7" />}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: lessonDone ? 400 : 500, color: lessonDone ? '#717182' : '#0F172A', textDecoration: lessonDone ? 'line-through' : 'none' }}>
                            {lesson.title}
                          </Typography>
                          {lesson.quiz && (
                            <Box sx={{ backgroundColor: '#F1F8F2', color: '#2E7D32', borderRadius: 1, px: 0.8, py: 0.2, fontSize: '0.65rem', fontWeight: 700 }}>
                              Quiz
                            </Box>
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#717182' }}>{lesson.duration}</Typography>
                      </Box>
                      <Box sx={{ flexShrink: 0 }}>
                        {lessonDone ? (
                          <Box sx={{ backgroundColor: '#ECFDF5', color: '#059669', borderRadius: 1.5, px: 1.2, py: 0.3, fontSize: '0.7rem', fontWeight: 600 }}>
                            เสร็จสิ้น
                          </Box>
                        ) : locked ? (
                          <Box sx={{ backgroundColor: '#F1F5F9', color: '#717182', borderRadius: 1.5, px: 1.2, py: 0.3, fontSize: '0.7rem', fontWeight: 600 }}>
                            ล็อค
                          </Box>
                        ) : (
                          <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={12} color="#1E7A34" style={{ marginLeft: 2 }} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
