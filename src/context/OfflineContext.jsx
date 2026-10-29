import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [syncQueue, setSyncQueue] = useState(() => StorageService.getSyncQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  const toggleOfflineMode = () => {
    if (isOfflineMode) {
      // Reconnecting! Trigger simulated sync
      setIsSyncing(true);
      setTimeout(() => {
        const count = syncQueue.length;
        StorageService.clearSyncQueue();
        setSyncQueue([]);
        setIsSyncing(false);
        setIsOfflineMode(false);
        StorageService.addAuditLog({
          user: 'Store-and-Forward Engine',
          role: 'System Background Worker',
          action: 'OFFLINE_SYNC_RECONCILE',
          category: 'Interoperability',
          resource: `Synchronized ${count} pending offline events`,
          facility: 'Local Node',
          ipAddress: '127.0.0.1 (Reconnected)',
          status: 'SUCCESS',
          details: 'Local cache reconciled with central health exchange. Zero conflict detected.'
        });
      }, 1600);
    } else {
      setIsOfflineMode(true);
      StorageService.addAuditLog({
        user: 'Network Guardian',
        role: 'System Monitor',
        action: 'OFFLINE_MODE_ENGAGED',
        category: 'System',
        resource: 'Local Cache Store',
        facility: 'Local Node',
        ipAddress: 'Disconnected',
        status: 'OFFLINE_ACTIVE',
        details: 'Simulated connectivity outage. Read/write operations switching to encrypted LocalStorage store-and-forward.'
      });
    }
  };

  const queueOfflineAction = (actionDescription) => {
    const updated = StorageService.addToSyncQueue(actionDescription);
    setSyncQueue(updated);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOfflineMode,
        isSyncing,
        syncQueue,
        toggleOfflineMode,
        queueOfflineAction,
        pendingCount: syncQueue.length
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
}
