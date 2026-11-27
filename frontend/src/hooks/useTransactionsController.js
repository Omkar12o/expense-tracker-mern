import { useState } from 'react';
import { accountsApi } from '../api/accounts';
import { categoriesApi } from '../api/categories';
import { errorMessage } from '../api/client';
import { transactionsApi } from '../api/transactions';
import { useToast } from '../context/ToastContext';
import { useFetch } from './useFetch';
import { useTransactionFilters } from './useTransactionFilters';

export function useTransactionsController() {
  const toast = useToast();
  const { filters, update, reset, params } = useTransactionFilters();
  const list = useFetch(() => transactionsApi.list(params), [
    params.page,
    params.limit,
    params.type,
    params.category,
    params.account,
    params.from,
    params.to,
    params.minAmount,
    params.maxAmount,
    params.search,
    params.recurring,
  ]);
  const meta = useFetch(async () => {
    const [accounts, categories] = await Promise.all([accountsApi.list(), categoriesApi.list()]);
    return { accounts: accounts.data, total: accounts.total, categories };
  }, []);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setFormError('');
    setFormOpen(true);
  };

  async function handleSubmit(payload) {
    setSaving(true);
    setFormError('');
    try {
      const result = editing
        ? await transactionsApi.update(editing.id, payload)
        : await transactionsApi.create(payload);
      toast.success(editing ? 'Transaction updated' : 'Transaction added');

      const alerts = (result.budgetAlerts || []).filter((item) => item.level !== 'ok');
      if (alerts.length > 0) {
        toast.warning('Budget alert', alerts.map((item) => item.message).join(' '), {
          duration: 8000,
        });
      }

      setFormOpen(false);
      setEditing(null);
      list.refetch();
      meta.refetch();
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error('Could not save transaction', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await transactionsApi.remove(deleting.id);
      toast.success('Transaction deleted');
      setDeleting(null);
      list.refetch();
      meta.refetch();
    } catch (error) {
      toast.error('Could not delete transaction', errorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { blob, filename } = await transactionsApi.exportCsv(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Export ready', 'Your CSV download has started.');
    } catch (error) {
      toast.error('Export failed', errorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  const retry = () => {
    list.refetch();
    meta.refetch();
  };

  return {
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
  };
}
