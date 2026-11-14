import React, { useState, useEffect, useRef } from 'react';
import { Award, Download, Eye, X, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { getMyCertificates } from '../../api/certificateApi';
import { formatDate } from '../../utils/formatters';
import Certificate from '../../components/certificate/Certificate';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export const MyCertificates = () => {
  const { user } = useAuthStore();
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const certRef = useRef(null);

  useEffect(() => {
    document.title = 'My Certificates | ExamIQ';
    async function load() {
      setIsLoading(true);
      try {
        const data = await getMyCertificates(user.id);
        setCerts(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load certificates');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user.id]);

  async function handleDownload(cert) {
    setDownloading(cert.id);
    setPreviewCert(cert);
    // Let the DOM render the hidden cert component before capturing
    await new Promise((r) => setTimeout(r, 400));
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8faff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1056, 748] });
      pdf.addImage(imgData, 'PNG', 0, 0, 1056, 748);
      pdf.save(`ExamIQ-Certificate-${cert.id}.pdf`);
      toast.success('Certificate downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(null);
      setPreviewCert(null);
    }
  }

  const gradeColor = (grade) => {
    if (!grade) return 'neutral';
    if (grade.startsWith('A')) return 'emerald';
    if (grade.startsWith('B')) return 'brand';
    return 'amber';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Certificates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Certificates earned for passing examinations
          </p>
        </div>
        {certs.length > 0 && (
          <Badge variant="emerald" size="lg" dot>
            {certs.length} Certificate{certs.length !== 1 ? 's' : ''} Earned
          </Badge>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-52 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && certs.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No certificates yet"
          description="Pass an exam to earn your first certificate."
        />
      )}

      {/* Grid */}
      {!isLoading && certs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-md transition-shadow"
            >
              {/* Card top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

              <div className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                      {cert.subject || 'General'}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {cert.examTitle}
                    </h3>
                  </div>
                  <Badge variant={gradeColor(cert.grade)} size="sm">
                    Grade {cert.grade || 'A'}
                  </Badge>
                </div>

                {/* Score bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Score</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {cert.score}/{cert.totalMarks} · {cert.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                      style={{ width: `${Math.min(cert.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {formatDate(cert.issuedAt)}
                  </span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                    {cert.id}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Eye}
                    className="flex-1"
                    onClick={() => setPreviewCert(cert)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Download}
                    className="flex-1"
                    isLoading={downloading === cert.id}
                    onClick={() => handleDownload(cert)}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden certificate for PDF capture */}
      {previewCert && downloading === previewCert.id && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: 1056,
            height: 748,
            overflow: 'hidden',
            zIndex: -1,
          }}
        >
          <Certificate ref={certRef} certificate={previewCert} forPrint />
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && downloading !== previewCert.id && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white p-2 rounded-xl transition-colors"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="overflow-auto max-h-[90vh] rounded-2xl shadow-2xl">
              <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                <Certificate certificate={previewCert} />
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                leftIcon={Download}
                onClick={() => {
                  setPreviewCert(null);
                  setTimeout(() => handleDownload(previewCert), 100);
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
