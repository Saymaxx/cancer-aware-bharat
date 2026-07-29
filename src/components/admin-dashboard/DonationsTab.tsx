import { Download } from 'lucide-react';
import type { AdminDonation } from '../../adminDashboardData';

export default function DonationsTab({
  donationsReceived,
  donations,
  handleExportDonationsCSV,
  onEmailReceipt,
}: {
  donationsReceived: number;
  donations: AdminDonation[];
  handleExportDonationsCSV: () => void;
  onEmailReceipt: (donationId: string) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Cumulative Donations Received', val: donationsReceived, prefix: '₹' },
          { label: 'Total Receipts Dispatched', val: '100%', prefix: '' },
          { label: 'Corporate CSR Grants', val: '2 sponsors', prefix: '' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 border border-outline-variant/30 rounded-2xl text-center">
            <p className="text-2xl font-black text-slate-900">{stat.prefix}{stat.val.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Donations History table */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Donation Ledgers</h3>
          <button
            onClick={handleExportDonationsCSV}
            className="px-3.5 py-1.5 border border-outline-variant/50 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export Ledger (Excel)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                <th className="px-6 py-3">Receipt Code</th>
                <th className="px-6 py-3">Donor Entity</th>
                <th className="px-6 py-3">Inflow Amount</th>
                <th className="px-6 py-3">Audit Date</th>
                <th className="px-6 py-3">Inflow Channel</th>
                <th className="px-6 py-3 text-right">Tax Exemption Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {donations.map((don) => (
                <tr key={don.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{don.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-950">{don.donorName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{don.donorType}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{don.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500">{don.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{don.paymentMethod}</td>
                  <td className="px-6 py-4 text-right">
                    {don.receiptSent ? (
                      <span className="text-[10px] font-bold text-primary-container bg-slate-50 px-2 py-0.5 rounded-full">✓ Sent (80G)</span>
                    ) : (
                      <button
                        onClick={() => onEmailReceipt(don.id)}
                        className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-bold hover:opacity-95"
                      >
                        Email Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
