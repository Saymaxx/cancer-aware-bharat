import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientEnquiryForm from './PatientEnquiryForm';

vi.mock('../api/client', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  submitEnquiry: vi.fn(),
}));

// canvas-confetti draws to a real <canvas>, which jsdom doesn't implement
// (getContext('2d') returns null) -- irrelevant to the flow under test and
// would otherwise throw on every successful submission.
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// PrescriptionPreview pulls in jspdf/html2canvas for a feature (PDF export)
// this test isn't exercising -- stub it out rather than let those libraries
// run against jsdom.
vi.mock('./PrescriptionPreview', () => ({ default: () => null }));

import { submitEnquiry } from '../api/client';

function fillValidForm() {
  const user = userEvent.setup();
  return {
    user,
    async fill() {
      // None of these text/number fields have a <label htmlFor> or
      // wrapping <label> association in the markup (only the gender
      // radios do, via a wrapping <label>) -- placeholder text is the
      // only reliable selector for the rest.
      await user.type(screen.getByPlaceholderText(/enter your full name/i), 'Meera Nair');
      await user.type(screen.getByPlaceholderText(/e\.g\. 45/i), '52');
      await user.click(screen.getByRole('radio', { name: 'Female' }));
      await user.type(screen.getByPlaceholderText(/10-digit mobile number/i), '9876543210');
      await user.type(screen.getByPlaceholderText(/enter your city, state/i), 'Kochi, Kerala');
      await user.type(screen.getByPlaceholderText(/describe your symptoms/i), 'Persistent cough for three weeks');
    },
  };
}

describe('PatientEnquiryForm submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a valid enquiry to the real API and shows the reference number', async () => {
    vi.mocked(submitEnquiry).mockResolvedValue({
      id: 'e-1',
      enquiryId: 'ENQ-2026-000123',
      referenceNumber: 'REF-2026-000123',
      patientName: 'Meera Nair',
      age: 52,
      gender: 'Female',
      phone: '9876543210',
      email: null,
    } as never);

    const { user, fill } = fillValidForm();
    render(<PatientEnquiryForm isOpen={true} onClose={vi.fn()} />);
    await fill();

    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    expect(await screen.findByText(/inquiry submitted successfully/i)).toBeInTheDocument();
    expect(screen.getByText('ENQ-2026-000123')).toBeInTheDocument();
    expect(submitEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        patientName: 'Meera Nair',
        age: 52,
        gender: 'Female',
        phone: '9876543210',
        reason: 'General Enquiry (Chatbot)',
      })
    );
  });

  it('blocks submission and never calls the API when required fields are invalid', async () => {
    const user = userEvent.setup();
    render(<PatientEnquiryForm isOpen={true} onClose={vi.fn()} />);

    // Nothing filled in at all.
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    expect(await screen.findByText(/fill in all required fields correctly/i)).toBeInTheDocument();
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('shows the server error and stays on the form when the API call fails', async () => {
    const { ApiError } = await import('../api/client');
    vi.mocked(submitEnquiry).mockRejectedValue(new ApiError(500, 'Unable to submit enquiry. Please check your connection and try again.'));

    const { user, fill } = fillValidForm();
    render(<PatientEnquiryForm isOpen={true} onClose={vi.fn()} />);
    await fill();

    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    expect(await screen.findByText(/unable to submit enquiry/i)).toBeInTheDocument();
    expect(screen.queryByText(/inquiry submitted successfully/i)).not.toBeInTheDocument();
  });
});
