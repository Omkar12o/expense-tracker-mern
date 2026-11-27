import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import Pagination from '../components/ui/Pagination';
import TransactionDialogs from '../components/transactions/TransactionDialogs';
import TransactionList from '../components/transactions/TransactionList';
import TransactionSummary from '../components/transactions/TransactionSummary';
import TransactionsToolbar from '../components/transactions/TransactionsToolbar';
import { useTransactionsController } from '../hooks/useTransactionsController';

export default function TransactionsPage() {
  const page = useTransactionsController();
  const {
    filters,
    update,
    reset,
    params,
    list,
    meta,
    formOpen,
    setFormOpen,
    editing,
    formError,
    saving,
    deleting,
    setDeleting,
    deleteBusy,
    exporting,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    handleExport,
    retry,
  } = page;

  const header = (
    <PageHeader
      eyebrow="Money movement"
      title="Transactions"
      description="Add, filter and export your income and expenses."
      actions={
        <Button onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Add transaction
        </Button>
      }
    />
  );

  if (list.loading || meta.loading) {
    return (
      <>
        {header}
        <Card><CardBody><LoadingState rows={6} /></CardBody></Card>
      </>
    );
  }

  if (list.error || meta.error) {
    return (
      <>
        {header}
        <Card>
          <CardBody>
            <ErrorState
              title="Transactions unavailable"
              message={list.error || meta.error}
              onRetry={retry}
            />
          </CardBody>
        </Card>
      </>
    );
  }

  const items = list.data?.data || [];
  const filtersActive = Object.keys(params).some((key) => !['page', 'limit'].includes(key));

  return (
    <>
      {header}
      <div className="space-y-6">
        <TransactionsToolbar
          filters={filters}
          update={update}
          reset={reset}
          categories={meta.data?.categories}
          accounts={meta.data?.accounts || []}
          onExport={handleExport}
          exporting={exporting}
        />

        <TransactionSummary summary={list.data?.summary} />

        <Card>
          <CardHeader
            title="Transaction history"
            description={`${list.data?.pagination?.total || 0} matching records`}
          />
          <CardBody className="p-0">
            {items.length === 0 ? (
              <EmptyState
                icon={filtersActive ? '🔍' : '🧾'}
                title={filtersActive ? 'No matching transactions' : 'No transactions yet'}
                description={
                  filtersActive
                    ? 'Try changing or clearing your filters.'
                    : 'Add your first income or expense to get started.'
                }
                actionLabel={filtersActive ? 'Clear filters' : 'Add transaction'}
                onAction={filtersActive ? reset : openCreate}
              />
            ) : (
              <TransactionList items={items} onEdit={openEdit} onDelete={setDeleting} />
            )}
          </CardBody>
          {items.length > 0 && (
            <CardBody className="border-t border-slate-200 dark:border-slate-800">
              <Pagination
                page={list.data?.pagination?.page || 1}
                pages={list.data?.pagination?.pages || 0}
                total={list.data?.pagination?.total || 0}
                onPage={(nextPage) => update('page', nextPage)}
              />
            </CardBody>
          )}
        </Card>
      </div>

      <TransactionDialogs
        formOpen={formOpen}
        editing={editing}
        accounts={meta.data?.accounts || []}
        categories={meta.data?.categories}
        formError={formError}
        saving={saving}
        onSubmit={handleSubmit}
        onCloseForm={() => setFormOpen(false)}
        deleting={deleting}
        deleteBusy={deleteBusy}
        onConfirmDelete={handleDelete}
        onCloseDelete={() => setDeleting(null)}
      />
    </>
  );
}
