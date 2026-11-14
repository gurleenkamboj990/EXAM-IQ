import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ShieldCheck,
  Download,
  RefreshCw,
  Users,
  FileSpreadsheet,
  Award,
  Activity,
  Cpu,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ADMIN_CHART_DATA, ADMIN_RECENT_ACTIVITIES } from '../../api/mockData';
import { getAdminStats } from '../../api/adminApi';

import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';

const PIE_COLORS = {
  UPCOMING: '#f59e0b',
  LIVE: '#10b981',
  COMPLETED: '#94a3b8',
};

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | ExamIQ';
    async function load() {
      setIsLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch {
        // fall through – stats will stay null, we'll show skeletons/fallback
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-soft-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
          {payload.map((p) => (
            <p key={p.name} style={{ color: p.color }} className="font-semibold">
              {p.name}: {p.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statCards = stats
    ? [
        {
          id: 'total-users',
          title: 'Total Users',
          value: stats.totalUsers,
          description: 'All registered accounts',
          iconName: 'Users',
          color: 'brand',
        },
        {
          id: 'teachers',
          title: 'Teachers',
          value: stats.usersByRole?.TEACHER ?? 0,
          description: 'Active educators',
          iconName: 'GraduationCap',
          color: 'indigo',
        },
        {
          id: 'students',
          title: 'Students',
          value: stats.usersByRole?.STUDENT ?? 0,
          description: 'Enrolled learners',
          iconName: 'User',
          color: 'emerald',
        },
        {
          id: 'certs',
          title: 'Certificates Issued',
          value: stats.certificatesIssued ?? 0,
          description: 'Earned by passing students',
          iconName: 'Award',
          color: 'amber',
        },
      ]
    : [];

  const pieData = stats
    ? Object.entries(stats.examsByStatus || {}).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-primary-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-soft-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Operations Control
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Healthy
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || 'Administrator'}
          </h2>
          <p className="text-sm text-indigo-100 max-w-xl">
            Real-time monitoring across candidate cohorts, exam integrity metrics, and secure delivery nodes.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
            leftIcon={Download}
          >
            Export Logs
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-brand-700 hover:bg-slate-100 border-0 shadow-sm"
            leftIcon={RefreshCw}
          >
            Run Audit
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading
          ? [1,2,3,4].map(k => <Skeleton key={k} className="h-28 rounded-2xl" />)
          : statCards.map((stat) => (
              <StatCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                iconName={stat.iconName}
                color={stat.color}
              />
            ))}
      </div>

      {/* Quick Actions – Admin pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-soft hover:shadow-soft-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">User Directory</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage accounts, roles & access</p>
          </div>
        </Link>
        <Link
          to="/admin/exams"
          className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-soft hover:shadow-soft-md hover:border-brand-300 dark:hover:border-brand-700 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Exams Master</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">View & manage all platform exams</p>
          </div>
        </Link>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exam Participation & Pass Rates</CardTitle>
            <CardDescription>Aggregated monthly candidate throughput and performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ADMIN_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attemptsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="passRateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#attemptsGrad)" name="Attempts" />
                  <Area type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#passRateGrad)" name="Pass Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Exams by status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Exams by Status</CardTitle>
            <CardDescription>Current distribution across all exams</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend formatter={(v) => <span className="text-xs capitalize text-slate-600 dark:text-slate-300">{v.toLowerCase()}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User growth bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly cumulative registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyUserGrowth || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Users" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities & System Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Audit Log</CardTitle>
            <CardDescription>Real-time stream of security and administrative events</CardDescription>
          </CardHeader>
          <CardContent noPadding>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor / System</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Resource</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ADMIN_RECENT_ACTIVITIES.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-semibold">{activity.user}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activity.type === 'security'
                            ? 'emerald'
                            : activity.type === 'exam'
                            ? 'brand'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">
                      {activity.target}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Cluster Infrastructure</CardTitle>
            <CardDescription>Live health and workload distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Database Pool Capacity', pct: 42, color: 'bg-brand-500' },
              { label: 'Exam Proctoring Sockets', pct: 68, color: 'bg-primary-500' },
              { label: 'Automated Backup Buffer', pct: 99, color: 'bg-emerald-500' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">{label}</span>
                  <span className="text-slate-900 dark:text-slate-100">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                TLS 1.3 / AES-256
              </span>
              <span>Region: us-east-1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
