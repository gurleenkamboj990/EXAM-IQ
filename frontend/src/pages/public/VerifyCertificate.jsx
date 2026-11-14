import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Search,
  Award,
  User,
  Calendar,
  BookOpen,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { verifyCertificate } from '../../api/certificateApi';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';

export const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [certId, setCertId] = useState(certificateId || '');
  const [input, setInput] = useState(certificateId || '');
  const [result, setResult] = useState(null);  // null = not searched, false = invalid, object = valid
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    document.title = 'Verify Certificate | ExamIQ';
    if (certificateId) {
      verify(certificateId);
    }
  }, [certificateId]);

  async function verify(id) {
    const trimmed = (id || input).trim();
    if (!trimmed) return;
    setIsLoading(true);
    setHasSearched(true);
    setResult(null);
    try {
      const cert = await verifyCertificate(trimmed);
      setResult(cert || false);
    } catch {
      setResult(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    // Update URL
    navigate(`/verify/${trimmed}`, { replace: true });
    verify(trimmed);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 flex flex-col">
      {/* Top bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center px-4 sm:px-8 justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to ExamIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xs">
            IQ
          </div>
          <span className="font-black text-slate-900 dark:text-white">ExamIQ</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
            Verify
          </span>
        </div>
        <Link
          to="/login"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Login
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-12 sm:py-16 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Certificate Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter a certificate ID to verify its authenticity instantly.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. EXQ-2026-123456"
                aria-label="Certificate ID"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:font-sans placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={Search}>
              Verify
            </Button>
          </div>
        </form>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-10 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-semibold">Verifying certificate…</span>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && result !== null && (
          <>
            {result === false ? (
              /* INVALID */
              <div className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-8 text-center animate-in fade-in duration-300">
                <XCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-rose-700 dark:text-rose-400 mb-2">
                  Certificate Not Found
                </h2>
                <p className="text-sm text-rose-600 dark:text-rose-500 mb-1">
                  The ID <span className="font-mono font-bold">{input.trim()}</span> does not match any valid certificate in our records.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                  The certificate may have been revoked, expired, or the ID may be incorrect.
                </p>
              </div>
            ) : (
              /* VALID */
              <div className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl overflow-hidden animate-in fade-in duration-300">
                {/* Green header */}
                <div className="bg-emerald-500 dark:bg-emerald-700 p-6 text-white text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 drop-shadow" />
                  <h2 className="text-xl font-black">Certificate is VALID</h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    This certificate is authentic and issued by ExamIQ.
                  </p>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  {[
                    { icon: User, label: 'Student Name', value: result.studentName },
                    { icon: BookOpen, label: 'Examination', value: result.examTitle },
                    {
                      icon: Award,
                      label: 'Score',
                      value: `${result.score}/${result.totalMarks} (${result.percentage}%) — Grade ${result.grade || 'A'}`,
                    },
                    { icon: Calendar, label: 'Date Issued', value: formatDate(result.issuedAt) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Certificate ID */}
                  <div className="mt-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center">
                    <p className="text-xs text-slate-400 mb-1">Certificate ID</p>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {result.id}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Issued by ExamIQ Examination Platform</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Placeholder before first search */}
        {!isLoading && !hasSearched && (
          <div className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-400 dark:text-slate-600">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Enter a certificate ID above to verify</p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        © 2026 ExamIQ · Intelligent Examination Platform
      </footer>
    </div>
  );
};

export default VerifyCertificate;
