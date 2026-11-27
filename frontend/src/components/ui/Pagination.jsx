function pageList(page, pages) {
  if (pages <= 5) return Array.from({ length: pages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, 4, '…', pages];
  if (page >= pages - 2) return [1, '…', pages - 3, pages - 2, pages - 1, pages];
  return [1, '…', page - 1, page, page + 1, '…', pages];
}

export default function Pagination({ page = 1, pages = 0, total = 0, onPage }) {
  if (pages <= 1) return null;
  const items = pageList(page, pages);

  return (
    <nav className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between" aria-label="Pagination">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page {page} of {pages} · {total} results
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="min-h-11 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ← Previous
        </button>
        {items.map((item, index) =>
          item === '…' ? (
            <span key={`gap-${index}`} className="px-2 text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`min-h-11 min-w-11 rounded-xl px-3 text-sm font-semibold ${
                item === page
                  ? 'bg-teal-700 text-white dark:bg-teal-600'
                  : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className="min-h-11 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Next →
        </button>
      </div>
    </nav>
  );
}
