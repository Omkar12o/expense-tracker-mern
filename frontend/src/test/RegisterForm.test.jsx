import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterForm from '../components/auth/RegisterForm';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: mocks.register }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error, info: vi.fn(), warning: vi.fn() }),
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    mocks.register.mockReset();
    mocks.success.mockReset();
    mocks.error.mockReset();
  });

  it('requires a valid username', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Use 3-30 letters, numbers or underscores.')).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('submits the username with the account details', async () => {
    mocks.register.mockResolvedValue({ token: 'token', user: {} });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/username/i), ' Test_User ');
    await user.type(screen.getByLabelText(/email address/i), 'User@Example.COM');
    await user.type(screen.getByLabelText(/^password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mocks.register).toHaveBeenCalledWith({
      name: 'Test User',
      username: 'test_user',
      email: 'user@example.com',
      password: 'Password123!',
    });
  });
});
