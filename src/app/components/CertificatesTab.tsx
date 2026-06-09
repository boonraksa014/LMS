import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Download, Eye, Award } from 'lucide-react';
import { Certificate } from '../data/types';

interface CertificatesTabProps {
  certificates: Certificate[];
  onViewCertificate: (cert: Certificate) => void;
}

export function CertificatesTab({ certificates, onViewCertificate }: CertificatesTabProps) {
  const exportCertCSV = () => {
    const headers = ['หมายเลขใบประกาศ', 'ชื่อผู้เรียน', 'คอร์ส', 'หมวดหมู่', 'คะแนน', 'วันที่ออก', 'วันหมดอายุ'];
    const rows = certificates.map((c) => [
      c.certificateNo, c.userName, c.courseTitle, c.category,
      `${c.score}%`,
      new Date(c.issuedAt).toLocaleDateString('th-TH'),
      new Date(c.expiresAt).toLocaleDateString('th-TH'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${x}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
          ใบประกาศนียบัตรทั้งหมด ({certificates.length} ฉบับ)
        </Typography>
        <Button variant="outlined" startIcon={<Download size={15} />} onClick={exportCertCSV} disabled={certificates.length === 0}>
          ส่งออก CSV
        </Button>
      </Box>

      {certificates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Award size={32} color="#CBD5E1" />
          </Box>
          <Typography color="text.secondary">ยังไม่มีใบประกาศที่ออกให้</Typography>
          <Typography variant="caption" color="text.secondary">
            ใบประกาศจะถูกออกอัตโนมัติเมื่อผู้เรียนสอบปลายภาคผ่าน
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell scope="col">หมายเลขใบประกาศ</TableCell>
                <TableCell scope="col">ชื่อผู้เรียน</TableCell>
                <TableCell scope="col">คอร์ส</TableCell>
                <TableCell scope="col">หมวดหมู่</TableCell>
                <TableCell scope="col">คะแนน</TableCell>
                <TableCell scope="col">วันที่ออก</TableCell>
                <TableCell scope="col">วันหมดอายุ</TableCell>
                <TableCell scope="col">ดูใบประกาศ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...certificates]
                .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
                .map((cert) => (
                  <TableRow key={cert.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#1E7A34', fontWeight: 600 }}>
                        {cert.certificateNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', backgroundColor: '#D97706' }}>
                          {cert.userName[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cert.userName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={cert.courseTitle} placement="top">
                        <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cert.courseTitle}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip label={cert.category} size="small" variant="outlined" sx={{ fontSize: '0.68rem', borderColor: '#1E7A34', color: '#1E7A34' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>{cert.score}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{new Date(cert.issuedAt).toLocaleDateString('th-TH')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: new Date(cert.expiresAt) < new Date() ? '#d4183d' : '#717182' }}>
                        {new Date(cert.expiresAt).toLocaleDateString('th-TH')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="ดูใบประกาศ">
                        <IconButton size="small" aria-label={`ดูใบประกาศ ${cert.certificateNo}`} sx={{ color: '#1E7A34' }} onClick={() => onViewCertificate(cert)}>
                          <Eye size={14} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}