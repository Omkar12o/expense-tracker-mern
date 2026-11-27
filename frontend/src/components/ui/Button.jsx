import { Link } from 'react-router-dom';

const variants = {
  primary:
    'bg-teal-700 text-white shadow-sm hover:bg-teal-800 active:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost:
    'text-slate-700 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-800',
  danger:
    'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 dark:bg-rose-600 dark:hover:bg-rose-500',
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'h-11 w-11 justify-center',
};

export default function Button({
  as = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  const Component = as === 'link' ? Link : as;
  const isButton = as === 'button';
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={classes}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  );
}
