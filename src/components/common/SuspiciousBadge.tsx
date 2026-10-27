import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';

interface SuspiciousBadgeProps {
  status: 'Genuine' | 'Suspicious' | 'Uncertain';
  reason?: string;
  score?: number;
  showReasonOnHover?: boolean;
  className?: string;
}

export const SuspiciousBadge: React.FC<SuspiciousBadgeProps> = ({
  status,
  reason,
  score,
  showReasonOnHover = true,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getDetails = () => {
    switch (status) {
      case 'Suspicious':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
          label: 'Flagged Suspicious',
        };
      case 'Uncertain':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
          label: 'Uncertain Pattern',
        };
      case 'Genuine':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
          label: 'Authentic Review',
        };
    }
  };

  const details = getDetails();

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help ${details.bg} ${className}`}
      >
        {details.icon}
        <span>{details.label}</span>
        {score !== undefined && status === 'Suspicious' && (
          <span className="text-[10px] opacity-75 font-bold">({score}%)</span>
        )}
      </span>

      {showReasonOnHover && showTooltip && reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-xl border border-slate-700 z-50 pointer-events-none">
          <div className="font-semibold mb-1 text-slate-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> AI Detection Insight
          </div>
          <p className="text-slate-300 leading-relaxed">{reason}</p>
          <div className="text-[10px] text-slate-400 mt-2 italic">
            *AI indication based on text entropy and patterns. Not definitive proof of fraud.
          </div>
        </div>
      )}
    </div>
  );
};
