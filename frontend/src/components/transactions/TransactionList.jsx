import { formatDate } from '../../utils/dates';
import { signedCurrency } from '../../utils/format';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';

function amountClass(type) {
  return type === 'income'
    ? 'text-emerald-700 dark:text-emerald-400'
    : 'text-rose-700 dark:text-rose-400';
}

function Actions({ item, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.category} transaction`}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Icon name="edit" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(item)}
        aria-label={`Delete ${item.category} transaction`}
        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
      >
        <Icon name="trash" className="h-4 w-4" />
      </button>
    </div>
  );
}

function CategoryCell({ item }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800" aria-hidden="true">
        {item.categoryIcon || (item.type === 'income' ? '💰' : '📦')}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.category}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.note || '—'}</p>
      </div>
    </div>
  );
}

export default function TransactionList({ items = [], onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Category</th>
              <th scope="col" className="px-5 py-3 font-semibold">Date</th>
              <th scope="col" className="px-5 py-3 font-semibold">Account</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Amount</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <CategoryCell item={item} />
                    {item.isRecurring && <Badge tone="info">Repeat</Badge>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600 dark:text-slate-300">{formatDate(item.date)}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{item.account?.name || '—'}</td>
                <td className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${amountClass(item.type)}`}>
                  {signedCurrency(item.type, item.amount)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <Actions item={item} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-200 md:hidden dark:divide-slate-800">
        {items.map((item) => (
          <li key={item.id} className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <CategoryCell item={item} />
              <span className={`ml-auto whitespace-nowrap text-sm font-semibold ${amountClass(item.type)}`}>
                {signedCurrency(item.type, item.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 pl-12">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(item.date)} · {item.account?.name || '—'}
              </span>
              <Actions item={item} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
