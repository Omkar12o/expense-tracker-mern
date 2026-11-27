import { useId } from 'react';

export function Field({ id, label, hint, error, required, children, className = '' }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {typeof children === 'function' ? children({ fieldId, describedBy }) : children}
      {hint && (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-rose-700 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ id, error, className = '', ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy = error ? `${inputId}-error` : undefined;

  return (
    <input
      id={inputId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
        error ? 'border-rose-500 dark:border-rose-500' : ''
      } ${className}`}
      {...props}
    />
  );
}

export function Select({ id, error, className = '', children, ...props }) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const describedBy = error ? `${selectId}-error` : undefined;

  return (
    <select
      id={selectId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
        error ? 'border-rose-500 dark:border-rose-500' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ id, error, className = '', ...props }) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const describedBy = error ? `${textareaId}-error` : undefined;

  return (
    <textarea
      id={textareaId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
        error ? 'border-rose-500 dark:border-rose-500' : ''
      } ${className}`}
      {...props}
    />
  );
}
