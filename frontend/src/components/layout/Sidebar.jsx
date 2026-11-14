import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  Settings,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Award,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Lock,
  Radio,
  Trophy,
  PenLine,
} from 'lucide-react';
import { ROLES, APP_CONFIG } from '../../utils/constants';
import Badge from '../ui/Badge';

export const SIDEBAR_ITEMS = {
  [ROLES.ADMIN]: [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, isReady: true },
        { label: 'User Directory', path: '/admin/users', icon: Users, isReady: true },
        { label: 'Exams Master', path: '/admin/exams', icon: FileSpreadsheet, isReady: true },
        { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle, isReady: false },
      ],
    },
    {
      title: 'Security & Operations',
      items: [
        { label: 'Integrity Logs', path: '/admin/audit', icon: ShieldCheck, isReady: false },
        { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3, isReady: false },
        { label: 'Platform Settings', path: '/admin/settings', icon: Settings, isReady: false },
      ],
    },
  ],
  [ROLES.TEACHER]: [
    {
      title: 'Teaching Hub',
      items: [
        { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, isReady: true },
        { label: 'Exam Schedule', path: '/teacher/exams', icon: FileSpreadsheet, isReady: true },
        { label: 'Question Bank', path: '/teacher/questions', icon: BookOpen, isReady: true },
        { label: 'AI Generator', path: '/teacher/ai-generator', icon: Sparkles, isReady: true },
      ],
    },
    {
      title: 'Evaluation & Monitoring',
      items: [
        { label: 'Live Monitor', path: '/teacher/monitor', icon: Radio, isReady: true },
        { label: 'Subjective Review', path: '/teacher/review', icon: PenLine, isReady: true },
        { label: 'Course Preferences', path: '/teacher/settings', icon: Settings, isReady: false },
      ],
    },
  ],
  [ROLES.STUDENT]: [
    {
      title: 'Learning Hub',
      items: [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, isReady: true },
        { label: 'Available Exams', path: '/student/exams', icon: GraduationCap, isReady: true },
        { label: 'My Results', path: '/student/results', icon: Award, isReady: true },
        { label: 'My Certificates', path: '/student/certificates', icon: Award, isReady: true },
        { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy, isReady: true },
      ],
    },
    {
      title: 'Performance',
      items: [
        { label: 'Submissions History', path: '/student/attempts', icon: ClipboardCheck, isReady: false },
        { label: 'Learner Profile', path: '/student/profile', icon: User, isReady: false },
      ],
    },
  ],
};

export const Sidebar = ({
  role = ROLES.STUDENT,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const sections = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS[ROLES.STUDENT];
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-brand-500/30 shrink-0">
            IQ
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-200">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {APP_CONFIG.NAME}
              </span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-1.5 py-0.5 rounded">
                v2.0
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

              if (!item.isReady) {
                return (
                  <div
                    key={item.label}
                    title={isCollapsed ? `${item.label} (Coming soon)` : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none group relative ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-700" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{item.label}</span>
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                          Soon
                        </span>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 shadow-soft-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Phase 2 active pill */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-brand-100 dark:border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
              ExamIQ Phase 2
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            Assessment wizard, live test engine & auto-grading active.
          </p>
        </div>
      )}

      {/* Collapse Toggle Footer (desktop) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 hidden lg:flex items-center justify-end shrink-0">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
        <div
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
