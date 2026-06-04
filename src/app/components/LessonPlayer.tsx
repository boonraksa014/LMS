import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  ExternalLink,
  BookOpen,
  PlayCircle,
  Film,
  Volume2,
  Maximize2,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Course, CourseProgress, User, Lesson, InVideoAnswer } from '../data/types';
import { isLessonCompleted, getCompletedLessons, getTotalLessons } from '../utils/helpers';

interface LessonPlayerProps {
  user: User;
  course: Course;
  moduleId: string;
  lessonId: string;
  allProgress: CourseProgress[];
  onBack: () => void;
  onMarkComplete: (moduleId: string, lessonId: string) => void;
  onNavigateLesson: (moduleId: string, lessonId: string) => void;
  onStartQuiz: (moduleId: string, lessonId: string, quizId: string) => void;
  onInVideoAnswer: (lessonId: string, answer: InVideoAnswer) => void;
}

function isYouTubeUrl(url: string) {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function toYouTubeEmbed(url: string) {
  if (url.includes('/embed/')) {
    return url.includes('enablejsapi') ? url : `${url}${url.includes('?') ? '&' : '?'}enablejsapi=1&rel=0`;
  }
  const videoId = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&enablejsapi=1` : url;
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function LessonPlayer({
  user, course, moduleId, lessonId, allProgress,
  onBack, onMarkComplete, onNavigateLesson, onStartQuiz, onInVideoAnswer,
}: LessonPlayerProps) {
  const [markingComplete, setMarkingComplete] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  // In-video question state
  const [activeIVQ, setActiveIVQ] = useState<NonNullable<Lesson['inVideoQuestions']>[0] | null>(null);
  const [ivqAnswer, setIvqAnswer] = useState<number | null>(null);
  const [ivqError, setIvqError] = useState(false);
  const [ivqSubmitted, setIvqSubmitted] = useState(false);
  const [sessionAnsweredIds, setSessionAnsweredIds] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastVideoTimeRef = useRef(-1);
  const ytLastTimeRef = useRef(-1);

  // Reset all state when lesson changes
  useEffect(() => {
    setVideoStarted(false);
    setVideoWatched(false);
    setMarkingComplete(false);
    setActiveIVQ(null);
    setIvqAnswer(null);
    setIvqError(false);
    setIvqSubmitted(false);
    setSessionAnsweredIds(new Set());
    lastVideoTimeRef.current = -1;
    ytLastTimeRef.current = -1;
  }, [lessonId]);

  const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
  const module = course.modules[moduleIndex];
  const lessonIndex = module?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson: Lesson | undefined = module?.lessons[lessonIndex];

  // IDs of questions already answered (persisted + this session)
  const allAnsweredIVQIds = useMemo(() => {
    const progress = allProgress.find((p) => p.courseId === course.id && p.userId === user.id);
    const lp = progress?.lessonProgress.find((l) => l.lessonId === lessonId);
    const fromStorage = new Set(lp?.inVideoAnswers?.map((a) => a.questionId) ?? []);
    sessionAnsweredIds.forEach((id) => fromStorage.add(id));
    return fromStorage;
  }, [allProgress, course.id, user.id, lessonId, sessionAnsweredIds]);

  // YouTube IFrame API — detect end and track current time for IVQ
  useEffect(() => {
    if (!lesson || lesson.type !== 'video' || !lesson.videoUrl) return;
    if (!isYouTubeUrl(lesson.videoUrl)) return;

    const handleMessage = (e: MessageEvent) => {
      if (!String(e.origin).includes('youtube.com')) return;
      try {
        const data = JSON.parse(typeof e.data === 'string' ? e.data : '{}');
        if (data.event === 'onStateChange' && data.info === 0) setVideoWatched(true);
        if (data.event === 'infoDelivery' && data.info?.playerState === 0) setVideoWatched(true);

        // Track current time for in-video questions
        if (data.event === 'infoDelivery' && typeof data.info?.currentTime === 'number' && !activeIVQ) {
          const ct: number = data.info.currentTime;
          const ivqs = lesson.inVideoQuestions;
          if (ivqs?.length) {
            for (const ivq of ivqs) {
              if (allAnsweredIVQIds.has(ivq.id)) continue;
              if (ytLastTimeRef.current < ivq.atSecond && ct >= ivq.atSecond) {
                // Pause YouTube
                iframeRef.current?.contentWindow?.postMessage(
                  JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
                );
                setActiveIVQ(ivq);
                setIvqAnswer(null);
                setIvqError(false);
                setIvqSubmitted(false);
                break;
              }
            }
            ytLastTimeRef.current = ct;
          }
        }
      } catch { /* non-JSON postMessage */ }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });

  // HTML5 video: check in-video question triggers
  const handleTimeUpdate = () => {
    if (!videoRef.current || activeIVQ) return;
    const ct = videoRef.current.currentTime;
    const ivqs = lesson?.inVideoQuestions;
    if (!ivqs?.length) return;

    for (const ivq of ivqs) {
      if (allAnsweredIVQIds.has(ivq.id)) continue;
      if (lastVideoTimeRef.current < ivq.atSecond && ct >= ivq.atSecond) {
        videoRef.current.pause();
        setActiveIVQ(ivq);
        setIvqAnswer(null);
        setIvqError(false);
        setIvqSubmitted(false);
        lastVideoTimeRef.current = ct;
        return;
      }
    }
    lastVideoTimeRef.current = ct;
  };

  const handleSeeked = () => {
    if (videoRef.current) lastVideoTimeRef.current = videoRef.current.currentTime;
  };

  const submitIVQAnswer = () => {
    if (ivqAnswer === null || !activeIVQ) return;
    const correct = ivqAnswer === activeIVQ.correctIndex;
    if (activeIVQ.mustCorrect && !correct) {
      setIvqError(true);
      return;
    }
    const answer: InVideoAnswer = {
      questionId: activeIVQ.id,
      selectedIndex: ivqAnswer,
      correct,
      answeredAt: new Date().toISOString(),
    };
    onInVideoAnswer(lessonId, answer);
    setSessionAnsweredIds((prev) => new Set([...prev, activeIVQ.id]));
    setIvqSubmitted(true);
    setIvqError(false);
  };

  const resumeVideo = () => {
    setActiveIVQ(null);
    setIvqAnswer(null);
    setIvqSubmitted(false);
    setIvqError(false);
    // Resume HTML5 video
    if (videoRef.current) videoRef.current.play().catch(() => {/* user gesture may be needed */});
    // Resume YouTube
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'
    );
  };

  if (!lesson) return null;

  const isCompleted = isLessonCompleted(course.id, user.id, lessonId, allProgress);
  const completedCount = getCompletedLessons(course, user.id, allProgress);
  const totalCount = getTotalLessons(course);
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  let prevLesson: { moduleId: string; lessonId: string } | null = null;
  let nextLesson: { moduleId: string; lessonId: string } | null = null;

  if (lessonIndex > 0) {
    prevLesson = { moduleId, lessonId: module.lessons[lessonIndex - 1].id };
  } else if (moduleIndex > 0) {
    const prevMod = course.modules[moduleIndex - 1];
    prevLesson = { moduleId: prevMod.id, lessonId: prevMod.lessons[prevMod.lessons.length - 1].id };
  }

  if (lessonIndex < module.lessons.length - 1) {
    nextLesson = { moduleId, lessonId: module.lessons[lessonIndex + 1].id };
  } else if (moduleIndex < course.modules.length - 1) {
    const nextMod = course.modules[moduleIndex + 1];
    nextLesson = { moduleId: nextMod.id, lessonId: nextMod.lessons[0].id };
  }

  const isVideoLesson = lesson.type === 'video';
  const canComplete = !isVideoLesson || isCompleted || videoWatched;
  const isYouTubeVideo = lesson.videoUrl ? isYouTubeUrl(lesson.videoUrl) : false;

  const handleMarkComplete = () => {
    if (lesson.quiz) {
      onStartQuiz(moduleId, lessonId, lesson.quiz.id);
    } else {
      setMarkingComplete(true);
      onMarkComplete(moduleId, lessonId);
    }
  };

  const lessonNumber = course.modules.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex + 1;

  const ivqs = lesson.inVideoQuestions ?? [];
  const isTF = activeIVQ?.type === 'true_false';
  const displayOptions = activeIVQ
    ? (isTF ? ['ถูก', 'ผิด'] : activeIVQ.options)
    : [];

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button startIcon={<ArrowLeft size={16} />} onClick={onBack} sx={{ color: '#64748B', flexShrink: 0 }}>
          กลับ
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
              บทที่ {lessonNumber} จาก {totalCount}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>{progressPercent}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 5 }} />
        </Box>
      </Box>

      {/* Lesson Card */}
      <Box sx={{ backgroundColor: 'white', borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {/* Lesson Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0F3D1A 0%, #1A5B2A 100%)',
            p: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(30,122,52,0.2)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 600 }}>
                {course.category}
              </Box>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem' }}>
                {module?.title}
              </Box>
              {isVideoLesson && (
                <Box sx={{ backgroundColor: 'rgba(30,122,52,0.25)', color: '#C7D2FE', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Film size={10} />
                  วิดีโอ
                </Box>
              )}
              {ivqs.length > 0 && (
                <Box sx={{ backgroundColor: 'rgba(245,158,11,0.25)', color: '#FCD34D', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HelpCircle size={10} />
                  {ivqs.length} คำถามระหว่างเรียน
                </Box>
              )}
              {isCompleted && (
                <Box sx={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#6EE7B7', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 700 }}>
                  ✓ เสร็จสิ้นแล้ว
                </Box>
              )}
            </Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
              {lesson.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.5, display: 'block' }}>
              <BookOpen size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {lesson.duration}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          {isVideoLesson && lesson.videoUrl && (
            <Box sx={{ mb: 4 }}>
              {/* Video label row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Chip
                  icon={<Film size={13} />}
                  label="วิดีโอบทเรียน"
                  size="small"
                  sx={{ backgroundColor: '#E8F5E9', color: '#1E7A34', fontWeight: 700, fontSize: '0.72rem', '& .MuiChip-icon': { color: '#1E7A34' } }}
                />
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {isCompleted || videoWatched
                    ? 'ดูวิดีโอครบแล้ว — สามารถทำเครื่องหมายเสร็จสิ้นได้'
                    : 'ต้องดูวิดีโอให้จบก่อนจึงจะเสร็จสิ้นบทเรียนได้'}
                </Typography>
              </Box>

              {/* Player container — position: relative for IVQ overlay */}
              <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', backgroundColor: '#0A0A0A', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {isYouTubeVideo ? (
                  <Box sx={{ aspectRatio: '16/9' }}>
                    <iframe
                      ref={iframeRef}
                      src={toYouTubeEmbed(lesson.videoUrl)}
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  </Box>
                ) : !videoStarted ? (
                  <Box
                    sx={{ aspectRatio: '16/9', position: 'relative', cursor: 'pointer', background: 'linear-gradient(135deg,#0F3D1A 0%,#1A5B2A 50%,#1E293B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}
                    onClick={() => setVideoStarted(true)}
                  >
                    <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(30,122,52,0.12)' }} />
                    <Box sx={{ position: 'absolute', bottom: '15%', right: '8%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(30,122,52,0.1)' }} />
                    <Box
                      sx={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#1E7A34,#43A047)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 12px rgba(30,122,52,0.2), 0 8px 32px rgba(30,122,52,0.5)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { transform: 'scale(1.08)', boxShadow: '0 0 0 16px rgba(30,122,52,0.25), 0 12px 40px rgba(30,122,52,0.6)' },
                      }}
                    >
                      <PlayCircle size={32} color="white" fill="white" />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                        กดเพื่อเล่นวิดีโอ
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', mt: 0.3 }}>
                        {lesson.duration}
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5, background: 'linear-gradient(0deg,rgba(0,0,0,0.6),transparent)', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Volume2 size={14} color="rgba(255,255,255,0.5)" />
                      <Box sx={{ flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
                        <Box sx={{ width: 0, height: '100%', backgroundColor: '#1E7A34', borderRadius: 2 }} />
                      </Box>
                      <Maximize2 size={14} color="rgba(255,255,255,0.5)" />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                    <video
                      ref={videoRef}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '100%', display: 'block' }}
                      preload="metadata"
                      onEnded={() => setVideoWatched(true)}
                      onTimeUpdate={handleTimeUpdate}
                      onSeeked={handleSeeked}
                    >
                      <source src={lesson.videoUrl} type="video/mp4" />
                      เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                    </video>
                  </Box>
                )}

                {/* In-video question overlay */}
                {activeIVQ && (
                  <Box
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.88)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10,
                      p: { xs: 2, md: 3 },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        maxWidth: 480,
                        width: '100%',
                        maxHeight: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Popup header */}
                      <Box sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <HelpCircle size={18} color="white" />
                          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                            คำถามระหว่างเรียน
                          </Typography>
                        </Box>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1.5, px: 1.5, py: 0.4 }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>
                            เวลา {fmtSecs(activeIVQ.atSecond)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Popup body */}
                      <Box sx={{ p: 3, overflowY: 'auto' }}>
                        {ivqSubmitted ? (
                          // Result view
                          <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                              {ivqAnswer === activeIVQ.correctIndex
                                ? <CheckCircle2 size={48} color="#22C55E" />
                                : <XCircle size={48} color="#EF4444" />}
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1, color: ivqAnswer === activeIVQ.correctIndex ? '#15803D' : '#DC2626' }}>
                              {ivqAnswer === activeIVQ.correctIndex ? 'ถูกต้อง! 🎉' : 'ไม่ถูกต้อง'}
                            </Typography>
                            {ivqAnswer !== activeIVQ.correctIndex && (
                              <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                                คำตอบที่ถูกต้องคือ: <strong style={{ color: '#15803D' }}>
                                  {displayOptions[activeIVQ.correctIndex]}
                                </strong>
                              </Typography>
                            )}
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={resumeVideo}
                              startIcon={<PlayCircle size={16} />}
                              sx={{ mt: 1, background: 'linear-gradient(135deg,#1E7A34,#155724)', '&:hover': { boxShadow: '0 8px 24px rgba(30,122,52,0.4)' } }}
                            >
                              ดูวิดีโอต่อ
                            </Button>
                          </Box>
                        ) : (
                          // Question view
                          <>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1E293B', mb: 2.5, lineHeight: 1.6 }}>
                              {activeIVQ.question}
                            </Typography>

                            <RadioGroup
                              value={ivqAnswer !== null ? String(ivqAnswer) : ''}
                              onChange={(e) => { setIvqAnswer(Number(e.target.value)); setIvqError(false); }}
                            >
                              {displayOptions.map((opt, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: 'flex', alignItems: 'center',
                                    border: `1.5px solid ${ivqAnswer === idx ? '#1E7A34' : '#E2E8F0'}`,
                                    borderRadius: 2, mb: 1.5, px: 1.5, py: 1,
                                    bgcolor: ivqAnswer === idx ? '#E8F5E9' : 'transparent',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    '&:hover': { borderColor: '#A5D6A7', bgcolor: '#F8F9FF' },
                                  }}
                                  onClick={() => { setIvqAnswer(idx); setIvqError(false); }}
                                >
                                  <Radio
                                    value={String(idx)}
                                    size="small"
                                    sx={{ p: 0.5, mr: 1, color: ivqAnswer === idx ? '#1E7A34' : undefined }}
                                  />
                                  {!isTF && (
                                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: ivqAnswer === idx ? '#1E7A34' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1, flexShrink: 0 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: ivqAnswer === idx ? 'white' : '#64748B', fontSize: '0.65rem' }}>
                                        {['A', 'B', 'C', 'D'][idx]}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Typography variant="body2" sx={{ fontWeight: ivqAnswer === idx ? 600 : 400, color: '#334155' }}>
                                    {opt || <em style={{ opacity: 0.5 }}>ยังไม่ระบุ</em>}
                                  </Typography>
                                </Box>
                              ))}
                            </RadioGroup>

                            {activeIVQ.mustCorrect && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', mb: 2 }}>
                                <HelpCircle size={14} color="#F97316" />
                                <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 500 }}>
                                  ต้องตอบถูกก่อนถึงจะดูวิดีโอต่อได้
                                </Typography>
                              </Box>
                            )}

                            {ivqError && (
                              <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
                                คำตอบไม่ถูกต้อง กรุณาลองอีกครั้ง
                              </Alert>
                            )}

                            <Button
                              fullWidth
                              variant="contained"
                              disabled={ivqAnswer === null}
                              onClick={submitIVQAnswer}
                              sx={{ mt: 1, background: 'linear-gradient(135deg,#F59E0B,#D97706)', '&:hover': { boxShadow: '0 8px 24px rgba(245,158,11,0.4)' } }}
                            >
                              ส่งคำตอบ
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Video status strip */}
              <Box sx={{
                mt: 1.5, px: 2, py: 1, borderRadius: 2,
                backgroundColor: videoWatched || isCompleted ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${videoWatched || isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                {videoWatched || isCompleted ? (
                  <>
                    <CheckCircle size={14} color="#10B981" />
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                      ดูวิดีโอจบแล้ว — กดปุ่มเสร็จสิ้นด้านล่างได้เลย
                    </Typography>
                  </>
                ) : (
                  <>
                    <Film size={14} color="#D97706" />
                    <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600 }}>
                      ต้องดูวิดีโอให้จบก่อน จึงจะสามารถทำเครื่องหมายเสร็จสิ้นได้
                    </Typography>
                  </>
                )}
              </Box>

              {/* In-video questions summary strip */}
              {ivqs.length > 0 && (
                <Box sx={{ mt: 1, px: 2, py: 1, borderRadius: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <HelpCircle size={13} color="#D97706" />
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600 }}>
                    บทเรียนนี้มี {ivqs.length} คำถามระหว่างเรียน
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {ivqs
                      .slice()
                      .sort((a, b) => a.atSecond - b.atSecond)
                      .map((ivq) => (
                        <Chip
                          key={ivq.id}
                          label={fmtSecs(ivq.atSecond)}
                          size="small"
                          icon={allAnsweredIVQIds.has(ivq.id) ? <CheckCircle size={10} /> : undefined}
                          sx={{
                            height: 20, fontSize: '0.65rem', fontWeight: 700,
                            bgcolor: allAnsweredIVQIds.has(ivq.id) ? '#D1FAE5' : '#FEF3C7',
                            color: allAnsweredIVQIds.has(ivq.id) ? '#065F46' : '#92400E',
                            '& .MuiChip-icon': { color: '#065F46' },
                          }}
                        />
                      ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {lesson.type === 'link' && lesson.externalUrl && (
            <Alert severity="info" icon={<ExternalLink size={18} />} action={<Button size="small" href={lesson.externalUrl} target="_blank" rel="noopener noreferrer" variant="outlined" color="primary">เปิดลิงก์</Button>} sx={{ mb: 3 }}>
              บทเรียนนี้มีเนื้อหาจากแหล่งภายนอก
            </Alert>
          )}

          {lesson.type === 'pdf' && (
            <Alert severity="info" icon={<FileText size={18} />} sx={{ mb: 3 }}>
              บทเรียนนี้เป็นไฟล์ PDF — อ่านเนื้อหาด้านล่างได้เลย
            </Alert>
          )}

          {/* Text Content */}
          <Box sx={{ maxWidth: '100%' }}>
            {lesson.content.split('\n').map((line, idx) => {
              if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
                return (
                  <Typography key={idx} sx={{ fontWeight: 800, fontSize: '1.05rem', mt: 3, mb: 1, color: '#0F3D1A', borderLeft: '3px solid #1E7A34', pl: 2, py: 0.5 }}>
                    {line.replace(/\*\*/g, '')}
                  </Typography>
                );
              }
              if (line.startsWith('| ') && line.includes(' | ')) {
                return (
                  <Box key={idx} sx={{ overflowX: 'auto', mb: 1 }}>
                    <Box component="pre" sx={{ fontFamily: 'inherit', fontSize: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: 2, p: 2, border: '1px solid #E2E8F0' }}>
                      {line}
                    </Box>
                  </Box>
                );
              }
              if (line.match(/^[•\-✅❌🔵💊🌿🔷⭐]/)) {
                return (
                  <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: 0.8, pl: 1 }}>
                    <Typography component="span" sx={{ flexShrink: 0, mt: 0.1, lineHeight: 1.7, fontSize: '0.95rem' }}>{line.slice(0, 2)}</Typography>
                    <Typography component="span" sx={{ lineHeight: 1.7, color: '#334155', fontSize: '0.95rem' }}>{line.slice(2)}</Typography>
                  </Box>
                );
              }
              if (line.match(/^\d+\./)) {
                return (
                  <Typography key={idx} component="p" sx={{ mb: 0.8, pl: 1, lineHeight: 1.7, color: '#334155', fontSize: '0.95rem', fontWeight: 500 }}>
                    {line}
                  </Typography>
                );
              }
              if (line === '') return <Box key={idx} sx={{ mb: 1.5 }} />;
              return (
                <Typography key={idx} component="p" sx={{ mb: 0.5, lineHeight: 1.8, color: '#334155', fontSize: '0.95rem' }}>
                  {line}
                </Typography>
              );
            })}
          </Box>

          {lesson.quiz && (
            <Alert severity="warning" sx={{ mt: 4 }}>
              <strong>บทเรียนนี้มีแบบทดสอบ</strong> — กดเรียนจบเพื่อทำ Quiz: {lesson.quiz.title} (เกณฑ์ผ่าน {lesson.quiz.passingScore}%)
            </Alert>
          )}
        </Box>

        {/* Action Bar */}
        <Box sx={{ px: { xs: 3, md: 5 }, py: 3, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, backgroundColor: '#FAFAFA' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {prevLesson && (
              <Button variant="outlined" startIcon={<ArrowLeft size={14} />} size="small" onClick={() => onNavigateLesson(prevLesson!.moduleId, prevLesson!.lessonId)}>
                ก่อนหน้า
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isCompleted ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={18} color="#10B981" />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>เสร็จสิ้นแล้ว</Typography>
                </Box>
                {nextLesson && (
                  <Button variant="contained" endIcon={<ArrowRight size={14} />} size="small" onClick={() => onNavigateLesson(nextLesson.moduleId, nextLesson.lessonId)} sx={{ background: 'linear-gradient(135deg, #1E7A34, #155724)' }}>
                    บทถัดไป
                  </Button>
                )}
              </>
            ) : !canComplete ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1, borderRadius: 2, backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                <Film size={16} color="#94A3B8" />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                  ดูวิดีโอให้จบก่อน
                </Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={lesson.quiz ? <FileText size={16} /> : <CheckCircle size={16} />}
                onClick={handleMarkComplete}
                disabled={markingComplete}
                sx={{ background: 'linear-gradient(135deg, #1E7A34, #155724)', px: 3, '&:hover': { boxShadow: '0 8px 24px rgba(30,122,52,0.4)' } }}
              >
                {lesson.quiz ? 'เรียนจบ → ทำ Quiz' : 'ทำเครื่องหมายว่าเสร็จสิ้น'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
