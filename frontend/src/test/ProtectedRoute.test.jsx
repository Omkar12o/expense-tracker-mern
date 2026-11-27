import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from '../routes/ProtectedRoute';

const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }));

vi.mock('../context/AuthContext', () => ({ useAuth: mockAuth }));

function renderRoute(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
          <Route path="/transactions" element={<p>Transactions page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it('shows a loading state while the session is checked', () => {
    mockAuth.mockReturnValue({ token: null, loading: true });
    renderRoute();
    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login and remembers the route', () => {
    mockAuth.mockReturnValue({ token: null, loading: false });
    renderRoute('/transactions');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the requested page for authenticated users', () => {
    mockAuth.mockReturnValue({ token: 'token', loading: false });
    renderRoute();
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });
});
