import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Radio,
  RadioGroup,
  Divider,
  Chip,
} from '@mui/material';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Film,
  FileText,
  Link2,
  BookOpen,
  Save,
  Check,
  File,
  ClipboardList,
  CircleCheck,
  CircleDot,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Course, Module, Lesson, Quiz, Question, InVideoQuestion } from '../data/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const LESSON_TYPE_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  text:  { label: 'บทความ/เนื้อหา', icon: FileText, color: '#6366F1' },
  video: { label: 'วิดีโอ',         icon: Film,     color: '#EC4899' },
  pdf:   { label: 'PDF',            icon: File,     color: '#F59E0B' },
  link:  { label: 'ลิงก์ภายนอก',   icon: Link2,    color: '#10B981' },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function secsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function mmssToSecs(str: string): number {
  const trimmed = str.trim();
  if (trimmed.includes(':')) {
    const [mStr, sStr] = trimmed.split(':');
    return (parseInt(mStr, 10) || 0) * 60 + (parseInt(sStr, 10) || 0);
  }
  return parseInt(trimmed, 10) || 0;
}

function defaultQuiz(title: string): Quiz {
  return { id: genId('quiz'), title, passingScore: 70, maxAttempts: 3, questionCount: 10, questions: [] };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type LessonType = 'text' | 'video' | 'pdf' | 'link';
type QuizTarget = 'preTest' | 'finalExam';

interface LessonForm {
  title: string;
  duration: string;
  type: LessonType;
  content: string;
  videoUrl: string;
  externalUrl: string;
  inVideoQuestions: InVideoQuestion[];
}

interface IVQForm {
  atTimeStr: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: [string, string, string, string];
  correctIndex: number;
  mustCorrect: boolean;
}

interface QuestionForm {
  type: 'multiple_choice' | 'true_false';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

type ActivePane =
  | { kind: 'none' }
  | { kind: 'lesson'; isNew: boolean; modIdx: number; lesIdx: number }
  | { kind: 'quiz'; target: QuizTarget };

const defaultLessonForm = (): LessonForm => ({
  title: '', duration: '10 นาที', type: 'text', content: '', videoUrl: '', externalUrl: '',
  inVideoQuestions: [],
});

const defaultIVQForm = (): IVQForm => ({
  atTimeStr: '0:30',
  question: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correctIndex: 0,
  mustCorrect: true,
});

const defaultQuestionForm = (): QuestionForm => ({
  type: 'multiple_choice', question: '', options: ['', '', '', ''], correctIndex: 0,
});

// ─── QuestionDialog ───────────────────────────────────────────────────────────

interface QuestionDialogProps {
  open: boolean;
  form: QuestionForm;
  onChange: (form: QuestionForm) => void;
  onSave: () => void;
  onClose: () => void;
  isNew: boolean;
}

function QuestionDialog({ open, form, onChange, onSave, onClose, isNew }: QuestionDialogProps) {
  const isTF = form.type === 'true_false';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700 }}>{isNew ? 'เพิ่มข้อสอบใหม่' : 'แก้ไขข้อสอบ'}</Typography>
        <IconButton size="small" onClick={onClose}><X size={16} /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>ประเภทข้อสอบ</InputLabel>
            <Select
              value={form.type}
              label="ประเภทข้อสอบ"
              onChange={(e) => onChange({ ...form, type: e.target.value as QuestionForm['type'], correctIndex: 0 })}
            >
              <MenuItem key="multiple_choice" value="multiple_choice">ปรนัย (4 ตัวเลือก)</MenuItem>
              <MenuItem key="true_false" value="true_false">ถูก / ผิด</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="คำถาม"
            fullWidth
            multiline
            rows={3}
            value={form.question}
            onChange={(e) => onChange({ ...form, question: e.target.value })}
            placeholder="พิมพ์คำถามที่นี่..."
          />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#374151' }}>
              ตัวเลือก — เลือกคำตอบที่ถูกต้อง
            </Typography>
            <RadioGroup
              value={String(form.correctIndex)}
              onChange={(e) => onChange({ ...form, correctIndex: Number(e.target.value) })}
            >
              {(isTF ? ['ถูก', 'ผิด'] : OPTION_LABELS).map((label, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Radio value={String(idx)} size="small" sx={{ p: 0.5 }} />
                  {isTF ? (
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 40 }}>{label}</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Chip label={label} size="small" sx={{ minWidth: 28, fontWeight: 700, fontSize: '0.7rem' }} />
                      <TextField
                        size="small"
                        fullWidth
                        placeholder={`ตัวเลือก ${label}`}
                        value={form.options[idx]}
                        onChange={(e) => {
                          const opts = [...form.options] as QuestionForm['options'];
                          opts[idx] = e.target.value;
                          onChange({ ...form, options: opts });
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" startIcon={<Check size={15} />} onClick={onSave} disabled={!form.question.trim()}>
          บันทึกข้อสอบ
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── InVideoQuestionDialog ────────────────────────────────────────────────────

interface IVQDialogProps {
  open: boolean;
  form: IVQForm;
  onChange: (f: IVQForm) => void;
  onSave: () => void;
  onClose: () => void;
  isNew: boolean;
}

function InVideoQuestionDialog({ open, form, onChange, onSave, onClose, isNew }: IVQDialogProps) {
  const isTF = form.type === 'true_false';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpCircle size={16} color="#F59E0B" />
          <Typography sx={{ fontWeight: 700 }}>{isNew ? 'เพิ่มคำถามระหว่างเรียน' : 'แก้ไขคำถาม'}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><X size={16} /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Timestamp */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Clock size={14} color="#6366F1" /> เวลาที่แสดงคำถาม (นาที:วินาที)
            </Typography>
            <TextField
              fullWidth size="small"
              value={form.atTimeStr}
              onChange={(e) => onChange({ ...form, atTimeStr: e.target.value })}
              placeholder="เช่น 0:50 หรือ 2:30"
              helperText={`= วินาทีที่ ${mmssToSecs(form.atTimeStr)} ของวิดีโอ`}
            />
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>ประเภทคำถาม</InputLabel>
            <Select
              value={form.type}
              label="ประเภทคำถาม"
              onChange={(e) => onChange({ ...form, type: e.target.value as IVQForm['type'], correctIndex: 0 })}
            >
              <MenuItem key="mc" value="multiple_choice">ปรนัย (4 ตัวเลือก)</MenuItem>
              <MenuItem key="tf" value="true_false">ถูก / ผิด</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="คำถาม" fullWidth multiline rows={3}
            value={form.question}
            onChange={(e) => onChange({ ...form, question: e.target.value })}
            placeholder="พิมพ์คำถามที่นี่..."
          />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#374151' }}>
              ตัวเลือก — เลือกคำตอบที่ถูกต้อง
            </Typography>
            <RadioGroup
              value={String(form.correctIndex)}
              onChange={(e) => onChange({ ...form, correctIndex: Number(e.target.value) })}
            >
              {(isTF ? ['ถูก', 'ผิด'] : OPTION_LABELS).map((label, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Radio value={String(idx)} size="small" sx={{ p: 0.5 }} />
                  {isTF ? (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Chip label={label} size="small" sx={{ minWidth: 28, fontWeight: 700, fontSize: '0.7rem' }} />
                      <TextField
                        size="small" fullWidth
                        placeholder={`ตัวเลือก ${label}`}
                        value={form.options[idx]}
                        onChange={(e) => {
                          const opts = [...form.options] as IVQForm['options'];
                          opts[idx] = e.target.value;
                          onChange({ ...form, options: opts });
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </RadioGroup>
          </Box>

          {/* mustCorrect toggle */}
          <Box
            onClick={() => onChange({ ...form, mustCorrect: !form.mustCorrect })}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, cursor: 'pointer',
              bgcolor: form.mustCorrect ? '#FFF7ED' : '#F8FAFC',
              border: `1.5px solid ${form.mustCorrect ? '#FED7AA' : '#E2E8F0'}`,
              transition: 'all 0.15s',
            }}
          >
            <ShieldCheck size={18} color={form.mustCorrect ? '#F97316' : '#94A3B8'} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: form.mustCorrect ? '#C2410C' : '#64748B' }}>
                ต้องตอบถูกก่อนดูวิดีโอต่อ
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {form.mustCorrect ? 'เปิดใช้งาน — ผู้เรียนต้องตอบถูกจึงดูต่อได้' : 'ปิด — ตอบแล้วดูวิดีโอต่อได้ทันที'}
              </Typography>
            </Box>
            <Box sx={{ width: 36, height: 20, borderRadius: 10, bgcolor: form.mustCorrect ? '#F97316' : '#CBD5E1', position: 'relative', transition: 'all 0.2s' }}>
              <Box sx={{ position: 'absolute', top: 2, left: form.mustCorrect ? 18 : 2, width: 16, height: 16, borderRadius: '50%', bgcolor: 'white', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>ยกเลิก</Button>
        <Button
          variant="contained"
          startIcon={<Check size={15} />}
          onClick={onSave}
          disabled={!form.question.trim()}
          sx={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}
        >
          บันทึกคำถาม
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── QuizPanel (right-panel content) ─────────────────────────────────────────

interface QuizPanelProps {
  quiz: Quiz;
  target: QuizTarget;
  onChange: (q: Quiz) => void;
}

function QuizPanel({ quiz, onChange }: QuizPanelProps) {
  const [qDialog, setQDialog] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [qForm, setQForm] = useState<QuestionForm>(defaultQuestionForm());

  const openAdd = () => {
    setQForm(defaultQuestionForm());
    setQDialog({ open: true, idx: null });
  };

  const openEdit = (idx: number) => {
    const q = quiz.questions[idx];
    const opts: QuestionForm['options'] = q.type === 'true_false'
      ? ['ถูก', 'ผิด', '', '']
      : ([...q.options, '', '', '', ''].slice(0, 4) as QuestionForm['options']);
    setQForm({ type: q.type, question: q.question, options: opts, correctIndex: q.correctIndex });
    setQDialog({ open: true, idx });
  };

  const saveQuestion = () => {
    const isTF = qForm.type === 'true_false';
    const question: Question = {
      id: qDialog.idx !== null ? quiz.questions[qDialog.idx].id : genId('q'),
      type: qForm.type,
      question: qForm.question.trim(),
      options: isTF ? ['ถูก', 'ผิด'] : qForm.options.map((o) => o.trim()),
      correctIndex: qForm.correctIndex,
    };
    const questions = qDialog.idx !== null
      ? quiz.questions.map((q, i) => i === qDialog.idx ? question : q)
      : [...quiz.questions, question];
    onChange({ ...quiz, questions });
    setQDialog({ open: false, idx: null });
  };

  const deleteQuestion = (idx: number) => {
    onChange({ ...quiz, questions: quiz.questions.filter((_, i) => i !== idx) });
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Settings bar */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>สุ่มข้อสอบ</Typography>
          <TextField
            size="small"
            type="number"
            value={quiz.questionCount ?? 10}
            onChange={(e) => onChange({ ...quiz, questionCount: Math.max(1, Number(e.target.value)) })}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ width: 72 }}
          />
          <Typography variant="body2" color="text.secondary">ข้อ/ครั้ง</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>(คลัง {quiz.questions.length})</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>คะแนนผ่าน</Typography>
          <TextField
            size="small"
            type="number"
            value={quiz.passingScore}
            onChange={(e) => onChange({ ...quiz, passingScore: Math.max(0, Math.min(100, Number(e.target.value))) })}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            sx={{ width: 72 }}
          />
          <Typography variant="body2" color="text.secondary">%</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>ทำได้สูงสุด</Typography>
          <TextField
            size="small"
            type="number"
            value={quiz.maxAttempts}
            onChange={(e) => onChange({ ...quiz, maxAttempts: Math.max(1, Number(e.target.value)) })}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ width: 72 }}
          />
          <Typography variant="body2" color="text.secondary">ครั้ง</Typography>
        </Box>
      </Box>

      {/* Question list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {quiz.questions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
            <ClipboardList size={40} strokeWidth={1} style={{ margin: '0 auto 12px' }} />
            <Typography variant="body2">ยังไม่มีข้อสอบ กด "+ เพิ่มข้อสอบ" เพื่อเริ่มต้น</Typography>
          </Box>
        )}

        {quiz.questions.map((q, idx) => {
          const isTF = q.type === 'true_false';
          const displayOptions = isTF ? ['ถูก', 'ผิด'] : q.options;
          return (
            <Box
              key={q.id}
              sx={{ mb: 2, p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FAFBFC', '&:hover': { borderColor: '#C7D2FE', bgcolor: '#FAFAFE' } }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flex: 1, minWidth: 0 }}>
                  <Chip label={`ข้อ ${idx + 1}`} size="small" sx={{ fontWeight: 700, flexShrink: 0 }} />
                  <Chip label={isTF ? 'ถูก/ผิด' : 'ปรนัย'} size="small" variant="outlined" sx={{ flexShrink: 0, fontSize: '0.68rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>{q.question}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="แก้ไข">
                    <IconButton size="small" onClick={() => openEdit(idx)}><Pencil size={13} /></IconButton>
                  </Tooltip>
                  <Tooltip title="ลบ">
                    <IconButton size="small" onClick={() => deleteQuestion(idx)}><Trash2 size={13} color="#EF4444" /></IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: isTF ? '1fr 1fr' : '1fr 1fr', gap: 0.75 }}>
                {displayOptions.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctIndex;
                  return (
                    <Box
                      key={oIdx}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: isCorrect ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${isCorrect ? '#86EFAC' : '#E2E8F0'}` }}
                    >
                      {isCorrect
                        ? <CircleCheck size={14} color="#22C55E" />
                        : <CircleDot size={14} color="#CBD5E1" />}
                      {!isTF && <Chip label={OPTION_LABELS[oIdx]} size="small" sx={{ fontSize: '0.65rem', height: 18, minWidth: 20 }} />}
                      <Typography variant="caption" sx={{ color: isCorrect ? '#15803D' : '#64748B', fontWeight: isCorrect ? 600 : 400 }}>
                        {opt || <em style={{ opacity: 0.5 }}>ยังไม่ระบุ</em>}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}

        <Button fullWidth variant="outlined" startIcon={<Plus size={15} />} onClick={openAdd} sx={{ mt: 1, borderStyle: 'dashed' }}>
          เพิ่มข้อสอบใหม่
        </Button>
      </Box>

      <QuestionDialog
        open={qDialog.open}
        form={qForm}
        onChange={setQForm}
        onSave={saveQuestion}
        onClose={() => setQDialog({ open: false, idx: null })}
        isNew={qDialog.idx === null}
      />
    </Box>
  );
}

// ─── Main: CourseContentEditor ────────────────────────────────────────────────

interface Props {
  course: Course;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Course) => void;
}

export function CourseContentEditor({ course, open, onClose, onSave }: Props) {
  const [modules, setModules] = useState<Module[]>([]);
  const [preTest, setPreTest] = useState<Quiz | null>(null);
  const [finalExam, setFinalExam] = useState<Quiz | null>(null);
  const [selModIdx, setSelModIdx] = useState(0);

  const [editingModIdx, setEditingModIdx] = useState<number | null>(null);
  const [editingModTitle, setEditingModTitle] = useState('');

  const [activePane, setActivePane] = useState<ActivePane>({ kind: 'none' });
  const [lessonForm, setLessonForm] = useState<LessonForm>(defaultLessonForm());

  const [delConfirm, setDelConfirm] = useState<{ type: 'module' | 'lesson'; modIdx: number; lesIdx?: number } | null>(null);
  const [saved, setSaved] = useState(false);

  // In-video question dialog state
  const [ivqDialog, setIvqDialog] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [ivqForm, setIvqForm] = useState<IVQForm>(defaultIVQForm());

  useEffect(() => {
    if (open) {
      setModules(JSON.parse(JSON.stringify(course.modules)));
      setPreTest(course.preTest ? JSON.parse(JSON.stringify(course.preTest)) : null);
      setFinalExam(course.finalExam ? JSON.parse(JSON.stringify(course.finalExam)) : null);
      setSelModIdx(0);
      setEditingModIdx(null);
      setActivePane({ kind: 'none' });
      setSaved(false);
    }
  }, [open, course]);

  const selMod = modules[selModIdx];
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  // ── Quiz helpers ──────────────────────────────────────────────────────────

  const openQuizPane = (target: QuizTarget) => {
    if (target === 'preTest' && !preTest) setPreTest(defaultQuiz('แบบทดสอบก่อนเรียน'));
    if (target === 'finalExam' && !finalExam) setFinalExam(defaultQuiz('แบบทดสอบหลังเรียน'));
    setActivePane({ kind: 'quiz', target });
  };

  const currentQuiz = activePane.kind === 'quiz'
    ? (activePane.target === 'preTest' ? preTest : finalExam)
    : null;

  const handleQuizChange = (q: Quiz) => {
    if (activePane.kind !== 'quiz') return;
    if (activePane.target === 'preTest') setPreTest(q);
    else setFinalExam(q);
  };

  // ── Module operations ─────────────────────────────────────────────────────

  const addModule = () => {
    const newMod: Module = { id: genId('mod'), title: 'บทใหม่', lessons: [] };
    const updated = [...modules, newMod];
    setModules(updated);
    const newIdx = updated.length - 1;
    setSelModIdx(newIdx);
    setEditingModIdx(newIdx);
    setEditingModTitle('บทใหม่');
    setActivePane({ kind: 'none' });
  };

  const saveModTitle = (idx: number) => {
    setModules(modules.map((m, i) => i === idx ? { ...m, title: editingModTitle.trim() || m.title } : m));
    setEditingModIdx(null);
  };

  const deleteModule = (idx: number) => {
    const updated = modules.filter((_, i) => i !== idx);
    setModules(updated);
    setSelModIdx(Math.max(0, Math.min(idx, updated.length - 1)));
    setDelConfirm(null);
    setActivePane({ kind: 'none' });
  };

  // ── Lesson operations ─────────────────────────────────────────────────────

  const openAddLesson = (modIdx: number) => {
    setLessonForm(defaultLessonForm());
    setActivePane({ kind: 'lesson', isNew: true, modIdx, lesIdx: -1 });
  };

  const openEditLesson = (modIdx: number, lesIdx: number) => {
    const les = modules[modIdx].lessons[lesIdx];
    setLessonForm({
      title: les.title,
      duration: les.duration,
      type: les.type as LessonType,
      content: les.content || '',
      videoUrl: les.videoUrl || '',
      externalUrl: les.externalUrl || '',
      inVideoQuestions: les.inVideoQuestions ? JSON.parse(JSON.stringify(les.inVideoQuestions)) : [],
    });
    setActivePane({ kind: 'lesson', isNew: false, modIdx, lesIdx });
  };

  // IVQ CRUD helpers
  const openAddIVQ = () => {
    setIvqForm(defaultIVQForm());
    setIvqDialog({ open: true, idx: null });
  };

  const openEditIVQ = (idx: number) => {
    const ivq = lessonForm.inVideoQuestions[idx];
    const opts: IVQForm['options'] = ivq.type === 'true_false'
      ? ['ถูก', 'ผิด', '', '']
      : ([...ivq.options, '', '', '', ''].slice(0, 4) as IVQForm['options']);
    setIvqForm({
      atTimeStr: secsToMMSS(ivq.atSecond),
      question: ivq.question,
      type: ivq.type,
      options: opts,
      correctIndex: ivq.correctIndex,
      mustCorrect: ivq.mustCorrect,
    });
    setIvqDialog({ open: true, idx });
  };

  const saveIVQ = () => {
    const isTF = ivqForm.type === 'true_false';
    const ivq: InVideoQuestion = {
      id: ivqDialog.idx !== null ? lessonForm.inVideoQuestions[ivqDialog.idx].id : genId('ivq'),
      atSecond: mmssToSecs(ivqForm.atTimeStr),
      question: ivqForm.question.trim(),
      type: ivqForm.type,
      options: isTF ? ['ถูก', 'ผิด'] : ivqForm.options.map((o) => o.trim()),
      correctIndex: ivqForm.correctIndex,
      mustCorrect: ivqForm.mustCorrect,
    };
    const updated = ivqDialog.idx !== null
      ? lessonForm.inVideoQuestions.map((q, i) => i === ivqDialog.idx ? ivq : q)
      : [...lessonForm.inVideoQuestions, ivq];
    const sorted = updated.slice().sort((a, b) => a.atSecond - b.atSecond);
    setLessonForm({ ...lessonForm, inVideoQuestions: sorted });
    setIvqDialog({ open: false, idx: null });
  };

  const deleteIVQ = (idx: number) => {
    setLessonForm({ ...lessonForm, inVideoQuestions: lessonForm.inVideoQuestions.filter((_, i) => i !== idx) });
  };

  const saveLesson = () => {
    if (activePane.kind !== 'lesson') return;
    const { isNew, modIdx, lesIdx } = activePane;
    const existingLesson = !isNew ? modules[modIdx].lessons[lesIdx] : null;
    const lessonData: Lesson = {
      id: isNew ? genId('les') : existingLesson!.id,
      title: lessonForm.title || 'บทเรียนใหม่',
      duration: lessonForm.duration,
      type: lessonForm.type,
      content: lessonForm.content,
      ...(lessonForm.videoUrl ? { videoUrl: lessonForm.videoUrl } : {}),
      ...(lessonForm.externalUrl ? { externalUrl: lessonForm.externalUrl } : {}),
      // Preserve existing quiz when editing
      ...(existingLesson?.quiz ? { quiz: existingLesson.quiz } : {}),
      ...(lessonForm.inVideoQuestions.length > 0 ? { inVideoQuestions: lessonForm.inVideoQuestions } : {}),
    };
    setModules(modules.map((m, mIdx) => {
      if (mIdx !== modIdx) return m;
      const lessons = isNew
        ? [...m.lessons, lessonData]
        : m.lessons.map((l, lIdx) => lIdx === lesIdx ? lessonData : l);
      return { ...m, lessons };
    }));
    setActivePane({ kind: 'none' });
  };

  const deleteLesson = (modIdx: number, lesIdx: number) => {
    setModules(modules.map((m, mIdx) => {
      if (mIdx !== modIdx) return m;
      return { ...m, lessons: m.lessons.filter((_, lIdx) => lIdx !== lesIdx) };
    }));
    setDelConfirm(null);
    if (activePane.kind === 'lesson' && activePane.modIdx === modIdx && activePane.lesIdx === lesIdx) {
      setActivePane({ kind: 'none' });
    }
  };

  const handleSave = () => {
    onSave({
      ...course,
      modules,
      preTest: preTest && preTest.questions.length > 0 ? preTest : undefined,
      finalExam: finalExam && finalExam.questions.length > 0 ? finalExam : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Quiz row chip ─────────────────────────────────────────────────────────

  const QuizRow = ({ target, label }: { target: QuizTarget; label: string }) => {
    const quiz = target === 'preTest' ? preTest : finalExam;
    const isActive = activePane.kind === 'quiz' && activePane.target === target;
    return (
      <Box
        onClick={() => openQuizPane(target)}
        sx={{
          px: 1.5, py: 1.2, cursor: 'pointer', borderRadius: 1.5, mx: 1, mb: 0.5,
          bgcolor: isActive ? '#FFF7ED' : 'transparent',
          border: isActive ? '1px solid #FED7AA' : '1px dashed #CBD5E1',
          '&:hover': { bgcolor: isActive ? '#FFF7ED' : '#FFF8F0', borderColor: '#FED7AA' },
          display: 'flex', alignItems: 'center', gap: 1,
        }}
      >
        <ClipboardList size={14} color="#F97316" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.8rem', color: '#EA580C' }}>{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {quiz ? `สุ่ม ${quiz.questionCount ?? 10} จาก ${quiz.questions.length} ข้อ · ผ่าน ${quiz.passingScore}%` : 'ยังไม่มีข้อสอบ'}
          </Typography>
        </Box>
        {quiz && quiz.questions.length > 0 && <CircleCheck size={14} color="#22C55E" />}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', py: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BookOpen size={20} color="#6366F1" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '1rem' }}>จัดการเนื้อหาคอร์ส</Typography>
            <Typography variant="caption" color="text.secondary">{course.title}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
      </DialogTitle>

      {/* ── 3-column body ── */}
      <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ─ Left: Module list + quiz rows ─ */}
        <Box sx={{ width: 260, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0, bgcolor: '#FAFBFC' }}>

          {/* Pre-test */}
          <Box sx={{ px: 1, pt: 1.5, pb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', px: 1, display: 'block', mb: 0.5 }}>
              ก่อนเรียน
            </Typography>
            <QuizRow target="preTest" label="แบบทดสอบก่อนเรียน" />
          </Box>

          <Divider sx={{ mx: 2, my: 1 }} />

          {/* Modules */}
          <Box sx={{ px: 1, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', px: 1 }}>
              โมดูล ({modules.length})
            </Typography>
            <Tooltip title="เพิ่มโมดูล">
              <IconButton size="small" color="primary" onClick={addModule}><Plus size={15} /></IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 0.5 }}>
            {modules.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>ยังไม่มีโมดูล</Typography>
                <Button size="small" startIcon={<Plus size={13} />} onClick={addModule}>เพิ่มโมดูล</Button>
              </Box>
            )}
            {modules.map((mod, idx) => (
              <Box
                key={mod.id}
                onClick={() => {
                  setSelModIdx(idx);
                  if (activePane.kind === 'quiz') setActivePane({ kind: 'none' });
                }}
                sx={{
                  px: 1.5, py: 1.2, cursor: 'pointer', borderRadius: 1.5, mb: 0.5,
                  bgcolor: selModIdx === idx && activePane.kind !== 'quiz' ? '#EEF2FF' : 'transparent',
                  border: selModIdx === idx && activePane.kind !== 'quiz' ? '1px solid #C7D2FE' : '1px solid transparent',
                  '&:hover': { bgcolor: selModIdx === idx && activePane.kind !== 'quiz' ? '#EEF2FF' : '#F1F5F9' },
                }}
              >
                {editingModIdx === idx ? (
                  <TextField
                    autoFocus size="small"
                    value={editingModTitle}
                    onChange={(e) => setEditingModTitle(e.target.value)}
                    onBlur={() => saveModTitle(idx)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveModTitle(idx); if (e.key === 'Escape') setEditingModIdx(null); }}
                    onClick={(e) => e.stopPropagation()}
                    fullWidth
                    sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.5 } }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: selModIdx === idx ? 700 : 500, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{mod.lessons.length} บทเรียน</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" sx={{ p: 0.4 }} onClick={() => { setEditingModIdx(idx); setEditingModTitle(mod.title); }}>
                        <Pencil size={12} color="#94A3B8" />
                      </IconButton>
                      <IconButton size="small" sx={{ p: 0.4 }} onClick={() => setDelConfirm({ type: 'module', modIdx: idx })}>
                        <Trash2 size={12} color="#EF4444" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          <Divider sx={{ mx: 2, my: 1 }} />

          {/* Post-test */}
          <Box sx={{ px: 1, pb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', px: 1, display: 'block', mb: 0.5 }}>
              หลังเรียน
            </Typography>
            <QuizRow target="finalExam" label="แบบทดสอบหลังเรียน" />
          </Box>
        </Box>

        {/* ─ Center: Lesson list ─ */}
        <Box sx={{ width: 280, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {activePane.kind === 'quiz' ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: '#CBD5E1', p: 3, textAlign: 'center' }}>
              <ClipboardList size={36} strokeWidth={1} />
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                แก้ไขข้อสอบและตั้งค่าแบบทดสอบ<br />ในแผงด้านขวา
              </Typography>
            </Box>
          ) : selMod ? (
            <>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                  บทเรียน ({selMod.lessons.length})
                </Typography>
                <Tooltip title="เพิ่มบทเรียน">
                  <IconButton size="small" color="primary" onClick={() => openAddLesson(selModIdx)}><Plus size={16} /></IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                {selMod.lessons.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>ยังไม่มีบทเรียน</Typography>
                    <Button size="small" startIcon={<Plus size={13} />} onClick={() => openAddLesson(selModIdx)}>เพิ่มบทเรียน</Button>
                  </Box>
                )}
                {selMod.lessons.map((les, lesIdx) => {
                  const typeInfo = LESSON_TYPE_INFO[les.type] || LESSON_TYPE_INFO.text;
                  const TypeIcon = typeInfo.icon;
                  const isActive = activePane.kind === 'lesson' && !activePane.isNew && activePane.modIdx === selModIdx && activePane.lesIdx === lesIdx;
                  return (
                    <Box
                      key={les.id}
                      onClick={() => openEditLesson(selModIdx, lesIdx)}
                      sx={{
                        px: 1.5, py: 1.2, cursor: 'pointer', borderRadius: 1.5, mx: 1, mb: 0.5,
                        bgcolor: isActive ? '#F0FDF4' : 'transparent',
                        border: isActive ? '1px solid #BBF7D0' : '1px solid transparent',
                        '&:hover': { bgcolor: isActive ? '#F0FDF4' : '#F8FAFC' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 1, bgcolor: `${typeInfo.color}15`, flexShrink: 0 }}>
                          <TypeIcon size={14} color={typeInfo.color} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {les.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{typeInfo.label} · {les.duration}</Typography>
                        </Box>
                        <Box onClick={(e) => e.stopPropagation()}>
                          <IconButton size="small" sx={{ p: 0.4 }} onClick={() => setDelConfirm({ type: 'lesson', modIdx: selModIdx, lesIdx })}>
                            <Trash2 size={12} color="#EF4444" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">เลือกโมดูลทางซ้ายเพื่อดูบทเรียน</Typography>
            </Box>
          )}
        </Box>

        {/* ─ Right: Lesson form or Quiz builder ─ */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activePane.kind === 'quiz' && currentQuiz ? (
            <>
              <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                <ClipboardList size={16} color="#F97316" />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activePane.target === 'preTest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'}
                </Typography>
              </Box>
              <QuizPanel
                quiz={currentQuiz}
                target={activePane.target}
                onChange={handleQuizChange}
              />
            </>
          ) : activePane.kind === 'lesson' ? (
            <>
              <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activePane.isNew ? 'เพิ่มบทเรียนใหม่' : 'แก้ไขบทเรียน'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setActivePane({ kind: 'none' })}>ยกเลิก</Button>
                  <Button size="small" variant="contained" startIcon={<Check size={14} />} onClick={saveLesson}>บันทึกบทเรียน</Button>
                </Box>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="ชื่อบทเรียน" fullWidth
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="เช่น บทนำ: ภาพรวมผลิตภัณฑ์"
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>ประเภทบทเรียน</InputLabel>
                      <Select
                        value={lessonForm.type}
                        label="ประเภทบทเรียน"
                        onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as LessonType })}
                      >
                        {Object.entries(LESSON_TYPE_INFO).map(([val, info]) => (
                          <MenuItem key={val} value={val}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <info.icon size={15} color={info.color} />{info.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="ระยะเวลา" fullWidth
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="เช่น 15 นาที"
                    />
                  </Box>
                  {lessonForm.type === 'video' && (
                    <TextField
                      label="URL วิดีโอ" fullWidth
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      placeholder="https://... หรือ YouTube URL"
                      helperText="รองรับ YouTube URL และไฟล์ MP4 โดยตรง"
                    />
                  )}
                  {lessonForm.type === 'link' && (
                    <TextField
                      label="URL ภายนอก" fullWidth
                      value={lessonForm.externalUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  )}
                  <TextField
                    label={lessonForm.type === 'video' ? 'คำอธิบายประกอบวิดีโอ' : 'เนื้อหาบทเรียน'}
                    fullWidth multiline
                    rows={lessonForm.type === 'video' ? 6 : 12}
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder={lessonForm.type === 'video' ? 'คำอธิบายประกอบวิดีโอ...' : 'เนื้อหาบทเรียน รองรับ Markdown...'}
                    helperText="รองรับ Markdown: **ตัวหนา**, *ตัวเอียง*, ## หัวข้อ, • รายการ"
                  />

                  {/* In-video questions section — video lessons only */}
                  {lessonForm.type === 'video' && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HelpCircle size={15} color="#F59E0B" />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                            คำถามระหว่างเรียน
                          </Typography>
                          {lessonForm.inVideoQuestions.length > 0 && (
                            <Chip label={lessonForm.inVideoQuestions.length} size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                        <Button size="small" startIcon={<Plus size={13} />} onClick={openAddIVQ} sx={{ color: '#F59E0B' }}>
                          เพิ่มคำถาม
                        </Button>
                      </Box>

                      {lessonForm.inVideoQuestions.length === 0 ? (
                        <Box
                          onClick={openAddIVQ}
                          sx={{
                            border: '1.5px dashed #FDE68A', borderRadius: 2, p: 2.5, textAlign: 'center',
                            cursor: 'pointer', bgcolor: '#FFFBEB',
                            '&:hover': { bgcolor: '#FEF3C7', borderColor: '#F59E0B' },
                          }}
                        >
                          <HelpCircle size={24} color="#FCD34D" style={{ margin: '0 auto 8px' }} />
                          <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 500 }}>
                            กดเพื่อเพิ่มคำถามระหว่างเรียน
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#B45309' }}>
                            ระบบจะหยุดวิดีโอและแสดงคำถามเมื่อถึงเวลาที่กำหนด
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {lessonForm.inVideoQuestions.map((ivq, idx) => (
                            <Box
                              key={ivq.id}
                              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid #FDE68A', borderRadius: 2, bgcolor: '#FFFBEB' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                <Clock size={12} color="#D97706" />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#D97706', minWidth: 36 }}>
                                  {secsToMMSS(ivq.atSecond)}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ivq.question}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignItems: 'center' }}>
                                {ivq.mustCorrect && (
                                  <Tooltip title="ต้องตอบถูกก่อนดูต่อ">
                                    <Box sx={{ display: 'flex' }}>
                                      <ShieldCheck size={13} color="#F97316" />
                                    </Box>
                                  </Tooltip>
                                )}
                                <Chip label={ivq.type === 'true_false' ? 'ถูก/ผิด' : 'ปรนัย'} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                                <Tooltip title="แก้ไข">
                                  <IconButton size="small" sx={{ p: 0.4 }} onClick={() => openEditIVQ(idx)}>
                                    <Pencil size={12} color="#6366F1" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ลบ">
                                  <IconButton size="small" sx={{ p: 0.4 }} onClick={() => deleteIVQ(idx)}>
                                    <Trash2 size={12} color="#EF4444" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          ))}
                          <Button size="small" variant="outlined" startIcon={<Plus size={13} />} onClick={openAddIVQ} sx={{ mt: 0.5, borderStyle: 'dashed', borderColor: '#FDE68A', color: '#D97706', '&:hover': { bgcolor: '#FFF7ED' } }}>
                            เพิ่มคำถามอีก
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: '#CBD5E1' }}>
              <BookOpen size={48} strokeWidth={1} />
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                เลือกบทเรียนเพื่อแก้ไข หรือกด <strong>+</strong> เพื่อเพิ่มบทเรียนใหม่
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box sx={{ borderTop: '1px solid #E2E8F0', px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {totalLessons} บทเรียน · {modules.length} โมดูล
          {preTest && preTest.questions.length > 0 && ` · Pre-test ${preTest.questions.length} ข้อ`}
          {finalExam && finalExam.questions.length > 0 && ` · Post-test ${finalExam.questions.length} ข้อ`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>ปิด</Button>
          <Button
            variant="contained"
            startIcon={saved ? <Check size={15} /> : <Save size={15} />}
            onClick={handleSave}
            color={saved ? 'success' : 'primary'}
            sx={{ minWidth: 180 }}
          >
            {saved ? 'บันทึกแล้ว!' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </Box>
      </Box>

      {/* ── In-video question dialog ── */}
      <InVideoQuestionDialog
        open={ivqDialog.open}
        form={ivqForm}
        onChange={setIvqForm}
        onSave={saveIVQ}
        onClose={() => setIvqDialog({ open: false, idx: null })}
        isNew={ivqDialog.idx === null}
      />

      {/* ── Delete confirmation ── */}
      <Dialog open={!!delConfirm} onClose={() => setDelConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Trash2 size={18} color="#EF4444" />ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {delConfirm?.type === 'module'
              ? `ต้องการลบโมดูล "${modules[delConfirm.modIdx]?.title}"? บทเรียนทั้งหมด ${modules[delConfirm.modIdx]?.lessons.length} บทเรียนจะถูกลบด้วย`
              : `ต้องการลบบทเรียน "${delConfirm && modules[delConfirm.modIdx]?.lessons[delConfirm.lesIdx!]?.title}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={() => {
            if (!delConfirm) return;
            if (delConfirm.type === 'module') deleteModule(delConfirm.modIdx);
            else deleteLesson(delConfirm.modIdx, delConfirm.lesIdx!);
          }}>ลบ</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
