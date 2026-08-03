import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VolunteerAuthPage from './VolunteerAuthPage';

// Mock the real API layer so this test exercises only the client-side form
// guard -- it must assert the network call never happens, not just that an
// error message renders.
vi.mock('../api/client', () => ({
  // Matches the real ApiError's (status, message) constructor order --
  // TypeScript type-checks `new ApiError(...)` call sites against the real
  // class (statically imported below for types), so a mismatched mock
  // shape here would silently swap status/message in the thrown error.
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  loginVolunteer: vi.fn(),
  registerVolunteer: vi.fn(),
  getMyVolunteerProfile: vi.fn(),
  setVolunteerSession: vi.fn(),
}));

import { getMyVolunteerProfile, loginVolunteer, registerVolunteer, setVolunteerSession } from '../api/client';

function renderPage() {
  return render(
    <MemoryRouter>
      <VolunteerAuthPage />
    </MemoryRouter>
  );
}

// Registration route mounted alongside the login route so a redirect after
// a successful login is observable the same way a browser user would see
// it, rather than reaching into VolunteerAuthPage's internal navigate call.
function renderPageWithDashboardRoute() {
  return render(
    <MemoryRouter initialEntries={['/volunteer/login']}>
      <Routes>
        <Route path="/volunteer/login" element={<VolunteerAuthPage />} />
        <Route path="/volunteer/dashboard" element={<div>Volunteer Dashboard Route</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function getLoginSubmitButton() {
  const form = document.querySelector('form') as HTMLFormElement;
  // Scoped to the <form> because the tab switcher above it also has a
  // button whose accessible name is exactly "Sign In".
  return within(form).getByRole('button', { name: /sign in/i });
}

describe('VolunteerAuthPage registration form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and never calls the API when passwords do not match', async () => {
    const user = userEvent.setup();
    renderPage();
    // Default 5s test timeout is tight for six sequential user.type() calls
    // plus a real 200ms tab-switch animation delay, especially when the
    // full suite runs multiple test files concurrently -- bump it rather
    // than risk a flaky timeout under load.

    await user.click(screen.getByRole('button', { name: /create account/i }));

    // The register/login tab switch animates in over ~200ms (see
    // switchMode in VolunteerAuthPage), so the register fields aren't in
    // the DOM immediately after the click -- wait for the first one.
    // Label text includes a trailing required-field asterisk ("Email *"),
    // so match on the start of the string rather than an exact match.
    await user.type(await screen.findByLabelText(/full name/i), 'Test Volunteer');
    await user.type(screen.getByLabelText(/^email\b/i), 'test.volunteer@example.com');
    await user.type(screen.getByLabelText(/^phone\b/i), '9876543210');
    await user.type(screen.getByLabelText(/^city\b/i), 'Jaipur');
    await user.type(screen.getByLabelText(/^password\b/i), 'CorrectPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass456');

    await user.click(screen.getByRole('button', { name: /create volunteer account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(registerVolunteer).not.toHaveBeenCalled();
  }, 10000);
});

describe('VolunteerAuthPage login form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in, stores the session, and redirects to the dashboard on success', async () => {
    vi.mocked(loginVolunteer).mockResolvedValue({
      accessToken: 'test-access-token',
      tokenType: 'bearer',
      role: 'volunteer',
      name: 'Priya Sharma',
    });
    vi.mocked(getMyVolunteerProfile).mockResolvedValue({
      id: 'v-1',
      volunteerId: 'V-2026-001',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      area: 'New Delhi',
      availableDays: [],
      motivation: null,
      status: 'Approved',
      totalHours: 0,
      createdAt: '2026-01-01T00:00:00Z',
    });

    const user = userEvent.setup();
    renderPageWithDashboardRoute();

    await user.type(screen.getByLabelText(/email address/i), 'priya@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'CorrectPass123');
    await user.click(getLoginSubmitButton());

    expect(await screen.findByText(/welcome back!/i)).toBeInTheDocument();
    expect(loginVolunteer).toHaveBeenCalledWith('priya@example.com', 'CorrectPass123');
    expect(getMyVolunteerProfile).toHaveBeenCalledWith('test-access-token');
    expect(setVolunteerSession).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Priya Sharma', accessToken: 'test-access-token', volunteerId: 'V-2026-001' })
    );

    // Login redirects after a short delay (see VolunteerAuthPage's
    // useEffect) rather than immediately -- wait past it for the real
    // navigation rather than asserting on the delay itself.
    expect(await screen.findByText('Volunteer Dashboard Route', {}, { timeout: 2500 })).toBeInTheDocument();
  });

  it('shows the server error and never stores a session on invalid credentials', async () => {
    const { ApiError } = await import('../api/client');
    vi.mocked(loginVolunteer).mockRejectedValue(new ApiError(401, 'Invalid email or password'));

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword');
    await user.click(getLoginSubmitButton());

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(setVolunteerSession).not.toHaveBeenCalled();
    expect(getMyVolunteerProfile).not.toHaveBeenCalled();
  });

  // No test for "required field left empty" here: both inputs carry the
  // native HTML `required` attribute, which jsdom's own constraint
  // validation enforces on a synthetic submit the same way a real browser
  // would -- the submit event (and therefore handleLogin's own manual
  // check) never fires, so there's nothing for handleLogin's redundant
  // client-side guard to do in a test environment. That manual check
  // exists for whatever might bypass `required` in a real browser
  // (autofill edge cases, JS-disabled form libraries), not something
  // reachable through a standard form submission.
});
