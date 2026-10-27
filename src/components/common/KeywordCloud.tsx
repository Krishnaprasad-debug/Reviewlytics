import React from 'react';
import { Tag } from 'lucide-react';

interface KeywordCloudProps {
  keywords: (string | { keyword: string; count?: number })[];
  selectedKeyword?: string | null;
  onSelectKeyword?: (keyword: string | null) => void;
  maxKeywords?: number;
  className?: string;
}

export const KeywordCloud: React.FC<KeywordCloudProps> = ({
  keywords,
  selectedKeyword,
  onSelectKeyword,
  maxKeywords = 20,
  className = '',
}) => {
  if (!keywords || keywords.length === 0) {
    return (
      <div className={`p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 ${className}`}>
        No recurring keywords identified.
      </div>
    );
  }

  const items = keywords.slice(0, maxKeywords);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item, idx) => {
        const word = typeof item === 'string' ? item : item.keyword;
        const count = typeof item === 'object' && item.count ? item.count : null;
        const isSelected = selectedKeyword?.toLowerCase() === word.toLowerCase();

        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (onSelectKeyword) {
                onSelectKeyword(isSelected ? null : word);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSelected
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20'
            }`}
          >
            <Tag className="w-3 h-3 opacity-60" />
            <span>{word}</span>
            {count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
