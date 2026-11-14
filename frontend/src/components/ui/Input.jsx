import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      type = 'text',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      rightElement,
      className = '',
      inputClassName = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <LeftIcon className="w-4 h-4" aria-hidden="true" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full rounded-lg text-sm bg-white dark:bg-slate-900 border transition-colors duration-150 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed ${
              LeftIcon ? 'pl-9' : 'pl-3.5'
            } ${RightIcon || rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            } ${inputClassName}`}
            {...props}
          />

          {rightElement ? (
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">{rightElement}</div>
          ) : RightIcon ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <RightIcon className="w-4 h-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>

        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

