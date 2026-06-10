import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Tooltip,
  Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, InputAdornment,
} from '@mui/material';
import { Store, Plus, Eye, Pencil, Trash2, X, Users, Search, Phone, MapPin, UserCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../services';
import { User } from '../data/types';

// ── Mock storage ────────────────────────────────────────────────────────────
const SHOP_KEY = 'lms_shops_v1';

export interface Shop {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  isActive: boolean;
}

const SEED_SHOPS: Shop[] = [
  { id: 1, name: 'ร้านค้า A', contactPerson: 'สมชาย ใจดี',   phone: '081-000-0001', address: 'กรุงเทพฯ',    isActive: true },
  { id: 2, name: 'ร้านค้า B', contactPerson: 'สมหญิง รักดี', phone: '081-000-0002', address: 'เชียงใหม่',  isActive: true },
  { id: 3, name: 'Partner C', contactPerson: '',               phone: '',             address: 'ขอนแก่น',   isActive: false },
];

function loadShops(): Shop[] {
  try { const s = localStorage.getItem(SHOP_KEY); if (s) return JSON.parse(s); } catch { /**/ }
  return SEED_SHOPS;
}
function saveShops(data: Shop[]) { localStorage.setItem(SHOP_KEY, JSON.stringify(data)); }

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

// ── Dialog form state ────────────────────────────────────────────────────────
interface ShopForm { name: string; contactPerson: string; phone: string; address: string }
const emptyForm = (): ShopForm => ({ name: '', contactPerson: '', phone: '', address: '' });

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

// ── Component ────────────────────────────────────────────────────────────────
export function ShopManagement() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [shops, setShops]       = useState<Shop[]>(loadShops);
  const [search, setSearch]     = useState('');

  // CRUD dialog
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; id?: number; form: ShopForm }>(
    { open: false, mode: 'add', form: emptyForm() }
  );
  const [errors, setErrors] = useState<Partial<ShopForm>>({});

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);

  // View members
  const [viewShop, setViewShop] = useState<Shop | null>(null);

  useEffect(() => {
    userService.getAll().then(setAllUsers).catch(() => toast.error('โหลดข้อมูลไม่สำเร็จ'));
  }, []);

  const membersOf = (shop: Shop) => allUsers.filter((u) => u.department === shop.name);

  const filteredShops = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  // ── Toggle ────────────────────────────────────────────────────────────────
  const handleToggle = (shop: Shop) => {
    const next = !shop.isActive;
    const updated = shops.map((s) => s.id === shop.id ? { ...s, isActive: next } : s);
    saveShops(updated);
    setShops(updated);
    toast.success(`${next ? 'เปิด' : 'ปิด'}ใช้งานร้านค้า "${shop.name}" เรียบร้อยแล้ว`);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd  = () => setDialog({ open: true, mode: 'add', form: emptyForm() });
  const openEdit = (shop: Shop) => setDialog({ open: true, mode: 'edit', id: shop.id, form: { name: shop.name, contactPerson: shop.contactPerson, phone: shop.phone, address: shop.address } });
  const closeDialog = () => { setDialog({ open: false, mode: 'add', form: emptyForm() }); setErrors({}); };

  const validate = (f: ShopForm): boolean => {
    const e: Partial<ShopForm> = {};
    if (!f.name.trim()) e.name = 'กรุณากรอกชื่อร้านค้า';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate(dialog.form)) return;
    const { name, contactPerson, phone, address } = dialog.form;
    let updated: Shop[];
    if (dialog.mode === 'add') {
      updated = [...shops, { id: nextId(shops), name: name.trim(), contactPerson: contactPerson.trim(), phone: phone.trim(), address: address.trim(), isActive: true }];
      toast.success(`เพิ่มร้านค้า "${name.trim()}" เรียบร้อยแล้ว`);
    } else {
      updated = shops.map((s) => s.id === dialog.id ? { ...s, name: name.trim(), contactPerson: contactPerson.trim(), phone: phone.trim(), address: address.trim() } : s);
      toast.success(`แก้ไขร้านค้าเรียบร้อยแล้ว`);
    }
    saveShops(updated);
    setShops(updated);
    closeDialog();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const members = membersOf(deleteTarget);
    if (members.length > 0) {
      toast.error(`ไม่สามารถลบร้านค้าที่ยังมีสมาชิก ${members.length} คนอยู่ได้`);
      setDeleteTarget(null);
      return;
    }
    const updated = shops.filter((s) => s.id !== deleteTarget.id);
    saveShops(updated);
    setShops(updated);
    toast.success(`ลบร้านค้า "${deleteTarget.name}" เรียบร้อยแล้ว`);
    setDeleteTarget(null);
  };

  const activeCount = shops.filter((s) => s.isActive).length;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการร้านค้า</Typography>
          <Typography variant="caption" color="text.secondary">
            {activeCount}/{shops.length} ร้านค้าเปิดใช้งาน
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openAdd}>
          เพิ่มร้านค้าใหม่
        </Button>
      </Box>

      {/* ── Search ── */}
      <TextField
        size="small" fullWidth placeholder="ค้นหาร้านค้า หรือผู้ติดต่อ..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5, maxWidth: 360 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><Search size={15} color="#94A3B8" /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}><X size={14} /></IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {/* ── Empty ── */}
      {filteredShops.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed #E2E8F0', borderRadius: 3 }}>
          <Store size={32} color="#CBD5E1" />
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>
            {search ? 'ไม่พบร้านค้าที่ค้นหา' : 'ยังไม่มีร้านค้า'}
          </Typography>
        </Box>
      )}

      {/* ── Shop list ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filteredShops.map((shop) => {
          const members   = membersOf(shop);
          const inactive  = !shop.isActive;

          return (
            <Paper key={shop.id} elevation={0} sx={{ border: `1px solid ${inactive ? '#F1F5F9' : '#E2E8F0'}`, borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, opacity: inactive ? 0.72 : 1, transition: 'opacity 0.2s', '&:hover': { backgroundColor: '#FAFAFA' } }}>
              {/* Icon */}
              <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: inactive ? '#94A3B8' : '#0F3D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s' }}>
                <Store size={18} color="white" />
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: inactive ? '#94A3B8' : '#0F172A' }}>{shop.name}</Typography>
                  {inactive && <Chip label="ปิดใช้งาน" size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#FEE2E2', color: '#d4183d' }} />}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.25 }}>
                  {shop.contactPerson && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <UserCheck size={11} color="#94A3B8" />
                      <Typography variant="caption" color="text.secondary">{shop.contactPerson}</Typography>
                    </Box>
                  )}
                  {shop.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone size={11} color="#94A3B8" />
                      <Typography variant="caption" color="text.secondary">{shop.phone}</Typography>
                    </Box>
                  )}
                  {shop.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={11} color="#94A3B8" />
                      <Typography variant="caption" color="text.secondary">{shop.address}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Member badge */}
              <Chip
                icon={<Users size={12} />}
                label={`${members.length} คน`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', borderColor: '#E2E8F0', color: '#475569', cursor: members.length > 0 ? 'pointer' : 'default' }}
                onClick={members.length > 0 ? () => setViewShop(shop) : undefined}
              />

              {/* Actions */}
              <Tooltip title={inactive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>
                <IconButton size="small" onClick={() => handleToggle(shop)} sx={{ color: shop.isActive ? '#1E7A34' : '#94A3B8' }}>
                  {shop.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="ดูสมาชิก">
                <IconButton size="small" onClick={() => setViewShop(shop)}>
                  <Eye size={15} />
                </IconButton>
              </Tooltip>
              <Tooltip title="แก้ไข">
                <IconButton size="small" sx={{ color: '#D97706' }} onClick={() => openEdit(shop)}>
                  <Pencil size={15} />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setDeleteTarget(shop)}>
                  <Trash2 size={15} />
                </IconButton>
              </Tooltip>
            </Paper>
          );
        })}
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: dialog.mode === 'add' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {dialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>{dialog.mode === 'add' ? 'เพิ่มร้านค้าใหม่' : 'แก้ไขร้านค้า'}</Typography>
            </Box>
            <IconButton size="small" onClick={closeDialog}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth required label="ชื่อร้านค้า" autoFocus
            value={dialog.form.name}
            onChange={(e) => setDialog((p) => ({ ...p, form: { ...p.form, name: e.target.value } }))}
            error={!!errors.name} helperText={errors.name}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <TextField
            fullWidth label="ผู้ติดต่อ"
            value={dialog.form.contactPerson}
            onChange={(e) => setDialog((p) => ({ ...p, form: { ...p.form, contactPerson: e.target.value } }))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><UserCheck size={14} color="#94A3B8" /></InputAdornment> } }}
          />
          <TextField
            fullWidth label="เบอร์โทร"
            value={dialog.form.phone}
            onChange={(e) => setDialog((p) => ({ ...p, form: { ...p.form, phone: e.target.value } }))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone size={14} color="#94A3B8" /></InputAdornment> } }}
          />
          <TextField
            fullWidth label="ที่อยู่"
            value={dialog.form.address}
            onChange={(e) => setDialog((p) => ({ ...p, form: { ...p.form, address: e.target.value } }))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><MapPin size={14} color="#94A3B8" /></InputAdornment> } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeDialog}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={!dialog.form.name.trim()}
            sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' } }}>
            {dialog.mode === 'add' ? 'เพิ่มร้านค้า' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#d4183d" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>ยืนยันการลบร้านค้า</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ต้องการลบร้านค้า <Typography component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>"{deleteTarget?.name}"</Typography> ใช่หรือไม่?
          </Typography>
          {deleteTarget && membersOf(deleteTarget).length > 0 && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#92400E' }}>
                ยังมีสมาชิก {membersOf(deleteTarget).length} คนในร้านค้านี้ กรุณาย้ายสมาชิกออกก่อน
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDelete}
            sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b91c1c' } }}>ลบร้านค้า</Button>
        </DialogActions>
      </Dialog>

      {/* ── View Members Dialog ── */}
      <Dialog open={!!viewShop} onClose={() => setViewShop(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {viewShop && (() => {
          const members = membersOf(viewShop);
          return (
            <>
              <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#0F3D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={16} color="white" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{viewShop.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{members.length} คน</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => setViewShop(null)}><X size={18} /></IconButton>
                </Box>
              </DialogTitle>
              <Divider sx={{ mt: 2 }} />
              <DialogContent sx={{ pt: 2, pb: 1 }}>
                {members.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Users size={36} color="#CBD5E1" />
                    <Typography color="text.secondary" sx={{ mt: 1.5 }}>ยังไม่มีสมาชิกในร้านค้านี้</Typography>
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
                <Button onClick={() => setViewShop(null)}>ปิด</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}