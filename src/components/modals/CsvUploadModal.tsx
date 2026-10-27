import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal.js';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  X,
} from 'lucide-react';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId?: string;
  onSuccess: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductId,
  onSuccess,
}) => {
  const { toast, success, error } = useToast();
  const [productId, setProductId] = useState(selectedProductId || '');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (selectedProductId) {
      setProductId(selectedProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0]._id);
    }
  }, [selectedProductId, products]);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      error('Please upload a valid .csv file.');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    try {
      const res = await api.upload.previewCsv(selectedFile);
      setPreviewData(res.data);
      success(`Parsed ${res.data.summary.total} rows (${res.data.summary.valid} valid).`);
    } catch (err: any) {
      error(err.message || 'Failed to parse CSV.');
      setFile(null);
      setPreviewData(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      error('Please select a CSV file to upload.');
      return;
    }
    if (!productId) {
      error('Please select a target product.');
      return;
    }

    setIsImporting(true);
    try {
      const res = await api.upload.importCsv(file, productId, autoAnalyze);
      success(res.message || 'CSV reviews imported successfully!');
      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setPreviewData(null);
    } catch (err: any) {
      error(err.message || 'Failed to import CSV.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'rating,title,reviewText,authorName\n' +
      '5,"Exceptional performance","Battery lasted 2 full days of travel and noise canceling is incredible.","Alex Chen"\n' +
      '4,"Solid sound, bulky case","Great audio quality with deep bass, but carrying case takes up too much bag room.","Jessica M."\n' +
      '1,"Hinge snapped easily","Build quality is questionable. Swivel cracked after two months.","Marcus W."\n' +
      '5,"Love it!","BEST BUY EVER GREAT SELLER!!","User123"\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_product_reviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Reviews via CSV"
      subtitle="Bulk upload customer feedback with automatic column detection and automated AI analysis."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Product selector & sample template */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="" disabled>
                Select product...
              </option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.brand})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={downloadSampleCsv}
            className="sm:mt-5 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV Template</span>
          </button>
        </div>

        {/* Dropzone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Click or drag & drop CSV review dataset here
            </h4>
            <p className="text-xs text-slate-400">
              Supports standard column headers: <code className="text-cyan-600">reviewText</code>,{' '}
              <code className="text-cyan-600">rating</code>, <code className="text-cyan-600">title</code>,{' '}
              <code className="text-cyan-600">author</code>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{file.name}</div>
                <div className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewData(null);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isParsing && (
          <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Parsing and validating CSV columns...</span>
          </div>
        )}

        {/* Preview Summary */}
        {previewData && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Rows</div>
                <div className="text-lg font-black text-slate-800 dark:text-slate-200">
                  {previewData.summary.total}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  Valid Rows
                </div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {previewData.summary.valid}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                  Invalid Rows
                </div>
                <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {previewData.summary.invalid}
                </div>
              </div>
            </div>

            {/* Error log if any */}
            {previewData.errors && previewData.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Validation Notices ({previewData.errors.length})</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {previewData.errors.slice(0, 3).map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview table */}
            {previewData.previewRows && previewData.previewRows.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  Sample Parsed Records (First {previewData.previewRows.length})
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 font-semibold border-b border-slate-200/60 dark:border-slate-800">
                      <tr>
                        <th className="p-2">Rating</th>
                        <th className="p-2">Author</th>
                        <th className="p-2">Review Content</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {previewData.previewRows.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2 font-bold text-amber-500">{r.rating} ★</td>
                          <td className="p-2 text-slate-500 dark:text-slate-400">{r.authorName}</td>
                          <td className="p-2 text-slate-700 dark:text-slate-300 truncate max-w-xs">
                            {r.reviewText}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Auto AI Option */}
            <div className="p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <div className="font-semibold text-xs text-cyan-900 dark:text-cyan-200">
                    Auto-Analyze with AI Intelligence
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Run sentiment classification & aspect breakdown upon import.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={e => setAutoAnalyze(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || !previewData || previewData.summary.valid === 0 || isImporting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
          >
            {isImporting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>
              {isImporting
                ? 'Importing & Analyzing...'
                : `Import ${previewData?.summary?.valid || ''} Reviews`}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
