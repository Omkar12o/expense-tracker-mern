import { useState } from 'react';
import { accountsApi } from '../api/accounts';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useFetch } from './useFetch';

export function useAccountsController() {
  const toast = useToast();
  const list = useFetch(() => accountsApi.list(), []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setFormError('');
    setFormOpen(true);
  };

  async function handleSubmit(payload) {
    setSaving(true);
    setFormError('');
    try {
      if (editing) await accountsApi.update(editing.id, payload);
      else await accountsApi.create(payload);
      toast.success(editing ? 'Account updated' : 'Account added');
      setFormOpen(false);
      setEditing(null);
      list.refetch();
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error('Could not save account', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await accountsApi.remove(deleting.id);
      toast.success('Account deleted');
      setDeleting(null);
      list.refetch();
    } catch (error) {
      toast.error('Could not delete account', errorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  return {
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
  };
}
