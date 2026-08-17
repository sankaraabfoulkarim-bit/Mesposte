import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline }) => {
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      id="network-status-indicator"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-bounce"
    >
      {!isOnline ? (
        <div className="flex items-center gap-2.5 bg-slate-900/95 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-amber-500/30 text-xs backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <WifiOff className="w-4 h-4 text-amber-400" />
          <div>
            <p className="font-bold text-amber-300">Mode Hors-Ligne</p>
            <p className="text-[10px] text-slate-300">Créations locales disponibles</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold animate-fadeIn">
          <Wifi className="w-4 h-4" />
          <span>Connexion rétablie</span>
        </div>
      )}
    </div>
  );
};
