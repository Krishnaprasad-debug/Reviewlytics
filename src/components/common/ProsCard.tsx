import React from 'react';
import { CheckCircle, ThumbsUp } from 'lucide-react';

interface ProsCardProps {
  pros: (string | { text: string; count?: number })[];
  title?: string;
  className?: string;
}

export const ProsCard: React.FC<ProsCardProps> = ({
  pros,
  title = 'Key Advantages & Highlights',
  className = '',
}) => {
  if (!pros || pros.length === 0) {
    return (
      <div className={`p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 ${className}`}>
        No specific pros extracted yet.
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ThumbsUp className="w-4 h-4" />
        </div>
        <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">{title}</h4>
      </div>

      <ul className="space-y-2.5">
        {pros.map((item, idx) => {
          const text = typeof item === 'string' ? item : item.text;
          const count = typeof item === 'object' && item.count ? item.count : null;

          return (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{text}</span>
                {count !== null && count > 0 && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300">
                    +{count} mentions
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
