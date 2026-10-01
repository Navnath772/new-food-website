import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  CloudCheck,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { OfflineStorageManager } from '../services/offlineStorage';

export const OfflineStatusBanner: React.FC<{
  lastSyncTime?: string | null;
  onForceSync?: () => void;
}> = ({ lastSyncTime, onForceSync }) => {
  const { isOnline, simulatedOffline, toggleSimulatedOffline } = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const queuedActions = OfflineStorageManager.getQueuedActions();

  const handleSyncClick = () => {
    setIsSyncing(true);
    if (onForceSync) onForceSync();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        !isOnline
          ? 'bg-amber-500/15 border-amber-300 text-amber-950'
          : 'bg-emerald-50 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
            !isOnline
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-emerald-600 text-white shadow-xs'
          }`}
        >
          {!isOnline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs sm:text-sm">
              {!isOnline
                ? 'Offline Mode Active — Viewing Local Cached Data'
                : 'Online Mode Active — Auto-Sync Enabled'}
            </span>
            {simulatedOffline && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                SIMULATION
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-600">
            {!isOnline
              ? 'Mobile signal unavailable or offline simulation enabled. Pickup details, addresses & OTPs are securely cached.'
              : lastSyncTime
              ? `Last synced to device localStorage: ${new Date(lastSyncTime).toLocaleTimeString()}`
              : 'All active volunteer mission manifests cached locally for instant offline retrieval.'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {queuedActions.length > 0 && (
          <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-lg font-bold">
            {queuedActions.length} queued action(s)
          </span>
        )}

        <button
          onClick={handleSyncClick}
          disabled={!isOnline || isSyncing}
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          title="Force refresh offline cache now"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Cache Now'}</span>
        </button>

        {/* Test Offline Mode Simulation Toggle for Jury / Demos */}
        <button
          onClick={toggleSimulatedOffline}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            simulatedOffline
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
          title="Simulate losing cellular signal in the field"
        >
          {simulatedOffline ? 'Resume Online' : 'Simulate Offline'}
        </button>
      </div>
    </div>
  );
};
