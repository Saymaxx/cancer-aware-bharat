import { GraduationCap, FileText, Play, Target, BookOpen } from 'lucide-react';
import { SectionHeader } from './shared';
import type { TrainingResource } from '../../volunteerDashboardData';

function resourceIcon(type: string) {
  switch (type) {
    case 'PDF Guide': return <FileText className="w-4 h-4" />;
    case 'Video': return <Play className="w-4 h-4" />;
    case 'Quiz': return <Target className="w-4 h-4" />;
    case 'Handbook': return <BookOpen className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
}

export default function TrainingTab({
  trainingModules,
  setActiveTrainingModal,
}: {
  trainingModules: TrainingResource[];
  setActiveTrainingModal: (res: TrainingResource) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <SectionHeader icon={GraduationCap} title="Volunteer Training Modules" subtitle="Complete certified skill courses to enhance patient care and camp readiness" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingModules.map((res) => (
          <div key={res.id} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${res.progress === 100 ? 'bg-slate-50 text-primary-container' : 'bg-primary/10 text-primary'
                  }`}>
                  {resourceIcon(res.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-2">
                <span>{res.duration}</span>
                <span className={res.progress === 100 ? 'text-primary-container font-bold' : 'text-primary font-bold'}>
                  {res.progress === 100 ? '✓ Completed' : `${res.progress}% Done`}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${res.progress === 100 ? 'bg-primary' : 'bg-primary'
                    }`}
                  style={{ width: `${res.progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setActiveTrainingModal(res)}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 transition-colors cursor-pointer"
            >
              {res.progress === 100 ? 'Review Module' : res.progress > 0 ? 'Continue Module' : 'Start Course'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
