import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  UploadCloud,
  Layers,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Star,
  Cpu,
  FileSpreadsheet,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { SentimentBadge } from '../components/common/SentimentBadge.js';
import { SuspiciousBadge } from '../components/common/SuspiciousBadge.js';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Sandbox State on landing
  const [sandboxText, setSandboxText] = useState(
    'The noise canceling on these headphones is unmatched! Battery lasted over 30 hours on my flight. However, the headband can slide slightly when walking fast.'
  );
  const [sandboxRating, setSandboxRating] = useState(5);

  const sampleAspects = [
    { name: 'Noise Cancellation', sentiment: 'Positive' as const },
    { name: 'Battery Life', sentiment: 'Positive' as const },
    { name: 'Headband Fit', sentiment: 'Mixed' as const },
  ];

  const faqs = [
    {
      q: 'How does the AI analyze customer reviews?',
      a: 'Our platform sends review text to server-side NLP models with structured schema enforcement. It performs Natural Language Processing to extract core sentiment (Positive, Negative, Neutral, Mixed), score aspect categories (e.g. Battery, Comfort, Audio), highlight distinct pros & cons, and detect suspicious patterns.',
    },
    {
      q: 'Can I upload my existing review datasets in CSV format?',
      a: 'Yes! The CSV Importer automatically identifies columns like reviewText, rating, author, and title. You can preview and validate your dataset before importing hundreds of customer reviews with a single click.',
    },
    {
      q: 'How does Suspicious Review Detection work?',
      a: 'Our AI examines text entropy, keyword repetition, excessive generic emotional hype, lack of product-specific technical context, and conflicting star ratings to flag potentially suspicious or promotional reviews.',
    },
    {
      q: 'Are my review data and credentials secure?',
      a: 'Absolutely. In accordance with strict full-stack security standards, all AI API calls and credentials reside solely on the Express backend and are never exposed to the client browser.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800/60 text-xs font-bold text-cyan-700 dark:text-cyan-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Next-Gen AI Review Intelligence & Sentiment Mining</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Turn Customer Reviews into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
                Actionable Growth Insights
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Analyze product reviews from Amazon and Flipkart in seconds. Automatically extract aspect-based sentiments, uncover recurring defects, detect suspicious reviews, and generate executive summaries with AI Review Intelligence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Analyze Amazon & Flipkart URL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Live Dashboard</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero-Config CSV Import</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Structured NLP Schemas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Bot & Spam Detection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Section */}
      <section id="demo" className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive AI Review Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
              Test how AI extracts granular sentiments, breaks down specific hardware aspects, and calculates confidence scores in real-time.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input column */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sample Review Text
                </label>
                <textarea
                  rows={5}
                  value={sandboxText}
                  onChange={e => setSandboxText(e.target.value)}
                  className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Rating</span>
                <RatingStars rating={sandboxRating} interactive onChange={val => setSandboxRating(val)} />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Dynamic AI NLP extraction engine</span>
              </div>
            </div>

            {/* AI Output Card Preview */}
            <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  Real-Time AI Extraction
                </span>
                <SentimentBadge sentiment="Positive" confidence={0.96} />
              </div>

              {/* Aspects breakdown preview */}
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">Aspect Breakdown</div>
                <div className="grid grid-cols-1 gap-2">
                  {sampleAspects.map((asp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{asp.name}</span>
                      <SentimentBadge sentiment={asp.sentiment} size="sm" showIcon={false} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros and Cons mini */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px]">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">Key Strength</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-snug">Class-leading noise cancellation & 30h battery.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[11px]">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">Watchout</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-snug">Loose headband clamping pressure.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Authenticity check:</span>
                <SuspiciousBadge status="Genuine" reason="Detailed ergonomic context" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Comprehensive Review Understanding
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Everything product managers, e-commerce brands, and researchers need to extract intelligence from feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                AI Sentiment Mining
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Classify sentiment into Positive, Negative, Neutral, or Mixed with confidence metrics and strict JSON schema guarantees.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Aspect-Based Breakdown
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Extract sentiment for individual product dimensions such as battery life, build quality, customer support, display, and pricing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Suspicious Review Detection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Identify suspicious, repetitive, and bot-generated reviews using AI entropy algorithms and context-aware pattern flags.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Bulk CSV Dataset Import
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload existing customer reviews in bulk with automatic column header detection, row validation, and batch AI analysis.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Visual Analytics & Trends
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Track review volumes, monthly sentiment velocity, 5-star rating spreads, and interactive keyword tags with D3/Recharts.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                AI Product Comparison
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Select 2 or more products and get a synthesized side-by-side analysis, feature matrix, and buyer recommendations from AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Simple 4-Step Analysis Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              From raw customer text to high-level strategic intelligence in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Add Products</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Catalog your SKUs, brand names, prices, categories, and descriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Collect Reviews</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Input reviews manually or bulk upload existing CSV datasets with 1-click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">AI Processing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Server-side AI parses aspects, pros/cons, keywords, and bot indicators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Analyze & Act</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Read executive summaries, aspect charts, and benchmark against rivals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear answers regarding our architecture, AI accuracy, and features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-cyan-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">REVIEWLYTICS</span>
            <span>— AI-Powered Product Review Analysis and Insight Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Dashboard
            </Link>
            <Link to="/products" className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Products
            </Link>
            <Link to="/reviews" className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Reviews
            </Link>
            <Link to="/compare" className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Compare
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
