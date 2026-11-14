import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Award, Trophy, Medal } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, isReady: true },
  { label: 'Exams', path: '/student/exams', icon: GraduationCap, isReady: true },
  { label: 'Results', path: '/student/results', icon: Award, isReady: true },
  { label: 'Certs', path: '/student/certificates', icon: Medal, isReady: true },
  { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy, isReady: true },
];

export const MobileBottomNav = () => {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-soft-lg"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (!item.isReady) {
            return (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-300 dark:text-slate-700 cursor-not-allowed select-none"
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
