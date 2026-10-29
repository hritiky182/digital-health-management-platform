import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  History,
  ShieldAlert,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MpiService } from '../../services/mpiService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function MasterPatientIndexPage() {
  const { patients, mergePatients, mpiMerges } = useData();
  const { currentRole, hasPermission } = useAuth();

  const [threshold, setThreshold] = useState(65);
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'history'
  const [selectedPair, setSelectedPair] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeReason, setMergeReason] = useState('Consolidation of duplicate registration across facilities.');

  // Find candidate duplicates based on sensitivity threshold
  const candidatePairs = useMemo(() => {
    return MpiService.findDuplicateCandidates(patients, threshold);
  }, [patients, threshold]);

  const handleOpenMerge = (pair) => {
    setSelectedPair(pair);
  };

  const handleExecuteMerge = () => {
    if (!selectedPair) return;
    setIsMerging(true);

    setTimeout(() => {
      mergePatients(
        selectedPair.primaryCandidate.id,
        selectedPair.duplicateCandidate.id,
        {},
        mergeReason
      );
      setIsMerging(false);
      setSelectedPair(null);
    }, 600);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Master Patient Index & Identity Resolution</h1>
            <Badge variant="teal">Deterministic & Probabilistic Engine</Badge>
          </div>
          <p className="page-description">
            National enterprise identity matching engine. Detects multi-facility duplicate registrations, computes phonetic and demographic match confidence, and executes auditable record consolidation.
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
              onClick={() => setActiveTab('candidates')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'candidates' ? '#0f766e' : 'transparent',
                color: activeTab === 'candidates' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Candidate Duplicates ({candidatePairs.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'history' ? '#0f766e' : 'transparent',
                color: activeTab === 'history' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Merge History ({mpiMerges.length})
            </button>
          </div>
        </div>
      </div>

      {/* Demonstration notice */}
      <div className="banner-alert banner-alert-info">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Demonstration Identity Algorithm:</strong> This Master Patient Index uses simulated probabilistic scoring (Levenshtein phonetic distance on personal names, exact/transposed date-of-birth verification, and national identity keys). In production national deployments, this interfaces with Civil Registration and Vital Statistics (CRVS) and biometric identity deduplication clusters.
        </div>
      </div>

      {activeTab === 'candidates' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sensitivity Filter Bar */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sliders size={18} color="#0f766e" />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                  Matching Sensitivity Threshold: <strong>{threshold}%</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  style={{ width: '180px', accentColor: '#0f766e', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  (Lower threshold flags looser phonetic matches)
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Duplicate Cards */}
          {candidatePairs.length > 0 ? (
            candidatePairs.map(pair => {
              const p1 = pair.primaryCandidate;
              const p2 = pair.duplicateCandidate;
              const isHigh = pair.score >= 85;

              return (
                <div key={pair.id} className="card" style={{ borderLeft: `4px solid ${isHigh ? '#dc2626' : '#f59e0b'}` }}>
                  <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Fingerprint size={20} color={isHigh ? '#dc2626' : '#d97706'} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                          Candidate Pair: {p1.mrn} ↔ {p2.mrn}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Match Reasons: {pair.reasons.join(' • ')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Badge variant={isHigh ? 'red' : 'amber'}>
                        {pair.score}% Confidence ({pair.confidence})
                      </Badge>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenMerge(pair)}
                      >
                        <GitMerge size={14} />
                        <span>Review & Merge</span>
                      </button>
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.825rem' }}>
                      {/* Record A */}
                      <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.35rem' }}>
                          <strong style={{ color: '#0f766e' }}>Target Primary: {p1.mrn}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>UPID: {p1.upid}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div>Name: <strong>{p1.firstName} {p1.middleName} {p1.lastName}</strong></div>
                          <div>DOB: <strong>{p1.dob}</strong> ({p1.gender})</div>
                          <div>National ID: <strong>{p1.nationalId || 'None'}</strong></div>
                          <div>Phone: <strong>{p1.phone}</strong></div>
                          <div>Address: {p1.address?.street}, {p1.address?.city}</div>
                          <div>Registered: {p1.registrationDate}</div>
                        </div>
                      </div>

                      {/* Record B */}
                      <div style={{ padding: '0.85rem', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #fde68a', paddingBottom: '0.35rem' }}>
                          <strong style={{ color: '#b45309' }}>Duplicate Candidate: {p2.mrn}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>UPID: {p2.upid}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div>Name: <strong>{p2.firstName} {p2.middleName} {p2.lastName}</strong></div>
                          <div>DOB: <strong>{p2.dob}</strong> ({p2.gender})</div>
                          <div>National ID: <strong>{p2.nationalId || 'None'}</strong></div>
                          <div>Phone: <strong>{p2.phone}</strong></div>
                          <div>Address: {p2.address?.street}, {p2.address?.city}</div>
                          <div>Registered: {p2.registrationDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No Duplicate Candidates Detected</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                All registered patient records meet uniqueness constraints at the {threshold}% sensitivity threshold.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Merge History Tab */
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Master Patient Index Merge Audit Log</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Preserves lineage of all consolidated records
            </span>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Merge Timestamp</th>
                  <th>Target Primary Record</th>
                  <th>Consolidated Duplicate Record</th>
                  <th>Authorized Officer</th>
                  <th>Clinical / Administrative Justification</th>
                </tr>
              </thead>
              <tbody>
                {mpiMerges.length > 0 ? (
                  mpiMerges.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontSize: '0.775rem' }}>{new Date(m.mergedAt).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f766e' }}>{m.targetName}</div>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>{m.targetMrn}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#991b1b' }}>{m.duplicateName}</div>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>{m.duplicateMrn} (Deactivated)</div>
                      </td>
                      <td>{m.performedBy}</td>
                      <td style={{ fontSize: '0.775rem', color: '#475569' }}>{m.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No record merges have been executed in this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Merge Confirmation & Preview Modal */}
      {selectedPair && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPair(null)}
          title="Master Patient Index — Proposed Record Consolidation"
          subtitle={`Merge ${selectedPair.duplicateCandidate.mrn} into primary ${selectedPair.primaryCandidate.mrn}`}
          maxWidth="680px"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPair(null)}
                disabled={isMerging}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleExecuteMerge}
                disabled={isMerging}
              >
                <GitMerge size={16} />
                <span>{isMerging ? 'Consolidating Records...' : 'Execute Permanent Merge'}</span>
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                borderRadius: '6px',
                padding: '0.85rem',
                fontSize: '0.8125rem',
                color: '#134e4a',
                lineHeight: 1.4
              }}
            >
              <strong>Data Retention & Reassignment Preview:</strong>
              <ul style={{ marginTop: '0.4rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>All historical clinical encounters from <strong>{selectedPair.duplicateCandidate.mrn}</strong> will be repointed to <strong>{selectedPair.primaryCandidate.mrn}</strong>.</li>
                <li>Prescriptions, laboratory orders, and billing invoices will be reassigned without data loss.</li>
                <li>The duplicate record will be marked <strong>"Merged"</strong> and will no longer accept new bookings.</li>
                <li>A permanent merge trace is logged into the national audit repository.</li>
              </ul>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Formal Administrative Justification for Merge *
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                value={mergeReason}
                onChange={e => setMergeReason(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
