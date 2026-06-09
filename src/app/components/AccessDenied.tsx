import { Box, Typography, Button } from '@mui/material';
import { ShieldOff } from 'lucide-react';

interface AccessDeniedProps {
  requiredRole?: string;
  onBack: () => void;
}

export function AccessDenied({ requiredRole, onBack }: AccessDeniedProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <ShieldOff size={34} color="#d4183d" />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
        ไม่มีสิทธิ์เข้าถึง
      </Typography>

      <Typography color="text.secondary" sx={{ fontSize: '0.9rem', mb: 0.5, maxWidth: 380 }}>
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        {requiredRole && ` (ต้องการสิทธิ์: ${requiredRole})`}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>
        กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
      </Typography>

      <Button
        variant="contained"
        disableElevation
        onClick={onBack}
        sx={{ backgroundColor: '#1E7A34', px: 4, '&:hover': { backgroundColor: '#155724' } }}
      >
        กลับหน้าหลัก
      </Button>
    </Box>
  );
}