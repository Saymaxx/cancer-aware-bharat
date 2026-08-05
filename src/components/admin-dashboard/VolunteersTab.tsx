import { Search, Download, Check, X } from 'lucide-react';
import type { AdminVolunteer } from '../../adminDashboardData';

export default function VolunteersTab({
  searchTerm,
  setSearchTerm,
  volunteerFilter,
  setVolunteerFilter,
  filteredVolunteers,
  handleExportVolunteersCSV,
  handleApproveVolunteer,
  handleRejectVolunteer,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  volunteerFilter: string;
  setVolunteerFilter: (val: string) => void;
  filteredVolunteers: AdminVolunteer[];
  handleExportVolunteersCSV: () => void;
  handleApproveVolunteer: (id: string) => void;
  handleRejectVolunteer: (id: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center space-x-2 border border-outline-variant rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Volunteer name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={volunteerFilter}
            onChange={e => setVolunteerFilter(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-xl text-xs bg-slate-50 cursor-pointer outline-none w-full sm:w-auto"
          >
            <option value="All">All Verification Status</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={handleExportVolunteersCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Export Volunteers CSV"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Volunteers list */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                <th className="px-6 py-3">Volunteer Details</th>
                <th className="px-6 py-3">Domain</th>
                <th className="px-6 py-3">Registered Date</th>
                <th className="px-6 py-3">Activity Metrics</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filteredVolunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-950">{vol.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{vol.email} • {vol.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{vol.domain}</td>
                  <td className="px-6 py-4 text-slate-500">{vol.registeredDate}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700">{vol.hoursLogged} hrs logged</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{vol.attendanceRate}% Attendance Rate</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      vol.status === 'Approved' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      vol.status === 'Pending Approval' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {vol.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {vol.status === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => handleApproveVolunteer(vol.id)}
                            className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectVolunteer(vol.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-lg text-[10px] hover:bg-red-100 cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      {vol.status === 'Approved' && (
                        <button
                          onClick={() => handleRejectVolunteer(vol.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-lg text-[10px] hover:bg-red-100 cursor-pointer inline-flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      )}
                      {vol.status === 'Rejected' && (
                        <button
                          onClick={() => handleApproveVolunteer(vol.id)}
                          className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 cursor-pointer inline-flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" /> Re-approve
                        </button>
                      )}
                    </div>
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
