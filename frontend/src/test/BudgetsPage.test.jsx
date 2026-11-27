import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BudgetsPage from '../pages/BudgetsPage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  categoryList: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../api/budgets', () => ({
  budgetsApi: { list: mocks.list, set: mocks.set, remove: mocks.remove },
}));

vi.mock('../api/categories', () => ({ categoriesApi: { list: mocks.categoryList } }));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error, info: vi.fn(), warning: vi.fn() }),
}));

const budgetData = {
  month: '2026-11',
  totalSpent: 40,
  overall: {
    id: 'budget-1',
    month: '2026-11',
    category: null,
    amount: 100,
    spent: 40,
    remaining: 60,
    percentUsed: 40,
    level: 'ok',
    inherited: false,
    message: 'You have used 40% of your November budget.',
  },
  categories: [],
};

describe('BudgetsPage', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.list.mockResolvedValue(budgetData);
    mocks.categoryList.mockResolvedValue({
      expense: [{ name: 'Food', icon: '🍔', type: 'expense', custom: false }],
      income: [],
    });
  });

  it('renders live budget progress and messages', async () => {
    render(<BudgetsPage />);

    expect(await screen.findByText('You have used 40% of your November budget.')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /\$40.00 of \$100.00/ })).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
    expect(screen.getByRole('button', { name: 'Edit Overall budget budget' })).toBeInTheDocument();
  });

  it('saves a category budget with the selected scope', async () => {
    const user = userEvent.setup();
    mocks.set.mockResolvedValue({ id: 'budget-2' });
    render(<BudgetsPage />);

    await user.click((await screen.findAllByRole('button', { name: /set budget/i }))[0]);
    const dialog = screen.getByRole('dialog');

    await user.selectOptions(within(dialog).getByLabelText(/^category/i), 'Food');
    await user.type(within(dialog).getByLabelText(/monthly limit/i), '75');
    await user.click(within(dialog).getByRole('button', { name: /set budget/i }));

    await vi.waitFor(() =>
      expect(mocks.set).toHaveBeenCalledWith({
        month: expect.stringMatching(/^\d{4}-\d{2}$/),
        category: 'Food',
        amount: 75,
      }),
    );
  });

  it('shows an empty state when no budgets exist', async () => {
    mocks.list.mockResolvedValue({ ...budgetData, overall: null, categories: [] });
    render(<BudgetsPage />);

    expect(await screen.findByText('No budgets set')).toBeInTheDocument();
  });
});
