import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  ArrowLeft,
  Calendar,
  Share2,
  Check,
  X,
  Minus,
  ShieldCheck,
  ShieldAlert,
  Trophy,
  GraduationCap,
} from 'lucide-react';
import { generateCertificate } from '../../api/certificateApi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

import { resultApi } from '../../api/resultApi';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import AIFeedback from '../../components/exam/AIFeedback';

const CHART_COLORS = {
  Correct: '#10b981',
  Incorrect: '#f43f5e',
  Skipped: '#94a3b8',
  'Pending Review': '#f59e0b',
};

export const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [certGenerated, setCertGenerated] = useState(false);

  useEffect(() => {
    document.title = 'Exam Result | ExamIQ';
    async function loadResult() {
      setIsLoading(true);
      try {
        const data = await resultApi.getById(attemptId);
        setResult(data);
        // Auto-generate certificate if passed
        if (data?.passed && !certGenerated) {
          try {
            await generateCertificate({
              studentId: user?.id,
              studentName: user?.name || data.studentName,
              examId: data.examId,
              examTitle: data.examTitle,
              subject: data.subject,
              score: data.score,
              totalMarks: data.totalMarks,
              percentage: data.percentage,
              attemptId: data.attemptId,
            });
            setCertGenerated(true);
          } catch (certErr) {
            console.warn('Certificate generation skipped:', certErr);
          }
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load assessment result');
        navigate('/student/results');
      } finally {
        setIsLoading(false);
      }
    }
    loadResult();
  }, [attemptId, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!result) return null;

  const summary = result.summary || {
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
    pendingCount: 0,
  };

  const chartData = [
    { name: 'Correct', value: summary.correctCount || 0 },
    { name: 'Incorrect', value: summary.incorrectCount || 0 },
    { name: 'Skipped', value: summary.skippedCount || 0 },
    ...(summary.pendingCount > 0
      ? [{ name: 'Pending Review', value: summary.pendingCount }]
      : []),
  ].filter((item) => item.value > 0);

  const hasProctoring = result.riskScore !== undefined || (result.violations && result.violations.length > 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Link & Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Link
          to="/student/results"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Results</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/student/leaderboard">
            <Button variant="outline" size="sm" leftIcon={Trophy}>
              View on Leaderboard
            </Button>
          </Link>
          {result.passed && (
            <Link to="/student/certificates">
              <Button variant="primary" size="sm" leftIcon={GraduationCap}>
                View Certificate
              </Button>
            </Link>
          )}
          <span className="text-xs text-slate-400 font-mono">Attempt ID: {result.attemptId}</span>
        </div>
      </div>

      {/* Score Hero Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-soft-lg flex flex-col sm:flex-row items-center justify-between gap-6 ${
          result.passed
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500'
            : 'bg-gradient-to-r from-rose-600 to-amber-700 text-white border-rose-500'
        }`}
      >
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              {result.passed ? 'Examination Passed' : 'Needs Improvement'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              Cohort Rank: #{result.percentage >= 90 ? '2' : result.percentage >= 80 ? '4' : '11'} of 25
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{result.examTitle}</h2>
          <p className="text-xs text-emerald-100 dark:text-rose-100">
            Completed on {formatDate(result.submittedAt)} by {result.studentName}
          </p>
        </div>

        {/* Big Score Callout */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 min-w-[160px] text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Final Score</span>
          <div className="text-4xl sm:text-5xl font-black mt-1">
            {result.score}
            <span className="text-lg font-normal text-white/80">/{result.totalMarks}</span>
          </div>
          <span className="text-sm font-bold mt-1 text-white/90">{result.percentage}%</span>
        </div>
      </div>

      {/* Proctoring Security Summary (If available) */}
      {hasProctoring && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {result.riskScore < 30 ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <CardTitle className="text-sm">Proctoring Telemetry & Integrity Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Recorded webcam and environment anomalies during this test window
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant={result.riskScore < 30 ? 'emerald' : result.riskScore < 70 ? 'warning' : 'danger'}
                size="sm"
                dot
              >
                {result.riskScore}% Cheating Risk
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Level</span>
                <span className="font-extrabold text-sm">{result.riskLevel || (result.riskScore < 30 ? 'LOW' : 'MEDIUM')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Violations Incurred</span>
                <span className="font-extrabold text-sm">{result.violations?.length || 0} Infractions</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Lockdown Compliance</span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {result.violations?.length === 0 ? '100% Compliant' : 'Monitored with Warnings'}
                </span>
              </div>
            </div>

            {result.violations && result.violations.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Logged Incident Details:</span>
                <div className="space-y-1">
                  {result.violations.map((v, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-slate-700 dark:text-slate-300">{v.type}: {v.message}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{v.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Breakdown Metrics & Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards Column */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Correct Answers</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.correctCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Incorrect Answers</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {summary.incorrectCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <X className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Skipped / Unattempted</span>
              <p className="text-2xl font-black text-slate-600 dark:text-slate-400">
                {summary.skippedCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <Minus className="w-5 h-5" />
            </div>
          </div>

          {summary.pendingCount > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Pending Review</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {summary.pendingCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Recharts Pie Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Response distribution across all questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[entry.name] || '#3b82f6'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Questions`, name]}
                    contentStyle={{
                      borderRadius: '0.875rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => (
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {val}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PHASE 3: AI Cognitive Feedback Panel */}
      <AIFeedback result={result} attemptId={attemptId} />

      {/* Per-Question Detailed Review */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Question Review</CardTitle>
          <CardDescription>
            Examine your individual responses against the benchmark answer key
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {result.answers?.map((ans, idx) => {
            const isCorrect = ans.isCorrect === true;
            const isIncorrect = ans.isCorrect === false && !ans.isSkipped;
            const isSkipped = ans.isSkipped === true;
            const isPending = ans.isCorrect === null;

            return (
              <div
                key={ans.questionId || idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-500">#{idx + 1}</span>
                    <Badge variant={ans.type === 'MCQ' ? 'brand' : 'indigo'} size="sm">
                      {ans.type}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {ans.marks} pts
                    </span>
                  </div>

                  <div>
                    {isCorrect && (
                      <Badge variant="emerald" size="sm" dot>
                        +{ans.marksAwarded} Marks
                      </Badge>
                    )}
                    {isIncorrect && (
                      <Badge variant="danger" size="sm" dot>
                        {ans.marksAwarded} Marks
                      </Badge>
                    )}
                    {isSkipped && (
                      <Badge variant="neutral" size="sm">
                        Skipped (0 pts)
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="amber" size="sm" dot>
                        Evaluation Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {ans.questionText}
                </p>

                {/* MCQ Review */}
                {ans.type === 'MCQ' && ans.options && (
                  <div className="space-y-1.5 pt-1 text-xs">
                    {ans.options.map((opt, optIndex) => {
                      const wasSelected = ans.studentAnswer === optIndex;
                      const isTargetCorrect = ans.correctAnswer === optIndex;

                      let rowClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                      if (isTargetCorrect) {
                        rowClass = 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                      } else if (wasSelected && !isTargetCorrect) {
                        rowClass = 'border-rose-300 bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
                      }

                      return (
                        <div
                          key={optIndex}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${rowClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 font-bold">{String.fromCharCode(65 + optIndex)}.</span>
                            <span>{opt}</span>
                          </div>
                          {wasSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-800 shadow-sm">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Review */}
                {ans.type === 'SHORT_ANSWER' && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Your Submitted Text
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {ans.studentAnswer || '(No answer provided)'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase block mb-1">
                        Reference Model Answer
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {ans.correctAnswer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback note */}
                {ans.feedback && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Evaluation Note: {ans.feedback}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResult;
