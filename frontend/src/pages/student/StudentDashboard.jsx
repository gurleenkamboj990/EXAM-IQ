import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  PlayCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { examApi } from '../../api/examApi';
import { resultApi } from '../../api/resultApi';
import { formatDate } from '../../utils/formatters';

import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [examsData, resultsData] = await Promise.all([
          examApi.getAll(),
          resultApi.getAll({ studentId: user?.id || 'usr_stud_01' }),
        ]);
        setExams(examsData || []);
        setResults(resultsData || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const resultMap = results.reduce((acc, r) => {
    acc[r.examId] = r;
    return acc;
  }, {});

  const attemptedCount = results.length;
  const avgPercentage =
    attemptedCount > 0
      ? (results.reduce((sum, r) => sum + (r.percentage || 0), 0) / attemptedCount).toFixed(1)
      : '0.0';

  const upcomingExams = exams.filter((e) => !resultMap[e.id] && e.status !== 'COMPLETED');

  // Chart data from real results (or fallback to syllabus benchmarks)
  const chartData =
    results.length > 0
      ? results.map((r, i) => ({
          exam: r.subject || `Exam ${i + 1}`,
          myScore: r.percentage,
          benchmark: 65,
        }))
      : [
          { exam: 'Foundations', myScore: 78, benchmark: 65 },
          { exam: 'Calculus', myScore: 84, benchmark: 65 },
          { exam: 'Physics', myScore: 88, benchmark: 65 },
        ];

  const stats = [
    {
      id: 'std_completed',
      title: 'Exams Completed',
      value: String(attemptedCount),
      change: 'All-time verified',
      trend: 'up',
      description: 'Formal submissions recorded',
      iconName: 'CheckCircle2',
      color: 'emerald',
    },
    {
      id: 'std_average',
      title: 'Cumulative Average',
      value: `${avgPercentage}%`,
      change: '+3.8% this term',
      trend: 'up',
      description: 'Weighted aggregate performance',
      iconName: 'Award',
      color: 'brand',
    },
    {
      id: 'std_upcoming',
      title: 'Available & Upcoming',
      value: String(upcomingExams.length),
      change: 'Open now or scheduled',
      trend: 'neutral',
      description: 'Awaiting your attempt',
      iconName: 'Calendar',
      color: 'indigo',
    },
    {
      id: 'std_rank',
      title: 'Cohort Standing',
      value: '#4 / 148',
      change: 'Top 3%',
      trend: 'up',
      description: 'Academic honors list eligible',
      iconName: 'TrendingUp',
      color: 'amber',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-soft-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
          <p className="text-brand-600 dark:text-brand-400 font-semibold">
            Score: {payload[0]?.value}%
          </p>
          <p className="text-slate-400 font-semibold">
            Passing Target: {payload[1]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-soft-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Learner Space
            </span>
            <span className="text-xs font-semibold text-brand-100">
              ExamIQ Phase 2 Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h2>
          <p className="text-sm text-indigo-100 max-w-xl">
            You have {upcomingExams.length} assessments available to take or scheduled soon.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/student/exams">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-brand-700 hover:bg-slate-100 border-0 shadow-sm"
              leftIcon={PlayCircle}
            >
              Browse Exams
            </Button>
          </Link>
          <Link to="/student/results">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
              leftIcon={Award}
            >
              My Transcripts
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

      {/* Academic Progress Line Chart */}
      <Card>
        <CardHeader
          action={
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-600" /> My Score (%)
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 ml-2" /> Target (%)
            </div>
          }
        >
          <CardTitle>Academic Progress & Score Trends</CardTitle>
          <CardDescription>
            Performance history tracked across all completed assessments
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1e293b' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="exam"
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  fontSize={12}
                  domain={[40, 100]}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="myScore"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="My Score"
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                  name="Passing Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Upcoming Assessments & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available / Upcoming Exams */}
        <Card>
          <CardHeader
            action={
              <Link
                to="/student/exams"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <CardTitle>Open & Upcoming Assessments</CardTitle>
            <CardDescription>Examination windows ready for attempt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All currently scheduled examinations have been completed!
              </p>
            ) : (
              upcomingExams.slice(0, 3).map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-1.5 py-0.5 rounded">
                        {exam.subject}
                      </span>
                      <Badge variant={exam.status === 'LIVE' ? 'emerald' : 'brand'} size="sm" dot>
                        {exam.status === 'LIVE' ? 'Live Now' : 'Upcoming'}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {exam.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {exam.duration} mins • {exam.totalMarks} Marks
                    </p>
                  </div>

                  <div className="shrink-0">
                    {exam.status === 'LIVE' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={PlayCircle}
                        onClick={() => navigate(`/student/exams/${exam.id}/attempt`)}
                      >
                        Start Exam
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        {formatDate(exam.startTime)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader
            action={
              <Link
                to="/student/results"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
              >
                <span>Full Gradebook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <CardTitle>Recent Verified Results</CardTitle>
            <CardDescription>Recently graded submissions and transcripts</CardDescription>
          </CardHeader>
          <CardContent noPadding>
            {isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No graded attempts recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 4).map((res) => (
                    <TableRow
                      key={res.attemptId}
                      isClickable
                      onClick={() => navigate(`/student/results/${res.attemptId}`)}
                    >
                      <TableCell>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {res.examTitle}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {res.score}/{res.totalMarks}
                      </TableCell>
                      <TableCell className="font-extrabold text-xs">
                        {res.percentage}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={res.passed ? 'emerald' : 'danger'} size="sm">
                          {res.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
