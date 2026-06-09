import { useState } from 'react';
import {
  Box, Typography, Avatar, Chip, Button, TextField,
  Divider, Alert, CircularProgress,
} from '@mui/material';
import { User as UserIcon, Mail, Lock, Save, CheckCircle, BadgeCheck } from 'lucide-react';
import { User } from '../data/types';
import { userService } from '../services';

interface ProfilePageProps {
  user: User;
  onUpdated: (updatedUser: User) => void;
}

const roleLabel: Record<string, string> = {
  super_admin:    'Super Admin',
  training_admin: 'Training Admin',
  manager:        'Manager',
  learner:        'Learner',
};

const roleColor: Record<string, { bg: string; color: string }> = {
  super_admin:    { bg: '#FEF2F2', color: '#991B1B' },
  training_admin: { bg: '#EDE9FE', color: '#5B21B6' },
  manager:        { bg: '#FFFBEB', color: '#92400E' },
  learner:        { bg: '#E8F5E9', color: '#155225' },
};

export function ProfilePage({ user, onUpdated }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState(false);

  const nameChanged = name.trim() !== user.name || email.trim() !== user.email;
  const rc = roleColor[user.role] ?? { bg: '#F1F5F9', color: '#475569' };

  const handleSaveInfo = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const updated = await userService.update(user.id, { name: name.trim(), email: email.trim() });
      if (updated) {
        onUpdated(updated);
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!oldPw || !newPw || !confirmPw) { setPwError('กรุณากรอกข้อมูลให้ครบ'); return; }
    if (newPw.length < 6) { setPwError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (newPw !== confirmPw) { setPwError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
    if (oldPw !== user.password) { setPwError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); return; }
    setPwSaving(true);
    try {
      const updated = await userService.update(user.id, { password: newPw });
      if (updated) {
        onUpdated(updated);
        setPwOk(true);
        setOldPw(''); setNewPw(''); setConfirmPw('');
        setTimeout(() => setPwOk(false), 3000);
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>

      {/* ── Hero card ── */}
      <Box sx={{ background: 'linear-gradient(135deg,#0F3D1A,#1E7A34)', borderRadius: 4, p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: '1.6rem', fontWeight: 800, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}>
            {user.name[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.02em', mb: 0.5 }}>{user.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={roleLabel[user.role] ?? user.role} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.72rem', height: 22 }} />
              <Chip label={user.group} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', height: 22 }} />
            </Box>
          </Box>
        </Box>
        {/* Read-only fields */}
        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {[
            { label: 'รหัสพนักงาน', value: user.employeeId },
            { label: 'บทบาท', value: roleLabel[user.role] ?? user.role },
          ].map((f) => (
            <Box key={f.label}>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.4 }}>{f.label}</Typography>
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{f.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Edit info ── */}
      <Box sx={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={15} color="white" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>ข้อมูลส่วนตัว</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
          <TextField label="ชื่อ-นามสกุล" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth slotProps={{ input: { startAdornment: <UserIcon size={14} color="#94A3B8" style={{ marginRight: 8 }} /> } }} />
          <TextField label="อีเมล" type="email" value={email} onChange={(e) => setEmail(e.target.value)} size="small" fullWidth slotProps={{ input: { startAdornment: <Mail size={14} color="#94A3B8" style={{ marginRight: 8 }} /> } }} />
        </Box>

        {saveOk && <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }} icon={<CheckCircle size={14} />}>บันทึกข้อมูลเรียบร้อยแล้ว</Alert>}

        <Button variant="contained" disableElevation startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <Save size={14} />}
          disabled={!nameChanged || saving}
          onClick={handleSaveInfo}
          sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155724' }, '&:disabled': { backgroundColor: '#E2E8F0' } }}>
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </Button>
      </Box>

      {/* ── Change password ── */}
      <Box sx={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={15} color="white" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>เปลี่ยนรหัสผ่าน</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
          <TextField label="รหัสผ่านปัจจุบัน" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} size="small" fullWidth />
          <Divider />
          <TextField label="รหัสผ่านใหม่" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} size="small" fullWidth helperText="อย่างน้อย 6 ตัวอักษร" />
          <TextField label="ยืนยันรหัสผ่านใหม่" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} size="small" fullWidth error={!!confirmPw && confirmPw !== newPw} helperText={confirmPw && confirmPw !== newPw ? 'รหัสผ่านไม่ตรงกัน' : ''} />
        </Box>

        {pwError && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{pwError}</Alert>}
        {pwOk && <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }} icon={<CheckCircle size={14} />}>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</Alert>}

        <Button variant="contained" disableElevation startIcon={pwSaving ? <CircularProgress size={13} color="inherit" /> : <BadgeCheck size={14} />}
          disabled={!oldPw || !newPw || !confirmPw || pwSaving}
          onClick={handleChangePassword}
          sx={{ backgroundColor: '#D97706', '&:hover': { backgroundColor: '#B45309' }, '&:disabled': { backgroundColor: '#E2E8F0' } }}>
          {pwSaving ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
        </Button>
      </Box>
    </Box>
  );
}