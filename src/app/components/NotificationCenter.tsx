import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Drawer,
  Button,
  Divider,
} from '@mui/material';
import { Bell, Award, CheckCircle, XCircle, BookOpen, X, BellOff } from 'lucide-react';
import { AppNotification } from '../data/types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const notifConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  cert_earned: { icon: <Award size={16} />, color: '#F59E0B', bg: '#FFFBEB' },
  quiz_passed: { icon: <CheckCircle size={16} />, color: '#10B981', bg: '#ECFDF5' },
  quiz_failed: { icon: <XCircle size={16} />, color: '#EF4444', bg: '#FEF2F2' },
  course_assigned: { icon: <BookOpen size={16} />, color: '#6366F1', bg: '#EEF2FF' },
  reminder: { icon: <Bell size={16} />, color: '#64748B', bg: '#F1F5F9' },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}

export function NotificationCenter({ notifications, onMarkRead, onMarkAllRead }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const sorted = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        sx={{
          color: 'rgba(255,255,255,0.6)',
          '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.08)' },
        }}
      >
        <Badge
          badgeContent={unread}
          color="error"
          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
        >
          <Bell size={18} />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 360,
            background: '#FFFFFF',
            borderLeft: '1px solid #E2E8F0',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Bell size={18} color="rgba(255,255,255,0.8)" />
            <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
              การแจ้งเตือน
            </Typography>
            {unread > 0 && (
              <Box sx={{ backgroundColor: '#EF4444', color: 'white', borderRadius: 10, px: 1, py: 0.2, fontSize: '0.68rem', fontWeight: 700 }}>
                {unread} ใหม่
              </Box>
            )}
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <X size={18} />
          </IconButton>
        </Box>

        {unread > 0 && (
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
            <Button
              size="small"
              onClick={onMarkAllRead}
              sx={{ fontSize: '0.78rem', color: '#6366F1', p: 0, minWidth: 0 }}
            >
              อ่านทั้งหมด
            </Button>
          </Box>
        )}

        {/* List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {sorted.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <BellOff size={36} color="#CBD5E1" />
              <Typography sx={{ color: '#94A3B8', mt: 2, fontSize: '0.875rem' }}>
                ไม่มีการแจ้งเตือน
              </Typography>
            </Box>
          ) : (
            sorted.map((notif, idx) => {
              const cfg = notifConfig[notif.type] ?? notifConfig.reminder;
              return (
                <Box key={notif.id}>
                  <Box
                    onClick={() => onMarkRead(notif.id)}
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: 'flex',
                      gap: 1.5,
                      cursor: 'pointer',
                      backgroundColor: notif.read ? 'transparent' : '#F8F8FF',
                      borderLeft: notif.read ? 'none' : '3px solid #6366F1',
                      transition: 'background 0.15s',
                      '&:hover': { backgroundColor: '#F8FAFC' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      {cfg.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.855rem', color: '#0F172A', lineHeight: 1.4, mb: 0.3 }}>
                        {notif.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5, mb: 0.5 }}>
                        {notif.message}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        {timeAgo(notif.timestamp)}
                      </Typography>
                    </Box>
                    {!notif.read && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366F1', flexShrink: 0, mt: 1 }} />
                    )}
                  </Box>
                  {idx < sorted.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                </Box>
              );
            })
          )}
        </Box>
      </Drawer>
    </>
  );
}
