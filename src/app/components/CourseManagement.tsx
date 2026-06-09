import { useState, useEffect } from 'react';
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
  Trash2,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService, courseService } from '../services';
import { Certificate, Course, CourseProgress, CourseStatus, User } from '../data/types';
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
  const [editableCourses, setEditableCourses] = useState<Course[]>([]);
  const [learners, setLearners] = useState<User[]>([]);

  const [courseFormDialog, setCourseFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; courseId?: string }>({ open: false, mode: 'create' });
  const [courseForm, setCourseForm] = useState<CourseForm>(defaultCourseForm());
  const [courseFormErrors, setCourseFormErrors] = useState<Partial<Record<keyof CourseForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const [contentEditor, setContentEditor] = useState<{ open: boolean; courseId: string | null }>({ open: false, courseId: null });

  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; courseId: string; courseName: string }>({ open: false, courseId: '', courseName: '' });
  const [duplicateTitle, setDuplicateTitle] = useState('');

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; courseId: string; courseName: string }>({ open: false, courseId: '', courseName: '' });

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const uniqueCategories = Array.from(new Set(editableCourses.map((c) => c.category))).sort();

  const filteredCourses = editableCourses.filter((c) => {
    const q = searchText.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchCategory = filterCategory === 'all' || c.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  useEffect(() => {
    Promise.all([courseService.getAll(), userService.getAll()]).then(([courses, users]) => {
      setEditableCourses(courses);
      setLearners(users.filter((u) => u.role === 'learner'));
    }).catch(() => {
      toast.error('โหลดข้อมูลคอร์สไม่สำเร็จ');
    });
  }, []);

  const openCreateCourse = () => {
    setCourseForm(defaultCourseForm());
    setCourseFormErrors({});
    setCourseFormDialog({ open: true, mode: 'create' });
  };

  const openEditCourse = (courseId: string) => {
    const course = editableCourses.find((c) => c.id === courseId);
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

  const handleSaveCourse = async () => {
    if (!validateCourseForm()) return;
    setSaving(true);
    try {
      if (courseFormDialog.mode === 'create') {
        const newCourse = await courseService.create({ ...courseForm, modules: [], createdAt: new Date().toISOString() });
        setEditableCourses((prev) => [...prev, newCourse]);
        toast.success(`สร้างคอร์ส "${courseForm.title}" เรียบร้อยแล้ว`);
      } else {
        const updated = await courseService.update(courseFormDialog.courseId!, courseForm);
        if (updated) {
          setEditableCourses((prev) => prev.map((c) => c.id === updated.id ? updated : c));
        }
        toast.success(`บันทึกคอร์ส "${courseForm.title}" เรียบร้อยแล้ว`);
      }
      setCourseFormDialog({ open: false, mode: 'create' });
    } catch {
      toast.error('บันทึกคอร์สไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await courseService.deleteCourse(deleteDialog.courseId);
      setEditableCourses((prev) => prev.filter((c) => c.id !== deleteDialog.courseId));
      toast.success(`ลบคอร์ส "${deleteDialog.courseName}" เรียบร้อยแล้ว`);
      setDeleteDialog({ open: false, courseId: '', courseName: '' });
    } catch {
      toast.error('ลบคอร์สไม่สำเร็จ');
    }
  };

  const handleDuplicate = async () => {
    const source = editableCourses.find((c) => c.id === duplicateDialog.courseId);
    if (!source || !duplicateTitle.trim()) return;
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = source;
      const newCourse = await courseService.create({ ...rest, title: duplicateTitle.trim(), status: 'draft' });
      setEditableCourses((prev) => [...prev, newCourse]);
      toast.success(`คอร์ส "${duplicateTitle}" ถูกสร้างเรียบร้อยแล้ว`);
      setDuplicateDialog({ open: false, courseId: '', courseName: '' });
      setDuplicateTitle('');
    } catch {
      toast.error('ทำสำเนาคอร์สไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
          คอร์สทั้งหมด{' '}
          <Typography component="span" variant="h6" sx={{ fontWeight: 400, color: '#64748B' }}>
            ({filteredCourses.length === editableCourses.length ? editableCourses.length : `${filteredCourses.length}/${editableCourses.length}`} คอร์ส)
          </Typography>
        </Typography>
        <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateCourse}>
          เพิ่มคอร์สใหม่
        </Button>
      </Box>

      {/* ── Filter Bar ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="ค้นหาชื่อคอร์ส, หมวดหมู่..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: '1 1 220px', minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={15} color="#64748B" />
                </InputAdornment>
              ),
              ...(searchText && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ),
              }),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>สถานะ</InputLabel>
          <Select value={filterStatus} label="สถานะ" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="published">เผยแพร่แล้ว</MenuItem>
            <MenuItem value="draft">ฉบับร่าง</MenuItem>
            <MenuItem value="archived">เก็บถาวร</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>หมวดหมู่</InputLabel>
          <Select value={filterCategory} label="หมวดหมู่" onChange={(e) => setFilterCategory(e.target.value)}>
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {uniqueCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </Select>
        </FormControl>

        {(searchText || filterStatus !== 'all' || filterCategory !== 'all') && (
          <Button
            size="small"
            startIcon={<SlidersHorizontal size={14} />}
            onClick={() => { setSearchText(''); setFilterStatus('all'); setFilterCategory('all'); }}
            sx={{ color: '#64748B', fontSize: '0.78rem', flexShrink: 0 }}
          >
            ล้างตัวกรอง
          </Button>
        )}
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
            {filteredCourses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                  ไม่พบคอร์สที่ตรงกับเงื่อนไข
                </TableCell>
              </TableRow>
            )}
            {filteredCourses.map((course) => {
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
                      <Tooltip title="ลบคอร์ส">
                        <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setDeleteDialog({ open: true, courseId: course.id, courseName: course.title })}>
                          <Trash2 size={14} />
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
            disabled={saving}
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
          <Button variant="contained" onClick={handleDuplicate} disabled={!duplicateTitle.trim() || saving}>สร้างสำเนา</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Course Confirm ── */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, courseId: '', courseName: '' })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>ยืนยันการลบคอร์ส</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ต้องการลบคอร์ส <strong>"{deleteDialog.courseName}"</strong> ใช่หรือไม่?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            ข้อมูลคอร์สจะถูกลบถาวร รวมถึงเนื้อหาและการตั้งค่าทั้งหมด
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, courseId: '', courseName: '' })}>ยกเลิก</Button>
          <Button variant="contained" disableElevation onClick={handleDeleteCourse} sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b01530' } }}>
            ลบคอร์ส
          </Button>
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
            onSave={async (updated) => {
              try {
                await courseService.update(updated.id, updated);
                setEditableCourses((prev) => prev.map((c) => c.id === updated.id ? updated : c));
              } catch {
                toast.error('บันทึกเนื้อหาไม่สำเร็จ');
              }
            }}
          />
        );
      })()}
    </Box>
  );
}