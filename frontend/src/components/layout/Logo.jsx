import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 rounded-xl" aria-label="Expense Tracker home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white shadow-sm dark:bg-teal-600">
        ET
      </span>
      {!compact && (
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Expense Tracker
        </span>
      )}
    </Link>
  );
}
