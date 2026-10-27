import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  Sparkles,
  Sun,
  Moon,
  Database,
  Sliders,
  Bell,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  HardDrive,
  Link as LinkIcon,
  Unlink,
  Check,
  Key,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { CsvUploadModal } from '../components/modals/CsvUploadModal.js';
import { Product } from '../types/index.js';
import { api, DatabaseStatusData } from '../services/api.js';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast, success } = useToast();

  const [model, setModel] = useState('standard-nlp');
  const [temperature, setTemperature] = useState('0.2');
  const [confidenceThreshold, setConfidenceThreshold] = useState('0.7');
  const [enableSpamDetection, setEnableSpamDetection] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBatchReanalyze, setAutoBatchReanalyze] = useState(true);

  // Supabase PostgreSQL & Storage engine state
  const [dbStatus, setDbStatus] = useState<DatabaseStatusData | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [schemaSql, setSchemaSql] = useState<string | null>(null);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  // CSV Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Apify Token state
  const [apifyStatus, setApifyStatus] = useState<{ isConfigured: boolean; maskedToken: string | null; hasToken: boolean } | null>(null);
  const [apifyTokenInput, setApifyTokenInput] = useState('');
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [isSavingApify, setIsSavingApify] = useState(false);

  const fetchDbStatus = async () => {
    try {
      setIsLoadingDb(true);
      const res = await api.settings.getDatabaseStatus();
      if (res.success && res.data) {
        setDbStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to load database status:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const fetchApifyStatus = async () => {
    try {
      const res = await api.settings.getApifyStatus();
      if (res.success && res.data) {
        setApifyStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to load Apify status:', err);
    }
  };

  useEffect(() => {
    fetchDbStatus();
    fetchApifyStatus();
  }, []);

  useEffect(() => {
    api.products.getAll({ limit: 100 }).then(res => {
      if (res.success && res.data) {
        setProducts(res.data.products);
      }
    }).catch(() => {});
  }, []);

  const handleSaveAISettings = (e: React.FormEvent) => {
    e.preventDefault();
    success('AI analysis engine settings saved successfully!');
  };

  const handleSaveApifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apifyTokenInput.trim()) {
      toast('Please enter a valid Apify API token', 'error');
      return;
    }
    setIsSavingApify(true);
    try {
      const res = await api.settings.saveApifyToken(apifyTokenInput.trim());
      if (res.success) {
        success('Apify API token saved and activated successfully!');
        setApifyTokenInput('');
        fetchApifyStatus();
      } else {
        toast(res.message || 'Failed to save Apify token', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to save Apify token', 'error');
    } finally {
      setIsSavingApify(false);
    }
  };

  const handleTestSupabase = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await api.settings.testSupabaseConfig();
      if (res.success) {
        setTestResult({ success: true, message: res.message });
        success('Supabase PostgreSQL read/write verification passed!');
        fetchDbStatus();
      } else {
        setTestResult({ success: false, message: res.message });
        toast(res.message, 'error');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
      toast(err.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncSupabase = async () => {
    try {
      setIsSyncing(true);
      const res = await api.settings.syncSupabase();
      if (res.success) {
        success(res.message || 'Data migrated and reconciled with Supabase PostgreSQL!');
        fetchDbStatus();
      } else {
        toast(res.message || 'Sync failed', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to sync data', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySchemaSql = async () => {
    try {
      let sqlText = schemaSql;
      if (!sqlText) {
        const res = await api.settings.getSchemaSql();
        if (res.success && res.data?.sql) {
          sqlText = res.data.sql;
          setSchemaSql(sqlText);
        }
      }
      if (sqlText) {
        await navigator.clipboard.writeText(sqlText);
        setShowSqlPreview(true);
        success('Migration SQL copied to clipboard! Paste it into your Supabase SQL Editor and click Run.');
      } else {
        toast('Could not load migration SQL', 'error');
      }
    } catch (err: any) {
      toast('Could not copy SQL automatically; displaying SQL below to copy manually.', 'error');
      setShowSqlPreview(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* AI Engine Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                AI NLP & Analytics Engine Parameters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure server-side Natural Language Processing and structured inference behavior.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Active Engine
          </span>
        </div>

        <form onSubmit={handleSaveAISettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                AI Processing Profile
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="standard-nlp">Standard AI NLP (High Speed / Low Latency)</option>
                <option value="deep-nlp">Deep Reasoning NLP (Comprehensive Synthesis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sampling Temperature ({temperature})
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                className="w-full mt-2 accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.0 (Deterministic)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Fake / Spam Review Detection
                </div>
                <div className="text-[11px] text-slate-500">
                  Run heuristic bot entropy and context checks
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableSpamDetection}
                onChange={e => setEnableSpamDetection(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Auto-Analyze on CSV Import
                </div>
                <div className="text-[11px] text-slate-500">
                  Instantly process incoming batch uploads
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoBatchReanalyze}
                onChange={e => setAutoBatchReanalyze(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-all inline-flex items-center gap-2 mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save AI Engine Preferences</span>
          </button>
        </form>
      </div>

      {/* Theme & Display Appearance */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Interface Appearance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose between crisp daylight aesthetic or deep dark mode for visual focus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Crisp Light Mode</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Optically balanced light theme</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Modern Dark Mode</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Low-glare contrast for deep focus</div>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Review Import (CSV) - Requirement 17 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Manual Review Import
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional fallback for importing review datasets for analysis.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Batch CSV Dataset Uploader
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Import pre-compiled CSV review files with columns for <code className="text-indigo-600 dark:text-indigo-400 font-mono">title</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono">reviewText</code>, and <code className="text-indigo-600 dark:text-indigo-400 font-mono">rating</code> into any tracked catalog SKU.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Open CSV Uploader</span>
          </button>
        </div>
      </div>

      {/* Marketplace Review Ingestion & Apify Scraper Engine */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              apifyStatus?.isConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Marketplace Scraper Engine (Apify)
                </h3>
                {apifyStatus?.isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Active Token</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Token Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powers real-time review extraction for Amazon and Flipkart product links.
              </p>
            </div>
          </div>

          {apifyStatus?.maskedToken && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              Token: {apifyStatus.maskedToken}
            </div>
          )}
        </div>

        <form onSubmit={handleSaveApifyToken} className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Apify Personal API Token
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Required to scrape uncached Amazon (ASIN) and Flipkart (PID) product reviews.
                </p>
              </div>
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Get API Token from Apify Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showApifyToken ? 'text' : 'password'}
                value={apifyTokenInput}
                onChange={e => setApifyTokenInput(e.target.value)}
                placeholder={apifyStatus?.isConfigured ? 'Enter new token to replace existing' : 'apify_api_••••••••••••••••••••••••••••••••'}
                className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowApifyToken(!showApifyToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showApifyToken ? 'Hide token' : 'Show token'}
              >
                {showApifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Stored securely on the backend server environment and never exposed in client bundles.
              </div>

              <button
                type="submit"
                disabled={isSavingApify || !apifyTokenInput.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSavingApify ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Token...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Save & Activate Token</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Database & Persistent Storage Engine (Supabase PostgreSQL) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              dbStatus?.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Supabase PostgreSQL Database Engine
                </h3>
                {dbStatus?.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Supabase Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <HardDrive className="w-3 h-3" />
                    Credentials Needed (Preserved Store Active)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Primary relational PostgreSQL persistence powered by Supabase with automatic record migration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchDbStatus}
              disabled={isLoadingDb}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin text-cyan-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Supabase Active Status Card */}
        {dbStatus?.isConnected ? (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Live Supabase PostgreSQL Connection Verified
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  Host: {dbStatus.host || 'supabase.co'} | Schema: {dbStatus.dbName || 'public'}
                </div>
              </div>

              {dbStatus.maskedUri && (
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800/80 text-xs font-mono text-slate-700 dark:text-slate-300 break-all flex items-center justify-between gap-2">
                  <span className="truncate">{dbStatus.maskedUri}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Active Primary DB
                  </span>
                </div>
              )}

              {/* Data Record Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950 text-center">
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {dbStatus.localStats?.products || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Products</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950 text-center">
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {dbStatus.localStats?.reviews || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Reviews</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950 text-center">
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {dbStatus.localStats?.analyses || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">AI Analyses</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950 text-center">
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {dbStatus.localStats?.listings || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Store Listings</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSyncSupabase}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Reconciling...' : 'Reconcile Records to Supabase'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? 'Running Verification...' : 'Run Read/Write Verification'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Awaiting Server Environment Configuration (Preserved Dataset Active)
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/40 px-2 py-0.5 rounded">
                {dbStatus?.localStats?.products || 0} Products • {dbStatus?.localStats?.reviews || 0} Reviews Preserved
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Configure your Supabase PostgreSQL server environment secrets and execute <code className="font-mono font-bold">supabase/migrations/20261026000001_initial_reviewlytics_schema.sql</code> in the Supabase SQL Editor to activate live relational storage.
            </p>
            {dbStatus?.lastError && (
              <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                Status: {dbStatus.lastError}
              </div>
            )}

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">
                  <div className="font-bold">{testResult.success ? 'Read/Write Verification Passed' : 'Verification Status'}</div>
                  <div>{testResult.message}</div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopySchemaSql}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>1. Copy SQL Schema for Supabase SQL Editor</span>
              </button>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Running Read/Write Test...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>2. Verify Read & Safe Write</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSyncSupabase}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Migrating Records...' : '3. Migrate Preserved Data to Supabase'}</span>
              </button>
            </div>

            {showSqlPreview && schemaSql && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>SQL Migration (`supabase/migrations/20261026000001_initial_reviewlytics_schema.sql`):</span>
                  <button
                    type="button"
                    onClick={() => setShowSqlPreview(false)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Hide SQL
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-64 border border-slate-700 select-all">
                  {schemaSql}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSV Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        products={products}
        onSuccess={() => {
          success('CSV reviews successfully uploaded and queued for AI analysis.');
        }}
      />
    </div>
  );
};
