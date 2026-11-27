import ConfirmDialog from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import AccountForm from './AccountForm';

export default function AccountDialogs({
  formOpen,
  editing,
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
        title={editing ? 'Edit account' : 'Add account'}
        description="Keep your balances accurate as you record transactions."
      >
        <AccountForm
          key={editing?.id || 'new'}
          initial={editing}
          onSubmit={onSubmit}
          onCancel={onCloseForm}
          submitting={saving}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this account?"
        description={`${deleting?.name || 'This account'} can only be deleted when it has no transactions.`}
        confirmLabel="Delete"
        destructive
        loading={deleteBusy}
        onConfirm={onConfirmDelete}
        onClose={onCloseDelete}
      />
    </>
  );
}
