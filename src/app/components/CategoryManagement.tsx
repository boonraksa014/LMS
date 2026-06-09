import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Tag, Plus, Pencil, Trash2, X } from 'lucide-react';
import { courses as staticCourses } from '../data/courses';

interface CategoryManagementProps {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategoryManagement({ categories, onCategoriesChange }: CategoryManagementProps) {
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; value: string; original: string }>(
    { open: false, mode: 'add', value: '', original: '' }
  );
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState<string | null>(null);

  const handleSaveCategory = () => {
    const trimmed = categoryDialog.value.trim();
    if (!trimmed) return;
    if (categoryDialog.mode === 'add') {
      if (!categories.includes(trimmed)) onCategoriesChange([...categories, trimmed]);
    } else {
      onCategoriesChange(categories.map((c) => (c === categoryDialog.original ? trimmed : c)));
    }
    setCategoryDialog((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteCategory = () => {
    if (categoryDeleteConfirm) {
      onCategoriesChange(categories.filter((c) => c !== categoryDeleteConfirm));
      setCategoryDeleteConfirm(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการหมวดหมู่</Typography>
          <Typography variant="caption" color="text.secondary">{categories.length} หมวดหมู่</Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={15} />}
          onClick={() => setCategoryDialog({ open: true, mode: 'add', value: '', original: '' })}
        >
          เพิ่มหมวดหมู่ใหม่
        </Button>
      </Box>

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed #E2E8F0', borderRadius: 3 }}>
          <Tag size={32} color="#CBD5E1" aria-hidden="true" />
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>ยังไม่มีหมวดหมู่</Typography>
          <Typography variant="caption" color="text.secondary">กดปุ่ม "เพิ่มหมวดหมู่ใหม่" เพื่อเริ่มต้น</Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
        {categories.map((cat) => {
          const courseCount = staticCourses.filter((c) => c.category === cat).length;
          return (
            <Paper key={cat} sx={{ p: 2, borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Tag size={16} color="#1E7A34" aria-hidden="true" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{cat}</Typography>
                  <Typography variant="caption" color="text.secondary">{courseCount} คอร์ส</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="แก้ไข">
                  <IconButton size="small" sx={{ color: '#1E7A34' }} onClick={() => setCategoryDialog({ open: true, mode: 'edit', value: cat, original: cat })}>
                    <Pencil size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ลบ">
                  <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setCategoryDeleteConfirm(cat)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* ── Add / Edit Category Dialog ── */}
      <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog((prev) => ({ ...prev, open: false }))} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: categoryDialog.mode === 'add' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {categoryDialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>
                {categoryDialog.mode === 'add' ? 'เพิ่มหมวดหมู่ใหม่' : 'แก้ไขหมวดหมู่'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setCategoryDialog((prev) => ({ ...prev, open: false }))}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="ชื่อหมวดหมู่"
            value={categoryDialog.value}
            autoFocus
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Tag size={15} color="#64748B" /></InputAdornment> } }}
            onChange={(e) => setCategoryDialog((prev) => ({ ...prev, value: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCategoryDialog((prev) => ({ ...prev, open: false }))}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={!categoryDialog.value.trim()}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
          >
            {categoryDialog.mode === 'add' ? 'เพิ่มหมวดหมู่' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Category Confirm ── */}
      <Dialog open={!!categoryDeleteConfirm} onClose={() => setCategoryDeleteConfirm(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle>ยืนยันการลบหมวดหมู่</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบหมวดหมู่ <strong>"{categoryDeleteConfirm}"</strong> ใช่หรือไม่?</Typography>
          {categoryDeleteConfirm && staticCourses.filter((c) => c.category === categoryDeleteConfirm).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีคอร์ส {staticCourses.filter((c) => c.category === categoryDeleteConfirm).length} คอร์สที่ใช้หมวดหมู่นี้อยู่
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCategoryDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" disableElevation onClick={handleDeleteCategory} sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b01530' } }}>
            ลบหมวดหมู่
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
