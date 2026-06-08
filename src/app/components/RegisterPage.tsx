import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import NutLoginImage from '../../imports/Nut_Login.png';
import { User, UserRole } from '../data/types';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onBackToLogin: () => void;
}

type UserType = 'employee' | 'external' | 'auditor';

interface FormState {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  email: string;
  phone: string;
  userType: UserType;
  // พนักงาน / ผู้ตรวจสอบ
  employeeId: string;
  position: string;
  department: string;
  division: string;
  // บุคคลภายนอก
  positionText: string;
  shopName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstNameTh?: string;
  lastNameTh?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  positionText?: string;
  password?: string;
  confirmPassword?: string;
}

const positionOptions = [
  'พนักงานขาย', 'ผู้จัดการฝ่ายขาย', 'เจ้าหน้าที่การตลาด', 'ผู้จัดการผลิตภัณฑ์',
  'เจ้าหน้าที่ฝึกอบรม', 'ผู้จัดการฝ่ายฝึกอบรม', 'เจ้าหน้าที่ HR', 'นักวิจัยและพัฒนา',
  'เจ้าหน้าที่ IT', 'ผู้ตรวจสอบภายใน', 'ผู้ตรวจสอบภายนอก', 'อื่นๆ',
];

const departmentOptions = [
  'ฝ่ายขาย', 'ฝ่ายการตลาด', 'ฝ่ายฝึกอบรม', 'ฝ่าย HR', 'ฝ่าย IT',
  'ฝ่ายวิจัยและพัฒนา', 'ฝ่ายปฏิบัติการ', 'ฝ่ายการเงิน', 'ฝ่ายตรวจสอบ', 'อื่นๆ',
];

const divisionOptions = [
  'Sales', 'Telesales', 'PC/BA', 'Live', 'Modern Trade',
  'Brand', 'R&D', 'CS', 'Partner/Distributor', 'HR & Training', 'IT', 'อื่นๆ',
];

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#E5E7EB' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 20, label: 'ความปลอดภัย: ต่ำ', color: '#EF4444' };
  if (score <= 3) return { score: 60, label: 'ความปลอดภัย: ปานกลาง', color: '#F59E0B' };
  return { score: 100, label: 'ความปลอดภัย: สูง', color: '#16A34A' };
}

const defaultForm = (): FormState => ({
  firstNameTh: '', lastNameTh: '', firstNameEn: '', lastNameEn: '',
  email: '', phone: '', userType: 'employee',
  employeeId: '', position: '', department: '', division: '',
  positionText: '', shopName: '',
  password: '', confirmPassword: '',
});

function genId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#A7C9B1' },
    '&.Mui-focused fieldset': { borderColor: '#1A5B2A', borderWidth: '1.5px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(26,91,42,0.08)', backgroundColor: '#FFFFFF' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1A5B2A' },
};

export function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const pwStrength = getPasswordStrength(form.password);
  const isEmployee = form.userType === 'employee';
  const isAuditor  = form.userType === 'auditor';
  const needsOrgFields = isEmployee || isAuditor;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.firstNameTh.trim()) errs.firstNameTh = 'กรุณากรอกชื่อ';
    if (!form.lastNameTh.trim()) errs.lastNameTh = 'กรุณากรอกนามสกุล';
    if (!form.email.trim()) errs.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.phone.trim()) errs.phone = 'กรุณากรอกเบอร์โทร';
    if (needsOrgFields) {
      if (!form.employeeId.trim()) errs.employeeId = 'กรุณากรอกรหัสพนักงาน';
      if (!form.position) errs.position = 'กรุณาเลือกตำแหน่ง';
      if (!form.department) errs.department = 'กรุณาเลือกแผนก';
    }
    if (form.userType === 'external') {
      if (!form.positionText.trim()) errs.positionText = 'กรุณากรอกตำแหน่งงาน';
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

    const role: UserRole = 'learner';
    const fullName = `${form.firstNameTh.trim()} ${form.lastNameTh.trim()}`;
    const newUser: User = {
      id: genId(),
      name: fullName,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role,
      group: needsOrgFields
        ? (form.division || form.department)
        : form.userType === 'external' ? (form.shopName.trim() || 'บุคคลภายนอก') : 'บุคคลภายนอก',
      employeeId: needsOrgFields
        ? form.employeeId.trim()
        : `EXT-${Date.now().toString().slice(-5)}`,
      active: true,
    };

    setSuccess(true);
    setTimeout(() => onRegister(newUser), 1800);
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{ width: 3, height: 14, borderRadius: 1, backgroundColor: '#1A5B2A' }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* Left Panel — sticky so it stays fixed while form scrolls */}
      <Box sx={{
        display: { xs: 'none', md: 'block' },
        flex: '0 0 38%',
        position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh', overflow: 'hidden',
      }}>
        <Box component="img" src={NutLoginImage} alt="Nutrition Profess"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </Box>

      {/* Right Panel */}
      <Box sx={{ flex: 1, backgroundColor: '#F7F8FA', overflowY: 'auto', display: 'flex', justifyContent: 'center', px: { xs: 3, md: 5 }, py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 520 }}>

          <Button startIcon={<ArrowLeft size={14} />} onClick={onBackToLogin}
            sx={{ mb: 3, color: '#6B7280', px: 0, fontSize: '0.8rem', '&:hover': { background: 'transparent', color: '#111827' } }}>
            กลับไปหน้าเข้าสู่ระบบ
          </Button>

          {success ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Box sx={{ width: 68, height: 68, borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircle size={32} color="#16A34A" />
              </Box>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', mb: 0.5 }}>สมัครสมาชิกสำเร็จ!</Typography>
              <Typography sx={{ color: '#717182', fontSize: '0.85rem' }}>กำลังเข้าสู่ระบบอัตโนมัติ...</Typography>
            </Box>
          ) : (
            <>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>
                  สมัครสมาชิก
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#717182' }}>กรอกข้อมูลเพื่อสร้างบัญชีใหม่</Typography>
              </Box>

              {/* ── Section 1: ข้อมูลส่วนตัว ── */}
              <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: 2.5, p: 3, mb: 2, border: '1px solid #F0F1F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <SectionLabel label="ข้อมูลส่วนตัว" />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField size="small" label="ชื่อ (ภาษาไทย)" required value={form.firstNameTh}
                      onChange={set('firstNameTh')} error={!!errors.firstNameTh} helperText={errors.firstNameTh}
                      placeholder="กรอกชื่อ" sx={fieldSx} />
                    <TextField size="small" label="นามสกุล (ภาษาไทย)" required value={form.lastNameTh}
                      onChange={set('lastNameTh')} error={!!errors.lastNameTh} helperText={errors.lastNameTh}
                      placeholder="กรอกนามสกุล" sx={fieldSx} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField size="small" label="Name (ภาษาอังกฤษ)" value={form.firstNameEn}
                      onChange={set('firstNameEn')} placeholder="กรอก Name" sx={fieldSx} />
                    <TextField size="small" label="Last name (ภาษาอังกฤษ)" value={form.lastNameEn}
                      onChange={set('lastNameEn')} placeholder="กรอก Last name" sx={fieldSx} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField size="small" label="อีเมล" type="email" required value={form.email}
                      onChange={set('email')} error={!!errors.email} helperText={errors.email}
                      placeholder="กรอกอีเมล" autoComplete="email" sx={fieldSx} />
                    <TextField size="small" label="เบอร์โทรศัพท์" required value={form.phone}
                      onChange={set('phone')} error={!!errors.phone} helperText={errors.phone}
                      placeholder="08X-XXX-XXXX" sx={fieldSx} />
                  </Box>
                </Box>
              </Box>

              {/* ── Section 2: ประเภทผู้สมัคร ── */}
              <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: 2.5, p: 3, mb: 2, border: '1px solid #F0F1F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <SectionLabel label="ประเภทผู้สมัคร" />
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup row value={form.userType}
                    onChange={(e) => setForm((prev) => ({ ...prev, userType: e.target.value as UserType, employeeId: '', position: '', department: '', division: '', positionText: '', shopName: '' }))}>
                    {([
                      { value: 'employee', label: 'พนักงานบริษัท' },
                      { value: 'external', label: 'บุคคลภายนอก' },
                      { value: 'auditor',  label: 'ผู้ตรวจสอบ' },
                    ] as const).map((opt) => (
                      <FormControlLabel key={opt.value} value={opt.value}
                        control={<Radio size="small" sx={{ color: '#D1D5DB', '&.Mui-checked': { color: '#1A5B2A' } }} />}
                        label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{opt.label}</Typography>}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                {/* พนักงานบริษัท / ผู้ตรวจสอบ */}
                {needsOrgFields && (
                  <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField size="small" label="รหัสพนักงาน" required value={form.employeeId}
                        onChange={set('employeeId')} error={!!errors.employeeId} helperText={errors.employeeId}
                        placeholder="กรอกรหัสพนักงาน" sx={fieldSx} />
                      <FormControl size="small" fullWidth required error={!!errors.position} sx={fieldSx}>
                        <InputLabel>ตำแหน่ง</InputLabel>
                        <Select value={form.position} label="ตำแหน่ง"
                          onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}>
                          {positionOptions.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </Select>
                        {errors.position && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.position}</Typography>}
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <FormControl size="small" fullWidth required error={!!errors.department} sx={fieldSx}>
                        <InputLabel>แผนก</InputLabel>
                        <Select value={form.department} label="แผนก"
                          onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}>
                          {departmentOptions.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </Select>
                        {errors.department && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.department}</Typography>}
                      </FormControl>
                      <FormControl size="small" fullWidth sx={fieldSx}>
                        <InputLabel>ฝ่าย</InputLabel>
                        <Select value={form.division} label="ฝ่าย"
                          onChange={(e) => setForm((p) => ({ ...p, division: e.target.value }))}>
                          {divisionOptions.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                )}

                {/* บุคคลภายนอก */}
                {form.userType === 'external' && (
                  <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField size="small" label="ตำแหน่ง" required value={form.positionText}
                      onChange={set('positionText')} error={!!errors.positionText} helperText={errors.positionText}
                      placeholder="กรอกตำแหน่งงาน" sx={fieldSx} />
                    <TextField size="small" label="ร้านค้า" value={form.shopName}
                      onChange={set('shopName')} placeholder="กรอกร้านค้า" sx={fieldSx} />
                  </Box>
                )}
              </Box>

              {/* ── Section 3: ความปลอดภัย ── */}
              <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: 2.5, p: 3, mb: 3, border: '1px solid #F0F1F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <SectionLabel label="ความปลอดภัย" />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <TextField size="small" label="รหัสผ่าน" type={showPassword ? 'text' : 'password'} fullWidth required
                      value={form.password} onChange={set('password')} error={!!errors.password} autoComplete="new-password" sx={fieldSx}
                      slotProps={{ input: { endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end"
                            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            sx={{ color: '#64748B' }}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </IconButton>
                        </InputAdornment>
                      )}}}
                    />
                    {form.password && (
                      <Box sx={{ mt: 1, px: 0.25 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                          {[20, 60, 100].map((threshold) => (
                            <Box key={threshold} sx={{ flex: 1, height: 3, borderRadius: 1, backgroundColor: pwStrength.score >= threshold ? pwStrength.color : '#F3F4F6', transition: 'background 0.3s', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
                          ))}
                        </Box>
                        <Typography sx={{ fontSize: '0.7rem', color: pwStrength.color, fontWeight: 600 }}>{pwStrength.label}</Typography>
                      </Box>
                    )}
                    {errors.password && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.password}</Typography>}
                  </Box>
                  <TextField size="small" label="ยืนยันรหัสผ่าน" type={showConfirm ? 'text' : 'password'} fullWidth required
                    value={form.confirmPassword} onChange={set('confirmPassword')}
                    error={!!errors.confirmPassword} helperText={errors.confirmPassword} autoComplete="new-password" sx={fieldSx}
                    slotProps={{ input: { endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end"
                          aria-label={showConfirm ? 'ซ่อนการยืนยันรหัสผ่าน' : 'แสดงการยืนยันรหัสผ่าน'}
                          sx={{ color: '#64748B' }}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </IconButton>
                      </InputAdornment>
                    )}}}
                  />
                </Box>
              </Box>

              <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}
                startIcon={<UserPlus size={16} />}
                sx={{
                  py: 1.4, mb: 2.5, borderRadius: 2, backgroundColor: '#1A5B2A',
                  boxShadow: '0 1px 2px rgba(26,91,42,0.2)', fontSize: '0.875rem', fontWeight: 600,
                  '&:hover': { backgroundColor: '#155724', boxShadow: '0 4px 12px rgba(26,91,42,0.25)' },
                  '&.Mui-disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                }}>
                {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </Button>

              <Typography sx={{ textAlign: 'center', fontSize: '0.82rem', color: '#717182' }}>
                มีบัญชีอยู่แล้ว?{' '}
                <Button variant="text" onClick={onBackToLogin}
                  sx={{ color: '#1A5B2A', fontWeight: 600, p: 0, minWidth: 0, fontSize: '0.82rem', verticalAlign: 'baseline', lineHeight: 'inherit', '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' } }}>
                  เข้าสู่ระบบ
                </Button>
              </Typography>
            </>
          )}

          <Typography sx={{ fontSize: '0.7rem', color: '#717182', textAlign: 'center', mt: 4, mb: 2 }}>
            © 2024 Nutrition Profess Public Company Limited
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
