import { Box, Typography, Chip } from '@mui/material';
import { CheckCircle, Circle, Play, Lock } from 'lucide-react';

interface LessonItemProps {
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  onClick: () => void;
}

export function LessonItem({ title, duration, completed, locked, onClick }: LessonItemProps) {
  return (
    <Box
      onClick={locked ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 1,
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.5 : 1,
        transition: 'background-color 0.2s',
        '&:hover': locked
          ? {}
          : {
              backgroundColor: 'action.hover',
            },
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        {locked ? (
          <Lock size={20} color="#999" />
        ) : completed ? (
          <CheckCircle size={20} color="#4caf50" />
        ) : (
          <Circle size={20} color="#999" />
        )}
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1">{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {duration}
        </Typography>
      </Box>

      {!locked && !completed && (
        <Box sx={{ flexShrink: 0 }}>
          <Play size={18} />
        </Box>
      )}

      {completed && (
        <Chip label="เสร็จสิ้น" size="small" color="success" variant="outlined" />
      )}

      {locked && <Chip label="ล็อค" size="small" variant="outlined" />}
    </Box>
  );
}
