import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { analyticsApi } from '../../api/analyticsApi';
import { useThemeStore } from '../../store/themeStore';
import { formatDate } from '../../utils/formatters';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';

export const ExamAnalytics = () => {
  const { id } = useParams();
  const { isDark } = useThemeStore();

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const data = await analyticsApi.getExamAnalytics(id);
        setAnalytics(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load examination analytics');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, [id]);

  const exportExcel = () => {
    if (!analytics) return;
    try {
      const dataToExport = analytics.allAttempts.map((att, i) => ({
        Rank: i + 1,
        'Student Name': att.studentName,
        Email: att.email,
        Score: att.score,
        'Total Marks': att.totalMarks,
        Percentage: `${att.percentage}%`,
        Result: att.passed ? 'PASSED' : 'FAILED',
        'Cheating Risk Score': `${att.riskScore}%`,
        'Risk Category': att.riskLevel,
        'Violations Logged': att.violationCount,
        'Submitted Date': formatDate(att.submittedAt),
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Gradebook');
      XLSX.writeFile(wb, `${analytics.exam?.title || 'Exam'}_Analytics.xlsx`);
      toast.success('Downloaded Excel gradebook!');
    } catch (err) {
      toast.error('Failed to export Excel file');
    }
  };

  const exportPDF = () => {
    if (!analytics) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Exam Analytics: ${analytics.exam?.title || 'Exam Report'}`, 14, 20);
      doc.setFontSize(10);
      doc.text(
        `Subject: ${analytics.exam?.subject || '-'} | Total Attempts: ${analytics.totalAttempts} | Pass Rate: ${analytics.passRate}% | Class Mean: ${analytics.averageScore}%`,
        14,
        28
      );

      const tableRows = analytics.allAttempts.map((att, i) => [
        i + 1,
        att.studentName,
        att.email,
        `${att.score} / ${att.totalMarks}`,
        `${att.percentage}%`,
        att.passed ? 'PASSED' : 'FAILED',
        `${att.riskScore}% (${att.riskLevel})`,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Rank', 'Student Name', 'Email', 'Score', 'Percentage', 'Status', 'Risk Score']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 8 },
      });

      doc.save(`${analytics.exam?.title || 'Exam'}_Report.pdf`);
      toast.success('Generated PDF analytics report!');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/teacher/exams"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exam Schedule</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
              {analytics.exam?.subject}
            </span>
            <Badge variant="emerald" size="sm" dot>
              Cohort Verified
            </Badge>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {analytics.exam?.title}
          </h2>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" leftIcon={FileSpreadsheet} onClick={exportExcel}>
            Export Excel (.xlsx)
          </Button>
          <Button variant="primary" size="sm" leftIcon={Download} onClick={exportPDF}>
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Class Average</span>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {analytics.averageScore}%
          </p>
          <span className="text-[11px] text-slate-400">Mean cohort grade</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Pass Rate</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {analytics.passRate}%
          </p>
          <span className="text-[11px] text-slate-400">Above passing threshold</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Highest Mark</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {analytics.highestScore}%
          </p>
          <span className="text-[11px] text-slate-400">Top score in cohort</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Lowest Mark</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {analytics.lowestScore}%
          </p>
          <span className="text-[11px] text-slate-400">Needs intervention</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Attempts</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {analytics.totalAttempts}
          </p>
          <span className="text-[11px] text-slate-400">Graded submissions</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution Histogram</CardTitle>
            <CardDescription>Number of candidates across percentage brackets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1e293b' : '#f1f5f9'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                  />
                  <YAxis
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderRadius: '0.875rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Per-Question Difficulty Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Question Accuracy (% Correct)</CardTitle>
            <CardDescription>Item response analysis measuring question difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.perQuestionStats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1e293b' : '#f1f5f9'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="questionNumber"
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={12}
                    tickFormatter={(v) => `Q${v}`}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={12}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}% Correct`, 'Accuracy']}
                    labelFormatter={(label) => `Question #${label}`}
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderRadius: '0.875rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="percentageCorrect" radius={[8, 8, 0, 0]} name="Accuracy %">
                    {analytics.perQuestionStats.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.percentageCorrect >= 75
                            ? '#10b981'
                            : entry.percentageCorrect >= 50
                            ? '#6366f1'
                            : '#f43f5e'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Question Table */}
      <Card>
        <CardHeader>
          <CardTitle>Item Response Analysis</CardTitle>
          <CardDescription>
            Calculated empirical difficulty based on cohort responses
          </CardDescription>
        </CardHeader>
        <CardContent noPadding>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Configured</TableHead>
                <TableHead>Empirical Difficulty</TableHead>
                <TableHead>Accuracy Rate</TableHead>
                <TableHead>Correct Turnout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.perQuestionStats.map((q) => (
                <TableRow key={q.questionId}>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-400 mr-2">Q{q.questionNumber}.</span>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {q.text}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {q.topic}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{q.configuredDifficulty}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        q.computedDifficulty === 'EASY'
                          ? 'emerald'
                          : q.computedDifficulty === 'MEDIUM'
                          ? 'indigo'
                          : 'danger'
                      }
                      size="sm"
                      dot
                    >
                      {q.computedDifficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black text-xs">
                    {q.percentageCorrect}%
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {q.correctCount} / {q.totalAttempts} Students
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top 5 and Bottom 5 Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Performers</CardTitle>
            <CardDescription>Highest scoring candidates in this paper</CardDescription>
          </CardHeader>
          <CardContent noPadding>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topPerformers.map((top, idx) => (
                  <TableRow key={top.attemptId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-xs text-slate-400">#{idx + 1}</span>
                        <img src={top.avatar} alt={top.studentName} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="font-semibold text-xs">{top.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {top.score} / {top.totalMarks}
                    </TableCell>
                    <TableCell className="font-black text-xs">{top.percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={top.riskScore > 30 ? 'warning' : 'emerald'} size="sm">
                        {top.riskScore}% Risk
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidates Requiring Support</CardTitle>
            <CardDescription>Lowest scoring submissions recommended for remedial review</CardDescription>
          </CardHeader>
          <CardContent noPadding>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.bottomPerformers.map((bot) => (
                  <TableRow key={bot.attemptId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img src={bot.avatar} alt={bot.studentName} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="font-semibold text-xs">{bot.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-rose-600 dark:text-rose-400">
                      {bot.score} / {bot.totalMarks}
                    </TableCell>
                    <TableCell className="font-black text-xs">{bot.percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={bot.passed ? 'brand' : 'danger'} size="sm">
                        {bot.passed ? 'Passed' : 'Needs Review'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamAnalytics;

