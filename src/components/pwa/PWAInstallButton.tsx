import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 cursor-pointer ${className}`}
          title="Install VyaparKhata as native app"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Add to iPhone</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">1</span>
                <p>Tap the <strong>Share button</strong> (square with arrow up) at the bottom toolbar in Safari.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">2</span>
                <p>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">3</span>
                <p>Tap <strong>Add</strong> in the top right. Launch VyaparKhata full-screen without address bar!</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2.5 text-sm font-semibold hover:opacity-90 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
