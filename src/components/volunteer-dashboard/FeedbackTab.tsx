import { MessageSquare, Send, CheckCircle, Clock, History } from 'lucide-react';
import { SectionHeader } from './shared';
import type { ApiVolunteerFeedback } from '../../api/client';

function FeedbackHistoryItem({ item }: { item: ApiVolunteerFeedback }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-800">{item.campaignName}</p>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
          item.status === 'Responded' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
        }`}>
          {item.status}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-sm ${i < item.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">{item.comment}</p>
      {item.response && (
        <div className="mt-3 pl-3 border-l-2 border-primary/30">
          <p className="text-[10px] font-bold text-primary mb-0.5">Team Response</p>
          <p className="text-xs text-slate-600">{item.response}</p>
        </div>
      )}
      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
        <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}

export default function FeedbackTab({
  campaignName,
  setCampaignName,
  feedbackRating,
  setFeedbackRating,
  feedbackText,
  setFeedbackText,
  submitting,
  submitError,
  handleFeedbackSubmit,
  justSubmitted,
  resetFeedback,
  myFeedback,
  myFeedbackLoading,
}: {
  campaignName: string;
  setCampaignName: (name: string) => void;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  submitting: boolean;
  submitError: string;
  handleFeedbackSubmit: () => void;
  justSubmitted: boolean;
  resetFeedback: () => void;
  myFeedback: ApiVolunteerFeedback[];
  myFeedbackLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs h-fit">
        <SectionHeader icon={MessageSquare} title="Share Your Volunteer Experience" subtitle="Your insights help us refine our campaign execution and support" />
        {!justSubmitted ? (
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="feedback-campaign" className="text-xs font-bold text-slate-700 mb-1 block">Campaign / Camp Name</label>
              <input
                id="feedback-campaign"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all text-xs"
                placeholder="e.g. Free Early Detection Camp, Sector 21"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Overall Experience Rating</p>
              <div className="flex gap-2">
                {[
                  { emoji: '😞', label: 'Poor', value: 1 },
                  { emoji: '😐', label: 'Okay', value: 2 },
                  { emoji: '🙂', label: 'Good', value: 3 },
                  { emoji: '😊', label: 'Great', value: 4 },
                  { emoji: '🤩', label: 'Amazing', value: 5 },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setFeedbackRating(r.value)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${feedbackRating === r.value
                        ? 'bg-primary/10 border-primary scale-105 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-[9px] font-semibold text-slate-600 mt-1">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="feedback-input" className="text-xs font-bold text-slate-700 mb-1 block">Comments & Suggestions</label>
              <textarea
                id="feedback-input"
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all text-xs resize-none"
                placeholder="Share what went well and any operational challenges faced..."
              />
            </div>
            {submitError && <p className="text-xs text-red-600">{submitError}</p>}
            <button
              onClick={handleFeedbackSubmit}
              disabled={feedbackRating === 0 || !campaignName.trim() || !feedbackText.trim() || submitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-slate-200">
              <CheckCircle className="w-8 h-8 text-primary-container" />
            </div>
            <h3 className="font-title-md text-primary font-bold text-base">Feedback Submitted!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Thank you for sharing your experience. Our team will review your comments to continuously improve campaign operations.</p>
            <button
              onClick={resetFeedback}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              Submit Another Response
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
        <SectionHeader icon={History} title="Your Feedback History" subtitle="Everything you've submitted, and any responses from the team" />
        <div className="mt-4 space-y-3">
          {myFeedbackLoading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>
          ) : myFeedback.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">You haven't submitted any feedback yet.</p>
          ) : (
            myFeedback.map(item => <FeedbackHistoryItem key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}
