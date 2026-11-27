import { Link } from 'react-router-dom';

export default function Logo({ compact = false, inverse = false }) {
  const markClass = inverse
    ? 'bg-white/15 text-white ring-1 ring-white/25'
    : 'bg-teal-700 text-white shadow-sm dark:bg-teal-600';
  const textClass = inverse ? 'text-white' : 'text-slate-900 dark:text-slate-100';

  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-2.5 rounded-xl focus-visible:ring-offset-0"
      aria-label="Expense Tracker home"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${markClass}`}>
        ET
      </span>
      {!compact && (
        <span className={`text-base font-bold tracking-tight ${textClass}`}>Expense Tracker</span>
      )}
    </Link>
  );
}
