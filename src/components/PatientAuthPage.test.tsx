import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientAuthPage from './PatientAuthPage';

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
  loginPatient: vi.fn(),
  registerPatient: vi.fn(),
  verifyPatientEmail: vi.fn(),
  requestPatientPasswordReset: vi.fn(),
  resetPatientPassword: vi.fn(),
  setPatientSession: vi.fn(),
}));

import {
  loginPatient, registerPatient, verifyPatientEmail, setPatientSession,
} from '../api/client';

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientAuthPage />
    </MemoryRouter>
  );
}

function getRegisterSubmitButton() {
  const form = document.querySelector('form') as HTMLFormElement;
  // Scoped to the <form> because the tab switcher above it also has a
  // button whose accessible name is exactly "Create Account".
  return within(form).getByRole('button', { name: /^create account$/i });
}

function getLoginSubmitButton() {
  const form = document.querySelector('form') as HTMLFormElement;
  // Scoped to the <form> because the tab switcher above it also has a
  // button whose accessible name is exactly "Sign In".
  return within(form).getByRole('button', { name: /^sign in$/i });
}

function renderPageWithDashboardRoute() {
  return render(
    <MemoryRouter initialEntries={['/patient/login']}>
      <Routes>
        <Route path="/patient/login" element={<PatientAuthPage />} />
        <Route path="/patient/dashboard" element={<div>Patient Dashboard Route</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PatientAuthPage login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in, stores the session, and redirects to the dashboard on success', async () => {
    vi.mocked(loginPatient).mockResolvedValue({
      accessToken: 'patient-access-token',
      tokenType: 'bearer',
      role: 'patient',
      name: 'Sunita Devi',
    });

    const user = userEvent.setup();
    renderPageWithDashboardRoute();

    await user.type(screen.getByLabelText(/email address/i), 'sunita@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'CorrectPass123');
    await user.click(getLoginSubmitButton());

    expect(await screen.findByText(/welcome, sunita devi/i)).toBeInTheDocument();
    expect(loginPatient).toHaveBeenCalledWith('sunita@example.com', 'CorrectPass123');
    expect(setPatientSession).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Sunita Devi', email: 'sunita@example.com', accessToken: 'patient-access-token' })
    );

    // Redirects 1200ms after the success screen renders (see the
    // submitSuccess useEffect) -- wait past it for the real navigation
    // rather than asserting on the delay itself.
    expect(await screen.findByText('Patient Dashboard Route', {}, { timeout: 2500 })).toBeInTheDocument();
  });

  it('shows the server error and never stores a session on invalid credentials', async () => {
    const { ApiError } = await import('../api/client');
    vi.mocked(loginPatient).mockRejectedValue(new ApiError(401, 'Invalid email or password'));

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword');
    await user.click(getLoginSubmitButton());

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(setPatientSession).not.toHaveBeenCalled();
  });
});

describe('PatientAuthPage registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and never calls the API when passwords do not match', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await user.type(await screen.findByLabelText(/full name/i), 'New Patient');
    await user.type(screen.getByLabelText(/^email/i), 'new.patient@example.com');
    await user.type(screen.getByLabelText(/^phone/i), '9876543210');
    await user.type(screen.getByLabelText(/^password/i), 'CorrectPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass456');
    await user.click(screen.getByLabelText(/agree to the/i));

    await user.click(getRegisterSubmitButton());

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(registerPatient).not.toHaveBeenCalled();
  }, 10000);

  it('registers successfully and switches to the email verification step', async () => {
    vi.mocked(registerPatient).mockResolvedValue({
      id: 'pat-1',
      name: 'New Patient',
      email: 'new.patient@example.com',
      phone: '9876543210',
      createdAt: '2026-01-01T00:00:00Z',
    } as never);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await user.type(await screen.findByLabelText(/full name/i), 'New Patient');
    await user.type(screen.getByLabelText(/^email/i), 'new.patient@example.com');
    await user.type(screen.getByLabelText(/^phone/i), '9876543210');
    await user.type(screen.getByLabelText(/^password/i), 'CorrectPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'CorrectPass123');
    await user.click(screen.getByLabelText(/agree to the/i));

    await user.click(getRegisterSubmitButton());

    expect(registerPatient).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Patient', email: 'new.patient@example.com', phone: '9876543210' })
    );
    expect(await screen.findByText(/verify your email/i)).toBeInTheDocument();
    expect(screen.getByText('new.patient@example.com')).toBeInTheDocument();
  }, 10000);
});

describe('PatientAuthPage email verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies the OTP, stores the session, and shows the welcome screen', async () => {
    vi.mocked(registerPatient).mockResolvedValue({
      id: 'pat-1',
      name: 'New Patient',
      email: 'new.patient@example.com',
      phone: '9876543210',
      createdAt: '2026-01-01T00:00:00Z',
    } as never);
    vi.mocked(verifyPatientEmail).mockResolvedValue({
      accessToken: 'verified-access-token',
      tokenType: 'bearer',
      role: 'patient',
      name: 'New Patient',
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /create account/i }));
    await user.type(await screen.findByLabelText(/full name/i), 'New Patient');
    await user.type(screen.getByLabelText(/^email/i), 'new.patient@example.com');
    await user.type(screen.getByLabelText(/^phone/i), '9876543210');
    await user.type(screen.getByLabelText(/^password/i), 'CorrectPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'CorrectPass123');
    await user.click(screen.getByLabelText(/agree to the/i));
    await user.click(getRegisterSubmitButton());

    await user.type(await screen.findByLabelText(/verification code/i), '123456');
    await user.click(screen.getByRole('button', { name: /verify & continue/i }));

    expect(verifyPatientEmail).toHaveBeenCalledWith('new.patient@example.com', '123456');
    expect(await screen.findByText(/welcome, new patient/i)).toBeInTheDocument();
    expect(setPatientSession).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Patient', accessToken: 'verified-access-token' })
    );
  }, 10000);
});
