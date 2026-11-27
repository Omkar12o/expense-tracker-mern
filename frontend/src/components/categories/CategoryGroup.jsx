import Badge from '../ui/Badge';
import Icon from '../ui/Icon';

function CategoryRow({ item, onDelete }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800"
        aria-hidden="true"
      >
        {item.icon || '📦'}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
        {item.name}
      </span>
      {item.builtIn ? (
        <Badge>Built-in</Badge>
      ) : (
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name} category`}
          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
        >
          <Icon name="trash" className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

export default function CategoryGroup({ title, items = [], onDelete }) {
  const custom = items.filter((item) => item.custom);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{custom.length} custom</p>
      </div>

      {custom.length === 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          No custom categories. Built-in options are ready to use.
        </p>
      )}

      <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
        {items.map((item) => (
          <CategoryRow key={item.id || item.name} item={item} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}
