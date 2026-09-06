'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, Upload, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function BulkImportCards() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/cards/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        setResult(json);
      } else {
        setError(json.error || 'Failed to process import file.');
      }
    } catch (err) {
      setError('Connection timeout or network failure.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,cardNumber,nfcUid,productSku\nNFC-PVC-10001,04A1B2C3D4E5,NFC-PVC-BLACK\nNFC-PVC-10002,04B1B2C3D4E6,NFC-PVC-BLACK\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'cards_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/cards"
          className="p-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Bulk Import</h1>
          <p className="text-slate-400 text-sm mt-1">Register multiple NFC cards in a single CSV batch import.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white">Upload CSV File</h2>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all text-center relative group">
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto group-hover:text-blue-500 transition-colors" />
                  <div className="text-sm font-bold text-slate-300">
                    {file ? file.name : 'Select or drag CSV file'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Max size: 5MB. File must terminate with standard CSV headers.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-950/20 border border-red-900 text-red-400 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="flex-1 py-3.5 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Download Template
                </button>
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Start Import</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Summary */}
          {result && (
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Import Report</h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Imported</span>
                  <span className="text-2xl font-extrabold text-emerald-400 block">{result.imported}</span>
                </div>
                <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Failed</span>
                  <span className="text-2xl font-extrabold text-red-400 block">{result.failed}</span>
                </div>
                <div className="p-4 bg-slate-950/20 border border-slate-850 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Skipped</span>
                  <span className="text-2xl font-extrabold text-slate-300 block">{result.skipped}</span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white">Validation Errors</h3>
                  <div className="max-h-60 overflow-y-auto border border-slate-850 rounded-2xl divide-y divide-slate-880">
                    {result.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-3 text-xs flex justify-between gap-4">
                        <span className="font-mono text-slate-400">Card: {err.cardNumber || '—'}</span>
                        <span className="text-red-400 font-semibold">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6 h-fit text-xs leading-relaxed text-slate-400">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">CSV Guidelines</h2>
          <ul className="list-disc pl-4 space-y-3">
            <li>File must be standard comma-separated format.</li>
            <li>Required column: <strong className="text-white">cardNumber</strong> (Unique serial identifier).</li>
            <li>Optional column: <strong className="text-white">nfcUid</strong> (Unique 12-digit hex key).</li>
            <li>Optional column: <strong className="text-white">productSku</strong> (Must match stock SKU code).</li>
            <li>Duplicates in database or files will fail validation and block imports.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
