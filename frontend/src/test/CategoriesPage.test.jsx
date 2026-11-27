import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoriesPage from '../pages/CategoriesPage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../api/categories', () => ({
  categoriesApi: { list: mocks.list, create: mocks.create, remove: mocks.remove },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error, info: vi.fn(), warning: vi.fn() }),
}));

const categories = {
  expense: [
    { name: 'Food', icon: '🍔', type: 'expense', custom: false, builtIn: true },
    { id: 'cat-1', name: 'Coffee', icon: '☕', type: 'expense', custom: true, builtIn: false },
  ],
  income: [
    { name: 'Salary', icon: '💼', type: 'income', custom: false, builtIn: true },
  ],
};

describe('CategoriesPage', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.list.mockResolvedValue(categories);
  });

  it('renders built-in and custom categories with delete actions', async () => {
    render(<CategoriesPage />);

    expect(await screen.findByText('Food')).toBeInTheDocument();
    expect(screen.getAllByText('Coffee').length).toBeGreaterThan(0);
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Coffee category' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete Food category' })).not.toBeInTheDocument();
  });

  it('adds a custom category with the selected type', async () => {
    const user = userEvent.setup();
    mocks.create.mockResolvedValue({ id: 'cat-2' });
    render(<CategoriesPage />);

    await user.click((await screen.findAllByRole('button', { name: /add category/i }))[0]);
    const dialog = screen.getByRole('dialog');

    await user.type(within(dialog).getByLabelText(/category name/i), 'Transport');
    await user.selectOptions(within(dialog).getByLabelText(/^type/i), 'expense');
    await user.clear(within(dialog).getByLabelText(/^icon/i));
    await user.type(within(dialog).getByLabelText(/^icon/i), '🚕');
    await user.click(within(dialog).getByRole('button', { name: /add category/i }));

    await vi.waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith({
        name: 'Transport',
        type: 'expense',
        icon: '🚕',
      }),
    );
  });

  it('shows an empty state when no custom categories exist', async () => {
    mocks.list.mockResolvedValue({
      expense: categories.expense.filter((item) => !item.custom),
      income: categories.income,
    });
    render(<CategoriesPage />);

    expect((await screen.findAllByText(/No custom categories/)).length).toBeGreaterThan(0);
  });
});
