import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Divider,
} from '@mui/material';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Award, RotateCcw, BookOpen, FileText, Clock } from 'lucide-react';
import { Quiz, QuizAttempt } from '../data/types';

interface QuizPageProps {
  quiz: Quiz;
  isFinalExam: boolean;
  isPreTest?: boolean;
  existingAttempts: QuizAttempt[];
  courseTitle: string;
  onSubmit: (attempt: Omit<QuizAttempt, 'attemptedAt'>) => void;
  onBack: () => void;
  onContinue: () => void;
  onViewCertificate?: () => void;
}

type QuizState = 'intro' | 'taking' | 'result';

export function QuizPage({ quiz, isFinalExam, isPreTest, existingAttempts, courseTitle, onSubmit, onBack, onContinue, onViewCertificate }: QuizPageProps) {
  const [quizState, setQuizState] = useState<QuizState>(existingAttempts.length > 0 ? 'result' : 'intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(
    existingAttempts.length > 0 ? existingAttempts[existingAttempts.length - 1] : null
  );

  const remainingAttempts = quiz.maxAttempts === 0 ? Infinity : quiz.maxAttempts - existingAttempts.length;
  const canRetake = remainingAttempts > 0;

  const handleStart = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestion(0);
    setQuizState('taking');
  };

  const handleAnswer = (value: string) => {
    const updated = [...answers];
    updated[currentQuestion] = parseInt(value);
    setAnswers(updated);
  };

  const handleSubmit = () => {
    const correctCount = quiz.questions.reduce((sum, q, idx) => sum + (answers[idx] === q.correctIndex ? 1 : 0), 0);
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const attempt: Omit<QuizAttempt, 'attemptedAt'> = { quizId: quiz.id, score, passed, answers: answers.map((a) => a ?? -1) };
    const fullAttempt: QuizAttempt = { ...attempt, attemptedAt: new Date().toISOString() };
    setLastAttempt(fullAttempt);
    onSubmit(attempt);
    setQuizState('result');
  };

  const allAnswered = answers.every((a) => a !== null);
  const question = quiz.questions[currentQuestion];

  // Intro
  if (quizState === 'intro') {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Button startIcon={<ArrowLeft size={16} />} onClick={onBack} sx={{ mb: 3, color: '#64748B' }}>กลับ</Button>
        <Box sx={{ background: 'white', borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <Box sx={{ backgroundColor: isFinalExam ? '#0F3D1A' : isPreTest ? '#92400E' : '#0D9488', p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                {isFinalExam ? <Award size={28} color="white" /> : <BookOpen size={28} color="white" />}
              </Box>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', borderRadius: 2, px: 2, py: 0.5, display: 'inline-block', mb: 1.5, fontSize: '0.75rem', fontWeight: 700 }}>
                {isFinalExam ? 'ข้อสอบปลายภาค' : isPreTest ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบ'}
              </Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{quiz.title}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{courseTitle}</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
              {[
                { label: 'จำนวนข้อ', value: `${quiz.questions.length} ข้อ`, icon: <FileText size={18} color="#1E7A34" /> },
                { label: 'เกณฑ์ผ่าน', value: `${quiz.passingScore}%`, icon: <Award size={18} color="#1E7A34" /> },
                { label: 'จำนวนครั้งที่ทำได้', value: quiz.maxAttempts === 0 ? 'ไม่จำกัด' : `${quiz.maxAttempts} ครั้ง`, icon: <RotateCcw size={18} color="#1E7A34" /> },
                { label: 'ครั้งที่เหลือ', value: quiz.maxAttempts === 0 ? 'ไม่จำกัด' : `${remainingAttempts} ครั้ง`, icon: <Clock size={18} color="#1E7A34" /> },
              ].map((item) => (
                <Box key={item.label} sx={{ backgroundColor: '#F8FAFC', borderRadius: 2.5, p: 2, border: '1px solid #E2E8F0' }}>
                  <Box sx={{ mb: 0.5 }} aria-hidden="true">{item.icon}</Box>
                  <Typography variant="caption" sx={{ color: '#717182', display: 'block', fontWeight: 500 }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disableElevation
              onClick={handleStart}
              disabled={!canRetake}
              sx={{
                py: 1.5,
                backgroundColor: isFinalExam ? '#1E7A34' : isPreTest ? '#D97706' : '#059669',
                '&:hover': { backgroundColor: isFinalExam ? '#155724' : isPreTest ? '#B45309' : '#047857' },
                '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
              }}
            >
              เริ่มทำแบบทดสอบ
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Taking Quiz
  if (quizState === 'taking') {
    const questionProgress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto' }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => { setQuizState('intro'); setAnswers(new Array(quiz.questions.length).fill(null)); setCurrentQuestion(0); }}
          sx={{ mb: 2, color: '#64748B' }}
        >
          ออกจากแบบทดสอบ
        </Button>
        {/* Progress Header */}
        <Box sx={{ background: 'white', borderRadius: 3, border: '1px solid #E2E8F0', p: 2.5, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{quiz.title}</Typography>
            <Box sx={{ background: '#E8F5E9', borderRadius: 2, px: 1.5, py: 0.3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E7A34' }}>
                {currentQuestion + 1} / {quiz.questions.length}
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={questionProgress}
            sx={{
              height: 6,
              borderRadius: 9999,
              backgroundColor: '#ececf0',
              '& .MuiLinearProgress-bar': { backgroundColor: '#1E7A34', borderRadius: 9999 },
            }}
          />
        </Box>

        {/* Question */}
        <Box sx={{ background: 'white', borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Question dots */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quiz.questions.map((_, idx) => (
              <Box
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`ข้อ ${idx + 1}${answers[idx] !== null ? ' (ตอบแล้ว)' : ''}`}
                aria-current={idx === currentQuestion ? 'true' : undefined}
                onClick={() => setCurrentQuestion(idx)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentQuestion(idx)}
                sx={{
                  width: 30, height: 30, borderRadius: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                  transition: 'all 0.15s',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  backgroundColor: idx === currentQuestion ? '#1E7A34' : answers[idx] !== null ? '#ECFDF5' : '#F1F5F9',
                  color: idx === currentQuestion ? 'white' : answers[idx] !== null ? '#059669' : '#475569',
                  boxShadow: idx === currentQuestion ? '0 4px 12px rgba(30,122,52,0.4)' : 'none',
                  '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: 2 },
                }}
              >
                {idx + 1}
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Box sx={{ backgroundColor: '#E8F5E9', color: '#1E7A34', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 700 }}>
                ข้อ {currentQuestion + 1}
              </Box>
              <Box sx={{ backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 600 }}>
                {question.type === 'multiple_choice' ? 'เลือกตอบ' : 'ถูก / ผิด'}
              </Box>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3.5, lineHeight: 1.5, color: '#0F172A' }}>
              {question.question}
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup value={answers[currentQuestion] !== null ? String(answers[currentQuestion]) : ''} onChange={(e) => handleAnswer(e.target.value)}>
                {question.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion] === idx;
                  return (
                    <FormControlLabel
                      key={idx}
                      value={String(idx)}
                      control={<Radio sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#1E7A34' } }} />}
                      label={<Typography sx={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? '#155724' : '#334155', fontSize: '0.95rem' }}>{option}</Typography>}
                      sx={{
                        border: `2px solid ${isSelected ? '#1E7A34' : '#E2E8F0'}`,
                        borderRadius: 2.5,
                        mb: 1.5,
                        mx: 0, px: 1.5, py: 0.5,
                        backgroundColor: isSelected ? '#E8F5E9' : '#FAFAFA',
                        transition: 'all 0.15s',
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                        '&:hover': { borderColor: '#A5D6A7', backgroundColor: '#F1F8F2' },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ px: 4, py: 2.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', backgroundColor: '#FAFAFA' }}>
            <Button variant="outlined" startIcon={<ArrowLeft size={14} />} onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))} disabled={currentQuestion === 0}>
              ก่อนหน้า
            </Button>
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button variant="contained" disableElevation endIcon={<ArrowRight size={14} />} onClick={() => setCurrentQuestion((p) => p + 1)} disabled={answers[currentQuestion] === null} sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
                ถัดไป
              </Button>
            ) : (
              <Button variant="contained" disableElevation onClick={handleSubmit} disabled={!allAnswered} startIcon={<CheckCircle size={14} />} sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
                ส่งคำตอบ
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Result
  if (quizState === 'result' && lastAttempt) {
    const passed = lastAttempt.passed;
    const score = lastAttempt.score;
    const correct = quiz.questions.filter((q, i) => lastAttempt.answers[i] === q.correctIndex).length;

    return (
      <Box sx={{ maxWidth: 580, mx: 'auto' }}>
        <Box sx={{ background: 'white', borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Result Header */}
          <Box sx={{ backgroundColor: passed ? '#F0FDF4' : '#FEF2F2', p: 5, textAlign: 'center', borderBottom: '1px solid', borderColor: passed ? '#A7F3D0' : '#FECACA' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: passed ? '#059669' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, boxShadow: passed ? '0 8px 24px rgba(5,150,105,0.3)' : '0 8px 24px rgba(239,68,68,0.3)' }}>
              {passed ? <CheckCircle size={36} color="white" /> : <XCircle size={36} color="white" />}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: passed ? '#065F46' : '#991B1B', mb: 0.5 }}>
              {passed ? 'ยินดีด้วย! สอบผ่านแล้ว' : 'ยังไม่ผ่านเกณฑ์'}
            </Typography>
            <Typography variant="body2" sx={{ color: passed ? '#059669' : '#DC2626' }}>{quiz.title}</Typography>

            <Box sx={{ display: 'inline-block', mt: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '3.5rem', lineHeight: 1, color: passed ? '#059669' : '#EF4444' }}>
                {score}<Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>%</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: '#717182', display: 'block' }}>
                ตอบถูก {correct}/{quiz.questions.length} ข้อ · เกณฑ์ผ่าน {quiz.passingScore}%
              </Typography>
            </Box>
          </Box>

          {/* Review */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#475569' }}>ตรวจคำตอบ</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quiz.questions.map((q, idx) => {
                const userAns = lastAttempt.answers[idx];
                const correct = userAns === q.correctIndex;
                return (
                  <Box key={q.id} sx={{ borderRadius: 2.5, p: 2, backgroundColor: correct ? '#F0FDF4' : '#FFF5F5', border: `1.5px solid ${correct ? '#BBF7D0' : '#FED7D7'}`, display: 'flex', gap: 1.5 }}>
                    <Box sx={{ flexShrink: 0, mt: 0.2 }}>
                      {correct ? <CheckCircle size={16} color="#059669" /> : <XCircle size={16} color="#EF4444" />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: correct ? '#065F46' : '#991B1B', mb: 0.3 }}>
                        ข้อ {idx + 1}: {q.question}
                      </Typography>
                      {!correct && (
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                          เฉลย: {q.options[q.correctIndex]}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Divider />

          {/* Certificate banner for final exam pass */}
          {passed && isFinalExam && onViewCertificate && (
            <Box sx={{ mx: 3, mb: 0, mt: -1, borderRadius: 2.5, backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={22} color="white" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem', lineHeight: 1.3 }}>
                  ขอแสดงความยินดี! คุณได้รับใบประกาศนียบัตร
                </Typography>
                <Typography variant="caption" sx={{ color: '#B45309' }}>
                  ใบประกาศถูกออกให้แล้ว กดดูได้เลย
                </Typography>
              </Box>
              <Button
                variant="contained"
                disableElevation
                size="small"
                startIcon={<FileText size={14} />}
                onClick={onViewCertificate}
                sx={{ backgroundColor: '#D97706', flexShrink: 0, px: 2, '&:hover': { backgroundColor: '#B45309' } }}
              >
                ดูใบประกาศ
              </Button>
            </Box>
          )}

          <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!passed && canRetake && (
              <Button variant="outlined" startIcon={<RotateCcw size={14} />} onClick={handleStart}>
                ลองใหม่ ({quiz.maxAttempts === 0 ? '∞' : remainingAttempts} ครั้ง)
              </Button>
            )}
            <Button
              variant="contained"
              disableElevation
              onClick={onContinue}
              startIcon={passed ? <Award size={14} /> : <ArrowLeft size={14} />}
              sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
            >
              กลับไปคอร์ส
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
}
