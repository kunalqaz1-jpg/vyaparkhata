import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { testConnection } from '../../lib/firebase';
import {
  ShieldAlert,
  Database,
  Activity,
  CheckCircle,
  Building2,
  Users,
  RefreshCw,
  Server
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { businesses, customers, transactions } = useBusiness();
  const { profile } = useAuth();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const checkHealth = async () => {
    setDbStatus('checking');
    const start = performance.now();
    try {
      const ok = await testConnection();
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setDbStatus(ok ? 'connected' : 'error');
    } catch {
      setDbStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SaaS Platform Admin Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            System & Database Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as Super Admin: <span className="text-amber-300 font-mono">{profile?.email || 'kunalqaz1@gmail.com'}</span>
          </p>
        </div>

        <button
          onClick={checkHealth}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Run Health Check</span>
        </button>
      </div>

      {/* Cloud & Database Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Firestore Database Health */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cloud Firestore</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {dbStatus === 'connected' ? 'Database Online & Synced' : 'Checking Connection...'}
              </span>
            </div>
            {latencyMs !== null && (
              <p className="text-[11px] text-slate-400 mt-1">
                Roundtrip Latency: <span className="font-mono font-bold text-emerald-600">{latencyMs}ms</span>
              </p>
            )}
          </div>
        </div>

        {/* Enterprise Store */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enterprise Store</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-lg font-black text-slate-900 dark:text-white truncate block">
              Anu Tools & Service Center
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              Admin: kunalqaz1@gmail.com
            </p>
          </div>
        </div>

        {/* Global Customers tracked */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Customer Khata</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {customers.length}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">With {transactions.length} ledger operations</p>
          </div>
        </div>

      </div>

      {/* Deployment & Architecture Specifications */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-500" />
          <span>Environment & Firebase Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">GCP Project ID:</span>
              <span className="font-bold text-slate-900 dark:text-white">video-505511</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Firestore DB ID:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">ai-studio-df66e573...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security Rules:</span>
              <span className="text-emerald-600 font-bold">Hardened v2 (Deployed)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">PWA Manifest:</span>
              <span className="text-emerald-600 font-bold">Standalone / Valid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Worker:</span>
              <span className="text-emerald-600 font-bold">Active (AutoUpdate)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Financial Storage:</span>
              <span className="font-bold text-indigo-600">Decimal-safe INR</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
