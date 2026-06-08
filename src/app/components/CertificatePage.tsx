import { useEffect } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { ArrowLeft, Printer, Award, Star, Shield } from 'lucide-react';
import { Certificate, CertificateTemplate } from '../data/types';
import { CertRenderer } from './CertRenderer';

interface CertificatePageProps {
  certificate: Certificate;
  certTemplates?: CertificateTemplate[];
  onBack: () => void;
}

const categoryColors: Record<string, { color: string; bg: string }> = {
  'Product Knowledge': { color: '#1E7A34', bg: '#E8F5E9' },
  'Sales Script': { color: '#10B981', bg: '#ECFDF5' },
  'Claim & Compliance': { color: '#F59E0B', bg: '#FFFBEB' },
  'Objection Handling': { color: '#EF4444', bg: '#FEF2F2' },
  'New Product Launch': { color: '#388E3C', bg: '#F1F8F2' },
};

export function CertificatePage({ certificate, certTemplates, onBack }: CertificatePageProps) {
  const issueDate = new Date(certificate.issuedAt);
  const expireDate = new Date(certificate.expiresAt);

  const activeTemplate = certTemplates
    ? certTemplates.find((t) => t.active && t.assignedCourseIds.includes(certificate.courseId))
      ?? certTemplates.find((t) => t.active && t.isDefault)
    : null;
  const catStyle = categoryColors[certificate.category] ?? { color: '#1E7A34', bg: '#E8F5E9' };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    // Inject print-specific styles
    const style = document.createElement('style');
    style.id = 'cert-print-style';
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #cert-print-root { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        .cert-no-print { display: none !important; }
        .cert-card { box-shadow: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('cert-print-style')?.remove(); };
  }, []);

  const handlePrint = () => window.print();

  return (
    <Box id="cert-print-root">
      {/* Controls */}
      <Box className="cert-no-print" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Button startIcon={<ArrowLeft size={16} />} onClick={onBack} sx={{ color: '#64748B' }}>
          กลับ
        </Button>
        <Button
          variant="contained"
          startIcon={<Printer size={16} />}
          onClick={handlePrint}
          disableElevation
          sx={{ backgroundColor: '#1E7A34', px: 3, '&:hover': { backgroundColor: '#155724' } }}
        >
          พิมพ์ / บันทึก PDF
        </Button>
      </Box>

      {/* Template-based certificate */}
      {activeTemplate && (
        <Box sx={{ mx: 'auto', mb: 3, overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ overflow: 'hidden', borderRadius: 3, boxShadow: '0 25px 80px rgba(0,0,0,0.15)', width: 900 * 0.78, height: 636 * 0.78, position: 'relative', flexShrink: 0 }}>
            <CertRenderer
              template={activeTemplate}
              recipientName={certificate.userName}
              courseTitle={certificate.courseTitle}
              score={certificate.score}
              issueDate={certificate.issuedAt}
              expiresDate={certificate.expiresAt}
              certNo={certificate.certificateNo}
              scale={0.78}
            />
          </Box>
        </Box>
      )}

      {/* Fallback Certificate (shown when no template assigned) */}
      {!activeTemplate && <Box
        className="cert-card"
        sx={{
          maxWidth: 820,
          mx: 'auto',
          background: 'white',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
          position: 'relative',
          border: '2px solid #E2E8F0',
        }}
      >
        {/* Gold top border strip */}
        <Box sx={{ height: 8, background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B, #D97706, #F59E0B)' }} />

        {/* Header band */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0F3D1A 0%, #1A5B2A 60%, #256B2D 100%)',
            px: { xs: 4, md: 8 },
            py: 5,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
          <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

          {/* Stars */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
            ))}
          </Box>

          {/* Award icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}>
              <Award size={32} color="white" />
            </Box>
          </Box>

          <Typography sx={{ color: '#FCD34D', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', mb: 1 }}>
            PK Learning · Product Knowledge LMS
          </Typography>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Certificate of Completion
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', mt: 0.5 }}>
            ใบประกาศนียบัตรแสดงความสำเร็จ
          </Typography>
        </Box>

        {/* Main body */}
        <Box sx={{ px: { xs: 4, md: 10 }, py: 6, textAlign: 'center', position: 'relative' }}>
          {/* Decorative top line */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5, justifyContent: 'center' }}>
            <Box sx={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #E2E8F0)' }} />
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <Box sx={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #E2E8F0)' }} />
          </Box>

          <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2, fontStyle: 'italic' }}>
            This is to certify that
          </Typography>

          {/* Learner name */}
          <Typography
            variant="h3"
            sx={{
              color: '#0F3D1A',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              mb: 2,
              lineHeight: 1.2,
              borderBottom: '3px solid #F59E0B',
              display: 'inline-block',
              pb: 1,
            }}
          >
            {certificate.userName}
          </Typography>

          <Typography sx={{ color: '#64748B', mt: 3, mb: 2, fontSize: '0.9rem' }}>
            ได้ศึกษาและผ่านการทดสอบ
          </Typography>

          {/* Course title */}
          <Box sx={{ backgroundColor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0', px: 4, py: 3, mb: 3, mx: 'auto', maxWidth: 520 }}>
            <Typography variant="h5" sx={{ color: '#0F3D1A', fontWeight: 700, lineHeight: 1.35, mb: 1.5 }}>
              {certificate.courseTitle}
            </Typography>
            <Chip
              label={certificate.category}
              size="small"
              sx={{ backgroundColor: catStyle.bg, color: catStyle.color, fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Box>

          {/* Score badge */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Box
              sx={{
                backgroundColor: '#10B981',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
              }}
            >
              <Shield size={18} color="white" />
              <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                คะแนน {certificate.score}%
              </Typography>
            </Box>
          </Box>

          {/* Decorative bottom line */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5, justifyContent: 'center' }}>
            <Box sx={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #E2E8F0)' }} />
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <Box sx={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #E2E8F0)' }} />
          </Box>

          {/* Footer details */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, textAlign: 'left' }}>
            <Box>
              <Typography sx={{ color: '#717182', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                วันที่ออกใบประกาศ
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                {formatDate(issueDate)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#717182', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                หมายเลขใบประกาศ
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#1E7A34', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                {certificate.certificateNo}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#717182', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                หมดอายุ
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                {formatDate(expireDate)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Gold bottom border strip */}
        <Box sx={{ height: 8, background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B, #D97706, #F59E0B)' }} />
      </Box>}

      {/* Info note */}
      <Box className="cert-no-print" sx={{ maxWidth: 820, mx: 'auto', mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          ใบประกาศนี้มีอายุ 1 ปี หมดอายุวันที่ {formatDate(expireDate)} · เลขที่: {certificate.certificateNo}
        </Typography>
      </Box>
    </Box>
  );
}
