import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminAuthPage from './AdminAuthPage';

// Matches the real ApiError's (status, message) constructor order -- see
// the identical note in VolunteerAuthPage.test.tsx.
vi.mock('../api/client', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  loginStaff: vi.fn(),
  // The real setStaffSession writes to localStorage, and AdminAuthPage's
  // success screen reads straight back from localStorage rather than
  // trusting its own component state -- mocking this as a plain vi.fn()
  // with no implementation would leave localStorage empty and the success
  // branch would never render. Mirror the real side effect.
  setStaffSession: vi.fn((session: Record<string, unknown>) => {
    localStorage.setItem('aware_bharat_logged_in_staff', JSON.stringify(session));
  }),
}));

import { loginStaff, setStaffSession } from '../api/client';

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminAuthPage />
    </MemoryRouter>
  );
}

function renderPageWithDashboardRoutes() {
  return render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <Routes>
        <Route path="/admin/login" element={<AdminAuthPage />} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard Route</div>} />
        <Route path="/superadmin/dashboard" element={<div>Super Admin Dashboard Route</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminAuthPage admin login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in and shows the session-initialized screen with a working dashboard link', async () => {
    vi.mocked(loginStaff).mockResolvedValue({
      accessToken: 'admin-access-token',
      tokenType: 'bearer',
      role: 'admin',
      name: 'Dwarka Admin',
    });

    const user = userEvent.setup();
    renderPageWithDashboardRoutes();

    await user.type(screen.getByLabelText(/admin email address/i), 'dwarka@awarebharat.org');
    await user.type(screen.getByLabelText(/^password$/i), 'CorrectPass123');
    // Passcode field defaults to '12345', left as-is.
    await user.click(screen.getByRole('button', { name: /connect admin console/i }));

    expect(await screen.findByText(/admin session initialized/i)).toBeInTheDocument();
    expect(loginStaff).toHaveBeenCalledWith('dwarka@awarebharat.org', 'CorrectPass123');
    expect(setStaffSession).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin', email: 'dwarka@awarebharat.org', accessToken: 'admin-access-token' })
    );

    await user.click(screen.getByRole('button', { name: /go to admin dashboard/i }));
    expect(await screen.findByText('Admin Dashboard Route')).toBeInTheDocument();
  });

  it('rejects a superadmin account logging in through the admin tab without setting a session', async () => {
    vi.mocked(loginStaff).mockResolvedValue({
      accessToken: 'super-access-token',
      tokenType: 'bearer',
      role: 'superadmin',
      name: 'Board Member',
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/admin email address/i), 'board@awarebharat.org');
    await user.type(screen.getByLabelText(/^password$/i), 'CorrectPass123');
    await user.click(screen.getByRole('button', { name: /connect admin console/i }));

    expect(await screen.findByText(/not an admin account/i)).toBeInTheDocument();
    expect(setStaffSession).not.toHaveBeenCalled();
  });

  it('shows the server error on invalid credentials and never sets a session', async () => {
    const { ApiError } = await import('../api/client');
    vi.mocked(loginStaff).mockRejectedValue(new ApiError(401, 'Invalid email or password'));

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/admin email address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /connect admin console/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(setStaffSession).not.toHaveBeenCalled();
  });
});

describe('AdminAuthPage super admin login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('switches to the Super Admin tab and logs in with a working dashboard link', async () => {
    vi.mocked(loginStaff).mockResolvedValue({
      accessToken: 'super-access-token',
      tokenType: 'bearer',
      role: 'superadmin',
      name: 'Board Member',
    });

    const user = userEvent.setup();
    renderPageWithDashboardRoutes();

    await user.click(screen.getByRole('button', { name: /^super admin$/i }));

    // The tab switch animates in over ~200ms (see switchRole in
    // AdminAuthPage), so the Super Admin fields aren't in the DOM
    // immediately after the click -- wait for the first one.
    await user.type(await screen.findByLabelText(/super admin email/i), 'board@awarebharat.org');
    await user.type(screen.getByLabelText(/trust password/i), 'CorrectPass123');
    // MFA field defaults to '999999', left as-is.
    await user.click(screen.getByRole('button', { name: /initialize board node/i }));

    expect(await screen.findByText(/super admin node initialized/i)).toBeInTheDocument();
    expect(loginStaff).toHaveBeenCalledWith('board@awarebharat.org', 'CorrectPass123');
    expect(setStaffSession).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin', email: 'board@awarebharat.org' })
    );

    await user.click(screen.getByRole('button', { name: /go to super admin console/i }));
    expect(await screen.findByText('Super Admin Dashboard Route')).toBeInTheDocument();
  });

  it('rejects an admin account logging in through the Super Admin tab', async () => {
    vi.mocked(loginStaff).mockResolvedValue({
      accessToken: 'admin-access-token',
      tokenType: 'bearer',
      role: 'admin',
      name: 'Dwarka Admin',
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /^super admin$/i }));
    await user.type(await screen.findByLabelText(/super admin email/i), 'dwarka@awarebharat.org');
    await user.type(screen.getByLabelText(/trust password/i), 'CorrectPass123');
    await user.click(screen.getByRole('button', { name: /initialize board node/i }));

    expect(await screen.findByText(/not a super admin account/i)).toBeInTheDocument();
    expect(setStaffSession).not.toHaveBeenCalled();
  });
});
