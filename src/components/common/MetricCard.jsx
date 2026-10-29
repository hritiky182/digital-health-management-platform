import React from 'react';

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'teal',
  trend,
  trendPositive,
  onClick
}) {
  const colorMap = {
    teal: { bg: '#f0fdfa', text: '#0f766e', border: '#ccfbf1' },
    blue: { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
    amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    green: { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0' },
    red: { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
    purple: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' }
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div className="metric-card" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div
            className="metric-icon-wrap"
            style={{ backgroundColor: scheme.bg, color: scheme.text, border: `1px solid ${scheme.border}` }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      {(subtext || trend) && (
        <div className="metric-sub">
          {trend && (
            <span
              style={{
                color: trendPositive ? '#10b981' : '#ef4444',
                fontWeight: 600
              }}
            >
              {trend}
            </span>
          )}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
}
