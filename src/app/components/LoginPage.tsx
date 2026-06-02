import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { BookOpen, LogIn, Eye, EyeOff, Zap, Shield, TrendingUp, Award } from 'lucide-react';
import { mockUsers } from '../data/users';
import { User } from '../data/types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowRegister?: () => void;
  allUsers?: User[];
}

const demoAccounts = [
  { label: 'ผู้เรียน', email: 'somchai@company.com', password: '1234', color: '#6366F1', bg: '#EEF2FF' },
  { label: 'Training Admin', email: 'admin@company.com', password: 'admin1234', color: '#10B981', bg: '#ECFDF5' },
  { label: 'Manager', email: 'manager@company.com', password: '1234', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Super Admin', email: 'superadmin@company.com', password: 'super1234', color: '#8B5CF6', bg: '#F5F3FF' },
];

const features = [
  { icon: <BookOpen size={20} />, title: '5 คอร์สผลิตภัณฑ์', desc: 'ครอบคลุม Product Knowledge, Sales Script, Compliance' },
  { icon: <Zap size={20} />, title: 'Quiz & Final Exam', desc: 'ระบบทดสอบออนไลน์พร้อมติดตามคะแนน' },
  { icon: <TrendingUp size={20} />, title: 'Track Progress', desc: 'ดูความคืบหน้าแบบ Real-time' },
  { icon: <Award size={20} />, title: 'Certificate', desc: 'รับ Certificate เมื่อสอบผ่านทุกคอร์ส' },
];

export function LoginPage({ onLogin, onShowRegister, allUsers = [] }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const allKnownUsers = [...mockUsers, ...allUsers];
    const user = allKnownUsers.find((u) => u.email === email && u.password === password);
    setLoading(false);
    if (!user) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      return;
    }
    if (!user.active) {
      setError('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }
    setError('');
    onLogin(user);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    const user = mockUsers.find((u) => u.email === demoEmail && u.active);
    if (user) onLogin(user);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left Panel */}
      <Box
        sx={{
          flex: { xs: 'none', md: '0 0 55%' },
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4338CA 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: { xs: 4, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(99,102,241,0.15)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(139,92,246,0.12)' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: '5%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
              <BookOpen size={22} color="white" />
            </Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
              PK Learning
            </Typography>
          </Box>

          <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 2, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            เรียนรู้ผลิตภัณฑ์
            <br />
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #A5B4FC, #C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              อย่างมืออาชีพ
            </Box>
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mb: 6, lineHeight: 1.7, fontSize: '1rem' }}>
            ระบบ E-Learning สำหรับพนักงานและพาร์ทเนอร์ เรียนได้ทุกที่ ทุกเวลา พร้อมติดตามผลแบบ Real-time
          </Typography>

          {/* Feature list */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {features.map((f) => (
              <Box
                key={f.title}
                sx={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  p: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ color: '#A5B4FC', mb: 1 }}>{f.icon}</Box>
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', mb: 0.5 }}>{f.title}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', lineHeight: 1.4 }}>{f.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAFA',
          p: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
              ยินดีต้อนรับ 👋
            </Typography>
            <Typography sx={{ color: '#64748B' }}>
              เข้าสู่ระบบเพื่อเริ่มเรียนรู้
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <TextField
              fullWidth
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            onClick={handleLogin}
            disabled={loading}
            startIcon={<LogIn size={18} />}
            sx={{
              py: 1.5,
              mb: 4,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              },
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>

          {/* Demo accounts */}
          <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 3 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 2 }}>
              ทดสอบด้วยบัญชีตัวอย่าง
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {demoAccounts.map((demo) => (
                <Box
                  key={demo.email}
                  onClick={() => handleDemoLogin(demo.email, demo.password)}
                  sx={{
                    border: `1.5px solid ${demo.color}20`,
                    borderRadius: 2.5,
                    p: 1.5,
                    cursor: 'pointer',
                    backgroundColor: demo.bg,
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: demo.color,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${demo.color}25`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: demo.color }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: demo.color, fontSize: '0.75rem' }}>
                      {demo.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {onShowRegister && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                ยังไม่มีบัญชี?{' '}
              </Typography>
              <Typography
                variant="caption"
                onClick={onShowRegister}
                sx={{ color: '#6366F1', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                สมัครสมาชิก
              </Typography>
            </Box>
          )}

          <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', textAlign: 'center', mt: 2 }}>
            © 2024 Product Knowledge LMS v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
