import React, { useState } from 'react';
import { X, Heart, CheckCircle2, IndianRupee } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { createDonationCheckout, verifyDonationCheckout, ApiError, type DonationVerifyPayload } from '../api/client';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const AMOUNT_PRESETS = [500, 1000, 2500, 5000];

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout script.')));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });
}

export default function DonateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorType, setDonorType] = useState<'Individual' | 'Corporate' | 'Foundation' | 'NGO'>('Individual');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [thankYou, setThankYou] = useState(false);

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  const handleClose = () => {
    setThankYou(false);
    setErrorMessage('');
    onClose();
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!donorName || !donorEmail || !effectiveAmount || effectiveAmount <= 0) {
      setErrorMessage('Please fill in your name, email, and a donation amount.');
      return;
    }

    setSubmitting(true);
    try {
      const checkout = await createDonationCheckout({
        amount: effectiveAmount,
        donorName,
        donorEmail,
        donorPhone: donorPhone || undefined,
        donorType,
      });

      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amountPaise,
        currency: checkout.currency,
        order_id: checkout.orderId,
        name: 'Cancer Aware Bharat',
        description: 'Donation',
        prefill: { name: donorName, email: donorEmail, contact: donorPhone },
        theme: { color: '#163a5f' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyPayload: DonationVerifyPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              donorName,
              donorEmail,
              donorPhone: donorPhone || undefined,
              donorType,
              amount: effectiveAmount,
            };
            await verifyDonationCheckout(verifyPayload);
            setThankYou(true);
          } catch {
            setErrorMessage('Payment could not be verified. If you were charged, please contact us with your payment ID.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.open();
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.status === 503) {
        setErrorMessage('Online donations aren’t set up yet — please contact us directly at info@awarebharat.org to donate.');
      } else {
        setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="donate-modal-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {thankYou ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Thank you for your donation!</h3>
            <p className="text-sm text-slate-500">Your support helps us fund early detection and patient care.</p>
            <button onClick={handleClose} className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 cursor-pointer">Close</button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 id="donate-modal-title" className="text-base font-bold text-slate-900 flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Make a Donation</h3>
              <button onClick={handleClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleDonate} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-slate-600 block mb-2 text-xs">Amount (INR)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {AMOUNT_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setAmount(preset); setCustomAmount(''); }}
                      className={`py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${!customAmount && amount === preset ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1 text-xs">Full Name</label>
                <input required value={donorName} onChange={e => setDonorName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary text-xs" placeholder="Your name" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-xs">Email</label>
                  <input required type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary text-xs" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-xs">Phone (optional)</label>
                  <input value={donorPhone} onChange={e => setDonorPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary text-xs" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1 text-xs">Donating As</label>
                <select value={donorType} onChange={e => setDonorType(e.target.value as typeof donorType)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary text-xs">
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Foundation">Foundation</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>

              {errorMessage && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMessage}</p>}

              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {submitting ? 'Processing...' : `Donate ₹${effectiveAmount || 0}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
