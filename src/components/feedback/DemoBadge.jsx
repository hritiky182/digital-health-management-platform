import React, { useState } from 'react';
import { ShieldCheck, Info, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useOffline } from '../../context/OfflineContext';

export function DemoBadge() {
  const [open, setOpen] = useState(false);
  const { resetDemoData } = useData();
  const { isOfflineMode, toggleOfflineMode, isSyncing, pendingCount } = useOffline();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="badge badge-amber"
        style={{
          cursor: 'pointer',
          padding: '0.25rem 0.65rem',
          fontSize: '0.725rem',
          fontWeight: 600,
          border: '1px solid #fde68a',
          gap: '0.4rem',
          display: 'flex',
          alignItems: 'center'
        }}
        title="CareAxis Demonstration Sandbox Context"
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isOfflineMode ? '#ef4444' : '#f59e0b',
            display: 'inline-block'
          }}
        />
        <span>DEMO ENVIRONMENT</span>
        {isOfflineMode && <span style={{ color: '#b91c1c', fontWeight: 700 }}>• OFFLINE</span>}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card"
            style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: '320px',
              zIndex: 100,
              boxShadow: 'var(--shadow-dialog)',
              padding: '1rem',
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} color="#0f766e" />
              <strong style={{ color: '#0f172a' }}>Demonstration Sandbox</strong>
            </div>
            <p style={{ color: '#475569', fontSize: '0.775rem', lineHeight: 1.4, marginBottom: '0.75rem' }}>
              All records, diagnostics, facilities, and clinical encounters are synthetic demonstration data.
              Integrations with national databases, HIE, and pharmacies are simulated client-side using browser LocalStorage.
            </p>

            {/* Offline simulation toggle */}
            <div
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: isOfflineMode ? '#fef2f2' : '#f8fafc',
                borderRadius: '6px',
                border: `1px solid ${isOfflineMode ? '#fecaca' : '#e2e8f0'}`,
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.775rem', color: isOfflineMode ? '#991b1b' : '#334155' }}>
                  {isOfflineMode ? 'Offline Store & Forward' : 'Online Connection Active'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {pendingCount > 0 ? `${pendingCount} events in sync queue` : 'No pending offline syncs'}
                </div>
              </div>
              <button
                className={`btn btn-sm ${isOfflineMode ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleOfflineMode}
                disabled={isSyncing}
                style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
              >
                {isSyncing ? (
                  'Syncing...'
                ) : isOfflineMode ? (
                  <>
                    <Wifi size={12} />
                    <span>Reconnect</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Simulate Outage</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (window.confirm('Reset all demo data back to default factory seed records?')) {
                    resetDemoData();
                    setOpen(false);
                  }
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RotateCcw size={13} />
                <span>Reset Demo to Factory State</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
