import { Search, Filter, Download, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Patient } from '../../adminDashboardData';

export default function PatientsTab({
  searchTerm,
  setSearchTerm,
  patientFilter,
  setPatientFilter,
  filteredPatients,
  handleExportPatientsCSV,
  handleOpenPatientForm,
  handleDeletePatient,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  patientFilter: string;
  setPatientFilter: (val: string) => void;
  filteredPatients: Patient[];
  handleExportPatientsCSV: () => void;
  handleOpenPatientForm: (patient: Patient | null) => void;
  handleDeletePatient: (id: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center space-x-2 border border-outline-variant rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={patientFilter}
              onChange={e => setPatientFilter(e.target.value)}
              className="pl-9 pr-6 py-2 border border-outline-variant rounded-xl text-xs bg-slate-50 cursor-pointer appearance-none outline-none w-full sm:w-auto"
            >
              <option value="All">All Financial Aid Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Not Requested">Not Requested</option>
            </select>
          </div>
          <button
            onClick={handleExportPatientsCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Export Patients CSV"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleOpenPatientForm(null)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Patient Record
          </button>
        </div>
      </div>

      {/* Patients Grid/Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                <th className="px-6 py-3">Patient Code</th>
                <th className="px-6 py-3">Patient Details</th>
                <th className="px-6 py-3">Primary Diagnosis</th>
                <th className="px-6 py-3">Clinic Partner</th>
                <th className="px-6 py-3">Financial Aid Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filteredPatients.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{pat.recordId}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-950">{pat.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pat.age} yrs • {pat.gender}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{pat.diagnosis}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{pat.hospitalName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      pat.financialAidStatus === 'Approved' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      pat.financialAidStatus === 'Pending Review' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      pat.financialAidStatus === 'Disbursed' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {pat.financialAidStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenPatientForm(pat)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-primary cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(pat.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
