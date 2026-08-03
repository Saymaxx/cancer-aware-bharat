import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HospitalAuthPage from './HospitalAuthPage';

vi.mock('../api/client', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  loginHospital: vi.fn(),
  setHospitalSession: vi.fn(),
}));

import { loginHospital, setHospitalSession } from '../api/client';

function renderWithDashboardRoute() {
  return render(
    <MemoryRouter initialEntries={['/hospital/login']}>
      <Routes>
        <Route path="/hospital/login" element={<HospitalAuthPage />} />
        <Route path="/hospital/dashboard" element={<div>Hospital Dashboard Route</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HospitalAuthPage login form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in, stores the session, and redirects to the dashboard on success', async () => {
    vi.mocked(loginHospital).mockResolvedValue({
      accessToken: 'hosp-access-token',
      tokenType: 'bearer',
      role: 'hospital',
      name: 'Apex Oncology Centre',
    });

    const user = userEvent.setup();
    renderWithDashboardRoute();

    // Neither login input has an htmlFor/id association in the markup, so
    // there's nothing for getByLabelText to match against -- placeholder
    // text is the only reliable, stable selector here.
    await user.type(screen.getByPlaceholderText(/rgci@awarebharat\.org/i), 'apex@awarebharat.local');
    await user.type(screen.getByPlaceholderText('••••••••'), 'ChangeMe123!');
    await user.click(screen.getByRole('button', { name: /access hospital dashboard/i }));

    expect(loginHospital).toHaveBeenCalledWith('apex@awarebharat.local', 'ChangeMe123!');
    expect(setHospitalSession).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Apex Oncology Centre', accessToken: 'hosp-access-token' })
    );
    // Login navigates immediately (no artificial delay, unlike
    // VolunteerAuthPage), so the destination route should already be
    // reachable once the mocked promise chain resolves.
    expect(await screen.findByText('Hospital Dashboard Route')).toBeInTheDocument();
  });

  it('shows the server error and never stores a session on invalid credentials', async () => {
    const { ApiError } = await import('../api/client');
    vi.mocked(loginHospital).mockRejectedValue(new ApiError(401, 'Invalid email or password'));

    const user = userEvent.setup();
    renderWithDashboardRoute();

    await user.type(screen.getByPlaceholderText(/rgci@awarebharat\.org/i), 'wrong@awarebharat.local');
    await user.type(screen.getByPlaceholderText('••••••••'), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /access hospital dashboard/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(setHospitalSession).not.toHaveBeenCalled();
    expect(screen.queryByText('Hospital Dashboard Route')).not.toBeInTheDocument();
  });
});
