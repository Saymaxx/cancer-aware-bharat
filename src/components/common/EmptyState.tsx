import React, { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = <FileQuestion className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 my-4">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-xs border border-slate-100 flex items-center justify-center mx-auto">
        {icon}
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
