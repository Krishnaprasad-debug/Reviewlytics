import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { MockMarketplaceProduct } from '../../data/mockMarketplaceProducts.js';

interface AnalysisLoadingModalProps {
  isOpen: boolean;
  product: MockMarketplaceProduct | null;
  onComplete: (product: MockMarketplaceProduct) => void;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
}

const ANALYSIS_STEPS: StepItem[] = [
  { id: 1, label: 'Product selected', detail: 'Marketplace SKU verified & matched with intelligence database' },
  { id: 2, label: 'Loading available reviews', detail: 'Ingesting customer ratings, text body, and timestamps' },
  { id: 3, label: 'Processing customer feedback', detail: 'Normalizing tone, cleaning punctuation, and deduplicating' },
  { id: 4, label: 'Running sentiment analysis', detail: 'Computing positive, neutral, and negative semantic entropy' },
  { id: 5, label: 'Extracting product aspects', detail: 'Isolating display, battery, camera, audio, and ergonomics' },
  { id: 6, label: 'Generating pros and cons', detail: 'Distilling verified strengths and reported critical flaws' },
  { id: 7, label: 'Preparing AI summary', detail: 'Synthesizing executive recommendation and buyer intelligence' },
];

export const AnalysisLoadingModal: React.FC<AnalysisLoadingModalProps> = ({
  isOpen,
  product,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);

  useEffect(() => {
    if (!isOpen || !product) {
      setCurrentStepIndex(0);
      setProgressPercent(10);
      return;
    }

    // Step pacing: Each step takes ~240ms so total duration is ~1.7 seconds (snappy demo experience)
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= ANALYSIS_STEPS.length) {
          clearInterval(stepInterval);
          setProgressPercent(100);
          setTimeout(() => {
            onComplete(product);
          }, 350);
          return ANALYSIS_STEPS.length;
        }
        setProgressPercent(Math.min(96, Math.round(((next + 1) / ANALYSIS_STEPS.length) * 100)));
        return next;
      });
    }, 240);

    return () => clearInterval(stepInterval);
  }, [isOpen, product, onComplete]);

  if (!isOpen || !product) return null;

  const isAmazon = product.source === 'amazon';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Decorative subtle ambient gradient ring */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
              <span>AI Review Analysis Engine</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Analyzing Product Reviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extracting sentiment polarity and aspect dimensions in real-time
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 border ${
              isAmazon
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            {isAmazon ? 'Amazon' : 'Flipkart'}
          </div>
        </div>

        {/* Target Product Summary Box */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={e => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{product.brand}</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200 font-bold">{product.formattedPrice}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{product.reviewCount.toLocaleString()} reviews</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">Analysis Progress</span>
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Checklist Steps */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60'
                    : 'opacity-80'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 transition-all" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? 'text-slate-900 dark:text-slate-100'
                        : isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isCurrent && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 animate-in fade-in duration-150">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center text-slate-400">
          Powered by Advanced Natural Language Processing & Aspect Sentiment Extraction
        </div>
      </div>
    </div>
  );
};
