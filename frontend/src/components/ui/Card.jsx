import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-soft transition-all duration-200 ${
        hoverable ? 'hover:shadow-soft-md hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', action, ...props }) => {
  return (
    <div
      className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      <div className="space-y-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => {
  return (
    <Component
      className={`text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div className={`${noPadding ? '' : 'p-6'} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

