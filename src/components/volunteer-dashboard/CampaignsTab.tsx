import { CheckCircle2, CheckCircle, Calendar, MapPin, User, Check, QrCode, FileText, PhoneCall, Plus, Users } from 'lucide-react';
import { CountdownDisplay } from './shared';
import type { ActiveCampaign } from '../../volunteerDashboardData';
import type { Event } from '../../types';

export default function CampaignsTab({
  myCampaigns,
  openCampaigns,
  handleEnroll,
  handleCheckIn,
  setActivePassModal,
  setActiveProtocolModal,
  setActiveLeadContactModal,
}: {
  myCampaigns: ActiveCampaign[];
  openCampaigns: Event[];
  handleEnroll: (eventId: string) => void;
  handleCheckIn: (campId: string) => void;
  setActivePassModal: (camp: ActiveCampaign) => void;
  setActiveProtocolModal: (camp: ActiveCampaign) => void;
  setActiveLeadContactModal: (camp: ActiveCampaign) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl text-xs flex items-start gap-3 leading-relaxed">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-primary-container mt-0.5" />
        <div>
          <p className="font-bold">Campaign Enrollment Requires Admin Approval</p>
          <p className="text-slate-800/85 mt-0.5">
            Enrolling in a campaign submits a request to the Regional Admin -- you're only confirmed for the campaign once it's approved. Once approved, click on the campaign to download your Digital Event Pass, access camp safety guidelines, or mark your check-in.
          </p>
        </div>
      </div>

      {/* Discover & Join New Campaigns */}
      {openCampaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-headline-lg text-sm font-bold text-slate-900">Open Campaigns You Can Join</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openCampaigns.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center justify-between gap-3 shadow-xs">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{ev.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {ev.date} • {ev.time}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {ev.location}</p>
                </div>
                <button
                  onClick={() => handleEnroll(ev.id)}
                  className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Enroll
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid of Admin Approved Campaigns */}
      {myCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-10 text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">You haven't enrolled in any campaigns yet.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myCampaigns.map((camp) => (
          <div key={camp.id} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            {/* Campaign Image */}
            <div className="h-44 relative overflow-hidden bg-slate-100">
              {camp.image ? (
                <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                camp.attendanceStatus === 'Pending' ? 'bg-amber-500' :
                camp.attendanceStatus === 'Rejected' ? 'bg-red-600' :
                'bg-primary'
              }`}>
                <CheckCircle className="w-3 h-3" />
                {camp.attendanceStatus === 'Pending' ? 'Awaiting Approval' :
                 camp.attendanceStatus === 'Rejected' ? 'Rejected' :
                 'Admin Approved'}
              </span>
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                {camp.type}
              </span>
            </div>

            {/* Campaign Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-headline-lg text-base font-bold text-slate-900">{camp.name}</h3>
                <div className="grid grid-cols-1 gap-2 mt-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary shrink-0" /> {camp.date} • {camp.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> {camp.location}</p>
                  {camp.organizer && (
                    <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary shrink-0" /> Regional Lead: {camp.organizer}</p>
                  )}
                </div>
              </div>

              {camp.attendanceStatus === 'Rejected' ? (
                <div className="pt-4 border-t border-slate-100">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Enrollment Rejected</p>
                    <p className="text-xs text-red-700">{camp.decisionNotes || 'No reason was provided.'}</p>
                  </div>
                </div>
              ) : (
              /* Action Control Panel for Campaign */
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  {camp.targetDate ? (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Starts In</p>
                      <CountdownDisplay targetDate={camp.targetDate} />
                    </div>
                  ) : <div />}
                  <div>
                    {camp.attendanceStatus === 'Checked In' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Checked In
                      </span>
                    ) : camp.attendanceStatus === 'Pending' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Awaiting Admin Approval
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(camp.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                      >
                        Check-In Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Buttons Bar */}
                <div className={`grid gap-2 pt-2 border-t border-slate-100 text-[10px] ${camp.organizer ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={() => setActivePassModal(camp)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Event Pass
                  </button>
                  <button
                    onClick={() => setActiveProtocolModal(camp)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Guidelines
                  </button>
                  {camp.organizer && (
                    <button
                      onClick={() => setActiveLeadContactModal(camp)}
                      className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Contact Lead
                    </button>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
