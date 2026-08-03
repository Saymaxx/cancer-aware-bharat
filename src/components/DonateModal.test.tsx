import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DonateModal from './DonateModal';

vi.mock('../api/client', () => ({
  // (status, message), matching the real ApiError's constructor order --
  // see the identical note in VolunteerAuthPage.test.tsx.
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  createDonationCheckout: vi.fn(),
  verifyDonationCheckout: vi.fn(),
}));

import { ApiError, createDonationCheckout, verifyDonationCheckout } from '../api/client';

// Captures the options object DonateModal constructs `new window.Razorpay(...)`
// with, so a test can invoke its `handler` the same way Razorpay's real
// checkout.js would after a successful payment -- without ever loading the
// real script (which DonateModal fetches from checkout.razorpay.com).
let lastRazorpayOptions: Record<string, unknown> | null = null;

async function fillDonorDetails(user: ReturnType<typeof userEvent.setup>) {
  // Sequential, not Promise.all -- user-event simulates real focus/keyboard
  // state per call, and two concurrent .type() calls on different elements
  // race for it instead of composing cleanly.
  await user.type(screen.getByPlaceholderText(/your name/i), 'Ananya Mehta');
  await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'ananya@example.com');
}

describe('DonateModal checkout flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastRazorpayOptions = null;
    // Must be a real `function`, not an arrow function -- DonateModal calls
    // this with `new`, and vitest 4's mock internals actually invoke the
    // implementation as a constructor now (vitest 3 silently tolerated an
    // arrow function here; arrow functions aren't constructible in real JS).
    window.Razorpay = vi.fn().mockImplementation(function (options: Record<string, unknown>) {
      lastRazorpayOptions = options;
      return { open: vi.fn() };
    }) as unknown as typeof window.Razorpay;
  });

  afterEach(() => {
    window.Razorpay = undefined as unknown as typeof window.Razorpay;
    document.querySelectorAll('script[src*="checkout.razorpay.com"]').forEach(el => el.remove());
  });

  it('creates a checkout order and verifies payment after Razorpay reports success', async () => {
    vi.mocked(createDonationCheckout).mockResolvedValue({
      orderId: 'order_test123',
      amountPaise: 100000,
      currency: 'INR',
      keyId: 'rzp_test_key',
    });
    vi.mocked(verifyDonationCheckout).mockResolvedValue({} as never);

    const user = userEvent.setup();
    render(<DonateModal isOpen={true} onClose={vi.fn()} />);

    // ₹1000 preset is selected by default -- just fill donor details.
    await fillDonorDetails(user);
    await user.click(screen.getByRole('button', { name: /donate ₹1000/i }));

    expect(createDonationCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1000, donorName: 'Ananya Mehta', donorEmail: 'ananya@example.com' })
    );

    // Razorpay's real checkout.js would call this after the user completes
    // payment in its popup -- simulate that callback directly. The
    // checkout->script-load->Razorpay-construction chain is async, so wait
    // for it rather than asserting immediately after the click.
    await waitFor(() => expect(lastRazorpayOptions).not.toBeNull());
    const handler = lastRazorpayOptions!.handler as (r: Record<string, string>) => Promise<void>;
    await handler({
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test456',
      razorpay_signature: 'sig_test789',
    });

    expect(verifyDonationCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        razorpayOrderId: 'order_test123',
        razorpayPaymentId: 'pay_test456',
        razorpaySignature: 'sig_test789',
        donorName: 'Ananya Mehta',
        donorEmail: 'ananya@example.com',
        amount: 1000,
      })
    );
    expect(await screen.findByText(/thank you for your donation/i)).toBeInTheDocument();
  });

  it('shows a payment-could-not-be-verified message when verification fails', async () => {
    vi.mocked(createDonationCheckout).mockResolvedValue({
      orderId: 'order_test999',
      amountPaise: 100000,
      currency: 'INR',
      keyId: 'rzp_test_key',
    });
    vi.mocked(verifyDonationCheckout).mockRejectedValue(new Error('signature mismatch'));

    const user = userEvent.setup();
    render(<DonateModal isOpen={true} onClose={vi.fn()} />);
    await fillDonorDetails(user);
    await user.click(screen.getByRole('button', { name: /donate ₹1000/i }));

    await waitFor(() => expect(lastRazorpayOptions).not.toBeNull());
    const handler = lastRazorpayOptions!.handler as (r: Record<string, string>) => Promise<void>;
    await handler({ razorpay_order_id: 'o', razorpay_payment_id: 'p', razorpay_signature: 's' });

    expect(await screen.findByText(/payment could not be verified/i)).toBeInTheDocument();
    expect(screen.queryByText(/thank you for your donation/i)).not.toBeInTheDocument();
  });

  it('tells the donor to contact the org directly when online donations are not yet configured', async () => {
    vi.mocked(createDonationCheckout).mockRejectedValue(new ApiError(503, 'Online donations are not configured'));

    const user = userEvent.setup();
    render(<DonateModal isOpen={true} onClose={vi.fn()} />);
    await fillDonorDetails(user);
    await user.click(screen.getByRole('button', { name: /donate ₹1000/i }));

    expect(await screen.findByText(/aren.t set up yet/i)).toBeInTheDocument();
    expect(window.Razorpay).not.toHaveBeenCalled();
  });
});
