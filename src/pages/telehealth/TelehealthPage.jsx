import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Wifi,
  Radio,
  FileText,
  User,
  Activity,
  ZoomIn,
  ZoomOut,
  Sun,
  Eye,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';

export function TelehealthPage() {
  const { telehealthSessions, patients } = useData();
  const { currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState('call'); // 'call', 'teleradiology', 'outreach'
  
  // Virtual Call state
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [bandwidthMode, setBandwidthMode] = useState('adaptive'); // 'hd', 'adaptive', 'store_forward'
  const [callNotes, setCallNotes] = useState('Patient connected from Riverside Outreach Clinic. Clear audio transmission. Reviewing knee joint flexion.');

  // Teleradiology DICOM state
  const [dicomBrightness, setDicomBrightness] = useState(100);
  const [dicomContrast, setDicomContrast] = useState(100);
  const [dicomInvert, setDicomInvert] = useState(false);
  const [dicomZoom, setDicomZoom] = useState(1);
  const [radiologistFinding, setRadiologistFinding] = useState('Bilateral lung fields clear. Cardiac silhouette within normal limits. Costophrenic angles sharp. No acute pulmonary consolidation or pneumothorax.');

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">National Telehealth & Remote Clinical Support</h1>
            <Badge variant="teal">Adaptive Bandwidth & DICOM Hub</Badge>
          </div>
          <p className="page-description">
            Virtual specialist consultations, teleradiology remote reporting, and store-and-forward outreach for rural clinics operating on variable network connectivity.
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
              onClick={() => setActiveTab('call')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'call' ? '#0f766e' : 'transparent',
                color: activeTab === 'call' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Virtual Consult Console
            </button>
            <button
              onClick={() => setActiveTab('teleradiology')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'teleradiology' ? '#0f766e' : 'transparent',
                color: activeTab === 'teleradiology' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Teleradiology (DICOM)
            </button>
            <button
              onClick={() => setActiveTab('outreach')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'outreach' ? '#0f766e' : 'transparent',
                color: activeTab === 'outreach' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Outreach Sessions ({telehealthSessions.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'call' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
          {/* Main Video Call Console */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#090d16',
                height: '420px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              {videoActive ? (
                /* Patient Video Simulation */
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#1e293b',
                      border: '3px solid #0f766e',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      fontSize: '2rem',
                      fontWeight: 700
                    }}
                  >
                    KM
                  </div>
                  <h3 style={{ color: '#ffffff', fontSize: '1.15rem' }}>Kofi Mensah (MRN-2026-3401)</h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Connected via Riverside Community Clinic Outstation Node
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <Badge variant="teal">Encrypted WebRTC Session (Simulated)</Badge>
                    <Badge variant="green">Latency: 42ms</Badge>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <VideoOff size={48} style={{ margin: '0 auto 0.75rem' }} />
                  <div>Camera Muted (Audio-Only Low Bandwidth Mode)</div>
                </div>
              )}

              {/* Clinician PIP (Picture in Picture) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  width: '130px',
                  height: '90px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '2px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: '#ffffff',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}
              >
                <span>{currentRole.userName} (You)</span>
              </div>
            </div>

            {/* Video Controls Toolbar */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  className={`btn btn-sm ${micActive ? 'btn-secondary' : 'btn-danger'}`}
                  onClick={() => setMicActive(!micActive)}
                  style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
                  title="Toggle Microphone"
                >
                  {micActive ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button
                  className={`btn btn-sm ${videoActive ? 'btn-secondary' : 'btn-danger'}`}
                  onClick={() => setVideoActive(!videoActive)}
                  style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
                  title="Toggle Video Stream"
                >
                  {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              </div>

              {/* Bandwidth selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bandwidth Profile:</span>
                <select
                  className="form-select"
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    height: '32px',
                    fontSize: '0.75rem'
                  }}
                  value={bandwidthMode}
                  onChange={e => setBandwidthMode(e.target.value)}
                >
                  <option value="hd">High Definition (Full Video / LAN)</option>
                  <option value="adaptive">Adaptive 4G/Cellular Link</option>
                  <option value="store_forward">Low-Bandwidth (Store-and-Forward)</option>
                </select>
              </div>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => alert('Consultation ended. Clinical notes saved to patient chart.')}
              >
                <PhoneOff size={15} />
                <span>Disconnect Call</span>
              </button>
            </div>
          </div>

          {/* Remote Clinical Chart & Live Notes Side Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Remote Patient Context</h3>
              </div>
              <div className="card-body" style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>Patient: <strong>Kofi Mensah (62 yrs, M)</strong></div>
                <div>Condition: <strong>Osteoarthritis (M54.5), Type 2 Diabetes</strong></div>
                <div>Allergies: <Badge variant="amber">Latex (Mild)</Badge></div>
                <div style={{ marginTop: '0.25rem', padding: '0.5rem', backgroundColor: '#f0fdfa', borderRadius: '4px', border: '1px solid #ccfbf1', fontSize: '0.775rem' }}>
                  <strong>Clinic Triage Vitals:</strong> BP 128/80 • HR 72 bpm • SpO2 99% (Transmitted from Riverside)
                </div>
              </div>
            </div>

            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tele-Consultation Clinical Notes</h3>
              </div>
              <div className="card-body">
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={callNotes}
                  onChange={e => setCallNotes(e.target.value)}
                  placeholder="Record remote observation, specialist recommendations..."
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => alert('Specialist notes integrated into EHR encounter record.')}
                  style={{ marginTop: '0.75rem', width: '100%' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Attach Notes to EHR Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teleradiology DICOM Simulator */}
      {activeTab === 'teleradiology' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* DICOM Viewer Header Toolbar */}
            <div
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={18} color="#38bdf8" />
                <span>Study: <strong>PA Chest Radiograph (DICOM)</strong></span>
                <span style={{ color: '#94a3b8' }}>• Series 1/1 (Lossless Synthetic)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDicomZoom(z => Math.min(2, z + 0.2))}
                  style={{ padding: '0.2rem 0.5rem', background: '#1e293b', color: '#fff', border: 'none' }}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDicomZoom(z => Math.max(0.6, z - 0.2))}
                  style={{ padding: '0.2rem 0.5rem', background: '#1e293b', color: '#fff', border: 'none' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDicomInvert(!dicomInvert)}
                  style={{ padding: '0.2rem 0.5rem', background: '#1e293b', color: '#fff', border: 'none' }}
                  title="Invert Grayscale"
                >
                  <Sun size={14} /> Invert
                </button>
              </div>
            </div>

            {/* Simulated X-Ray Canvas */}
            <div
              style={{
                height: '420px',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Abstract medical imaging representation */}
              <div
                style={{
                  width: '320px',
                  height: '380px',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  background: 'radial-gradient(circle at center, #334155 0%, #0f172a 50%, #000000 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: `brightness(${dicomBrightness}%) contrast(${dicomContrast}%) ${dicomInvert ? 'invert(1)' : ''}`,
                  transform: `scale(${dicomZoom})`,
                  transition: 'transform 100ms ease'
                }}
              >
                {/* Simulated Ribs & Thoracic outline */}
                <svg width="240" height="280" viewBox="0 0 240 280" fill="none">
                  {/* Spine */}
                  <rect x="116" y="20" width="8" height="240" rx="4" fill="#64748b" opacity="0.6" />
                  {/* Clavicles */}
                  <path d="M40 50 Q120 70 200 50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                  {/* Rib cages */}
                  <path d="M60 90 Q120 120 180 90" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.7" />
                  <path d="M50 125 Q120 155 190 125" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.7" />
                  <path d="M45 160 Q120 190 195 160" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.7" />
                  <path d="M50 195 Q120 220 190 195" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.7" />
                  {/* Cardiac Silhouette */}
                  <ellipse cx="135" cy="180" rx="35" ry="45" fill="#475569" opacity="0.5" />
                  {/* Diaphragms */}
                  <path d="M30 240 Q75 200 120 230" stroke="#94a3b8" strokeWidth="5" fill="none" />
                  <path d="M120 230 Q165 210 210 245" stroke="#94a3b8" strokeWidth="5" fill="none" />
                </svg>

                <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                  CAREAXIS TELERADIOLOGY<br />
                  PAT: OKAFOR, AMARA<br />
                  MOD: CR • KVP: 120 • MAS: 4.5
                </div>
              </div>
            </div>

            {/* Adjust sliders */}
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Brightness:</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={dicomBrightness}
                  onChange={e => setDicomBrightness(Number(e.target.value))}
                  style={{ accentColor: '#0f766e' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Contrast:</span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={dicomContrast}
                  onChange={e => setDicomContrast(Number(e.target.value))}
                  style={{ accentColor: '#0f766e' }}
                />
              </div>
            </div>
          </div>

          {/* Radiologist Report Panel */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Teleradiology Diagnostic Impression</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Radiologist Diagnostic Findings</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={radiologistFinding}
                  onChange={e => setRadiologistFinding(e.target.value)}
                />
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdfa', borderRadius: '6px', border: '1px solid #ccfbf1', fontSize: '0.775rem' }}>
                <strong>Quality Assurance Attestation:</strong> High resolution lossless transmission certified under DICOM 3.0 / ACR-NEMA tele-reporting standards.
              </div>

              <button
                className="btn btn-primary"
                onClick={() => alert('Radiology formal report signed and dispatched to referring physician.')}
              >
                <CheckCircle2 size={15} />
                <span>Sign & Authorize Radiology Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Sessions List */}
      {activeTab === 'outreach' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Rural Outreach & Specialist Support Worklist</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Scheduled sessions connecting central tertiary specialists to remote clinic outstations
            </span>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheduled Time</th>
                  <th>Patient Name & MRN</th>
                  <th>Assigned Specialist</th>
                  <th>Specialty Scope</th>
                  <th>Clinical Reason</th>
                  <th>Bandwidth Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {telehealthSessions.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.scheduledTime).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f766e' }}>{s.patientName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{s.patientMrn}</div>
                    </td>
                    <td>{s.specialistName}</td>
                    <td>{s.specialty}</td>
                    <td>{s.chiefComplaint}</td>
                    <td>
                      <Badge variant="blue">{s.bandwidthTier}</Badge>
                    </td>
                    <td>
                      <Badge variant={s.status === 'Completed' ? 'green' : 'amber'} dot>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
