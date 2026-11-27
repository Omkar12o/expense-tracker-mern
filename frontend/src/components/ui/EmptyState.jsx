import Button from './Button';

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description = 'Once you add data, it will appear here.',
  actionLabel,
  onAction,
  to,
}) {
  const hasAction = Boolean(actionLabel && (onAction || to));

  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {hasAction && (
        <div className="mt-5">
          {to ? (
            <Button as="link" to={to}>
              {actionLabel}
            </Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
