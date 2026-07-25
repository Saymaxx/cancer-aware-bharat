import React from 'react';
import { EnquiryStatus } from '../../types';

interface StatusBadgeProps {
  status: EnquiryStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const getBadgeStyle = (statusStr: string) => {
    switch (statusStr) {
      case 'Pending Admin Review':
        return 'bg-amber-50 text-amber-800 border-amber-300/80';
      case 'Approved by Admin':
      case 'Pending Hospital Assignment':
        return 'bg-blue-50 text-blue-800 border-blue-300/80';
      case 'Assigned to Hospital':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300/80';
      case 'Accepted by Hospital':
        return 'bg-teal-50 text-teal-800 border-teal-300/80';
      case 'Appointment Confirmed':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300/80';
      case 'Rejected by Admin':
      case 'Declined by Hospital':
        return 'bg-red-50 text-red-800 border-red-300/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'lg':
        return 'px-3.5 py-1.5 text-xs font-bold';
      case 'md':
        return 'px-3 py-1 text-[11px] font-bold';
      default:
        return 'px-2.5 py-0.5 text-[10px] font-bold';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${getBadgeStyle(
        status
      )} ${getSizeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
      <span>{status}</span>
    </span>
  );
}
