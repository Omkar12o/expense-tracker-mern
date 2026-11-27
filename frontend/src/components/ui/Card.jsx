export function Card({ as: Component = 'section', className = '', children, ...props }) {
  return (
    <Component
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 ${className}`}
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return (
    <div
      className={`border-t border-slate-200 p-5 dark:border-slate-800 ${className}`}
    >
      {children}
    </div>
  );
}
