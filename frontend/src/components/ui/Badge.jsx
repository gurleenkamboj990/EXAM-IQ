import React from 'react';

const VARIANTS = {
  primary:
    'bg-primary-50 text-primary-700 border-primary-200/80 dark:bg-primary-950/60 dark:text-primary-300 dark:border-primary-800/60',
  brand:
    'bg-brand-50 text-brand-700 border-brand-200/80 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/60',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  emerald:
    'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  amber:
    'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  danger:
    'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  neutral:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
};

const DOT_COLORS = {
  primary: 'bg-primary-500',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  emerald: 'bg-emerald-500',
  warning: 'bg-amber-500',
  amber: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5 font-medium',
  md: 'text-xs px-2.5 py-1 font-semibold',
};

export const Badge = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;
  const dotColorClass = DOT_COLORS[variant] || DOT_COLORS.neutral;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />}
      {children}
    </span>
  );
};

export default Badge;

