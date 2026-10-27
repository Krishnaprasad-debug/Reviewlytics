import React from 'react';
import { XCircle, ThumbsDown } from 'lucide-react';

interface ConsCardProps {
  cons: (string | { text: string; count?: number })[];
  title?: string;
  className?: string;
}

export const ConsCard: React.FC<ConsCardProps> = ({
  cons,
  title = 'Areas for Improvement & Complaints',
  className = '',
}) => {
  if (!cons || cons.length === 0) {
    return (
      <div className={`p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 ${className}`}>
        No specific complaints or cons detected.
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ThumbsDown className="w-4 h-4" />
        </div>
        <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">{title}</h4>
      </div>

      <ul className="space-y-2.5">
        {cons.map((item, idx) => {
          const text = typeof item === 'string' ? item : item.text;
          const count = typeof item === 'object' && item.count ? item.count : null;

          return (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{text}</span>
                {count !== null && count > 0 && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-300">
                    {count} mentions
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
