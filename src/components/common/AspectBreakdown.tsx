import React from 'react';
import { AspectSentiment } from '../../types/index.js';
import { SentimentBadge } from './SentimentBadge.js';

interface AspectBreakdownProps {
  aspects: AspectSentiment[];
  onSelectAspect?: (aspectName: string) => void;
  selectedAspect?: string | null;
  className?: string;
}

export const AspectBreakdown: React.FC<AspectBreakdownProps> = ({
  aspects,
  onSelectAspect,
  selectedAspect,
  className = '',
}) => {
  if (!aspects || aspects.length === 0) {
    return (
      <div className={`p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 ${className}`}>
        No aspect data analyzed yet.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {aspects.map((aspect, idx) => {
        const isSelected = selectedAspect?.toLowerCase() === aspect.name.toLowerCase();

        // Calculate a visual progress bar percentage based on sentiment
        let percent = 50;
        let barColor = 'bg-slate-400';
        if (aspect.sentiment === 'Positive') {
          percent = 90;
          barColor = 'bg-emerald-500';
        } else if (aspect.sentiment === 'Negative') {
          percent = 20;
          barColor = 'bg-rose-500';
        } else if (aspect.sentiment === 'Mixed') {
          percent = 60;
          barColor = 'bg-amber-500';
        }

        return (
          <div
            key={idx}
            onClick={() => onSelectAspect && onSelectAspect(aspect.name)}
            className={`p-3 rounded-xl border transition-all ${
              onSelectAspect ? 'cursor-pointer hover:border-cyan-500/50' : ''
            } ${
              isSelected
                ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-500 dark:border-cyan-500'
                : 'bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {aspect.name}
                </span>
                {aspect.mentions && (
                  <span className="text-[10px] text-slate-600 dark:text-slate-300">
                    ({aspect.mentions} mentions)
                  </span>
                )}
              </div>
              <SentimentBadge sentiment={aspect.sentiment} size="sm" showIcon={false} />
            </div>

            {/* Progress bar visual */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
