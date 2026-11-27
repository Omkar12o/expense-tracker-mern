import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '../components/auth/LoginForm';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mocks.login }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error, info: vi.fn(), warning: vi.fn() }),
}));

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<p>Signed in page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.success.mockReset();
    mocks.error.mockReset();
  });

  it('shows inline validation errors and does not submit invalid input', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('submits normalised credentials and navigates on success', async () => {
    mocks.login.mockResolvedValue({ token: 'token', user: { name: 'Test' } });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText('you@example.com'), ' User@Example.COM ');
    await user.type(screen.getByPlaceholderText('Your password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Signed in page')).toBeInTheDocument();
    expect(mocks.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123!',
    });
    expect(mocks.success).toHaveBeenCalledWith('Welcome back', 'You are signed in.');
  });

  it('surfaces API errors without navigating', async () => {
    mocks.login.mockRejectedValue({ appError: { message: 'Invalid email or password.' } });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@example.com');
    await user.type(screen.getByPlaceholderText('Your password'), 'WrongPassword1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(mocks.error).toHaveBeenCalled();
    expect(screen.queryByText('Signed in page')).not.toBeInTheDocument();
  });
});
