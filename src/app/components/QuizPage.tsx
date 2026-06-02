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
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Award, RotateCcw, BookOpen, FileText } from 'lucide-react';
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
          <Box sx={{ background: isFinalExam ? 'linear-gradient(135deg, #1E1B4B, #312E81)' : isPreTest ? 'linear-gradient(135deg, #92400E, #D97706)' : 'linear-gradient(135deg, #0F766E, #0D9488)', p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, backdropFilter: 'blur(10px)' }}>
                {isFinalExam ? <Award size={28} color="white" /> : <BookOpen size={28} color="white" />}
              </Box>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', borderRadius: 2, px: 2, py: 0.5, display: 'inline-block', mb: 1.5, fontSize: '0.75rem', fontWeight: 700 }}>
                {isFinalExam ? 'FINAL EXAM' : isPreTest ? 'PRE-TEST' : 'QUIZ'}
              </Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{quiz.title}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{courseTitle}</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
              {[
                { label: 'จำนวนข้อ', value: `${quiz.questions.length} ข้อ`, icon: '📝' },
                { label: 'เกณฑ์ผ่าน', value: `${quiz.passingScore}%`, icon: '🎯' },
                { label: 'จำนวนครั้งที่ทำได้', value: quiz.maxAttempts === 0 ? 'ไม่จำกัด' : `${quiz.maxAttempts} ครั้ง`, icon: '🔄' },
                { label: 'ครั้งที่เหลือ', value: quiz.maxAttempts === 0 ? 'ไม่จำกัด' : `${remainingAttempts} ครั้ง`, icon: '⏳' },
              ].map((item) => (
                <Box key={item.label} sx={{ backgroundColor: '#F8FAFC', borderRadius: 2.5, p: 2, border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>{item.icon}</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontWeight: 500 }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleStart}
              disabled={!canRetake}
              sx={{
                py: 1.5,
                background: isFinalExam ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : isPreTest ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #10B981, #059669)',
                '&:hover': { boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
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
        {/* Progress Header */}
        <Box sx={{ background: 'white', borderRadius: 3, border: '1px solid #E2E8F0', p: 2.5, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{quiz.title}</Typography>
            <Box sx={{ background: '#EEF2FF', borderRadius: 2, px: 1.5, py: 0.3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366F1' }}>
                {currentQuestion + 1} / {quiz.questions.length}
              </Typography>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={questionProgress} sx={{ height: 6 }} />
        </Box>

        {/* Question */}
        <Box sx={{ background: 'white', borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Question dots */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quiz.questions.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                sx={{
                  width: 30, height: 30, borderRadius: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                  transition: 'all 0.15s',
                  backgroundColor: idx === currentQuestion ? '#6366F1' : answers[idx] !== null ? '#ECFDF5' : '#F1F5F9',
                  color: idx === currentQuestion ? 'white' : answers[idx] !== null ? '#059669' : '#94A3B8',
                  boxShadow: idx === currentQuestion ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                {idx + 1}
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Box sx={{ backgroundColor: '#EEF2FF', color: '#6366F1', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 700 }}>
                ข้อ {currentQuestion + 1}
              </Box>
              <Box sx={{ backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: 1.5, px: 1.5, py: 0.4, fontSize: '0.72rem', fontWeight: 600 }}>
                {question.type === 'multiple_choice' ? 'Multiple Choice' : 'True / False'}
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
                      control={<Radio sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#6366F1' } }} />}
                      label={<Typography sx={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? '#4F46E5' : '#334155', fontSize: '0.95rem' }}>{option}</Typography>}
                      sx={{
                        border: `2px solid ${isSelected ? '#6366F1' : '#E2E8F0'}`,
                        borderRadius: 2.5,
                        mb: 1.5,
                        mx: 0, px: 1.5, py: 0.5,
                        backgroundColor: isSelected ? '#EEF2FF' : '#FAFAFA',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: '#A5B4FC', backgroundColor: '#F5F3FF' },
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
              <Button variant="contained" endIcon={<ArrowRight size={14} />} onClick={() => setCurrentQuestion((p) => p + 1)} disabled={answers[currentQuestion] === null} sx={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                ถัดไป
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSubmit} disabled={!allAnswered} startIcon={<CheckCircle size={14} />} sx={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
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
          <Box sx={{ background: passed ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, #FEF2F2, #FECACA)', p: 5, textAlign: 'center', borderBottom: '1px solid', borderColor: passed ? '#A7F3D0' : '#FECACA' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: passed ? 'linear-gradient(135deg, #10B981, #34D399)' : 'linear-gradient(135deg, #EF4444, #F87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, boxShadow: passed ? '0 8px 24px rgba(16,185,129,0.4)' : '0 8px 24px rgba(239,68,68,0.4)' }}>
              {passed ? <CheckCircle size={36} color="white" /> : <XCircle size={36} color="white" />}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: passed ? '#065F46' : '#991B1B', mb: 0.5 }}>
              {passed ? 'ยินดีด้วย! สอบผ่าน 🎉' : 'ยังไม่ผ่านเกณฑ์'}
            </Typography>
            <Typography variant="body2" sx={{ color: passed ? '#059669' : '#DC2626' }}>{quiz.title}</Typography>

            <Box sx={{ display: 'inline-block', mt: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '3.5rem', lineHeight: 1, color: passed ? '#10B981' : '#EF4444' }}>
                {score}<Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>%</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
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
                      {correct ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: correct ? '#065F46' : '#991B1B', mb: 0.3 }}>
                        ข้อ {idx + 1}: {q.question}
                      </Typography>
                      {!correct && (
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
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
            <Box sx={{ mx: 3, mb: 0, mt: -1, borderRadius: 2.5, background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1.5px solid #FDE68A', p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={22} color="white" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem', lineHeight: 1.3 }}>
                  🎉 ขอแสดงความยินดี! คุณได้รับใบประกาศนียบัตร
                </Typography>
                <Typography variant="caption" sx={{ color: '#B45309' }}>
                  ใบประกาศถูกออกให้แล้ว กดดูได้เลย
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<FileText size={14} />}
                onClick={onViewCertificate}
                sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', flexShrink: 0, px: 2, '&:hover': { boxShadow: '0 6px 16px rgba(245,158,11,0.4)' } }}
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
              onClick={onContinue}
              startIcon={passed ? <Award size={14} /> : <ArrowLeft size={14} />}
              sx={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', '&:hover': { boxShadow: '0 8px 24px rgba(99,102,241,0.4)' } }}
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
