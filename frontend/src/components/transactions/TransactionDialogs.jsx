import ConfirmDialog from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import TransactionForm from './TransactionForm';

export default function TransactionDialogs({
  formOpen,
  editing,
  accounts,
  categories,
  formError,
  saving,
  onSubmit,
  onCloseForm,
  deleting,
  deleteBusy,
  onConfirmDelete,
  onCloseDelete,
}) {
  return (
    <>
      <Modal
        open={formOpen}
        onClose={onCloseForm}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        description="All amounts are stored with two decimal places."
        size="lg"
      >
        <TransactionForm
          key={editing?.id || 'new'}
          initial={editing}
          accounts={accounts}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={onCloseForm}
          submitting={saving}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this transaction?"
        description={`${deleting?.category || 'This record'} will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        loading={deleteBusy}
        onConfirm={onConfirmDelete}
        onClose={onCloseDelete}
      />
    </>
  );
}
