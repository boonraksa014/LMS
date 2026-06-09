import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { LayoutList, Plus, Eye, Pencil, Trash2, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { userService, courseService } from '../services';
import { Course, CourseProgress, User } from '../data/types';
import { getCourseEnrollStatus } from '../utils/helpers';

interface GroupManagementProps {
  groups: string[];
  onGroupsChange: (groups: string[]) => void;
  allProgress: CourseProgress[];
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  manager: 'Manager',
  learner: 'ผู้เรียน',
};

const roleChipSx: Record<string, object> = {
  super_admin:    { backgroundColor: '#0F172A', color: '#F8FAFC' },
  training_admin: { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
  manager:        { backgroundColor: '#FFFBEB', color: '#92400E' },
  learner:        { backgroundColor: '#F1F5F9', color: '#475569' },
};

export function GroupManagement({ groups, onGroupsChange, allProgress }: GroupManagementProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);

  const [groupDialog, setGroupDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; value: string; original: string }>(
    { open: false, mode: 'add', value: '', original: '' }
  );
  const [groupDeleteConfirm, setGroupDeleteConfirm] = useState<string | null>(null);
  const [groupViewDetail, setGroupViewDetail] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([userService.getAll(), courseService.getAll()]).then(([users, courses]) => {
      setAllUsers(users);
      setPublishedCourses(courses.filter((c) => c.status === 'published'));
    }).catch(() => {
      toast.error('โหลดข้อมูลไม่สำเร็จ');
    });
  }, []);

  const handleSaveGroup = () => {
    const trimmed = groupDialog.value.trim();
    if (!trimmed) return;
    if (groupDialog.mode === 'add') {
      if (!groups.includes(trimmed)) onGroupsChange([...groups, trimmed]);
    } else {
      onGroupsChange(groups.map((g) => (g === groupDialog.original ? trimmed : g)));
    }
    setGroupDialog({ ...groupDialog, open: false });
  };

  const handleDeleteGroup = () => {
    if (groupDeleteConfirm) {
      onGroupsChange(groups.filter((g) => g !== groupDeleteConfirm));
      setGroupDeleteConfirm(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>จัดการกลุ่มผู้เรียน</Typography>
          <Typography variant="caption" color="text.secondary">{groups.length} กลุ่ม</Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={15} />}
          onClick={() => setGroupDialog({ open: true, mode: 'add', value: '', original: '' })}
        >
          เพิ่มกลุ่มใหม่
        </Button>
      </Box>

      {groups.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed #E2E8F0', borderRadius: 3 }}>
          <LayoutList size={32} color="#CBD5E1" aria-hidden="true" />
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>ยังไม่มีกลุ่มผู้เรียน</Typography>
          <Typography variant="caption" color="text.secondary">กดปุ่ม "เพิ่มกลุ่มใหม่" เพื่อเริ่มต้น</Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
        {groups.map((g) => {
          const memberCount = allUsers.filter((u) => u.group === g).length;
          return (
            <Paper key={g} sx={{ p: 2, borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LayoutList size={16} color="white" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{g}</Typography>
                  <Typography variant="caption" color="text.secondary">{memberCount} คน</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="ดูผู้เรียน">
                  <IconButton size="small" onClick={() => setGroupViewDetail(g)}>
                    <Eye size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="แก้ไข">
                  <IconButton size="small" sx={{ color: '#1E7A34' }} onClick={() => setGroupDialog({ open: true, mode: 'edit', value: g, original: g })}>
                    <Pencil size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ลบ">
                  <IconButton size="small" sx={{ color: '#d4183d' }} onClick={() => setGroupDeleteConfirm(g)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* ── Add / Edit Group Dialog ── */}
      <Dialog open={groupDialog.open} onClose={() => setGroupDialog({ ...groupDialog, open: false })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: groupDialog.mode === 'add' ? '#1E7A34' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {groupDialog.mode === 'add' ? <Plus size={18} color="white" /> : <Pencil size={16} color="white" />}
              </Box>
              <Typography sx={{ fontWeight: 700 }}>{groupDialog.mode === 'add' ? 'เพิ่มกลุ่มใหม่' : 'แก้ไขกลุ่ม'}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setGroupDialog({ ...groupDialog, open: false })}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2 }} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="ชื่อกลุ่ม"
            value={groupDialog.value}
            autoFocus
            onChange={(e) => setGroupDialog({ ...groupDialog, value: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveGroup()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setGroupDialog({ ...groupDialog, open: false })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveGroup} disabled={!groupDialog.value.trim()}>
            {groupDialog.mode === 'add' ? 'เพิ่มกลุ่ม' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Group Confirm ── */}
      <Dialog open={!!groupDeleteConfirm} onClose={() => setGroupDeleteConfirm(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle>ยืนยันการลบกลุ่ม</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบกลุ่ม <strong>"{groupDeleteConfirm}"</strong> ใช่หรือไม่?</Typography>
          {groupDeleteConfirm && allUsers.filter((u) => u.group === groupDeleteConfirm).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
              มีผู้ใช้ {allUsers.filter((u) => u.group === groupDeleteConfirm).length} คนอยู่ในกลุ่มนี้
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setGroupDeleteConfirm(null)}>ยกเลิก</Button>
          <Button variant="contained" disableElevation onClick={handleDeleteGroup} sx={{ backgroundColor: '#d4183d', '&:hover': { backgroundColor: '#b01530' } }}>
            ลบกลุ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Group Members Dialog ── */}
      <Dialog open={!!groupViewDetail} onClose={() => setGroupViewDetail(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {groupViewDetail && (() => {
          const members = allUsers.filter((u) => u.group === groupViewDetail);
          return (
            <>
              <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#1E7A34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LayoutList size={16} color="white" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{groupViewDetail}</Typography>
                      <Typography variant="caption" color="text.secondary">{members.length} คน</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => setGroupViewDetail(null)}><X size={18} /></IconButton>
                </Box>
              </DialogTitle>
              <Divider sx={{ mt: 2 }} />
              <DialogContent sx={{ pt: 2, pb: 1 }}>
                {members.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Users size={36} color="#CBD5E1" />
                    <Typography color="text.secondary" sx={{ mt: 1.5 }}>ยังไม่มีผู้เรียนในกลุ่มนี้</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {members.map((u) => {
                      const passedCount = publishedCourses.filter((c) => getCourseEnrollStatus(c, u.id, allProgress) === 'passed').length;
                      return (
                        <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid #F0F1F3', '&:hover': { backgroundColor: '#F8FAFC' } }}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700, backgroundColor: u.active ? '#1E7A34' : '#CBD5E1' }}>
                            {u.name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>{u.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {u.email} · {u.employeeId}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                            <Chip label={roleLabel[u.role]} size="small" sx={{ ...(roleChipSx[u.role] ?? {}) }} />
                            <Typography variant="caption" sx={{ fontWeight: passedCount > 0 ? 700 : 400, color: passedCount > 0 ? '#059669' : '#717182' }}>
                              ผ่าน {passedCount} คอร์ส
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setGroupViewDetail(null)}>ปิด</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}