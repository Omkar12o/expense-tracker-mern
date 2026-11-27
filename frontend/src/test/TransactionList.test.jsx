import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionList from '../components/transactions/TransactionList';

const items = [
  {
    id: 'tx-1',
    type: 'expense',
    amount: 12.5,
    category: 'Food',
    categoryIcon: '🍔',
    date: '2026-11-27',
    note: 'Lunch',
    account: { id: 'acc-1', name: 'Cash' },
    isRecurring: true,
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 100,
    category: 'Salary',
    categoryIcon: '💼',
    date: '2026-11-26',
    note: '',
    account: { id: 'acc-2', name: 'Bank' },
    isRecurring: false,
  },
];

describe('TransactionList', () => {
  it('renders signed amounts, dates and accessible row actions', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TransactionList items={items} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getAllByText('-$12.50').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+$100.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('27 Nov 2026').length).toBeGreaterThan(0);
    expect(screen.getByText('Repeat')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Edit Food transaction' })[0]);
    expect(onEdit).toHaveBeenCalledWith(items[0]);

    await user.click(screen.getAllByRole('button', { name: 'Delete Salary transaction' })[0]);
    expect(onDelete).toHaveBeenCalledWith(items[1]);
  });
});
