import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const isFull = rating >= i;
    const isHalf = !isFull && rating >= i - 0.5;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange && onChange(i)}
        className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'} focus:outline-none`}
        aria-label={`${i} stars`}
      >
        {isFull ? (
          <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
        ) : isHalf ? (
          <StarHalf className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
        ) : (
          <Star className={`${sizeClasses[size]} text-slate-300 dark:text-slate-600`} />
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showValue && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};
