import { X, UserCheck, QrCode, Download, ShieldCheck, PhoneCall, User, Phone, Send, GraduationCap, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ActiveCampaign, TrainingResource } from '../../volunteerDashboardData';

// 1. DIGITAL VOLUNTEER EVENT PASS MODAL
export function EventPassModal({
  campaign,
  onClose,
  volunteerName,
  volunteerId,
  volunteerDomain,
  showToast,
}: {
  campaign: ActiveCampaign;
  onClose: () => void;
  volunteerName: string;
  volunteerId: string;
  volunteerDomain: string;
  showToast: (msg: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-pass-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-xs" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#004349] to-primary p-6 text-white text-center relative">
          <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-2 border border-white/20">
            <UserCheck className="w-6 h-6 text-secondary-container" />
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-secondary-container">Official Event Pass</p>
          <h3 id="event-pass-modal-title" className="text-base font-bold mt-1">{campaign.name}</h3>
        </div>
        <div className="p-6 space-y-4 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center border border-slate-200">
            <QrCode className="w-16 h-16 text-slate-800" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-sm text-slate-900">{volunteerName}</p>
            <p className="text-xs text-slate-500 font-mono">ID: {volunteerId} • {volunteerDomain}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-left text-[11px] space-y-1.5 border border-slate-200/60">
            <p><strong className="text-slate-700">Date & Time:</strong> {campaign.date} ({campaign.time})</p>
            <p><strong className="text-slate-700">Venue:</strong> {campaign.location}</p>
            <p><strong className="text-slate-700">Coordinator:</strong> {campaign.organizer} ({campaign.organizerPhone})</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                showToast(`Downloading Digital Pass for ${campaign.name}...`);
                onClose();
              }}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90"
            >
              <Download className="w-4 h-4" /> Download Pass PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. CAMP GUIDELINES MODAL
export function ProtocolModal({ campaign, onClose }: { campaign: ActiveCampaign; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="protocol-modal-title" className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-container" /> Operational & Safety Protocol Guidelines
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-slate-600 leading-relaxed font-semibold">Standard Operating Procedures for <strong>{campaign.name}</strong>:</p>
          <ul className="space-y-2 text-slate-700 list-disc pl-4">
            <li>Arrive at venue by <strong>{campaign.time.split('–')[0]}</strong> for morning briefing.</li>
            <li>Wear official CAB volunteer lanyard and badge at all times.</li>
            <li>Maintain strict patient confidentiality for all screening records and medical histories.</li>
            <li>Ensure hygiene kits (sanitizers, masks, gloves) are stocked at registration tables.</li>
            <li>For any emergency or medical escalation, contact Regional Lead <strong>{campaign.organizer}</strong> immediately.</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
        >
          I Understand & Acknowledge
        </button>
      </div>
    </div>
  );
}

// 3. CONTACT REGIONAL LEAD MODAL
export function LeadContactModal({
  campaign,
  onClose,
  showToast,
}: {
  campaign: ActiveCampaign;
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-contact-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="lead-contact-modal-title" className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-primary" /> Regional Lead Direct Desk
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-center">
          <User className="w-10 h-10 text-primary mx-auto bg-primary/10 p-2 rounded-full" />
          <p className="font-bold text-slate-900 text-sm">{campaign.organizer}</p>
          <p className="text-slate-500 text-xs">Regional Campaign Coordinator</p>
          <p className="font-mono text-xs font-bold text-primary pt-1">{campaign.organizerPhone}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${campaign.organizerPhone}`}
            onClick={() => showToast(`Calling ${campaign.organizer}...`)}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90"
          >
            <Phone className="w-4 h-4" /> Call Lead
          </a>
          <button
            onClick={() => {
              showToast(`SMS alert dispatched to ${campaign.organizer}`);
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200"
          >
            <Send className="w-4 h-4" /> Send SMS
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. INTERACTIVE TRAINING MODULE MODAL
export function TrainingModuleModal({
  resource,
  onClose,
  quizAnswer,
  setQuizAnswer,
  onComplete,
}: {
  resource: TrainingResource;
  onClose: () => void;
  quizAnswer: number | null;
  setQuizAnswer: (idx: number) => void;
  onComplete: (resId: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="training-modal-title" className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" /> {resource.title}
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
            <p className="font-bold text-primary text-xs mb-1">Course Overview & Protocol Lesson</p>
            <p className="text-slate-600 text-xs leading-relaxed">{resource.description}</p>
          </div>

          <div className="space-y-2 pt-2">
            <p className="font-bold text-slate-900 text-xs">Quick Knowledge Test Question:</p>
            <p className="text-slate-700">What is the primary action when a citizen presents with suspicious oral mucosal lesions during a drive?</p>
            <div className="space-y-1.5">
              {[
                "Direct them to immediate oncologist consultation station & log registry",
                "Advise them to return home and monitor for 6 months",
                "Hand them general brochures without documentation"
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuizAnswer(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                    quizAnswer === idx ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {idx === 0 ? '✓ ' : ''}{option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onComplete(resource.id)}
            disabled={quizAnswer !== 0}
            className="w-full py-2.5 bg-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Submit Quiz & Complete Course (+100 XP)
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. REPORT SCHEDULE ISSUE MODAL
export function ReportIssueModal({
  onClose,
  issueCategory,
  setIssueCategory,
  issueDescription,
  setIssueDescription,
  onSubmit,
}: {
  onClose: () => void;
  issueCategory: string;
  setIssueCategory: (cat: string) => void;
  issueDescription: string;
  setIssueDescription: (desc: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="report-issue-modal-title" className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Report Camp Issue / Delay
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
            <select
              value={issueCategory}
              onChange={e => setIssueCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
            >
              <option value="Kit Shortage">Screening Kit Shortage</option>
              <option value="Venue Access">Venue Access / Power Issue</option>
              <option value="Crowd Overflow">High Patient Crowd Surge</option>
              <option value="Medical Escalation">Emergency Medical Transport Required</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Issue Details *</label>
            <textarea
              rows={3}
              required
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              placeholder="Describe the operational challenge for immediate coordinator dispatch..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer shadow-xs"
            >
              Dispatch Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
