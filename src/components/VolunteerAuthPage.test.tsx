import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VolunteerAuthPage from './VolunteerAuthPage';

// Mock the real API layer so this test exercises only the client-side form
// guard -- it must assert the network call never happens, not just that an
// error message renders.
vi.mock('../api/client', () => ({
  ApiError: class ApiError extends Error {},
  loginVolunteer: vi.fn(),
  registerVolunteer: vi.fn(),
  getMyVolunteerProfile: vi.fn(),
  setVolunteerSession: vi.fn(),
}));

import { registerVolunteer } from '../api/client';

function renderPage() {
  return render(
    <MemoryRouter>
      <VolunteerAuthPage />
    </MemoryRouter>
  );
}

describe('VolunteerAuthPage registration form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and never calls the API when passwords do not match', async () => {
    const user = userEvent.setup();
    renderPage();

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
  });
});
