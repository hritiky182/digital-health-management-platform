import React from 'react';

export function Badge({ children, variant = 'teal', dot = false, className = '' }) {
  const variantMap = {
    teal: 'badge-teal',
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    blue: 'badge-blue',
    purple: 'badge-purple',
    gray: 'badge-gray'
  };

  const badgeClass = variantMap[variant] || 'badge-gray';

  const dotColorMap = {
    teal: '#0f766e',
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    blue: '#0284c7',
    purple: '#7c3aed',
    gray: '#64748b'
  };

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {dot && (
        <span
          className="status-dot"
          style={{ backgroundColor: dotColorMap[variant] || '#64748b' }}
        />
      )}
      {children}
    </span>
  );
}
