import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 4 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
            <AlertTriangle size={40} color="#EF4444" style={{ marginBottom: 16 }} aria-hidden="true" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
              เกิดข้อผิดพลาดที่ไม่คาดคิด
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#717182', mb: 3, lineHeight: 1.6 }}>
              หน้านี้โหลดไม่สำเร็จ กรุณาลองรีเฟรชหน้าเว็บ หากปัญหายังคงอยู่ ติดต่อผู้ดูแลระบบ
            </Typography>
            <Button
              variant="contained"
              disableElevation
              onClick={() => window.location.reload()}
              sx={{ backgroundColor: '#1E7A34', '&:hover': { backgroundColor: '#155225' } }}
            >
              รีเฟรชหน้า
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}