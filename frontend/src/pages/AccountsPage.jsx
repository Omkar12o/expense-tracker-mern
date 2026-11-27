import AccountDialogs from '../components/accounts/AccountDialogs';
import AccountList from '../components/accounts/AccountList';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import { useAccountsController } from '../hooks/useAccountsController';
import { currency } from '../utils/format';

export default function AccountsPage() {
  const page = useAccountsController();
  const {
    list,
    formOpen,
    setFormOpen,
    editing,
    formError,
    saving,
    deleting,
    setDeleting,
    deleteBusy,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
  } = page;

  const header = (
    <PageHeader
      eyebrow="Money sources"
      title="Accounts"
      description="Keep cash, bank and card balances in one place."
      actions={
        <Button onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Add account
        </Button>
      }
    />
  );

  if (list.loading) {
    return (
      <>
        {header}
        <Card><CardBody><LoadingState rows={4} /></CardBody></Card>
      </>
    );
  }

  if (list.error) {
    return (
      <>
        {header}
        <Card>
          <CardBody>
            <ErrorState title="Accounts unavailable" message={list.error} onRetry={list.refetch} />
          </CardBody>
        </Card>
      </>
    );
  }

  const items = list.data?.data?.items || [];
  const total = list.data?.data?.total || 0;

  return (
    <>
      {header}
      <div className="space-y-6">
        <Card>
          <CardBody className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Combined balance
              </p>
              <p className="mt-1 truncate text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currency(total)}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {items.length} {items.length === 1 ? 'account' : 'accounts'}
            </p>
          </CardBody>
        </Card>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon="👛"
              title="No accounts yet"
              description="Add an account to organise your transactions."
              actionLabel="Add account"
              onAction={openCreate}
            />
          </Card>
        ) : (
          <AccountList items={items} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </div>

      <AccountDialogs
        formOpen={formOpen}
        editing={editing}
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
