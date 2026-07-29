import type { AdminFeedback } from '../../adminDashboardData';

export default function FeedbackTab({
  feedbacks,
  activeFeedbackId,
  setActiveFeedbackId,
  feedbackReplyText,
  setFeedbackReplyText,
  handleSendFeedbackReply,
}: {
  feedbacks: AdminFeedback[];
  activeFeedbackId: string | null;
  setActiveFeedbackId: (id: string | null) => void;
  feedbackReplyText: string;
  setFeedbackReplyText: (val: string) => void;
  handleSendFeedbackReply: (id: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-1 gap-4">
        {feedbacks.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">{f.volunteerName}</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Campaign: {f.campaignName} • {f.date}</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-0.5 rounded-full font-bold border border-slate-100 text-[10px]">
                ★ {f.rating} / 5 Rating
              </div>
            </div>
            <p className="text-slate-700 italic leading-relaxed">"{f.comment}"</p>

            {/* Reply box */}
            {f.status === 'Responded' ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-primary">Admin Response:</p>
                <p className="text-slate-600 mt-1">"{f.response}"</p>
              </div>
            ) : activeFeedbackId === f.id ? (
              <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                <textarea
                  rows={2}
                  value={feedbackReplyText}
                  onChange={e => setFeedbackReplyText(e.target.value)}
                  placeholder="Type response to volunteer..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendFeedbackReply(f.id)}
                    className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:opacity-95"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => setActiveFeedbackId(null)}
                    className="px-4 py-1.5 border border-outline-variant rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveFeedbackId(f.id);
                  setFeedbackReplyText('');
                }}
                className="px-3 py-1.5 border border-outline-variant/50 hover:bg-slate-50 rounded-lg font-bold text-slate-700"
              >
                Reply to Feedback
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
