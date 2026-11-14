import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  PlusCircle,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Radio,
  PenLine,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { examApi } from '../../api/examApi';
import { questionApi } from '../../api/questionApi';
import { TEACHER_CHART_DATA } from '../../api/mockData';
import { formatDate } from '../../utils/formatters';

import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  const [exams, setExams] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [examsData, questionsData] = await Promise.all([
          examApi.getAll(),
          questionApi.getAll({ limit: 1 }),
        ]);
        setExams(examsData || []);
        setTotalQuestions(questionsData.total || 0);
      } catch (err) {
        console.error('Failed to load teacher dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const liveExamsCount = exams.filter((e) => e.status === 'LIVE').length;
  const upcomingExamsCount = exams.filter((e) => e.status === 'UPCOMING').length;

  const stats = [
    {
      id: 'tch_live',
      title: 'Live Assessments Now',
      value: String(liveExamsCount),
      change: `${upcomingExamsCount} upcoming`,
      trend: liveExamsCount > 0 ? 'up' : 'neutral',
      description: 'Active candidate testing slots',
      iconName: 'Clock',
      color: 'emerald',
    },
    {
      id: 'tch_total_exams',
      title: 'Total Examinations',
      value: String(exams.length),
      change: `+${exams.length} active`,
      trend: 'up',
      description: 'Scheduled across curriculum',
      iconName: 'FileSpreadsheet',
      color: 'brand',
    },
    {
      id: 'tch_bank',
      title: 'Question Bank Items',
      value: String(totalQuestions),
      change: 'Verified items',
      trend: 'up',
      description: 'Ready for assessment assembly',
      iconName: 'HelpCircle',
      color: 'indigo',
    },
    {
      id: 'tch_score',
      title: 'Average Class Score',
      value: '81.4%',
      change: '+4.2% semester',
      trend: 'up',
      description: 'Median grade: B+',
      iconName: 'TrendingUp',
      color: 'amber',
    },
  ];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'LIVE':
        return 'emerald';
      case 'UPCOMING':
        return 'amber';
      case 'COMPLETED':
        return 'neutral';
      default:
        return 'brand';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-soft-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
          <p className="text-primary-600 dark:text-primary-400 font-semibold">
            Enrolled Students: {payload[0]?.value}
          </p>
          <p className="text-slate-400 font-semibold">
            Dept Benchmark: {payload[1]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-700 via-indigo-600 to-brand-600 rounded-2xl p-6 sm:p-8 text-white shadow-soft-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Faculty Workspace
            </span>
            <span className="text-xs font-semibold text-indigo-100">
              ExamIQ Phase 3
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user?.name || 'Professor'}
          </h2>
          <p className="text-sm text-indigo-100 max-w-xl">
            You have {liveExamsCount} live examinations running and {upcomingExamsCount} upcoming testing windows scheduled.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link to="/teacher/exams/new">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-primary-700 hover:bg-slate-100 border-0 shadow-sm"
              leftIcon={PlusCircle}
            >
              Create Exam
            </Button>
          </Link>
          <Link to="/teacher/questions">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
              leftIcon={HelpCircle}
            >
              Question Bank
            </Button>
          </Link>
          <Link to="/teacher/ai-generator">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
              leftIcon={Sparkles}
            >
              AI Generator
            </Button>
          </Link>
          <Link to="/teacher/monitor">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
              leftIcon={Radio}
            >
              Live Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            description={stat.description}
            iconName={stat.iconName}
            color={stat.color}
          />
        ))}
      </div>

      {/* Phase 3 Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/teacher/ai-generator" className="group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-950/50 dark:to-indigo-950/50 border border-brand-200 dark:border-brand-900 hover:shadow-soft-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">AI Question Generator</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Auto-synthesize exam questions with AI</p>
          </div>
        </Link>
        <Link to="/teacher/monitor" className="group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-900 hover:shadow-soft-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Live Exam Monitor</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Watch candidates in real time</p>
          </div>
        </Link>
        <Link to="/teacher/review" className="group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-900 hover:shadow-soft-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <PenLine className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">Subjective Review</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Grade short answers with AI assist</p>
          </div>
        </Link>
      </div>

      {/* Score Distribution Chart */}
      <Card>
        <CardHeader
          action={
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-600" /> Current Cohort
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 ml-2" /> Benchmark
            </div>
          }
        >
          <CardTitle>Class Score Distribution</CardTitle>
          <CardDescription>
            Performance breakdown across all active course modules
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEACHER_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1e293b' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="gradeRange"
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
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="students"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  name="Students"
                />
                <Bar
                  dataKey="benchmark"
                  fill={isDark ? '#334155' : '#cbd5e1'}
                  radius={[8, 8, 0, 0]}
                  name="Benchmark"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Live & Upcoming Course Examinations Table */}
      <Card>
        <CardHeader
          action={
            <Link
              to="/teacher/exams"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <CardTitle>Scheduled Examinations</CardTitle>
          <CardDescription>Live data directly connected to your active exam schedules</CardDescription>
        </CardHeader>

        <CardContent noPadding>
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject & Title</TableHead>
                  <TableHead>Duration & Questions</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.slice(0, 5).map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-1.5 py-0.5 rounded mr-2">
                          {exam.subject}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {exam.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {exam.duration} mins • {exam.questionCount} Questions
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {exam.totalMarks} Marks
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(exam.status)} size="sm" dot>
                        {exam.status === 'LIVE'
                          ? 'Live Now'
                          : exam.status === 'UPCOMING'
                          ? 'Upcoming'
                          : 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatDate(exam.startTime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
