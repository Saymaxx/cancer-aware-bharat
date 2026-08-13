import { useState } from 'react';
import type { AdminFeedback } from '../../adminDashboardData';
import type { ApiVolunteerIssueReport } from '../../api/client';

export default function FeedbackTab({
  feedbacks,
  activeFeedbackId,
  setActiveFeedbackId,
  feedbackReplyText,
  setFeedbackReplyText,
  handleSendFeedbackReply,
  issues,
  handleResolveIssue,
}: {
  feedbacks: AdminFeedback[];
  activeFeedbackId: string | null;
  setActiveFeedbackId: (id: string | null) => void;
  feedbackReplyText: string;
  setFeedbackReplyText: (val: string) => void;
  handleSendFeedbackReply: (id: string) => void;
  issues: ApiVolunteerIssueReport[];
  handleResolveIssue: (id: string, resolutionNotes?: string) => void;
}) {
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const submitResolve = (id: string) => {
    handleResolveIssue(id, resolutionNotes.trim() || undefined);
    setResolvingIssueId(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {issues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Volunteer Issue Reports</h3>
            <span className="text-xs font-semibold text-slate-500">{issues.filter(i => i.status !== 'Resolved').length} Unresolved</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-xs text-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{issue.volunteerName}</span>
                    <p className="text-slate-400 text-[10px] mt-0.5">{new Date(issue.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${issue.status === 'Resolved' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {issue.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${issue.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">{issue.description}</p>
                {issue.status === 'Resolved' ? (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-primary text-[10px] uppercase tracking-wider">Resolution Notes</p>
                    <p className="text-slate-600 mt-1">{issue.resolutionNotes || 'Marked as resolved'}</p>
                  </div>
                ) : resolvingIssueId === issue.id ? (
                  <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      placeholder="Add resolution notes or action taken (optional)..."
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitResolve(issue.id)}
                        className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 cursor-pointer"
                      >
                        Confirm Resolution
                      </button>
                      <button
                        onClick={() => {
                          setResolvingIssueId(null);
                          setResolutionNotes('');
                        }}
                        className="px-4 py-1.5 border border-outline-variant rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setResolvingIssueId(issue.id);
                      setResolutionNotes('');
                    }}
                    className="px-3 py-1.5 border border-outline-variant/50 hover:bg-slate-50 rounded-lg font-bold text-slate-700 cursor-pointer"
                  >
                    Resolve Issue
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                    className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 cursor-pointer"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => setActiveFeedbackId(null)}
                    className="px-4 py-1.5 border border-outline-variant rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
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
                className="px-3 py-1.5 border border-outline-variant/50 hover:bg-slate-50 rounded-lg font-bold text-slate-700 cursor-pointer"
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
