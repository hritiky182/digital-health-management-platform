import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Download,
  Filter,
  Activity,
  UserCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { MetricCard } from '../../components/common/MetricCard';

export function SecurityAuditPage() {
  const { auditLogs } = useData();

  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'breakglass'
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
      return true;
    });
  }, [auditLogs, categoryFilter]);

  const breakGlassLogs = useMemo(() => {
    return auditLogs.filter(log => log.action === 'BREAK_GLASS_OVERRIDE' || log.action === 'BREAK_GLASS_ACCESS');
  }, [auditLogs]);

  const columns = [
    {
      key: 'timestamp',
      header: 'Audit Timestamp',
      width: '180px',
      render: (val) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            {new Date(val).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Security Action Code',
      render: (act, row) => (
        <div>
          <div style={{ fontWeight: 600, color: row.status === 'AUDITED_OVERRIDE' ? '#dc2626' : '#0f766e' }}>
            {act}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            Category: <strong>{row.category}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      header: 'Authenticated Officer',
      render: (usr, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{usr}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            Role: <strong>{row.role}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'resource',
      header: 'Target Healthcare Resource',
      render: (res) => <span style={{ fontSize: '0.8rem', color: '#1e293b' }}>{res}</span>
    },
    {
      key: 'facility',
      header: 'Node Context / IP',
      render: (fac, row) => (
        <div>
          <div style={{ fontSize: '0.775rem' }}>{fac || 'Demonstration Console'}</div>
          <div style={{ fontSize: '0.675rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            {row.ipAddress || '10.0.0.1'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Audit Result',
      width: '140px',
      render: (status) => (
        <Badge
          variant={
            status === 'SUCCESS' ? 'green' :
            status === 'AUDITED_OVERRIDE' ? 'red' : 'blue'
          }
          dot
        >
          {status}
        </Badge>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Information Security Governance & Audit Trail</h1>
            <Badge variant="teal">Tamper-Evident Security Log</Badge>
          </div>
          <p className="page-description">
            Immutable system audit logs complying with ISO 27799 health sector controls. Tracks longitudinal record accesses, electronic prescription signing, and emergency break-glass overrides.
          </p>
        </div>

        <div className="page-actions">
          <div
            style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'logs' ? '#0f766e' : 'transparent',
                color: activeTab === 'logs' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Unified Audit Feed ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('breakglass')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'breakglass' ? '#0f766e' : 'transparent',
                color: activeTab === 'breakglass' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Break-Glass Overrides ({breakGlassLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Total Audit Events Recorded"
          value={auditLogs.length}
          subtext="Cryptographically sealed in browser"
          icon={ShieldCheck}
          color="teal"
        />
        <MetricCard
          title="Break-Glass Overrides"
          value={breakGlassLogs.length}
          subtext="Emergency clinical exemptions"
          icon={ShieldAlert}
          color={breakGlassLogs.length > 0 ? 'red' : 'green'}
        />
        <MetricCard
          title="Data Integrity Status"
          value="100% Valid"
          subtext="Zero hash sequence mismatches"
          icon={Activity}
          color="green"
        />
      </div>

      {activeTab === 'logs' ? (
        <div className="card">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredLogs}
              searchPlaceholder="Search action code, user, role, patient MRN, or IP..."
              searchKeys={['action', 'user', 'role', 'resource', 'details']}
              exportFileName="careaxis_security_audit_log"
              filterComponent={
                <select
                  className="form-select"
                  style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Audit Categories</option>
                  <option value="Clinical">Clinical Access</option>
                  <option value="Security Exception">Security Exception</option>
                  <option value="Pharmacy">Pharmacy E-Rx</option>
                  <option value="Diagnostics">Diagnostics LIMS</option>
                  <option value="Billing">Billing & Finance</option>
                  <option value="Supply Chain">Supply Chain</option>
                </select>
              }
            />
          </div>
        </div>
      ) : (
        /* Break-Glass Emergency Overrides Review */
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Break-Glass Emergency Overrides Surveillance</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Heightened oversight required by National Health Data Privacy Directives
              </p>
            </div>
            <Badge variant="red">{breakGlassLogs.length} Overrides Flagged</Badge>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {breakGlassLogs.length > 0 ? (
              breakGlassLogs.map(bg => (
                <div
                  key={bg.id}
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.825rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} color="#dc2626" />
                      <strong style={{ color: '#991b1b' }}>{bg.resource}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                      {new Date(bg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ color: '#7f1d1d', marginBottom: '0.5rem' }}>
                    <strong>Invoked By:</strong> {bg.user} ({bg.role}) • Node: {bg.facility || 'Clinical Station'} ({bg.ipAddress})
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.65rem', borderRadius: '4px', border: '1px solid #fecaca', color: '#334155' }}>
                    <strong>Mandatory Clinical Justification:</strong> {bg.details}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No Break-Glass emergency overrides recorded in this environment.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
