const variants = {
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-100',
    icon: 'ℹ️',
    role: 'status',
  },
  success: {
    wrapper:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100',
    icon: '✅',
    role: 'status',
  },
  warning: {
    wrapper:
      'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-100',
    icon: '⚠️',
    role: 'status',
  },
  error: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-100',
    icon: '⛔',
    role: 'alert',
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) {
  const config = variants[variant] || variants.info;

  return (
    <div
      role={config.role}
      className={`flex gap-3 rounded-xl border p-4 text-sm ${config.wrapper} ${className}`}
    >
      <span aria-hidden="true" className="shrink-0 text-base leading-none">
        {config.icon}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-m-1 shrink-0 rounded-lg px-2 text-lg leading-none hover:bg-black/5 dark:hover:bg-white/10"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
