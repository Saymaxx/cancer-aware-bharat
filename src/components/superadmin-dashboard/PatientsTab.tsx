import { Search, Download } from 'lucide-react';
import type { Patient } from '../../adminDashboardData';

export default function PatientsTab({
  patients,
  searchTerm,
  setSearchTerm,
  handleExportPatientsCSV,
}: {
  patients: Patient[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleExportPatientsCSV: () => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Patients', value: patients.length.toLocaleString(), color: 'text-rose-700 bg-rose-50 border-rose-200' },
          { label: 'Under Treatment', value: String(patients.filter(p => p.status === 'Under Treatment').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Recovered / Remission', value: String(patients.filter(p => p.status === 'Recovered').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Financial Aid Pending', value: String(patients.filter(p => p.financialAidStatus === 'Pending Review').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name or diagnosis..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full"
          />
        </div>
        <button
          onClick={handleExportPatientsCSV}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4 text-indigo-600" /> Export Patients CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Patient Code</th>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Diagnosis</th>
                <th className="px-5 py-3">Clinic Partner</th>
                <th className="px-5 py-3">Financial Aid Status</th>
                <th className="px-5 py-3 text-right">Medical Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-700">{p.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.age} yrs • {p.gender}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{p.diagnosis}</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{p.hospitalName}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.financialAidStatus === 'Approved' ? 'bg-slate-50 text-slate-700 border-slate-200' : p.financialAidStatus === 'Pending Review' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {p.financialAidStatus} {p.financialAidAmount ? `(₹${p.financialAidAmount.toLocaleString()})` : ''}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-700">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
