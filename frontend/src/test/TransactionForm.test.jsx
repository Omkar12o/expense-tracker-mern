import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransactionForm from '../components/transactions/TransactionForm';

const accounts = [{ id: 'acc-1', name: 'Cash', balance: 100 }];
const categories = {
  expense: [{ name: 'Food', icon: '🍔', type: 'expense' }],
  income: [{ name: 'Salary', icon: '💼', type: 'income' }],
};

const onSubmit = vi.fn();

function renderForm(props = {}) {
  return render(
    <MemoryRouter>
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('TransactionForm', () => {
  beforeEach(() => onSubmit.mockReset());

  it('blocks invalid submissions with inline errors', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(await screen.findByText('Enter an amount greater than zero.')).toBeInTheDocument();
    expect(screen.getByText('Choose a category.')).toBeInTheDocument();
    expect(screen.getByText('Choose an account.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('builds a clean API payload from valid input', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/amount/i), '12.345');
    await user.selectOptions(screen.getByLabelText(/^category/i), 'Food');
    await user.selectOptions(screen.getByLabelText(/^account/i), 'acc-1');
    await user.type(screen.getByLabelText(/receipt link/i), 'https://example.com/receipt.png');
    await user.type(screen.getByLabelText(/^note/i), '  <b>Lunch</b>  ');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        amount: 12.345,
        category: 'Food',
        account: 'acc-1',
        note: '<b>Lunch</b>',
        attachment: 'https://example.com/receipt.png',
        isRecurring: false,
        recurrence: null,
      }),
    );
  });

  it('reveals recurrence settings and includes them in the payload', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/amount/i), '25');
    await user.selectOptions(screen.getByLabelText(/^category/i), 'Food');
    await user.selectOptions(screen.getByLabelText(/^account/i), 'acc-1');
    await user.click(screen.getByRole('checkbox', { name: /repeat this transaction/i }));
    await user.selectOptions(await screen.findByLabelText(/frequency/i), 'weekly');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        isRecurring: true,
        recurrence: expect.objectContaining({ frequency: 'weekly' }),
      }),
    );
  });
});
