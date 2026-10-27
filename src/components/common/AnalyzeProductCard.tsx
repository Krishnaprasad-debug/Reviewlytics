import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Link as LinkIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

interface AnalyzeProductCardProps {
  onSuccess?: (productId: string) => void;
  className?: string;
}

type ImportMode = 'amazon' | 'flipkart' | 'both';

export const AnalyzeProductCard: React.FC<AnalyzeProductCardProps> = ({
  onSuccess,
  className = '',
}) => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<ImportMode>('amazon');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [flipkartUrl, setFlipkartUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleAmazonUrl = 'https://www.amazon.in/dp/B0GZMYP6Y6';
  const sampleFlipkartUrl = 'https://www.flipkart.com/boat-airdopes-131-bluetooth-headset/p/itm0b377bcf4d1f2';

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'amazon' && !amazonUrl.trim()) {
      setErrorMessage('Please enter an Amazon product URL.');
      return;
    }
    if (mode === 'flipkart' && !flipkartUrl.trim()) {
      setErrorMessage('Please enter a Flipkart product URL.');
      return;
    }
    if (mode === 'both' && !amazonUrl.trim() && !flipkartUrl.trim()) {
      setErrorMessage('Please provide at least one Amazon or Flipkart URL.');
      return;
    }

    setIsLoading(true);

    try {
      let res: any;

      if (mode === 'amazon') {
        setLoadingStep('Connecting to Apify Actor & extracting Amazon reviews...');
        res = await api.import.importAmazon(amazonUrl.trim());
      } else if (mode === 'flipkart') {
        setLoadingStep('Connecting to Apify Actor & extracting Flipkart reviews...');
        res = await api.import.importFlipkart(flipkartUrl.trim());
      } else {
        setLoadingStep('Extracting multi-platform reviews from Amazon and Flipkart...');
        res = await api.import.analyzeMulti({
          amazonUrl: amazonUrl.trim() || undefined,
          flipkartUrl: flipkartUrl.trim() || undefined,
        });
      }

      if (res && res.success && res.productId) {
        setLoadingStep('Synthesizing review intelligence with AI Analysis...');
        if (res.reviewCount === 0) {
          success(`Imported ${res.product?.name || 'product'}! (Listing details saved, no written customer reviews published yet)`);
        } else {
          success(`Successfully analyzed ${res.product?.name || 'product'} with ${res.reviewCount} reviews analyzed!`);
        }
        if (onSuccess) {
          onSuccess(res.productId);
        } else {
          navigate(`/products/${res.productId}`);
        }
      } else {
        throw new Error(res?.error || res?.message || 'Failed to analyze product reviews.');
      }
    } catch (err: any) {
      console.error('[AnalyzeProductCard Error]:', err);
      const msg = err.message || 'An error occurred while importing and analyzing product reviews.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-slate-800 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/70 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-World AI Review Ingestion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Analyze a Product
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Paste an Amazon or Flipkart URL to ingest verified customer reviews and generate AI sentiment insights.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl border border-slate-300/40 dark:border-slate-700/60 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => { setMode('amazon'); setErrorMessage(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'amazon'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Amazon Only
          </button>
          <button
            type="button"
            onClick={() => { setMode('flipkart'); setErrorMessage(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'flipkart'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Flipkart Only
          </button>
          <button
            type="button"
            onClick={() => { setMode('both'); setErrorMessage(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'both'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Amazon + Flipkart
          </button>
        </div>
      </div>

      {/* Import Form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        {/* Amazon Input */}
        {(mode === 'amazon' || mode === 'both') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase">
                  Amazon
                </span>
                <span>Amazon Product URL</span>
              </label>
              <button
                type="button"
                onClick={() => setAmazonUrl(sampleAmazonUrl)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Use boAt Earbuds Example
              </button>
            </div>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={amazonUrl}
                onChange={e => setAmazonUrl(e.target.value)}
                placeholder="Amazon product URL, amzn.in short-link, or 10-character ASIN (e.g. B0GZMYP6Y6)"
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Flipkart Input */}
        {(mode === 'flipkart' || mode === 'both') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-sm bg-blue-600/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase">
                  Flipkart
                </span>
                <span>Flipkart Product URL or PID</span>
              </label>
              <button
                type="button"
                onClick={() => setFlipkartUrl(sampleFlipkartUrl)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Use Flipkart Example
              </button>
            </div>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={flipkartUrl}
                onChange={e => setFlipkartUrl(e.target.value)}
                placeholder="Flipkart product URL or Product ID (PID e.g. TWCH4F6HYUYZXX7H)"
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Loading / Progress Alert */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{loadingStep || 'Processing ingestion pipeline...'}</span>
            </div>
            <div className="h-1.5 w-full bg-indigo-200/60 dark:bg-indigo-900/60 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse w-3/4 transition-all duration-300" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              This calls verified review ingestion and AI NLP. Ingestion takes approximately 5–15 seconds.
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Extracts verified reviews with real written feedback • Server-side token security</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Product...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Product</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
