import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Search, BookOpen, Clock, Lock } from 'lucide-react';
import { Course, CourseProgress, User } from '../data/types';
import { getCourseEnrollStatus, getCourseProgressPercent, getTotalLessons } from '../utils/helpers';
import { useEnrollments } from '../hooks/useEnrollments';

interface CourseCatalogProps {
  user: User;
  courses: Course[];
  allProgress: CourseProgress[];
  onCourseClick: (courseId: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  not_started: { label: 'ยังไม่เริ่ม', color: '#64748B', bg: '#F1F5F9' },
  in_progress: { label: 'กำลังเรียน', color: '#1E7A34', bg: '#E8F5E9' },
  completed: { label: 'เรียนครบ', color: '#D97706', bg: '#FFFBEB' },
  passed: { label: 'สอบผ่าน ✓', color: '#059669', bg: '#ECFDF5' },
  failed: { label: 'สอบไม่ผ่าน', color: '#EF4444', bg: '#FEF2F2' },
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  'Product Knowledge': { color: '#1E7A34', bg: '#E8F5E9' },
  'Sales Script': { color: '#059669', bg: '#ECFDF5' },
  'Claim & Compliance': { color: '#D97706', bg: '#FFFBEB' },
  'Objection Handling': { color: '#EF4444', bg: '#FEF2F2' },
  'New Product Launch': { color: '#388E3C', bg: '#F1F8F2' },
};

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'passed';
type SortOption = 'default' | 'title_asc' | 'progress_desc';

export function CourseCatalog({ user, courses, allProgress, onCourseClick }: CourseCatalogProps) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('default');

  const { enrollments } = useEnrollments();

  const availableCourses = courses.filter((c) => c.status === 'published');
  const categories = ['all', ...Array.from(new Set(availableCourses.map((c) => c.category)))];

  const filtered = availableCourses
    .filter((c) => {
      const matchCat = category === 'all' || c.category === category;
      const matchSearch =
        search === '' ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      const status = getCourseEnrollStatus(c, user.id, allProgress);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'not_started' && status === 'not_started') ||
        (statusFilter === 'in_progress' && (status === 'in_progress' || status === 'completed')) ||
        (statusFilter === 'passed' && status === 'passed');
      return matchCat && matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sort === 'title_asc') return a.title.localeCompare(b.title, 'th');
      if (sort === 'progress_desc') {
        const pa = getCourseProgressPercent(a, user.id, allProgress);
        const pb = getCourseProgressPercent(b, user.id, allProgress);
        return pb - pa;
      }
      return 0;
    });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
          คอร์สเรียนทั้งหมด
        </Typography>
        <Typography sx={{ color: '#64748B' }}>
          {availableCourses.length} คอร์สพร้อมให้เรียน
          {filtered.length !== availableCourses.length && ` · แสดง ${filtered.length} รายการ`}
        </Typography>
      </Box>

      {/* Search + Sort row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="ค้นหาคอร์ส ชื่อ คำอธิบาย หรือหมวดหมู่..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#64748B" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            displayEmpty
            sx={{ fontSize: '0.85rem' }}
          >
            <MenuItem value="default">เรียงลำดับ: ค่าเริ่มต้น</MenuItem>
            <MenuItem value="title_asc">ชื่อ ก → ฮ</MenuItem>
            <MenuItem value="progress_desc">% ความคืบหน้า ↓</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Status filter chips */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => { if (v) setStatusFilter(v); }}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5, '& .MuiToggleButtonGroup-grouped': { border: '1px solid #E2E8F0 !important', borderRadius: '20px !important', mx: 0 } }}
        >
          {([
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'not_started', label: 'ยังไม่เริ่ม' },
            { value: 'in_progress', label: 'กำลังเรียน' },
            { value: 'passed', label: 'สอบผ่านแล้ว' },
          ] as { value: StatusFilter; label: string }[]).map((opt) => (
            <ToggleButton
              key={opt.value}
              value={opt.value}
              sx={{
                fontSize: '0.78rem', px: 2, py: 0.5, textTransform: 'none',
                '&.Mui-selected': { backgroundColor: '#1E7A34', color: 'white', '&:hover': { backgroundColor: '#155724' } },
              }}
            >
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={category}
        onChange={(_, v) => setCategory(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 4, '& .MuiTab-root': { fontSize: '0.82rem' } }}
      >
        {categories.map((cat) => (
          <Tab key={cat} label={cat === 'all' ? 'ทั้งหมด' : cat} value={cat} />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <BookOpen size={32} color="#CBD5E1" />
          </Box>
          <Typography color="text.secondary">ไม่พบคอร์สที่ตรงกับการค้นหา</Typography>
          {(search || statusFilter !== 'all' || category !== 'all') && (
            <Typography
              variant="caption"
              sx={{ color: '#1E7A34', cursor: 'pointer', mt: 1, display: 'block', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => { setSearch(''); setStatusFilter('all'); setCategory('all'); }}
            >
              ล้างตัวกรองทั้งหมด
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
          {filtered.map((course) => {
            const status = getCourseEnrollStatus(course, user.id, allProgress);
            const progress = getCourseProgressPercent(course, user.id, allProgress);
            const total = getTotalLessons(course);
            const s = statusConfig[status];
            const catStyle = categoryColors[course.category] ?? { color: '#1E7A34', bg: '#E8F5E9' };
            const isManuallyEnrolled = enrollments.some((e) => e.courseId === course.id && e.userId === user.id);
            const isRestricted = !isManuallyEnrolled && course.allowedGroups.length > 0 && !course.allowedGroups.includes(user.group);

            return (
              <Card
                key={course.id}
                role="button"
                tabIndex={isRestricted ? -1 : 0}
                aria-label={`${course.title}${isRestricted ? ' (ไม่มีสิทธิ์เข้าถึง)' : ''}`}
                aria-disabled={isRestricted}
                onClick={() => !isRestricted && onCourseClick(course.id)}
                onKeyDown={(e) => e.key === 'Enter' && !isRestricted && onCourseClick(course.id)}
                sx={{
                  cursor: isRestricted ? 'not-allowed' : 'pointer',
                  opacity: isRestricted ? 0.55 : 1,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  overflow: 'hidden',
                  '&:hover': isRestricted ? {} : {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    borderColor: '#A5D6A7',
                  },
                  '&:focus-visible': { outline: '2px solid #1E7A34', outlineOffset: 2 },
                  border: status === 'passed' ? '2px solid #A7F3D0' : '1px solid #E2E8F0',
                }}
              >
                {/* Image */}
                <Box sx={{ position: 'relative' }}>
                  <Box component="img" src={course.image} alt={course.title} loading="lazy" sx={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 50%)' }} />
                  <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                    <Box sx={{ backgroundColor: catStyle.bg, color: catStyle.color, borderRadius: 2, px: 1.5, py: 0.5, fontSize: '0.72rem', fontWeight: 700 }}>
                      {course.category}
                    </Box>
                  </Box>
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Box sx={{ backgroundColor: s.bg, color: s.color, borderRadius: 2, px: 1.2, py: 0.4, fontSize: '0.7rem', fontWeight: 600 }}>
                      {s.label}
                    </Box>
                  </Box>
                  {isRestricted && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                      <Box sx={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Lock size={14} color="white" />
                        <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                          {course.allowedGroups.join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.4, mb: 1, fontSize: '0.95rem' }}>
                    {course.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, mb: 2 }}>
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: progress > 0 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BookOpen size={13} color="#64748B" />
                      <Typography variant="caption" color="text.secondary">{total} บทเรียน</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Clock size={13} color="#64748B" />
                      <Typography variant="caption" color="text.secondary">{course.duration}</Typography>
                    </Box>
                  </Box>

                  {progress > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">ความคืบหน้า</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: status === 'passed' ? '#059669' : '#1E7A34' }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 5,
                          borderRadius: 9999,
                          backgroundColor: '#ececf0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: status === 'passed' ? '#059669' : '#1E7A34',
                            borderRadius: 9999,
                          },
                        }}
                      />
                    </Box>
                  )}

                  {course.finalExam && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#A7F3D0' }} />
                      <Typography variant="caption" sx={{ color: '#059669', fontSize: '0.7rem' }}>
                        มี Final Exam · เกณฑ์ผ่าน {course.finalExam.passingScore}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}