import { HelpCircle, Download } from 'lucide-react';

export default function SupportTab({
  ticketSubject,
  setTicketSubject,
  ticketCategory,
  setTicketCategory,
  ticketDetails,
  setTicketDetails,
  showToast,
}: {
  ticketSubject: string;
  setTicketSubject: (val: string) => void;
  ticketCategory: string;
  setTicketCategory: (val: string) => void;
  ticketDetails: string;
  setTicketDetails: (val: string) => void;
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-primary-container" /> Raise Support Ticket to NGO Board</h3>
          <form onSubmit={e => { e.preventDefault(); showToast('Support ticket raised. Case reference: TKT-2026-904'); setTicketSubject(''); setTicketDetails(''); }} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ticket Subject</label>
              <input type="text" required value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs" placeholder="e.g. Referral intake delay inquiry" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
              <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs">
                <option value="Patient Referral Question">Patient Referral Question</option>
                <option value="Financial Aid Disbursement">Financial Aid Disbursement</option>
                <option value="Awareness Camp Coordination">Awareness Camp Coordination</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
              <textarea rows={3} value={ticketDetails} onChange={e => setTicketDetails(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs" placeholder="Provide full details..." />
            </div>
            <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90 cursor-pointer">
              Submit Support Ticket
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Download className="w-4 h-4 text-primary-container" /> Download Partnership Guidelines & SOPs</h3>
          <div className="space-y-2 text-xs">
            {[
              { title: 'CAB Hospital Partnership SOP 2026.pdf', size: '2.8 MB' },
              { title: 'Patient Referral Standard Guidelines.pdf', size: '1.4 MB' },
              { title: 'Financial Aid Verification Rate Card.pdf', size: '920 KB' },
            ].map((file, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{file.title}</p>
                  <p className="text-[10px] text-slate-400">{file.size}</p>
                </div>
                <button onClick={() => showToast(`Downloaded ${file.title}`)} className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] hover:bg-slate-300 cursor-pointer">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
