import { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Tabs, Tab, Chip, IconButton, Tooltip, Divider, Alert,
  Grid, Card, CardContent, CardActions,
} from '@mui/material';
import {
  Plus, Edit2, Trash2, Eye, Star, ToggleLeft, ToggleRight, Copy,
  Palette, Type, User, BookOpen, Award, CheckCircle,
} from 'lucide-react';
import { CertificateTemplate } from '../data/types';
import { CertRenderer } from './CertRenderer';
import { courses } from '../data/courses';

interface CertificateTemplateManagerProps {
  templates: CertificateTemplate[];
  onSave: (templates: CertificateTemplate[]) => void;
}

const SCALE_CARD = 0.34;
const SCALE_PREVIEW = 0.56;

const emptyTemplate = (): Omit<CertificateTemplate, 'id' | 'createdAt'> => ({
  name: '',
  description: '',
  active: true,
  isDefault: false,
  bgType: 'white',
  bgColor: '#FFFFFF',
  bgGradientFrom: '#FFFFFF',
  bgGradientTo: '#F0F4FF',
  borderStyle: 'double',
  borderColor: '#1E1B4B',
  primaryColor: '#1E1B4B',
  accentColor: '#F59E0B',
  textColor: '#1E1B4B',
  orgName: 'PK Learning · Product Knowledge LMS',
  orgSubtitle: 'ใบประกาศนียบัตรแสดงความสำเร็จ',
  certTitle: 'Certificate of Completion',
  certSubtitle: 'ใบประกาศนียบัตร',
  recipientPrefix: 'This is to certify that',
  coursePrefix: 'ได้ศึกษาและผ่านการทดสอบ',
  showScore: true,
  scorePrefix: 'คะแนน',
  signerName: 'ผู้อำนวยการฝ่ายพัฒนาบุคลากร',
  signerTitle: 'Director of Human Resources Development',
  showDate: true,
  showCertNo: true,
  footerNote: 'ใบประกาศนี้มีอายุ 1 ปีนับจากวันที่ออก',
  assignedCourseIds: [],
});

interface FormState extends Omit<CertificateTemplate, 'id' | 'createdAt'> {}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 36, height: 36, borderRadius: 1.5,
          border: '2px solid #E2E8F0',
          bgcolor: value,
          flexShrink: 0,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        />
      </Box>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{ flex: 1 }}
        inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.8rem' } }}
      />
    </Box>
  );
}

export function CertificateTemplateManager({ templates, onSave }: CertificateTemplateManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState(0);
  const [form, setForm] = useState<FormState>(emptyTemplate());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyTemplate());
    setFormTab(0);
    setDialogOpen(true);
  };

  const openEdit = (tmpl: CertificateTemplate) => {
    setEditingId(tmpl.id);
    setForm({ ...tmpl });
    setFormTab(0);
    setDialogOpen(true);
  };

  const handleSaveDialog = () => {
    if (!form.name.trim()) return;

    if (editingId) {
      const updated = templates.map((t) =>
        t.id === editingId
          ? { ...t, ...form }
          : form.isDefault ? { ...t, isDefault: false } : t
      );
      onSave(updated);
    } else {
      const newTmpl: CertificateTemplate = {
        id: `tmpl-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...form,
      };
      const updated = form.isDefault
        ? templates.map((t) => ({ ...t, isDefault: false })).concat(newTmpl)
        : [...templates, newTmpl];
      onSave(updated);
    }
    setDialogOpen(false);
  };

  const handleDuplicate = (tmpl: CertificateTemplate) => {
    const dup: CertificateTemplate = {
      ...tmpl,
      id: `tmpl-${Date.now()}`,
      name: `${tmpl.name} (สำเนา)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    onSave([...templates, dup]);
  };

  const handleToggleActive = (id: string) => {
    onSave(templates.map((t) => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleSetDefault = (id: string) => {
    onSave(templates.map((t) => ({ ...t, isDefault: t.id === id })));
  };

  const handleDelete = (id: string) => {
    onSave(templates.filter((t) => t.id !== id));
    setDeleteConfirmId(null);
  };

  const openPreview = (tmpl: CertificateTemplate) => {
    setPreviewTemplate(tmpl);
    setPreviewOpen(true);
  };

  const formAsTemplate = (): CertificateTemplate => ({
    id: editingId ?? 'preview',
    createdAt: new Date().toISOString(),
    ...form,
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
            จัดการเทมเพลตใบประกาศนียบัตร
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            สร้างและแก้ไขรูปแบบใบประกาศฯ ที่ใช้ออกให้ผู้เรียน
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={openCreate}
          sx={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', borderRadius: 2, px: 2.5, fontWeight: 700 }}
        >
          สร้างเทมเพลต
        </Button>
      </Box>

      {templates.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>ยังไม่มีเทมเพลต — กดปุ่ม "สร้างเทมเพลต" เพื่อเริ่มต้น</Alert>
      )}

      {/* Template grid */}
      <Grid container spacing={3}>
        {templates.map((tmpl) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={tmpl.id}>
            <Card
              elevation={0}
              sx={{
                border: tmpl.isDefault ? '2px solid #6366F1' : '1px solid #E2E8F0',
                borderRadius: 3,
                overflow: 'hidden',
                opacity: tmpl.active ? 1 : 0.6,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
              }}
            >
              {/* Mini certificate preview */}
              <Box
                sx={{
                  height: 216,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  bgcolor: '#F8FAFC',
                }}
                onClick={() => openPreview(tmpl)}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', pointerEvents: 'none' }}>
                  <CertRenderer
                    template={tmpl}
                    recipientName="สมชาย ใจดี"
                    courseTitle="หลักสูตรตัวอย่าง"
                    score={92}
                    scale={SCALE_CARD}
                  />
                </Box>
                {/* Hover overlay */}
                <Box sx={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0)', transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.35)' },
                  '&:hover .preview-icon': { opacity: 1 },
                }}>
                  <Box className="preview-icon" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Eye size={28} color="white" />
                    <Typography sx={{ color: 'white', fontSize: '0.78rem', fontWeight: 600 }}>ดูตัวอย่าง</Typography>
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tmpl.name}
                      </Typography>
                      {tmpl.isDefault && (
                        <Chip label="Default" size="small" icon={<Star size={10} />} sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 700, fontSize: '0.6rem', height: 18 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {tmpl.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      กำหนดให้ {tmpl.assignedCourseIds.length} คอร์ส
                    </Typography>
                  </Box>
                  <Chip
                    label={tmpl.active ? 'เปิดใช้' : 'ปิดใช้'}
                    size="small"
                    sx={{
                      bgcolor: tmpl.active ? '#ECFDF5' : '#F8FAFC',
                      color: tmpl.active ? '#10B981' : '#94A3B8',
                      fontWeight: 700, fontSize: '0.65rem', height: 20, flexShrink: 0,
                    }}
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ px: 2, pt: 0, pb: 1.5, gap: 0.5 }}>
                <Tooltip title="แก้ไข">
                  <IconButton size="small" onClick={() => openEdit(tmpl)} sx={{ color: '#6366F1' }}>
                    <Edit2 size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ดูตัวอย่าง">
                  <IconButton size="small" onClick={() => openPreview(tmpl)} sx={{ color: '#6366F1' }}>
                    <Eye size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ทำสำเนา">
                  <IconButton size="small" onClick={() => handleDuplicate(tmpl)} sx={{ color: '#64748B' }}>
                    <Copy size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={tmpl.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}>
                  <IconButton size="small" onClick={() => handleToggleActive(tmpl.id)} sx={{ color: tmpl.active ? '#10B981' : '#94A3B8' }}>
                    {tmpl.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  </IconButton>
                </Tooltip>
                {!tmpl.isDefault && (
                  <Tooltip title="ตั้งเป็น Default">
                    <IconButton size="small" onClick={() => handleSetDefault(tmpl.id)} sx={{ color: '#F59E0B' }}>
                      <Star size={15} />
                    </IconButton>
                  </Tooltip>
                )}
                <Box sx={{ flex: 1 }} />
                <Tooltip title={tmpl.isDefault ? 'ไม่สามารถลบ Default ได้' : 'ลบ'}>
                  <span>
                    <IconButton size="small" onClick={() => setDeleteConfirmId(tmpl.id)} sx={{ color: '#EF4444' }} disabled={tmpl.isDefault}>
                      <Trash2 size={15} />
                    </IconButton>
                  </span>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Editor Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: '92vw', maxWidth: 1100, borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          {editingId ? 'แก้ไขเทมเพลต' : 'สร้างเทมเพลตใหม่'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', minHeight: 540 }}>
          {/* Left panel: form */}
          <Box sx={{ width: 420, flexShrink: 0, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <Tabs value={formTab} onChange={(_, v) => setFormTab(v)} sx={{ borderBottom: '1px solid #E2E8F0', px: 2 }} variant="scrollable">
              <Tab icon={<Palette size={14} />} label="ดีไซน์" iconPosition="start" sx={{ fontSize: '0.75rem', minHeight: 44 }} />
              <Tab icon={<Type size={14} />} label="ข้อความ" iconPosition="start" sx={{ fontSize: '0.75rem', minHeight: 44 }} />
              <Tab icon={<User size={14} />} label="ผู้รับรอง" iconPosition="start" sx={{ fontSize: '0.75rem', minHeight: 44 }} />
              <Tab icon={<BookOpen size={14} />} label="คอร์ส" iconPosition="start" sx={{ fontSize: '0.75rem', minHeight: 44 }} />
            </Tabs>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* ── Tab 0: Design ── */}
              {formTab === 0 && (
                <>
                  <TextField
                    label="ชื่อเทมเพลต *"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="คำอธิบาย"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <Divider><Typography variant="caption" color="text.secondary">พื้นหลัง</Typography></Divider>
                  <FormControl size="small" fullWidth>
                    <InputLabel>ประเภทพื้นหลัง</InputLabel>
                    <Select value={form.bgType} onChange={(e) => setField('bgType', e.target.value as FormState['bgType'])} label="ประเภทพื้นหลัง">
                      <MenuItem key="white" value="white">สีขาว</MenuItem>
                      <MenuItem key="solid" value="solid">สีเดียว</MenuItem>
                      <MenuItem key="gradient" value="gradient">Gradient</MenuItem>
                    </Select>
                  </FormControl>
                  {form.bgType === 'solid' && (
                    <ColorField label="สีพื้นหลัง" value={form.bgColor} onChange={(v) => setField('bgColor', v)} />
                  )}
                  {form.bgType === 'gradient' && (
                    <>
                      <ColorField label="สีเริ่มต้น (Gradient)" value={form.bgGradientFrom} onChange={(v) => setField('bgGradientFrom', v)} />
                      <ColorField label="สีสิ้นสุด (Gradient)" value={form.bgGradientTo} onChange={(v) => setField('bgGradientTo', v)} />
                    </>
                  )}
                  <Divider><Typography variant="caption" color="text.secondary">ขอบ</Typography></Divider>
                  <FormControl size="small" fullWidth>
                    <InputLabel>สไตล์ขอบ</InputLabel>
                    <Select value={form.borderStyle} onChange={(e) => setField('borderStyle', e.target.value as FormState['borderStyle'])} label="สไตล์ขอบ">
                      <MenuItem key="none" value="none">ไม่มีขอบ</MenuItem>
                      <MenuItem key="single" value="single">ขอบเดี่ยว</MenuItem>
                      <MenuItem key="double" value="double">ขอบคู่</MenuItem>
                      <MenuItem key="ornate" value="ornate">ขอบประดับ</MenuItem>
                    </Select>
                  </FormControl>
                  {form.borderStyle !== 'none' && (
                    <ColorField label="สีขอบ" value={form.borderColor} onChange={(v) => setField('borderColor', v)} />
                  )}
                  <Divider><Typography variant="caption" color="text.secondary">สีหลัก</Typography></Divider>
                  <ColorField label="สีหลัก (Primary)" value={form.primaryColor} onChange={(v) => setField('primaryColor', v)} />
                  <ColorField label="สีเน้น (Accent)" value={form.accentColor} onChange={(v) => setField('accentColor', v)} />
                  <Divider><Typography variant="caption" color="text.secondary">ตัวเลือก</Typography></Divider>
                  <FormControlLabel
                    control={<Switch checked={form.isDefault} onChange={(e) => setField('isDefault', e.target.checked)} />}
                    label={<Typography variant="body2">ตั้งเป็น Default</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={form.active} onChange={(e) => setField('active', e.target.checked)} />}
                    label={<Typography variant="body2">เปิดใช้งาน</Typography>}
                  />
                </>
              )}

              {/* ── Tab 1: Text ── */}
              {formTab === 1 && (
                <>
                  <TextField label="ชื่อองค์กร / หน่วยงาน" value={form.orgName} onChange={(e) => setField('orgName', e.target.value)} size="small" fullWidth />
                  <TextField label="คำบรรยายองค์กร" value={form.orgSubtitle} onChange={(e) => setField('orgSubtitle', e.target.value)} size="small" fullWidth />
                  <Divider />
                  <TextField label="ชื่อใบประกาศ (หลัก)" value={form.certTitle} onChange={(e) => setField('certTitle', e.target.value)} size="small" fullWidth />
                  <TextField label="ชื่อใบประกาศ (รอง)" value={form.certSubtitle} onChange={(e) => setField('certSubtitle', e.target.value)} size="small" fullWidth />
                  <Divider />
                  <TextField label='คำนำหน้าชื่อผู้รับ เช่น "This is to certify that"' value={form.recipientPrefix} onChange={(e) => setField('recipientPrefix', e.target.value)} size="small" fullWidth />
                  <TextField label='คำนำหน้าชื่อคอร์ส เช่น "ได้ศึกษาและผ่านการทดสอบ"' value={form.coursePrefix} onChange={(e) => setField('coursePrefix', e.target.value)} size="small" fullWidth />
                  <Divider />
                  <FormControlLabel
                    control={<Switch checked={form.showScore} onChange={(e) => setField('showScore', e.target.checked)} />}
                    label={<Typography variant="body2">แสดงคะแนน</Typography>}
                  />
                  {form.showScore && (
                    <TextField label='คำนำหน้าคะแนน เช่น "คะแนน"' value={form.scorePrefix} onChange={(e) => setField('scorePrefix', e.target.value)} size="small" fullWidth />
                  )}
                  <Divider />
                  <FormControlLabel
                    control={<Switch checked={form.showDate} onChange={(e) => setField('showDate', e.target.checked)} />}
                    label={<Typography variant="body2">แสดงวันที่ออก</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={form.showCertNo} onChange={(e) => setField('showCertNo', e.target.checked)} />}
                    label={<Typography variant="body2">แสดงเลขที่ใบประกาศ</Typography>}
                  />
                  <TextField
                    label="หมายเหตุท้ายใบประกาศ"
                    value={form.footerNote}
                    onChange={(e) => setField('footerNote', e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </>
              )}

              {/* ── Tab 2: Signer ── */}
              {formTab === 2 && (
                <>
                  <TextField label="ชื่อผู้รับรอง/ลงนาม" value={form.signerName} onChange={(e) => setField('signerName', e.target.value)} size="small" fullWidth />
                  <TextField label="ตำแหน่งผู้รับรอง" value={form.signerTitle} onChange={(e) => setField('signerTitle', e.target.value)} size="small" fullWidth />
                </>
              )}

              {/* ── Tab 3: Courses ── */}
              {formTab === 3 && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    เลือกคอร์สที่จะใช้เทมเพลตนี้ (หากไม่เลือก ระบบจะใช้ Default template)
                  </Typography>
                  {courses.map((course) => {
                    const assigned = form.assignedCourseIds.includes(course.id);
                    return (
                      <Box
                        key={course.id}
                        onClick={() => {
                          setField(
                            'assignedCourseIds',
                            assigned
                              ? form.assignedCourseIds.filter((id) => id !== course.id)
                              : [...form.assignedCourseIds, course.id]
                          );
                        }}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: 1.5, borderRadius: 2, cursor: 'pointer',
                          border: `1px solid ${assigned ? '#6366F1' : '#E2E8F0'}`,
                          bgcolor: assigned ? '#EEF2FF' : 'white',
                          transition: 'all 0.15s',
                          '&:hover': { bgcolor: assigned ? '#E0E7FF' : '#F8FAFC' },
                        }}
                      >
                        <CheckCircle size={16} color={assigned ? '#6366F1' : '#CBD5E1'} fill={assigned ? '#6366F1' : 'none'} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {course.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{course.category}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>
          </Box>

          {/* Right panel: live preview */}
          <Box sx={{ flex: 1, bgcolor: '#F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, gap: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ตัวอย่างใบประกาศ
            </Typography>
            <Box sx={{ overflow: 'hidden', borderRadius: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', width: 900 * SCALE_PREVIEW, height: 636 * SCALE_PREVIEW, position: 'relative', flexShrink: 0 }}>
              <CertRenderer
                template={formAsTemplate()}
                recipientName="สมชาย ใจดี"
                courseTitle="หลักสูตรตัวอย่าง"
                score={92}
                scale={SCALE_PREVIEW}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              ตัวอย่างแสดงผลแบบ real-time ตามการแก้ไข
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748B' }}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleSaveDialog}
            disabled={!form.name.trim()}
            sx={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', fontWeight: 700 }}
          >
            บันทึกเทมเพลต
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Full Preview Dialog ── */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { bgcolor: '#0F172A', borderRadius: 3, p: 3 } }}
      >
        {previewTemplate && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {previewTemplate.name}
            </Typography>
            <Box sx={{ overflow: 'hidden', borderRadius: 2, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', width: 900 * SCALE_PREVIEW, height: 636 * SCALE_PREVIEW, position: 'relative' }}>
              <CertRenderer
                template={previewTemplate}
                recipientName="สมชาย ใจดี"
                courseTitle="หลักสูตรผลิตภัณฑ์ประกันชีวิต"
                score={92}
                certNo="CERT-2026-001234"
                scale={SCALE_PREVIEW}
              />
            </Box>
            <Button onClick={() => setPreviewOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
              ปิด
            </Button>
          </Box>
        )}
      </Dialog>

      {/* ── Delete confirm ── */}
      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>ยืนยันการลบเทมเพลต</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            คุณแน่ใจหรือไม่ว่าต้องการลบเทมเพลตนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} sx={{ color: '#64748B' }}>ยกเลิก</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            sx={{ fontWeight: 700 }}
          >
            ลบเทมเพลต
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
