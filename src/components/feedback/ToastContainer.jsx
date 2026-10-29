import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    warning: <AlertTriangle size={18} color="#f59e0b" />,
    info: <Info size={18} color="#0284c7" />
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast-item">
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {iconMap[t.type] || iconMap.info}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {t.title && (
              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                {t.title}
              </h5>
            )}
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, wordBreak: 'break-word' }}>
              {t.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
