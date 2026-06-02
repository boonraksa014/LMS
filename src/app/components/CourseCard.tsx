import { Card, CardContent, CardMedia, Typography, Chip, LinearProgress, Box } from '@mui/material';
import { BookOpen, Clock, Award } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  lessons: number;
  progress: number;
  category: string;
  onClick: () => void;
}

export function CourseCard({
  title,
  description,
  image,
  duration,
  lessons,
  progress,
  category,
  onClick,
}: CourseCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        height="180"
        image={image}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Chip label={category} size="small" color="primary" sx={{ mb: 1 }} />
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock size={16} />
              <Typography variant="caption" color="text.secondary">
                {duration}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BookOpen size={16} />
              <Typography variant="caption" color="text.secondary">
                {lessons} บทเรียน
              </Typography>
            </Box>
            {progress > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Award size={16} />
                <Typography variant="caption" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
            )}
          </Box>

          {progress > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  ความคืบหน้า
                </Typography>
                <Typography variant="caption" color="primary">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
