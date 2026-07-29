import { Search, Users } from 'lucide-react';
import type { AssignedPatient } from '../../hospitalDashboardData';

export default function PatientsTab({
  searchTerm,
  setSearchTerm,
  patientStatusFilter,
  setPatientStatusFilter,
  filteredPatients,
  hospitalName,
  setSelectedPatientModal,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  patientStatusFilter: string;
  setPatientStatusFilter: (val: string) => void;
  filteredPatients: AssignedPatient[];
  hospitalName: string;
  setSelectedPatientModal: (pat: AssignedPatient) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search patient name, ID, diagnosis..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Under Review', 'Under Treatment', 'Completed', 'Emergency'].map(s => (
            <button key={s} onClick={() => setPatientStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${patientStatusFilter === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Patient Table or Empty State */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Patients Assigned Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Patient intake records assigned to <strong>{hospitalName}</strong> by Cancer Aware Bharat caseworkers will appear here once approved.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                  <th className="p-4">Patient Name & ID</th>
                  <th className="p-4">Diagnosis & Stage</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Admission Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map(pat => (
                  <tr key={pat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{pat.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{pat.ngoRefId} • {pat.age} yrs / {pat.gender}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{pat.diagnosis}</p>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">{pat.cancerStage}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{pat.assignedDoctor}</td>
                    <td className="p-4 text-slate-500">{pat.admissionDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        pat.treatmentStatus === 'Completed' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        pat.treatmentStatus === 'Under Treatment' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        pat.treatmentStatus === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {pat.treatmentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => setSelectedPatientModal(pat)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-[10px] cursor-pointer">
                        Profile & Reports
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
