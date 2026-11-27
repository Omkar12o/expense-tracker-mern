import Icon from '../ui/Icon';

const tones = {
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

export default function StatCard({ label, value, hint, icon, tone = 'teal' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {hint && <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        <span className={`rounded-xl p-2.5 ${tones[tone] || tones.teal}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
