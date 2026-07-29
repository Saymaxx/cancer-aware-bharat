import { Calendar } from 'lucide-react';
import type { CampaignRequest } from '../../adminDashboardData';

export default function RequestsTab({
  campaignRequests,
  handleScheduleFromRequest,
}: {
  campaignRequests: CampaignRequest[];
  handleScheduleFromRequest: (req: CampaignRequest) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                <th className="px-6 py-3">Applicant / Host Organization</th>
                <th className="px-6 py-3">Contact Person</th>
                <th className="px-6 py-3">Requested Location</th>
                <th className="px-6 py-3">Expected Attendees</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {campaignRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-950">{req.organizationName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{req.orgType} • Applied: {req.requestedDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700">{req.contactPerson}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{req.email} • {req.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{req.location}</td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{req.expectedAttendees}</td>
                  <td className="px-6 py-4 font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      req.status === 'Scheduled' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending Scheduling' ? (
                      <button
                        onClick={() => handleScheduleFromRequest(req)}
                        className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 cursor-pointer inline-flex items-center gap-0.5 shadow-sm"
                      >
                        <Calendar className="w-3 h-3" /> Convert to Camp
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-primary-container bg-slate-50 px-2 py-1 rounded">
                        Active scheduled
                      </span>
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
