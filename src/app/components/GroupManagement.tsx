import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Tooltip,
  Chip, Avatar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, Collapse, Switch,
} from '@mui/material';
import { Building2, Layers, Plus, Eye, Pencil, Trash2, X, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../services';
import { CourseProgress, User } from '../data/types';

// ── Mock storage ───────────────────────────────────────────────────────────
const DIV_KEY  = 'lms_divisions_v1';
const DEPT_KEY = 'lms_departments_v1';

export interface Division   { id: number; name: string; isActive: boolean }
export interface Department { id: number; divisionId: number; name: string; isActive: boolean }

const SEED_DIVISIONS: Division[] = [
  { id: 1, name: 'Management',  isActive: true },
  { id: 2, name: 'Operations',  isActive: true },
  { id: 3, name: 'Sales',       isActive: true },
  { id: 4, name: 'Support',     isActive: true },
];
const SEED_DEPARTMENTS: Department[] = [
  { id: 1, divisionId: 1, name: 'Executive',  isActive: true },
  { id: 2, divisionId: 2, name: 'HR',          isActive: true },
  { id: 3, divisionId: 3, name: 'Sales',       isActive: true },
  { id: 4, divisionId: 3, name: 'Telesales',   isActive: true },
  { id: 5, divisionId: 3, name: 'PC/BA',       isActive: true },
  { id: 6, divisionId: 4, name: 'IT Support',  isActive: true },
];

function loadDivisions(): Division[] {
  try {
    const s = localStorage.getItem(DIV_KEY);
    if (s) {
      // migrate old records that lack isActive
      const parsed: Division[] = JSON.parse(s);
      return parsed.map((d) => ({ ...d, isActive: d.isActive ?? true }));
    }
  } catch { /**/ }
  return SEED_DIVISIONS;
}
function saveDivisions(data: Division[]) { localStorage.setItem(DIV_KEY, JSON.stringify(data)); }

function loadDepartments(): Department[] {
  try {
    const s = localStorage.getItem(DEPT_KEY);
    if (s) {
      const parsed: Department[] = JSON.parse(s);
      return parsed.map((d) => ({ ...d, isActive: d.isActive ?? true }));
    }
  } catch { /**/ }
  return SEED_DEPARTMENTS;
}
function saveDepartments(data: Department[]) { localStorage.setItem(DEPT_KEY, JSON.stringify(data)); }

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Props {
  groups: string[];
  onGroupsChange: (groups: string[]) => void;
  allProgress: CourseProgress[];
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin', training_admin: 'Training Admin',
  manager: 'Manager', learner: 'ผู้เรียน',
};
const roleChipSx: Record<string, object> = {
  super_admin:    { backgroundColor: '#0F172A', color: '#F8FAFC' },
  training_admin: { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
  manager:        { backgroundColor: '#FFFBEB', color: '#92400E' },
  learner:        { backgroundColor: '#F1F5F9', color: '#475569' },
};

// ── Component ──────────────────────────────────────────────────────────────
export function GroupManagement({ allProgress }: Props) {
  const [allUsers, setAllUsers]       = useState<User[]>([]);
  const [divisions, setDivisions]     = useState<Division[]>(loadDivisions);
  const [departments, setDepartments] = useState<Department[]>(loadDepartments);
  const [expanded, setExpanded]       = useState<Set<number>>(new Set([1, 2, 3, 4]));

  // Division dialog
  const [divDialog, setDivDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; id?: number; value: string }>(
    { open: false, mode: 'add', value: '' }
  );
  const [divDeleteConfirm, setDivDeleteConfirm] = useState<Division | null>(null);

  // Department dialog
  const [deptDialog, setDeptDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; id?: number; divisionId: number; value: string }>(
    { open: false, mode: 'add', divisionId: 0, value: '' }
  );
  const [deptDeleteConfirm, setDeptDeleteConfirm] = useState<Department | null>(null);

  // View members
  const [viewDept, setViewDept] = useState<Department | null>(null);

  useEffect(() => {
    userService.getAll().then(setAllUsers).catch(() => toast.error('โหลดข้อมูลไม่สำเร็จ'));
  }, []);

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const handleToggleDivision = (div: Division) => {
    const next = !div.isActive;
    const updated = divisions.map((d) => d.id === div.id ? { ...d, isActive: next } : d);
    saveDivisions(updated);
    setDivisions(updated);
    toast.success(`${next ? 'เปิด' : 'ปิด'}ใช้งานฝ่าย "${div.name}" เรียบร้อยแล้ว`);
  };

  const handleToggleDepartment = (dept: Department) => {
    const next = !dept.isActive;
    const updated = departments.map((d) => d.id === dept.id ? { ...d, isActive: next } : d);
    saveDepartments(updated);
    setDepartments(updated);
    toast.success(`${next ? 'เปิด' : 'ปิด'}ใช้งานแผนก "${dept.name}" เรียบร้อยแล้ว`);
  };

  // ── Division CRUD ────────────────────────────────────────────────────────
  const handleSaveDivision = () => {
    const name = divDialog.value.trim();
    if (!name) return;
    let updated: Division[];
    if (divDialog.mode === 'add') {
      const newDiv: Division = { id: nextId(divisions), name, isActive: true };
      updated = [...divisions, newDiv];
      setExpanded((prev) => new Set([...prev, newDiv.id]));
      toast.success(`เพิ่มฝ่าย "${name}" เรียบร้อยแล้ว`);
    } else {
      updated = divisions.map((d) => d.id === divDialog.id ? { ...d, name } : d);
      toast.success(`แก้ไขฝ่ายเรียบร้อยแล้ว`);
    }
    saveDivisions(updated);
    setDivisions(updated);
    setDivDialog({ open: false, mode: 'add', value: '' });
  };

  const handleDeleteDivision = () => {
    if (!divDeleteConfirm) return;
    const hasDepts = departments.some((d) => d.divisionId === divDeleteConfirm.id);
    if (hasDepts) {
      toast.error('ไม่สามารถลบฝ่ายที่ยังมีแผนกอยู่ได้');
      setDivDeleteConfirm(null);
      return;
    }
    const updated = divisions.filter((d) => d.id !== divDeleteConfirm.id);
    saveDivisions(updated);
    setDivisions(updated);
    toast.success(`ลบฝ่าย "${divDeleteConfirm.name}" เรียบร้อยแล้ว`);
    setDivDeleteConfirm(null);
  };

  // ── Department CRUD ──────────────────────────────────────────────────────
  const handleSaveDepartment = () => {
    const name = deptDialog.value.trim();
    if (!name) return;
    let updated: Department[];
    if (deptDialog.mode === 'add') {
      updated = [...departments, { id: nextId(departments), divisionId: deptDialog.divisionId, name, isActive: true }];
      toast.success(`เพิ่มแผนก "${name}" เรียบร้อยแล้ว`);
    } else {
      updated = departments.map((d) => d.id === deptDialog.id ? { ...d, name } : d);
      toast.success(`แก้ไขแผนกเรียบร้อยแล้ว`);
    }
    saveDepartments(updated);
    setDepartments(updated);
    setDeptDialog({ open: false, mode: 'add', divisionId: 0, value: '' });
  };

  const handleDeleteDepartment = () => {
    if (!deptDeleteConfirm) return;
    const members = allUsers.filter((u) => u.department === deptDeleteConfirm.name);
    if (members.length > 0) {
      toast.error(`ไม่สามารถลบแผนกที่ยังมีพนักงาน ${members.length} คนอยู่ได้`);
      setDeptDeleteConfirm(null);
      return;
    }
    const updated = departments.filter((d) => d.id !== deptDeleteConfirm.id);
    saveDepartments(updated);
    setDepartments(updated);
    toast.success(`ลบแผนก "${deptDeleteConfirm.name}" เรียบร้อยแล้ว`);
    setDeptDeleteConfirm(null);
  };

  const toggleExpand = (id: number) =>
    setExpanded((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const activeDivisions   = divisions.filter((d) => d.isActive).length;
  const activeDepartments = departments.filter((d) => d.isActive).length;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการแผนก</Typography>
          <Typography variant="caption" color="text.secondary">
            {activeDivisions}/{divisions.length} ฝ่ายเปิดใช้งาน · {activeDepartments}/{departments.length} แผนกเปิดใช้งาน · {allUsers.length} คน
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Plus size={15} />}
          onClick={() => setDivDialog({ open: true, mode: 'add', value: '' })}>
          เพิ่มฝ่ายใหม่
        </Button>
      </Box>

      {/* ── Division list ── */}
      {divisions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed #E2E8F0', borderRadius: 3 }}>
          <Building2 size={32} color="#CBD5E1" />
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>ยังไม่มีฝ่าย</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {divisions.map((div) => {
          const depts       = departments.filter((d) => d.divisionId === div.id);
          const memberCount = allUsers.filter((u) => depts.some((d) => d.name === u.department)).length;
          const isOpen      = expanded.has(div.id);
          const divInactive = !div.isActive;

          return (
            <Paper key={div.id} sx={{ borderRadius: 2, border: `1px solid ${divInactive ? '#F1F5F9' : '#E2E8F0'}`, overflow: 'hidden', opacity: divInactive ? 0.72 : 1, transition: 'opacity 0.2s' }}>
              {/* Division row */}
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, backgroundColor: divInactive ? '#F8FAFC' : '#F1F5F9', gap: 1.5 }}>
                <IconButton size="small" onClick={() => toggleExpand(div.id)} sx={{ color: '#475569' }}>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </IconButton>
                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: divInactive ? '#94A3B8' : '#0F3D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s' }}>
                  <Building2 size={15} color="white" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: divInactive ? '#94A3B8' : '#0F172A', transition: 'color 0.2s' }}>{div.name}</Typography>
                    {divInactive && (
                      <Chip label="ปิดใช้งาน" size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#FEE2E2', color: '#d4183d' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{depts.length} แผนก · {memberCount} คน</Typography>
                </Box>

                {/* Toggle switch */}
                <Tooltip title={divInactive ? 'เปิดใช้งานฝ่าย' : 'ปิดใช้งานฝ่าย'}>
                  <Switch
                    size="small"
                    checked={div.isActive}
                    onChange={() => handleToggleDivision(div)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#1E7A34' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1E7A34' },
                    }}
                  />
                </Tooltip>

                <Tooltip title="เพิ่มแผนกในฝ่ายนี้">
                  <IconButton size="small" sx={{ color: '#1E7A34' }}
                    onClick={() => { setExpanded((p) => new Set([...p, div.id])); setDeptDialog({ open: true, mode: 'add', divisionId: div.id, value: '' }); }}>
                    <Plus size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="แก้ไขฝ่าย">
                  <IconButton size="small" sx={{ color: '#D97706' }}
                    onClick={() => setDivDialog({ open: true, mode: 'edit', id: div.id, value: div.name })}>
                    <Pencil size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ลบฝ่าย">
                  <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setDivDeleteConfirm(div)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Department rows */}
              <Collapse in={isOpen}>
                {depts.length === 0 && (
                  <Box sx={{ px: 3, py: 2.5, pl: 7, borderTop: '1px solid #F1F5F9' }}>
                    <Typography variant="caption" color="text.secondary">ยังไม่มีแผนกในฝ่ายนี้</Typography>
                  </Box>
                )}
                {depts.map((dept, idx) => {
                  const members     = allUsers.filter((u) => u.department === dept.name);
                  const deptInactive = !dept.isActive || divInactive;
                  const ownInactive  = !dept.isActive;

                  return (
                    <Box key={dept.id} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25, pl: 7, gap: 1.5, borderTop: '1px solid #F1F5F9', '&:hover': { backgroundColor: '#FAFAFA' }, backgroundColor: idx % 2 === 0 ? '#FDFDFD' : '#FFFFFF', opacity: deptInactive ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: 1, backgroundColor: deptInactive ? '#F1F5F9' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s' }}>
                        <Layers size={13} color={deptInactive ? '#94A3B8' : '#1E7A34'} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.825rem', color: deptInactive ? '#94A3B8' : '#0F172A', transition: 'color 0.2s' }}>{dept.name}</Typography>
                          {ownInactive && !divInactive && (
                            <Chip label="ปิดใช้งาน" size="small" sx={{ fontSize: '0.6rem', height: 16, backgroundColor: '#FEE2E2', color: '#d4183d' }} />
                          )}
                          {divInactive && ownInactive && (
                            <Chip label="ปิดใช้งาน" size="small" sx={{ fontSize: '0.6rem', height: 16, backgroundColor: '#FEE2E2', color: '#d4183d' }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{members.length} คน</Typography>
                      </Box>

                      {/* Department toggle — disabled if parent division is inactive */}
                      <Tooltip title={divInactive ? 'เปิดใช้งานฝ่ายก่อนเปิดแผนก' : dept.isActive ? 'ปิดใช้งานแผนก' : 'เปิดใช้งานแผนก'}>
                        <span>
                          <Switch
                            size="small"
                            checked={dept.isActive}
                            disabled={divInactive}
                            onChange={() => handleToggleDepartment(dept)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#1E7A34' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1E7A34' },
                            }}
                          />
                        </span>
                      </Tooltip>

                      <Tooltip title="ดูสมาชิก">
                        <IconButton size="small" onClick={() => setViewDept(dept)}>
                          <Eye size={13} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="แก้ไขแผนก">
                        <IconButton size="small" sx={{ color: '#D97706' }}
                          onClick={() => setDeptDialog({ open: true, mode: 'edit', id: dept.id, divisionId: dept.divisionId, value: dept.name })}>
                          <Pencil size={13} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบแผนก">
                        <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setDeptDeleteConfirm(dept)}>
                          <Trash2 size={13} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Collapse>
            </Paper>
          );
        })}
      </Box>

      {/* ── Division Dialog ── */}
      <Dialog open={divDialog.open} onClose={() => setDivDialog({ open: false, mode: 'add', value: '' })}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: divDialog.mode === 'add' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {divDialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>{divDialog.mode === 'add' ? 'เพิ่มฝ่ายใหม่' : 'แก้ไขฝ่าย'}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setDivDialog({ open: false, mode: 'add', value: '' })}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField fullWidth label="ชื่อฝ่าย" autoFocus value={divDialog.value}
            onChange={(e) => setDivDialog({ ...divDialog, value: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveDivision()} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDivDialog({ open: false, mode: 'add', value: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveDivision} disabled={!divDialog.value.trim()}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
            {divDialog.mode === 'add' ? 'เพิ่มฝ่าย' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Department Dialog ── */}
      <Dialog open={deptDialog.open} onClose={() => setDeptDialog({ open: false, mode: 'add', divisionId: 0, value: '' })}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: deptDialog.mode === 'add' ? '#059669' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deptDialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{deptDialog.mode === 'add' ? 'เพิ่มแผนกใหม่' : 'แก้ไขแผนก'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ฝ่าย: {divisions.find((d) => d.id === deptDialog.divisionId)?.name ?? ''}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setDeptDialog({ open: false, mode: 'add', divisionId: 0, value: '' })}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField fullWidth label="ชื่อแผนก" autoFocus value={deptDialog.value}
            onChange={(e) => setDeptDialog({ ...deptDialog, value: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveDepartment()} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeptDialog({ open: false, mode: 'add', divisionId: 0, value: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveDepartment} disabled={!deptDialog.value.trim()}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
            {deptDialog.mode === 'add' ? 'เพิ่มแผนก' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Division Confirm ── */}
      <Dialog open={!!divDeleteConfirm} onClose={() => setDivDeleteConfirm(null)}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#d4183d" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>ยืนยันการลบฝ่าย</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ต้องการลบฝ่าย <Typography component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>"{divDeleteConfirm?.name}"</Typography> ใช่หรือไม่?
          </Typography>
          {divDeleteConfirm && departments.some((d) => d.divisionId === divDeleteConfirm.id) && (
            <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }}>
              ต้องลบแผนกทั้งหมดในฝ่ายนี้ก่อน
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDivDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDeleteDivision}
            sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b91c1c' } }}>ลบฝ่าย</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Department Confirm ── */}
      <Dialog open={!!deptDeleteConfirm} onClose={() => setDeptDeleteConfirm(null)}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#d4183d" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>ยืนยันการลบแผนก</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ต้องการลบแผนก <Typography component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>"{deptDeleteConfirm?.name}"</Typography> ใช่หรือไม่?
          </Typography>
          {deptDeleteConfirm && allUsers.filter((u) => u.department === deptDeleteConfirm.name).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีพนักงาน {allUsers.filter((u) => u.department === deptDeleteConfirm.name).length} คนอยู่ในแผนกนี้
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeptDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDeleteDepartment}
            sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b91c1c' } }}>ลบแผนก</Button>
        </DialogActions>
      </Dialog>

      {/* ── View Members Dialog ── */}
      <Dialog open={!!viewDept} onClose={() => setViewDept(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {viewDept && (() => {
          const members = allUsers.filter((u) => u.department === viewDept.name);
          const divName = divisions.find((d) => d.id === viewDept.divisionId)?.name ?? '';
          return (
            <>
              <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={16} color="white" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{viewDept.name}</Typography>
                      <Typography variant="caption" color="text.secondary">ฝ่าย {divName} · {members.length} คน</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => setViewDept(null)}><X size={18} /></IconButton>
                </Box>
              </DialogTitle>
              <Divider sx={{ mt: 2 }} />
              <DialogContent sx={{ pt: 2, pb: 1 }}>
                {members.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Users size={36} color="#CBD5E1" />
                    <Typography color="text.secondary" sx={{ mt: 1.5 }}>ยังไม่มีพนักงานในแผนกนี้</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {members.map((u) => (
                      <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid #F0F1F3', '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700, backgroundColor: u.isActive ? '#1E7A34' : '#CBD5E1' }}>
                          {u.fullnameThai[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.fullnameThai}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.email} · {u.employeeId}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                          <Chip label={roleLabel[u.role]} size="small" sx={{ ...(roleChipSx[u.role] ?? {}) }} />
                          <Chip label={u.isActive ? 'ใช้งาน' : 'ระงับ'} size="small"
                            color={u.isActive ? 'success' : 'error'} sx={{ fontSize: '0.65rem' }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setViewDept(null)}>ปิด</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}