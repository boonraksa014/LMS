import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  BookOpen,
  CheckCircle,
  Plus,
  X,
  Image as ImageIcon,
  Clock,
  Tag,
  LayoutList,
  Pencil,
  Copy,
} from 'lucide-react';
import { mockUsers } from '../data/users';
import { courses as staticCourses } from '../data/courses';
import { Certificate, Course, CourseProgress, CourseStatus } from '../data/types';
import { CourseContentEditor } from './CourseContentEditor';
import { getCourseEnrollStatus, getTotalLessons } from '../utils/helpers';

interface CourseManagementProps {
  allProgress: CourseProgress[];
  certificates: Certificate[];
  managedGroups: string[];
  managedCategories: string[];
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  duration: string;
  image: string;
  allowedGroups: string[];
}

const defaultCourseForm = (): CourseForm => ({
  title: '', description: '', category: 'Product Knowledge', status: 'draft', duration: '', image: '', allowedGroups: [],
});

const courseStatusThai: Record<string, string> = { draft: 'ฉบับร่าง', published: 'เผยแพร่แล้ว', archived: 'เก็บถาวร' };
const courseStatusChipSx: Record<string, object> = {
  draft:     { backgroundColor: '#F1F5F9', color: '#475569' },
  published: { backgroundColor: '#DCFCE7', color: '#166534' },
  archived:  { backgroundColor: '#FEF3C7', color: '#92400E' },
};

export function CourseManagement({ allProgress, certificates, managedGroups, managedCategories }: CourseManagementProps) {
  const [courseFormDialog, setCourseFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; courseId?: string }>({ open: false, mode: 'create' });
  const [courseForm, setCourseForm] = useState<CourseForm>(defaultCourseForm());
  const [courseFormErrors, setCourseFormErrors] = useState<Partial<Record<keyof CourseForm, string>>>({});
  const [courseSaveSuccess, setCourseSaveSuccess] = useState('');

  const [editableCourses, setEditableCourses] = useState<Course[]>(() => JSON.parse(JSON.stringify(staticCourses)));
  const [contentEditor, setContentEditor] = useState<{ open: boolean; courseId: string | null }>({ open: false, courseId: null });

  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; courseId: string; courseName: string }>({ open: false, courseId: '', courseName: '' });
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [duplicateSuccess, setDuplicateSuccess] = useState('');

  const learners = mockUsers.filter((u) => u.role === 'learner');

  const openCreateCourse = () => {
    setCourseForm(defaultCourseForm());
    setCourseFormErrors({});
    setCourseFormDialog({ open: true, mode: 'create' });
  };

  const openEditCourse = (courseId: string) => {
    const course = staticCourses.find((c) => c.id === courseId);
    if (!course) return;
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      status: course.status,
      duration: course.duration,
      image: course.image,
      allowedGroups: course.allowedGroups,
    });
    setCourseFormErrors({});
    setCourseFormDialog({ open: true, mode: 'edit', courseId });
  };

  const validateCourseForm = (): boolean => {
    const errs: Partial<Record<keyof CourseForm, string>> = {};
    if (!courseForm.title.trim()) errs.title = 'กรุณากรอกชื่อคอร์ส';
    if (!courseForm.description.trim()) errs.description = 'กรุณากรอกคำอธิบาย';
    if (!courseForm.duration.trim()) errs.duration = 'กรุณากรอกระยะเวลา';
    setCourseFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCourse = () => {
    if (!validateCourseForm()) return;
    const msg = courseFormDialog.mode === 'create'
      ? `สร้างคอร์ส "${courseForm.title}" เรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึกถาวร)`
      : `บันทึกคอร์ส "${courseForm.title}" เรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึกถาวร)`;
    setCourseFormDialog({ open: false, mode: 'create' });
    setCourseSaveSuccess(msg);
    setTimeout(() => setCourseSaveSuccess(''), 5000);
  };

  const handleDuplicate = () => {
    setDuplicateSuccess(`คอร์ส "${duplicateTitle}" ถูกสร้างเรียบร้อยแล้ว (ต้องการ Backend เพื่อบันทึก)`);
    setDuplicateDialog({ open: false, courseId: '', courseName: '' });
    setDuplicateTitle('');
    setTimeout(() => setDuplicateSuccess(''), 5000);
  };

  return (
    <Box>
      {courseSaveSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCourseSaveSuccess('')}>{courseSaveSuccess}</Alert>}
      {duplicateSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDuplicateSuccess('')}>{duplicateSuccess}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
          คอร์สทั้งหมด ({editableCourses.length} คอร์ส)
        </Typography>
        <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateCourse}>
          เพิ่มคอร์สใหม่
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ชื่อคอร์ส</TableCell>
              <TableCell>หมวดหมู่</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>บทเรียน</TableCell>
              <TableCell>ผู้เรียน</TableCell>
              <TableCell>ผ่าน</TableCell>
              <TableCell>ใบประกาศ</TableCell>
              <TableCell>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editableCourses.map((course) => {
              const enrolled = learners.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) !== 'not_started').length;
              const passed = learners.filter((u) => getCourseEnrollStatus(course, u.id, allProgress) === 'passed').length;
              const certCount = certificates.filter((c) => c.courseId === course.id).length;
              return (
                <TableRow key={course.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box component="img" src={course.image} alt={course.title} loading="lazy" sx={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 1.5 }} />
                      <Tooltip title={course.title} placement="top">
                        <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {course.title}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={course.category} size="small" variant="outlined" sx={{ fontSize: '0.68rem', borderColor: '#1E7A34', color: '#1E7A34' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={courseStatusThai[course.status]} size="small" sx={{ fontSize: '0.75rem', ...(courseStatusChipSx[course.status] ?? {}) }} />
                  </TableCell>
                  <TableCell><Typography variant="body2">{getTotalLessons(course)}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{enrolled}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>{passed}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: certCount > 0 ? 700 : 400, color: certCount > 0 ? '#B45309' : '#717182' }}>
                      {certCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="จัดการเนื้อหา">
                        <IconButton size="small" sx={{ color: '#475569' }} onClick={() => setContentEditor({ open: true, courseId: course.id })}>
                          <LayoutList size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="แก้ไขข้อมูลคอร์ส">
                        <IconButton size="small" sx={{ color: '#1E7A34' }} onClick={() => openEditCourse(course.id)}>
                          <Pencil size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ทำสำเนาคอร์ส">
                        <IconButton size="small" onClick={() => { setDuplicateDialog({ open: true, courseId: course.id, courseName: course.title }); setDuplicateTitle(`${course.title} (สำเนา)`); }}>
                          <Copy size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Create / Edit Course Dialog ── */}
      <Dialog open={courseFormDialog.open} onClose={() => setCourseFormDialog({ open: false, mode: 'create' })} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: courseFormDialog.mode === 'create' ? '#059669' : '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {courseFormDialog.mode === 'create' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  {courseFormDialog.mode === 'create' ? 'สร้างคอร์สใหม่' : 'แก้ไขคอร์ส'}
                </Typography>
                {courseFormDialog.mode === 'edit' && (
                  <Typography variant="caption" color="text.secondary">แก้ไขข้อมูลและการตั้งค่าคอร์ส</Typography>
                )}
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setCourseFormDialog({ open: false, mode: 'create' })}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="ชื่อคอร์ส"
              fullWidth
              required
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              error={!!courseFormErrors.title}
              helperText={courseFormErrors.title}
              placeholder="เช่น ความรู้ผลิตภัณฑ์ดูแลตับ"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><BookOpen size={16} color="#64748B" /></InputAdornment> } }}
            />
            <TextField
              label="คำอธิบายคอร์ส"
              fullWidth
              required
              multiline
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              error={!!courseFormErrors.description}
              helperText={courseFormErrors.description}
              placeholder="อธิบายสิ่งที่ผู้เรียนจะได้เรียนรู้จากคอร์สนี้..."
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select value={courseForm.category} label="หมวดหมู่" onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}>
                  {managedCategories.map((c) => (
                    <MenuItem key={c} value={c}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Tag size={14} color="#64748B" />{c}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>สถานะ</InputLabel>
                <Select value={courseForm.status} label="สถานะ" onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as CourseStatus })}>
                  <MenuItem key="draft" value="draft"><Chip label="ฉบับร่าง" size="small" sx={{ ...(courseStatusChipSx['draft'] ?? {}) }} /></MenuItem>
                  <MenuItem key="published" value="published"><Chip label="เผยแพร่แล้ว" size="small" sx={{ ...(courseStatusChipSx['published'] ?? {}) }} /></MenuItem>
                  <MenuItem key="archived" value="archived"><Chip label="เก็บถาวร" size="small" sx={{ ...(courseStatusChipSx['archived'] ?? {}) }} /></MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="ระยะเวลาเรียน"
                fullWidth
                required
                value={courseForm.duration}
                onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                error={!!courseFormErrors.duration}
                helperText={courseFormErrors.duration || 'เช่น 3 ชั่วโมง'}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Clock size={15} color="#64748B" /></InputAdornment> } }}
              />
              <FormControl fullWidth>
                <InputLabel>กลุ่มที่เข้าถึงได้</InputLabel>
                <Select
                  multiple
                  value={courseForm.allowedGroups}
                  label="กลุ่มที่เข้าถึงได้"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCourseForm({ ...courseForm, allowedGroups: typeof val === 'string' ? val.split(',') : val });
                  }}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? <Typography variant="body2" color="text.secondary">ทุกกลุ่ม</Typography>
                      : selected.join(', ')
                  }
                >
                  {managedGroups.map((g) => (
                    <MenuItem key={g} value={g}>
                      <Checkbox checked={courseForm.allowedGroups.includes(g)} size="small" sx={{ py: 0 }} />
                      <ListItemText primary={g} />
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>ไม่เลือก = เข้าถึงได้ทุกกลุ่ม</FormHelperText>
              </FormControl>
            </Box>
            <TextField
              label="URL รูปปก"
              fullWidth
              value={courseForm.image}
              onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
              helperText="ใส่ URL รูปภาพสำหรับปกคอร์ส"
              placeholder="https://..."
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><ImageIcon size={15} color="#64748B" /></InputAdornment> } }}
            />
            {courseForm.image && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', height: 120, border: '1px solid #E2E8F0' }}>
                <Box
                  component="img"
                  src={courseForm.image}
                  alt="preview"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setCourseFormDialog({ open: false, mode: 'create' })}>ยกเลิก</Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveCourse}
            startIcon={courseFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
          >
            {courseFormDialog.mode === 'create' ? 'สร้างคอร์ส' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Duplicate Course Dialog ── */}
      <Dialog open={duplicateDialog.open} onClose={() => setDuplicateDialog({ open: false, courseId: '', courseName: '' })} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Copy size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          ทำสำเนาคอร์ส
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            คัดลอกคอร์ส: <strong>{duplicateDialog.courseName}</strong>
          </Typography>
          <TextField fullWidth label="ชื่อคอร์สใหม่" value={duplicateTitle} onChange={(e) => setDuplicateTitle(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDuplicateDialog({ open: false, courseId: '', courseName: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDuplicate} disabled={!duplicateTitle.trim()}>สร้างสำเนา</Button>
        </DialogActions>
      </Dialog>

      {/* ── Course Content Editor ── */}
      {contentEditor.open && contentEditor.courseId && (() => {
        const targetCourse = editableCourses.find((c) => c.id === contentEditor.courseId);
        if (!targetCourse) return null;
        return (
          <CourseContentEditor
            course={targetCourse}
            open={contentEditor.open}
            onClose={() => setContentEditor({ open: false, courseId: null })}
            onSave={(updated) => {
              setEditableCourses(editableCourses.map((c) => c.id === updated.id ? updated : c));
            }}
          />
        );
      })()}
    </Box>
  );
}
