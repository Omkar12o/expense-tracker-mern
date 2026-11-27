import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Field, Input, Select } from '../ui/Field';

export default function TransactionFilters({
  filters,
  update,
  reset,
  categories = { expense: [], income: [] },
  accounts = [],
  onExport,
  exporting = false,
}) {
  const categoryList = filters.type
    ? categories[filters.type] || []
    : [...(categories.expense || []), ...(categories.income || [])];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Search">
          {({ fieldId }) => (
            <div className="relative">
              <Input
                id={fieldId}
                type="search"
                placeholder="Note, category or amount"
                value={filters.search}
                onChange={(event) => update('search', event.target.value)}
                className="pl-10"
              />
              <Icon name="search" className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>
          )}
        </Field>

        <Field label="Type">
          {({ fieldId }) => (
            <Select id={fieldId} value={filters.type} onChange={(event) => update('type', event.target.value)}>
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          )}
        </Field>

        <Field label="Category">
          {({ fieldId }) => (
            <Select
              id={fieldId}
              value={filters.category}
              onChange={(event) => update('category', event.target.value)}
            >
              <option value="">All categories</option>
              {categoryList.map((item) => (
                <option key={`${item.type}:${item.name}`} value={item.name}>
                  {item.icon} {item.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Account">
          {({ fieldId }) => (
            <Select
              id={fieldId}
              value={filters.account}
              onChange={(event) => update('account', event.target.value)}
            >
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
          More filters
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="From date">
            {({ fieldId }) => (
              <Input id={fieldId} type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} />
            )}
          </Field>
          <Field label="To date">
            {({ fieldId }) => (
              <Input id={fieldId} type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} />
            )}
          </Field>
          <Field label="Min amount">
            {({ fieldId }) => (
              <Input id={fieldId} type="number" min="0" step="0.01" placeholder="0.00" value={filters.minAmount} onChange={(event) => update('minAmount', event.target.value)} />
            )}
          </Field>
          <Field label="Max amount">
            {({ fieldId }) => (
              <Input id={fieldId} type="number" min="0" step="0.01" placeholder="Any" value={filters.maxAmount} onChange={(event) => update('maxAmount', event.target.value)} />
            )}
          </Field>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={reset}>
          Clear filters
        </Button>
        <Button variant="secondary" size="sm" onClick={onExport} loading={exporting}>
          <Icon name="download" className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
