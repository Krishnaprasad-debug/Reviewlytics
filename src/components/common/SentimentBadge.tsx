import React from 'react';
import { ThumbsUp, ThumbsDown, Minus, RefreshCw } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  confidence?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({
  sentiment,
  confidence,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const getStyles = () => {
    switch (sentiment) {
      case 'Positive':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
          icon: <ThumbsUp className="w-3.5 h-3.5" />,
          dot: 'bg-emerald-500',
        };
      case 'Negative':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
          icon: <ThumbsDown className="w-3.5 h-3.5" />,
          dot: 'bg-rose-500',
        };
      case 'Mixed':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
          icon: <RefreshCw className="w-3.5 h-3.5" />,
          dot: 'bg-amber-500',
        };
      case 'Neutral':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
          icon: <Minus className="w-3.5 h-3.5" />,
          dot: 'bg-slate-400',
        };
    }
  };

  const styles = getStyles();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${styles.bg} ${sizeClasses[size]} ${className}`}
      title={confidence ? `AI Confidence: ${Math.round(confidence * 100)}%` : undefined}
    >
      {showIcon ? styles.icon : <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      <span>{sentiment}</span>
      {confidence !== undefined && (
        <span className="opacity-70 text-[10px] ml-0.5">({Math.round(confidence * 100)}%)</span>
      )}
    </span>
  );
};
