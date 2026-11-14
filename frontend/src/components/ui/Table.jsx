import React from 'react';

export const Table = ({ children, className = '', containerClassName = '' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 ${containerClassName}`}>
      <table className={`w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className={`bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', isClickable = false, ...props }) => {
  return (
    <tr
      className={`transition-colors duration-150 ${
        isClickable
          ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
          : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/30'
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-5 py-3.5 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-5 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
};

export default Table;

