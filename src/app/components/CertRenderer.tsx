import { Box, Typography } from '@mui/material';
import { Award, Star, Shield, CheckCircle } from 'lucide-react';
import { CertificateTemplate } from '../data/types';

interface CertRendererProps {
  template: CertificateTemplate;
  recipientName?: string;
  courseTitle?: string;
  score?: number;
  issueDate?: string;
  expiresDate?: string;
  certNo?: string;
  scale?: number;
}

const BASE_W = 900;
const BASE_H = 636;

function BorderLayer({ style, color }: { style: CertificateTemplate['borderStyle']; color: string }) {
  if (style === 'none') return null;

  if (style === 'single') {
    return (
      <Box sx={{
        position: 'absolute', inset: 12,
        border: `3px solid ${color}`,
        borderRadius: 3,
        pointerEvents: 'none',
      }} />
    );
  }

  if (style === 'double') {
    return (
      <>
        <Box sx={{ position: 'absolute', inset: 8, border: `2px solid ${color}`, borderRadius: 2, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', inset: 14, border: `1px solid ${color}88`, borderRadius: 1.5, pointerEvents: 'none' }} />
      </>
    );
  }

  // ornate
  return (
    <>
      <Box sx={{ position: 'absolute', inset: 8, border: `3px solid ${color}`, borderRadius: 2, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', inset: 14, border: `1px solid ${color}60`, borderRadius: 1.5, pointerEvents: 'none' }} />
      {/* Corner ornaments */}
      {[
        { top: 4, left: 4 },
        { top: 4, right: 4 },
        { bottom: 4, left: 4 },
        { bottom: 4, right: 4 },
      ].map((pos, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          ...pos,
          width: 28, height: 28,
          border: `2px solid ${color}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, opacity: 0.7 }} />
        </Box>
      ))}
    </>
  );
}

export function CertRenderer({
  template,
  recipientName = 'ชื่อผู้เรียน',
  courseTitle = 'ชื่อหลักสูตร',
  score = 85,
  issueDate,
  expiresDate,
  certNo = 'CERT-000000',
  scale = 1,
}: CertRendererProps) {
  const isDark = template.primaryColor.startsWith('#C') || template.bgGradientFrom === '#0F172A';

  const bg =
    template.bgType === 'gradient'
      ? `linear-gradient(135deg, ${template.bgGradientFrom}, ${template.bgGradientTo})`
      : template.bgType === 'solid'
      ? template.bgColor
      : '#FFFFFF';

  const bodyTextColor = template.textColor || (isDark ? 'rgba(255,255,255,0.75)' : '#64748B');
  const headingColor = isDark ? template.accentColor : template.primaryColor;
  const subHeadColor = isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8';
  const nameColor = isDark ? '#FFFFFF' : template.primaryColor;
  const dividerColor = isDark ? `${template.accentColor}60` : '#E2E8F0';
  const dotColor = template.accentColor;

  const formattedIssue = issueDate
    ? new Date(issueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    : '1 มกราคม 2569';
  const formattedExpiry = expiresDate
    ? new Date(expiresDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    : '1 มกราคม 2570';

  return (
    <Box
      sx={{
        width: BASE_W,
        height: BASE_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        background: bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Sarabun", "Prompt", sans-serif',
        flexShrink: 0,
      }}
    >
      <BorderLayer style={template.borderStyle} color={template.borderColor} />

      {/* Top accent strip */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${template.accentColor}, ${template.primaryColor}, ${template.accentColor})` }} />

      {/* Header region */}
      <Box sx={{ pt: 4, pb: 2.5, textAlign: 'center', position: 'relative' }}>
        {/* Stars */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill={template.accentColor} color={template.accentColor} />
          ))}
        </Box>

        {/* Award icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.2 }}>
          <Box sx={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${template.accentColor}, ${template.primaryColor})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 20px ${template.accentColor}55`,
          }}>
            <Award size={26} color="white" />
          </Box>
        </Box>

        <Typography sx={{ color: headingColor, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', mb: 0.4 }}>
          {template.orgName}
        </Typography>
        <Typography sx={{ color: nameColor, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1 }}>
          {template.certTitle}
        </Typography>
        <Typography sx={{ color: subHeadColor, fontSize: '0.62rem', mt: 0.3 }}>
          {template.orgSubtitle}
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 8, mb: 2, gap: 1.5 }}>
        <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${dividerColor})` }} />
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dotColor }} />
        <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${dividerColor})` }} />
      </Box>

      {/* Body */}
      <Box sx={{ textAlign: 'center', px: 10 }}>
        <Typography sx={{ color: bodyTextColor, fontSize: '0.72rem', mb: 0.8, fontStyle: 'italic' }}>
          {template.recipientPrefix}
        </Typography>

        <Typography sx={{
          color: nameColor,
          fontSize: '1.8rem',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          display: 'inline-block',
          borderBottom: `3px solid ${template.accentColor}`,
          pb: 0.5,
          mb: 1.2,
        }}>
          {recipientName}
        </Typography>

        <Typography sx={{ color: bodyTextColor, fontSize: '0.72rem', mb: 1 }}>
          {template.coursePrefix}
        </Typography>

        <Box sx={{
          bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
          borderRadius: 2,
          px: 3, py: 1.2,
          mx: 'auto',
          maxWidth: 480,
          mb: 1.5,
        }}>
          <Typography sx={{ color: nameColor, fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>
            {courseTitle}
          </Typography>
        </Box>

        {template.showScore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Box sx={{
              background: `linear-gradient(135deg, #10B981, #059669)`,
              borderRadius: 2,
              px: 2.5, py: 0.6,
              display: 'inline-flex', alignItems: 'center', gap: 1,
              boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
            }}>
              <Shield size={13} color="white" />
              <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.8rem' }}>
                {template.scorePrefix} {score}%
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 8, mb: 1.5, gap: 1.5 }}>
        <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${dividerColor})` }} />
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dotColor }} />
        <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${dividerColor})` }} />
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, px: 8, mb: 1 }}>
        {template.showDate && (
          <Box>
            <Typography sx={{ color: subHeadColor, fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
              วันที่ออก
            </Typography>
            <Typography sx={{ color: nameColor, fontWeight: 600, fontSize: '0.65rem' }}>
              {formattedIssue}
            </Typography>
          </Box>
        )}
        {template.showCertNo && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: subHeadColor, fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
              เลขที่ใบประกาศ
            </Typography>
            <Typography sx={{ color: template.accentColor, fontWeight: 600, fontSize: '0.6rem', fontFamily: 'monospace' }}>
              {certNo}
            </Typography>
          </Box>
        )}
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: subHeadColor, fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
            ผู้รับรอง
          </Typography>
          <Typography sx={{ color: nameColor, fontWeight: 700, fontSize: '0.65rem' }}>
            {template.signerName}
          </Typography>
          <Typography sx={{ color: subHeadColor, fontSize: '0.58rem' }}>
            {template.signerTitle}
          </Typography>
        </Box>
      </Box>

      {/* Footer note */}
      {template.footerNote && (
        <Box sx={{ textAlign: 'center', mt: 0.5 }}>
          <Typography sx={{ color: subHeadColor, fontSize: '0.55rem' }}>
            {template.footerNote}
          </Typography>
        </Box>
      )}

      {/* Bottom accent strip */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${template.accentColor}, ${template.primaryColor}, ${template.accentColor})` }} />

      {/* Verified badge */}
      <Box sx={{ position: 'absolute', bottom: 18, right: 24, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.5 }}>
        <CheckCircle size={10} color={template.accentColor} />
        <Typography sx={{ color: subHeadColor, fontSize: '0.5rem' }}>Verified</Typography>
      </Box>
    </Box>
  );
}
