import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  Laptop,
  Check,
  ChevronRight,
} from 'lucide-react';
import { APP_CONFIG, DEMO_CREDENTIALS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';

export const Landing = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const features = [
    {
      icon: ShieldCheck,
      title: 'Institutional Grade Security',
      description:
        'End-to-end encrypted assessment packets, single-session token enforcement, and tamper-resistant audit trails.',
      color: 'brand',
    },
    {
      icon: Users,
      title: 'Three Distinct Role Portals',
      description:
        'Tailored experiences for System Administrators, Faculty Instructors, and Candidates with strict RBAC.',
      color: 'indigo',
    },
    {
      icon: BarChart3,
      title: 'Deep Learning Analytics',
      description:
        'Item response analysis, class score distributions, and real-time pass/fail predictive modeling.',
      color: 'emerald',
    },
    {
      icon: Zap,
      title: 'Instant Automated Evaluation',
      description:
        'Immediate scoring algorithms for multiple choice and numerical assessments, with review queues for subjective papers.',
      color: 'amber',
    },
    {
      icon: Laptop,
      title: 'Responsive & Accessible',
      description:
        'Built from the ground up for seamless operation across desktop workstations, tablets, and mobile devices.',
      color: 'brand',
    },
    {
      icon: Lock,
      title: 'Dual Mode Execution',
      description:
        'Seamlessly switch between realistic offline mock data simulation and production REST APIs with a single flag.',
      color: 'indigo',
    },
  ];

  const metrics = [
    { value: '99.98%', label: 'Infrastructure Uptime' },
    { value: '38,000+', label: 'Verified Submissions' },
    { value: '< 45ms', label: 'Average Response Time' },
    { value: '100%', label: 'Audit Trail Coverage' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-soft">
              IQ
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {APP_CONFIG.NAME}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link to={`/${user?.role?.toLowerCase() || 'student'}/dashboard`}>
                <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 shadow-soft-xs">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                Phase 1 Active • Multi-Role Exam Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Intelligent, Secure & Seamless{' '}
              <span className="bg-gradient-to-r from-brand-600 via-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Online Examinations
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Empower educators, streamline institutional administration, and deliver distraction-free
              assessment environments for students with real-time analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={ArrowRight}>
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore One-Click Demo
                </Button>
              </Link>
            </div>

            {/* Quick Demo Credentials Pill Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Test Credentials:</span>
              {DEMO_CREDENTIALS.map((c) => (
                <span
                  key={c.role}
                  className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800"
                >
                  {c.email}
                </span>
              ))}
              <span className="text-slate-400">(Pass: Demo@123)</span>
            </div>
          </div>

          {/* Interactive Preview Mock Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-brand-500/20 via-primary-500/10 to-transparent border border-brand-200/40 dark:border-slate-800 shadow-soft-lg">
            <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft p-6 sm:p-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">examiq.live/platform-preview</span>
                </div>
                <Badge variant="emerald" size="sm" dot>Live Cluster Active</Badge>
              </div>

              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Administrator Node</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1">3,842 Active Users</p>
                  <span className="text-xs text-emerald-600 font-semibold">+14.2% this semester</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Faculty Workspace</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1">8 Active Papers</p>
                  <span className="text-xs text-brand-600 font-semibold">14 subjective reviews pending</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Candidate Hub</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1">88.7% Avg Score</p>
                  <span className="text-xs text-indigo-600 font-semibold">Rank #4 of 148 enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {metrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black text-brand-600 dark:text-brand-400 font-mono tracking-tight">
                  {m.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="brand" size="md">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Engineered for Academic Rigor
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              ExamIQ delivers the reliability, security, and insight needed to run high-stakes examinations at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-gradient-to-r from-brand-600 via-primary-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to upgrade your examination infrastructure?
          </h2>
          <p className="text-base text-indigo-100 max-w-xl mx-auto">
            Experience ExamIQ Phase 1 today with instantaneous demo login and full dark mode support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-slate-100 border-0">
                Register Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                Launch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
              IQ
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">ExamIQ Platform</span>
              <p className="text-[11px] text-slate-400">Phase 1 Release • Architecture & Security</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span>Admin, Teacher & Student Workspaces</span>
            <span>Mock API Active</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

