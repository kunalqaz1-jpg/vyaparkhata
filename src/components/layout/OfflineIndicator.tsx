import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-18 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-xl animate-fade-in border border-amber-500/40">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
      <span>Offline Mode — Cached data active. Updates will sync automatically once online.</span>
    </div>
  );
};
