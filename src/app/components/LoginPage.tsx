import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LogIn, Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { mockUsers } from '../data/users';
import { User } from '../data/types';
import NutLoginImage from '../../imports/Nut_Login.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowRegister?: () => void;
  allUsers?: User[];
}

const demoAccounts = [
  { label: 'ผู้เรียน',       email: 'somchai@company.com',    password: '1234',       dot: '#16A34A' },
  { label: 'Training Admin', email: 'admin@company.com',      password: 'admin1234',  dot: '#0891B2' },
  { label: 'Manager',        email: 'manager@company.com',    password: '1234',       dot: '#D97706' },
  { label: 'Super Admin',    email: 'superadmin@company.com', password: 'super1234',  dot: '#7C3AED' },
];

export function LoginPage({ onLogin, onShowRegister, allUsers = [] }: LoginPageProps) {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [view, setView]               = useState<'login' | 'forgot' | 'forgot_sent'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const user = [...mockUsers, ...allUsers].find((u) => u.email === email && u.password === password);
    setLoading(false);
    if (!user)        { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); return; }
    if (!user.active) { setError('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'); return; }
    setError('');
    onLogin(user);
  };

  const handleForgotSubmit = () => {
    if (!forgotEmail) { setForgotError('กรุณากรอกอีเมล'); return; }
    const exists = [...mockUsers, ...allUsers].find((u) => u.email === forgotEmail);
    if (!exists) { setForgotError('ไม่พบอีเมลนี้ในระบบ'); return; }
    setForgotError('');
    setView('forgot_sent');
  };

  const handleDemoLogin = (demoEmail: string) => {
    const user = mockUsers.find((u) => u.email === demoEmail && u.active);
    if (user) onLogin(user);
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#F9FAFB',
      fontSize: '0.9rem',
      '& fieldset': { borderColor: '#E5E7EB' },
      '&:hover fieldset': { borderColor: '#A7C9B1' },
      '&.Mui-focused fieldset': { borderColor: '#1A5B2A', borderWidth: '1.5px' },
      '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 0 0 3px rgba(26,91,42,0.08)' },
    },
    '& .MuiInputLabel-root': { fontSize: '0.875rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1A5B2A' },
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Left: Brand image ── */}
      <Box sx={{ flex: { xs: 'none', md: '0 0 55%' }, display: { xs: 'none', md: 'block' }, position: 'relative', overflow: 'hidden' }}>
        <Box component="img" src={NutLoginImage} alt="Nutrition Profess" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </Box>

      {/* ── Right: Form ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA', p: { xs: 3, md: 6 } }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Box sx={{
          width: '100%', maxWidth: 400,
          backgroundColor: '#FFFFFF',
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #F0F1F3',
        }}>

          {/* Brand tag */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, backgroundColor: '#1A5B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogIn size={14} color="white" />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', letterSpacing: '0.04em' }}>
              PK LEARNING
            </Typography>
          </Box>

          {/* ── Login view ── */}
          {view === 'login' && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>
                  เข้าสู่ระบบ
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  ยินดีต้อนรับกลับมา กรุณาใส่ข้อมูลของคุณ
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '0.82rem', py: 0.5 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1.5 }}>
                <TextField fullWidth label="อีเมล" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  sx={fieldSx}
                />
                <TextField fullWidth label="รหัสผ่าน" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end" sx={{ color: '#9CA3AF', '&:hover': { color: '#374151' } }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Box component="span" onClick={() => { setForgotEmail(''); setForgotError(''); setView('forgot'); }}
                  sx={{ fontSize: '0.8rem', color: '#1A5B2A', fontWeight: 500, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  ลืมรหัสผ่าน?
                </Box>
              </Box>

              <Button
                fullWidth variant="contained" size="large"
                onClick={handleLogin} disabled={loading}
                startIcon={<LogIn size={16} />}
                sx={{
                  py: 1.4, mb: 4, borderRadius: 2,
                  backgroundColor: '#1A5B2A', boxShadow: '0 1px 2px rgba(26,91,42,0.2)',
                  fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.01em',
                  '&:hover': { backgroundColor: '#155724', boxShadow: '0 4px 12px rgba(26,91,42,0.25)' },
                  '&:active': { backgroundColor: '#0F3D1A', boxShadow: 'none' },
                  '&.Mui-disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                }}
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>

              <Box sx={{ borderTop: '1px solid #F3F4F6', pt: 3 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5 }}>
                  ทดสอบด้วยบัญชีตัวอย่าง
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {demoAccounts.map((demo) => (
                    <Box key={demo.email} onClick={() => handleDemoLogin(demo.email)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '1px solid #F3F4F6', borderRadius: 1.5,
                        px: 1.5, py: 1, cursor: 'pointer', transition: 'all 0.15s',
                        '&:hover': { borderColor: '#A7C9B1', backgroundColor: '#F7FEF9', transform: 'translateY(-1px)', boxShadow: '0 2px 6px rgba(26,91,42,0.08)' },
                      }}
                    >
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: demo.dot, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>{demo.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {onShowRegister && (
                <Box sx={{ textAlign: 'center', mt: 3.5 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                    ยังไม่มีบัญชี?{' '}
                    <Box component="span" onClick={onShowRegister}
                      sx={{ color: '#1A5B2A', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      สมัครสมาชิก
                    </Box>
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* ── Forgot password view ── */}
          {view === 'forgot' && (
            <>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Mail size={20} color="#1A5B2A" />
                </Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>
                  ลืมรหัสผ่าน?
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตให้
                </Typography>
              </Box>

              {forgotError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '0.82rem', py: 0.5 }}>
                  {forgotError}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <TextField fullWidth label="อีเมล" type="email" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleForgotSubmit()}
                  sx={fieldSx}
                />
              </Box>

              <Button fullWidth variant="contained" size="large" onClick={handleForgotSubmit}
                startIcon={<Mail size={16} />}
                sx={{
                  py: 1.4, mb: 3, borderRadius: 2,
                  backgroundColor: '#1A5B2A', boxShadow: '0 1px 2px rgba(26,91,42,0.2)',
                  fontSize: '0.875rem', fontWeight: 600,
                  '&:hover': { backgroundColor: '#155724', boxShadow: '0 4px 12px rgba(26,91,42,0.25)' },
                }}
              >
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Box component="span" onClick={() => setView('login')}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem', color: '#6B7280', cursor: 'pointer', '&:hover': { color: '#1A5B2A' } }}>
                  <ArrowLeft size={14} />
                  กลับหน้าเข้าสู่ระบบ
                </Box>
              </Box>
            </>
          )}

          {/* ── Forgot sent view ── */}
          {view === 'forgot_sent' && (
            <>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                  <CheckCircle size={28} color="#16A34A" />
                </Box>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', mb: 1 }}>
                  ส่งลิงก์แล้ว!
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#6B7280', mb: 0.5 }}>
                  ระบบส่งลิงก์รีเซ็ตรหัสผ่านไปยัง
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A5B2A', mb: 3 }}>
                  {forgotEmail}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', mb: 4 }}>
                  กรุณาตรวจสอบกล่องจดหมาย (และโฟลเดอร์ spam)
                </Typography>
                <Button fullWidth variant="contained" size="large"
                  onClick={() => { setView('login'); setForgotEmail(''); }}
                  sx={{
                    py: 1.4, borderRadius: 2, backgroundColor: '#1A5B2A',
                    fontSize: '0.875rem', fontWeight: 600,
                    '&:hover': { backgroundColor: '#155724' },
                  }}
                >
                  กลับหน้าเข้าสู่ระบบ
                </Button>
              </Box>
            </>
          )}

          <Typography sx={{ fontSize: '0.7rem', color: '#D1D5DB', textAlign: 'center', mt: 3 }}>
            © 2024 Nutrition Profess Public Company Limited
          </Typography>
        </Box>
        </Box>
      </Box>
    </Box>
  );
}
