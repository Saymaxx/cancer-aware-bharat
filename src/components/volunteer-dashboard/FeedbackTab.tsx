import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { SectionHeader } from './shared';

export default function FeedbackTab({
  feedbackSubmitted,
  feedbackRating,
  setFeedbackRating,
  feedbackText,
  setFeedbackText,
  handleFeedbackSubmit,
  resetFeedback,
}: {
  feedbackSubmitted: boolean;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  handleFeedbackSubmit: () => void;
  resetFeedback: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs max-w-2xl animate-[fadeInUp_0.4s_ease-out]">
      <SectionHeader icon={MessageSquare} title="Share Your Volunteer Experience" subtitle="Your insights help us refine our campaign execution and support" />
      {!feedbackSubmitted ? (
        <div className="space-y-4 mt-4">
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
          <button
            onClick={handleFeedbackSubmit}
            disabled={feedbackRating === 0}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit Feedback
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
  );
}
