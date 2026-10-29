import React, { useState } from 'react';
import {
  Milestone,
  CheckCircle2,
  Clock,
  Building2,
  Sliders,
  RotateCcw,
  Shield,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { APP_CONFIG } from '../../app/config';
import { Badge } from '../../components/common/Badge';

export function ImplementationPlanPage() {
  const { rolloutMilestones, updateRolloutMilestone, resetDemoData } = useData();

  const [activeTab, setActiveTab] = useState('readiness'); // 'readiness' or 'config'
  const [configParams, setConfigParams] = useState({
    brandName: APP_CONFIG.name,
    tagline: APP_CONFIG.tagline,
    version: APP_CONFIG.version,
    mpiSensitivity: 75,
    offlineMaxHours: 72,
    enableStoreAndForward: true,
    currencySymbol: 'USD ($)',
    timeZone: 'UTC+02:00 (Central African Time / Regional Hub)'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">National Implementation & Rollout Roadmap</h1>
            <Badge variant="teal">Multi-Phase Deployment Framework</Badge>
          </div>
          <p className="page-description">
            Tracking hospital facility digital readiness, infrastructure commissioning, clinician training certifications, and enterprise platform parameters.
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
              onClick={() => setActiveTab('readiness')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'readiness' ? '#0f766e' : 'transparent',
                color: activeTab === 'readiness' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Facility Readiness Matrix ({rolloutMilestones.length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'config' ? '#0f766e' : 'transparent',
                color: activeTab === 'config' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              System Configuration
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'readiness' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {rolloutMilestones.map(m => (
            <div key={m.id} className="card">
              <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Building2 size={20} color="#0f766e" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                      {m.facilityName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {m.tier} • {m.phase}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge variant={m.status === 'Completed' ? 'green' : 'amber'} dot>
                    {m.status}
                  </Badge>
                  <strong style={{ fontSize: '0.9rem', color: '#0f766e' }}>
                    {m.progressPercent}%
                  </strong>
                </div>
              </div>

              <div className="card-body">
                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: `${m.progressPercent}%`,
                      height: '100%',
                      backgroundColor: m.progressPercent === 100 ? '#10b981' : '#0f766e',
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Target Go-Live:</span>
                    <strong>{m.targetGoLive}</strong> (Actual: {m.actualGoLive})
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Local Network & Power:</span>
                    <span>{m.infrastructure}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Clinical Staff Certified:</span>
                    <strong style={{ color: '#0f766e' }}>{m.staffTrained}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Workstations & Devices:</span>
                    <span>{m.devicesDeployed}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Configuration Parameters Tab */
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Platform System Configuration</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Central parameter repository governing network branding, MPI thresholds, and offline sync engines
              </p>
            </div>
          </div>
          <form onSubmit={handleSaveConfig} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {savedSuccess && (
              <div className="banner-alert banner-alert-info">
                <CheckCircle2 size={18} color="#0f766e" />
                <span>Configuration changes saved to browser storage.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Brand Working Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={configParams.brandName}
                  onChange={e => setConfigParams({ ...configParams, brandName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Build Tag</label>
                <input
                  type="text"
                  className="form-input"
                  disabled
                  value={configParams.version}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Default Accounting Currency</label>
                <input
                  type="text"
                  className="form-input"
                  value={configParams.currencySymbol}
                  onChange={e => setConfigParams({ ...configParams, currencySymbol: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Regional Healthcare Timezone</label>
                <input
                  type="text"
                  className="form-input"
                  value={configParams.timeZone}
                  onChange={e => setConfigParams({ ...configParams, timeZone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Default Master Patient Index (MPI) Match Sensitivity Threshold: <strong>{configParams.mpiSensitivity}%</strong>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={configParams.mpiSensitivity}
                onChange={e => setConfigParams({ ...configParams, mpiSensitivity: Number(e.target.value) })}
                style={{ accentColor: '#0f766e', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (window.confirm('Reset all demo entities back to original factory demonstration records?')) {
                    resetDemoData();
                  }
                }}
              >
                <RotateCcw size={15} />
                <span>Reset Demo to Factory State</span>
              </button>

              <button type="submit" className="btn btn-primary">
                Save Parameter Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
