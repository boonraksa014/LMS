import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Checkbox,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import { Plus, Pencil, Trash2, Lock, Shield, CheckCircle, X } from 'lucide-react';

import { userService } from '../services';
import { User } from '../data/types';
import {
  MENU_DEFS,
  INITIAL_ROLE_CONFIGS,
  _sp,
  type RoleConfig,
} from '../data/rolePermissions';

const AVATAR_COLORS = ['#0F3D1A', '#1E7A34', '#0891B2', '#D97706', '#B45309', '#475569', '#1D4ED8'];

const SECTIONS = [...new Set(MENU_DEFS.map((m) => m.section))];

type CheckState = 'all' | 'some' | 'none';

function getSectionState(role: RoleConfig, section: string): CheckState {
  const menus = MENU_DEFS.filter((m) => m.section === section);
  const total = menus.reduce((s, m) => s + m.actions.length, 0);
  const checked = menus.reduce((s, m) => {
    const mp = role.permissions[m.id] ?? {};
    return s + m.actions.filter((a) => mp[a.id]).length;
  }, 0);
  if (checked === 0) return 'none';
  if (checked === total) return 'all';
  return 'some';
}

function getMenuState(role: RoleConfig, menuId: string): CheckState {
  const menu = MENU_DEFS.find((m) => m.id === menuId);
  if (!menu) return 'none';
  const mp = role.permissions[menuId] ?? {};
  const checked = menu.actions.filter((a) => mp[a.id]).length;
  if (checked === 0) return 'none';
  if (checked === menu.actions.length) return 'all';
  return 'some';
}

export function RoleManagement() {
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    userService.getAll().then(setAllUsers).catch(() => {});
  }, []);

  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(INITIAL_ROLE_CONFIGS);
  const [savedConfigs, setSavedConfigs] = useState<RoleConfig[]>(INITIAL_ROLE_CONFIGS);
  const [selectedRoleId, setSelectedRoleId] = useState('super_admin');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [roleFormDialog, setRoleFormDialog] = useState<{
    open: boolean; mode: 'create' | 'edit'; label: string; description: string; copyFrom: string;
  }>({ open: false, mode: 'create', label: '', description: '', copyFrom: '' });

  const [roleDeleteConfirm, setRoleDeleteConfirm] = useState<string | null>(null);

  const selectedRole = roleConfigs.find((r) => r.id === selectedRoleId) ?? null;
  const isLocked = selectedRole?.id === 'super_admin';

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleAction = (menuId: string, actionId: string) => {
    if (isLocked) return;
    setRoleConfigs((prev) => prev.map((r) =>
      r.id !== selectedRoleId ? r : {
        ...r,
        permissions: {
          ...r.permissions,
          [menuId]: { ...r.permissions[menuId], [actionId]: !r.permissions[menuId]?.[actionId] },
        },
      }
    ));
  };

  const toggleMenu = (menuId: string, value: boolean) => {
    if (isLocked) return;
    const menu = MENU_DEFS.find((m) => m.id === menuId);
    if (!menu) return;
    setRoleConfigs((prev) => prev.map((r) =>
      r.id !== selectedRoleId ? r : {
        ...r,
        permissions: {
          ...r.permissions,
          [menuId]: Object.fromEntries(menu.actions.map((a) => [a.id, value])),
        },
      }
    ));
  };

  const toggleSection = (section: string, value: boolean) => {
    if (isLocked) return;
    const menus = MENU_DEFS.filter((m) => m.section === section);
    setRoleConfigs((prev) => prev.map((r) =>
      r.id !== selectedRoleId ? r : {
        ...r,
        permissions: {
          ...r.permissions,
          ...Object.fromEntries(menus.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, value]))])),
        },
      }
    ));
  };

  const handleSave = () => {
    setSavedConfigs(JSON.parse(JSON.stringify(roleConfigs)));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setRoleConfigs(JSON.parse(JSON.stringify(savedConfigs)));
  };

  const handleSaveRoleForm = () => {
    if (!roleFormDialog.label.trim()) return;
    if (roleFormDialog.mode === 'create') {
      const newId = `custom_${Date.now()}`;
      const template = roleFormDialog.copyFrom ? roleConfigs.find((r) => r.id === roleFormDialog.copyFrom) : null;
      const emptyPerms = Object.fromEntries(MENU_DEFS.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, false]))]));
      setRoleConfigs((prev) => [...prev, {
        id: newId,
        label: roleFormDialog.label.trim(),
        description: roleFormDialog.description.trim(),
        isSystem: false,
        permissions: template ? JSON.parse(JSON.stringify(template.permissions)) : emptyPerms,
      }]);
      setSelectedRoleId(newId);
    } else {
      setRoleConfigs((prev) => prev.map((r) =>
        r.id !== selectedRoleId ? r : {
          ...r,
          label: roleFormDialog.label.trim(),
          description: roleFormDialog.description.trim(),
        }
      ));
    }
    setRoleFormDialog({ ...roleFormDialog, open: false });
  };

  const handleDeleteRole = () => {
    if (!roleDeleteConfirm) return;
    const remaining = roleConfigs.filter((r) => r.id !== roleDeleteConfirm);
    setRoleConfigs(remaining);
    if (selectedRoleId === roleDeleteConfirm) setSelectedRoleId(remaining[0]?.id ?? '');
    setRoleDeleteConfirm(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color="white" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            สิทธิการใช้งาน
          </Typography>
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.875rem', pl: '52px' }}>
          ตั้งค่าการเข้าถึงเมนูและข้อมูลสำหรับแต่ละบทบาท
        </Typography>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }} onClose={() => setSaveSuccess(false)}>
          บันทึกการเปลี่ยนแปลงสิทธิ์เรียบร้อยแล้ว
        </Alert>
      )}

      {/* Main card */}
      <Box sx={{
        display: 'flex',
        border: '1px solid #E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'white',
        minHeight: 580,
      }}>

        {/* ── Left: role list ─────────────────────────────────────── */}
        <Box sx={{ width: 240, flexShrink: 0, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ px: 2, py: 1.75, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>บทบาท</Typography>
            <Tooltip title="เพิ่มบทบาทใหม่">
              <IconButton size="small"
                onClick={() => setRoleFormDialog({ open: true, mode: 'create', label: '', description: '', copyFrom: '' })}
                sx={{ color: '#64748B', '&:hover': { color: '#1E7A34', backgroundColor: '#F0FDF4' } }}>
                <Plus size={15} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Role list */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {roleConfigs.map((role, idx) => {
              const isSel = selectedRoleId === role.id;
              return (
                <Box
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRoleId(role.id); } }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSel}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 1.25, borderRadius: 2, cursor: 'pointer',
                    backgroundColor: isSel ? '#F0FDF4' : 'transparent',
                    border: `1px solid ${isSel ? '#BBF7D0' : 'transparent'}`,
                    transition: 'all 0.12s',
                    '&:hover': { backgroundColor: isSel ? '#F0FDF4' : '#F8FAFC' },
                    '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: 1 },
                    position: 'relative',
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.82rem', fontWeight: 700, flexShrink: 0, backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                    {role.label.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: isSel ? '#1E7A34' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                      {role.label}
                    </Typography>
                  </Box>
                  {role.isSystem
                    ? <Lock size={12} color="#CBD5E1" />
                    : (
                      <Tooltip title="ลบบทบาท">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); setRoleDeleteConfirm(role.id); }}
                          sx={{ p: 0.5, color: '#CBD5E1', opacity: isSel ? 1 : 0, '&:hover': { color: '#d4183d', backgroundColor: '#FEF2F2', opacity: 1 }, '.MuiBox-root:hover &': { opacity: 1 } }}
                        >
                          <Trash2 size={12} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Right: permission tree + footer ─────────────────────── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Panel header */}
          <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>การให้สิทธิ์</Typography>
              {selectedRole && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{selectedRole.label}</Typography>
                  {selectedRole.isSystem && <Chip label="บทบาทระบบ" size="small" sx={{ fontSize: '0.6rem', height: 16, backgroundColor: '#F1F5F9', color: '#64748B' }} />}
                </Box>
              )}
            </Box>
            {selectedRole?.description && (
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.4, mt: 0.25 }}>
                {selectedRole.description}
              </Typography>
            )}
          </Box>

          {/* Permission tree */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
            {!selectedRole ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>เลือกบทบาทเพื่อตั้งค่าสิทธิ์</Typography>
              </Box>
            ) : isLocked ? (
              <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                Super Admin มีสิทธิ์ครบทุกฟังก์ชันและไม่สามารถแก้ไขได้
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {SECTIONS.map((section, sIdx) => {
                  const sectionMenus = MENU_DEFS.filter((m) => m.section === section);
                  const sectionState = getSectionState(selectedRole, section);

                  return (
                    <Box key={section}>
                      {/* Section divider */}
                      {sIdx > 0 && <Divider sx={{ my: 1.5 }} />}

                      {/* Section row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
                        <Checkbox
                          size="small"
                          checked={sectionState === 'all'}
                          indeterminate={sectionState === 'some'}
                          onChange={(_, v) => toggleSection(section, v)}
                          sx={{
                            p: 0.5,
                            color: '#CBD5E1',
                            '&.Mui-checked': { color: '#1E7A34' },
                            '&.MuiCheckbox-indeterminate': { color: '#1E7A34' },
                          }}
                        />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {section}
                        </Typography>
                      </Box>

                      {/* Menu rows */}
                      {sectionMenus.map((menu) => {
                        const menuState = getMenuState(selectedRole, menu.id);
                        const mp = selectedRole.permissions[menu.id] ?? {};

                        return (
                          <Box key={menu.id}>
                            {/* Menu row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, pl: 3 }}>
                              <Checkbox
                                size="small"
                                checked={menuState === 'all'}
                                indeterminate={menuState === 'some'}
                                onChange={(_, v) => toggleMenu(menu.id, v)}
                                sx={{
                                  p: 0.5,
                                  color: '#CBD5E1',
                                  '&.Mui-checked': { color: '#1E7A34' },
                                  '&.MuiCheckbox-indeterminate': { color: '#1E7A34' },
                                }}
                              />
                              <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1F2937' }}>
                                {menu.label}
                              </Typography>
                            </Box>

                            {/* Action rows */}
                            {menu.actions.map((action) => (
                              <Box
                                key={action.id}
                                onClick={() => toggleAction(menu.id, action.id)}
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  py: 0.875, pl: 6, cursor: 'pointer',
                                  borderRadius: 1,
                                  '&:hover': { backgroundColor: '#F8FAFC' },
                                }}
                              >
                                <Checkbox
                                  size="small"
                                  checked={!!mp[action.id]}
                                  onChange={() => toggleAction(menu.id, action.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    p: 0.5,
                                    color: '#CBD5E1',
                                    '&.Mui-checked': { color: '#059669' },
                                  }}
                                />
                                <Typography sx={{ fontSize: '0.8rem', color: mp[action.id] ? '#111827' : '#9CA3AF', fontWeight: mp[action.id] ? 500 : 400, userSelect: 'none' }}>
                                  {action.label}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* ── Bottom action bar ── */}
          <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: 1.5, backgroundColor: '#FAFAFA' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{ borderColor: '#E2E8F0', color: '#374151', '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' } }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              disableElevation
              startIcon={<CheckCircle size={15} />}
              onClick={handleSave}
              sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' }, px: 3 }}
            >
              บันทึก
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Create / Edit Role Dialog ── */}
      <Dialog
        open={roleFormDialog.open}
        onClose={() => setRoleFormDialog({ ...roleFormDialog, open: false })}
        maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: roleFormDialog.mode === 'create' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {roleFormDialog.mode === 'create' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {roleFormDialog.mode === 'create' ? 'สร้างบทบาทใหม่' : 'แก้ไขบทบาท'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setRoleFormDialog({ ...roleFormDialog, open: false })}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="ชื่อบทบาท" fullWidth required autoFocus
              value={roleFormDialog.label}
              onChange={(e) => setRoleFormDialog({ ...roleFormDialog, label: e.target.value })}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Shield size={15} color="#64748B" /></InputAdornment> } }}
              placeholder="เช่น Content Editor"
            />
            <TextField
              label="คำอธิบาย" fullWidth multiline rows={2}
              value={roleFormDialog.description}
              onChange={(e) => setRoleFormDialog({ ...roleFormDialog, description: e.target.value })}
              placeholder="อธิบายหน้าที่และขอบเขตของบทบาทนี้..."
            />
            {roleFormDialog.mode === 'create' && (
              <FormControl fullWidth>
                <InputLabel>คัดลอกสิทธิ์จาก</InputLabel>
                <Select
                  value={roleFormDialog.copyFrom}
                  label="คัดลอกสิทธิ์จาก"
                  onChange={(e) => setRoleFormDialog({ ...roleFormDialog, copyFrom: e.target.value })}
                >
                  <MenuItem value="">ไม่คัดลอก (เริ่มด้วยสิทธิ์ว่าง)</MenuItem>
                  {roleConfigs.map((r) => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
                </Select>
                <FormHelperText>บทบาทใหม่จะได้รับสิทธิ์จากบทบาทที่เลือก แล้วสามารถปรับเพิ่มเติมได้</FormHelperText>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setRoleFormDialog({ ...roleFormDialog, open: false })}>ยกเลิก</Button>
          <Button
            variant="contained" disableElevation
            disabled={!roleFormDialog.label.trim()}
            onClick={handleSaveRoleForm}
            startIcon={roleFormDialog.mode === 'create' ? <Plus size={15} /> : <CheckCircle size={15} />}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}
          >
            {roleFormDialog.mode === 'create' ? 'สร้างบทบาท' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Role Confirm ── */}
      <Dialog
        open={!!roleDeleteConfirm}
        onClose={() => setRoleDeleteConfirm(null)}
        maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle>ยืนยันการลบบทบาท</DialogTitle>
        <DialogContent>
          <Typography>
            ต้องการลบบทบาท <strong>"{roleConfigs.find((r) => r.id === roleDeleteConfirm)?.label}"</strong> ใช่หรือไม่?
          </Typography>
          {roleDeleteConfirm && allUsers.filter((u) => u.role === roleDeleteConfirm).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีผู้ใช้ {allUsers.filter((u) => u.role === roleDeleteConfirm).length} คนที่ใช้บทบาทนี้อยู่
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRoleDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" disableElevation onClick={handleDeleteRole} sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b01530' } }}>ลบบทบาท</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}