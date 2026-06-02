import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  BookOpen,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Zap,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';
import { User, UserRole } from '../data/types';
import { groupOptions } from '../data/users';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onBackToLogin: () => void;
}

type UserType = 'employee' | 'external';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  employeeId: string;
  group: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  group?: string;
  password?: string;
  confirmPassword?: string;
}

const defaultForm = (): FormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  userType: 'employee',
  employeeId: '',
  group: '',
  password: '',
  confirmPassword: '',
});

const benefits = [
  { icon: <Zap size={18} />, text: 'เข้าถึงคอร์สเรียนได้ทันที' },
  { icon: <TrendingUp size={18} />, text: 'ติดตามความคืบหน้าแบบ Real-time' },
  { icon: <Award size={18} />, text: 'รับใบประกาศเมื่อสอบผ่าน' },
  { icon: <CheckCircle size={18} />, text: 'เรียนได้ทุกที่ ทุกเวลา' },
];

function genId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm((prev) => ({ ...prev, [field]: (e as React.ChangeEvent<HTMLInputElement>).target.value }));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'กรุณากรอกชื่อ';
    if (!form.lastName.trim()) errs.lastName = 'กรุณากรอกนามสกุล';
    if (!form.email.trim()) errs.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.phone.trim()) errs.phone = 'กรุณากรอกเบอร์โทร';
    if (form.userType === 'employee') {
      if (!form.employeeId.trim()) errs.employeeId = 'กรุณากรอกรหัสพนักงาน';
      if (!form.group) errs.group = 'กรุณาเลือกกลุ่ม/ทีม';
    }
    if (!form.password) errs.password = 'กรุณากรอกรหัสผ่าน';
    else if (form.password.length < 6) errs.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (!form.confirmPassword) errs.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    const role: UserRole = form.userType === 'employee' ? 'learner' : 'learner';
    const newUser: User = {
      id: genId(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role,
      group: form.userType === 'employee' ? form.group : 'บุคคลภายนอก',
      employeeId: form.userType === 'employee' ? form.employeeId.trim() : `EXT-${Date.now().toString().slice(-5)}`,
      active: true,
    };

    setSuccess(true);
    setTimeout(() => {
      onRegister(newUser);
    }, 1800);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Left Panel ── */}
      <Box
        sx={{
          flex: { xs: 'none', md: '0 0 42%' },
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(139,92,246,0.12)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="white" />
            </Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>PK Learning</Typography>
          </Box>

          <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 2, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            เริ่มต้น
            <br />
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #A5B4FC, #C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              การเรียนรู้
            </Box>
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mb: 6, lineHeight: 1.7 }}>
            สมัครสมาชิกและเข้าถึงคอร์สผลิตภัณฑ์ทั้งหมดได้ทันที พร้อมระบบติดตามผลและใบประกาศ
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {benefits.map((b, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'rgba(165,180,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A5B4FC', flexShrink: 0 }}>
                  {b.icon}
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{b.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Right Panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAFA',
          p: { xs: 3, md: 5 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>

          {/* Back link */}
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={onBackToLogin}
            sx={{ mb: 3, color: '#64748B', px: 0, '&:hover': { background: 'transparent', color: '#0F172A' } }}
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Button>

          {/* Success state */}
          {success ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}>
                <CheckCircle size={40} color="white" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#065F46', mb: 1 }}>สมัครสมาชิกสำเร็จ!</Typography>
              <Typography sx={{ color: '#059669' }}>กำลังเข้าสู่ระบบอัตโนมัติ...</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
                  สมัครสมาชิก
                </Typography>
                <Typography sx={{ color: '#64748B' }}>กรอกข้อมูลเพื่อสร้างบัญชีใหม่</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Name row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="ชื่อ"
                    fullWidth
                    required
                    value={form.firstName}
                    onChange={set('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                  <TextField
                    label="นามสกุล"
                    fullWidth
                    required
                    value={form.lastName}
                    onChange={set('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Box>

                {/* Email + Phone row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="อีเมล"
                    type="email"
                    fullWidth
                    required
                    value={form.email}
                    onChange={set('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                  <TextField
                    label="เบอร์โทรศัพท์"
                    fullWidth
                    required
                    value={form.phone}
                    onChange={set('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="08X-XXX-XXXX"
                  />
                </Box>

                {/* User type */}
                <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: 'white' }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', mb: 1 }}>
                      ประเภทผู้ใช้งาน <span style={{ color: '#EF4444' }}>*</span>
                    </FormLabel>
                    <RadioGroup
                      row
                      value={form.userType}
                      onChange={(e) => setForm((prev) => ({ ...prev, userType: e.target.value as UserType, employeeId: '', group: '' }))}
                    >
                      <FormControlLabel
                        value="employee"
                        control={<Radio size="small" sx={{ color: '#6366F1', '&.Mui-checked': { color: '#6366F1' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>พนักงานบริษัท</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="external"
                        control={<Radio size="small" sx={{ color: '#6366F1', '&.Mui-checked': { color: '#6366F1' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>บุคคลภายนอก</Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Employee-only fields */}
                {form.userType === 'employee' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="รหัสพนักงาน"
                      fullWidth
                      required
                      value={form.employeeId}
                      onChange={set('employeeId')}
                      error={!!errors.employeeId}
                      helperText={errors.employeeId}
                      placeholder="EMP-001"
                    />
                    <FormControl fullWidth required error={!!errors.group}>
                      <InputLabel>กลุ่ม / ทีม</InputLabel>
                      <Select
                        value={form.group}
                        label="กลุ่ม / ทีม"
                        onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}
                      >
                        {groupOptions.map((g) => (
                          <MenuItem key={g} value={g}>{g}</MenuItem>
                        ))}
                      </Select>
                      {errors.group && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.group}</Typography>
                      )}
                    </FormControl>
                  </Box>
                )}

                <Divider sx={{ my: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>รหัสผ่าน</Typography>
                </Divider>

                {/* Password row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="รหัสผ่าน"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={form.password}
                    onChange={set('password')}
                    error={!!errors.password}
                    helperText={errors.password || 'อย่างน้อย 6 ตัวอักษร'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="ยืนยันรหัสผ่าน"
                    type={showConfirm ? 'text' : 'password'}
                    fullWidth
                    required
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end">
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={<UserPlus size={18} />}
                  sx={{
                    py: 1.5,
                    mt: 0.5,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                    },
                  }}
                >
                  {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </Button>

                <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748B' }}>
                  มีบัญชีอยู่แล้ว?{' '}
                  <Box
                    component="span"
                    onClick={onBackToLogin}
                    sx={{ color: '#6366F1', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    เข้าสู่ระบบ
                  </Box>
                </Typography>
              </Box>
            </>
          )}

          <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', textAlign: 'center', mt: 4 }}>
            © 2024 Product Knowledge LMS v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
