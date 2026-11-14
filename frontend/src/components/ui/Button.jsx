import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 focus:ring-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500',
  indigo:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/20 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-500',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
  outline:
    'border border-slate-300 hover:bg-slate-100/80 text-slate-700 focus:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800/60',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-3 text-base font-semibold rounded-xl gap-2.5',
};

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const sizeClasses = SIZES[size] || SIZES.md;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98] ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : LeftIcon ? (
          <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : null}
        
        <span>{children}</span>

        {!isLoading && RightIcon && (
          <RightIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

