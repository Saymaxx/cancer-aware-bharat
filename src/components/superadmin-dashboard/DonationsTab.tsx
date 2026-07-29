import { Download } from 'lucide-react';
import type { AdminDonation } from '../../adminDashboardData';

export default function DonationsTab({
  donations,
  handleExportDonationsCSV,
}: {
  donations: AdminDonation[];
  handleExportDonationsCSV: () => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Donations', value: '₹' + donations.reduce((acc, curr) => acc + curr.amount, 650000).toLocaleString(), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Individual Donors', value: String(donations.filter(d => d.donorType === 'Individual').length + 140), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Corporate Sponsors', value: String(donations.filter(d => d.donorType === 'Corporate').length + 6), color: 'text-purple-700 bg-purple-50 border-purple-200' },
          { label: '80G Tax Receipts Sent', value: String(donations.filter(d => d.receiptSent).length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <h3 className="text-sm font-bold text-slate-900">National Financial Ledger & Audit Receipts</h3>
        <button
          onClick={handleExportDonationsCSV}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-indigo-600" /> Export Ledger CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Receipt ID</th>
                <th className="px-5 py-3">Donor Entity</th>
                <th className="px-5 py-3">Inflow Amount</th>
                <th className="px-5 py-3">Audit Date</th>
                <th className="px-5 py-3">Payment Channel</th>
                <th className="px-5 py-3 text-right">Tax Exemption Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-700">{d.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{d.donorName}</p>
                    <p className="text-[10px] text-slate-400">{d.donorType}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">₹{d.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{d.date}</td>
                  <td className="px-5 py-4 font-medium text-slate-700">{d.paymentMethod}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${d.receiptSent ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {d.receiptSent ? '✓ Dispatched (80G)' : 'Pending'}
                    </span>
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
