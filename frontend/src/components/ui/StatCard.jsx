import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  FileCheck,
  Award,
  Activity,
  FileText,
  GraduationCap,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const ICON_MAP = {
  Users,
  FileCheck,
  Award,
  Activity,
  FileText,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
};

const COLOR_MAP = {
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-950/60',
    text: 'text-brand-600 dark:text-brand-400',
    border: 'border-brand-100 dark:border-brand-900/40',
  },
  indigo: {
    bg: 'bg-primary-50 dark:bg-primary-950/60',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-100 dark:border-primary-900/40',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/40',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/40',
  },
};

export const StatCard = ({
  title,
  value,
  change,
  trend = 'neutral',
  description,
  icon: IconProp,
  iconName,
  color = 'brand',
  className = '',
}) => {
  const Icon = IconProp || (iconName && ICON_MAP[iconName]) || Activity;
  const colorScheme = COLOR_MAP[color] || COLOR_MAP.brand;

  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft transition-all duration-200 hover:shadow-soft-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}
        >
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>

      {(change || description) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md ${
                isUp
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : isDown
                  ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isUp && <TrendingUp className="w-3.5 h-3.5" />}
              {isDown && <TrendingDown className="w-3.5 h-3.5" />}
              {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}

          {description && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;

