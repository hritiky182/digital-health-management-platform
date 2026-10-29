import React, { useState } from 'react';
import {
  Network,
  Radio,
  FileCode,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Server,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FhirService } from '../../services/fhirService';
import { ExportService } from '../../services/exportService';
import { Badge } from '../../components/common/Badge';

export function InteroperabilityPage() {
  const { patients, encounters, prescriptions, labOrders } = useData();

  const [activeTab, setActiveTab] = useState('fhir'); // 'fhir', 'hl7v2', 'endpoints'
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [simulatingTransmission, setSimulatingTransmission] = useState(false);
  const [transmissionSuccess, setTransmissionSuccess] = useState(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Generated FHIR R4 Bundle
  const fhirBundle = selectedPatient
    ? FhirService.generatePatientFhirBundle(
        selectedPatient,
        encounters.filter(e => e.patientId === selectedPatient.id),
        prescriptions.filter(p => p.patientId === selectedPatient.id),
        labOrders.filter(l => l.patientId === selectedPatient.id)
      )
    : null;

  // Generated HL7 v2 Message
  const hl7Message = selectedPatient ? FhirService.generateHl7v2AdtMessage(selectedPatient) : '';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFhir = () => {
    if (!fhirBundle) return;
    ExportService.exportToJson(`FHIR_Bundle_${selectedPatient.mrn}`, fhirBundle);
  };

  const handleTransmitHie = () => {
    setSimulatingTransmission(true);
    setTransmissionSuccess(null);

    setTimeout(() => {
      setSimulatingTransmission(false);
      setTransmissionSuccess({
        timestamp: new Date().toISOString(),
        httpStatus: 200,
        responseAck: 'ACK^A08^CA-ACK-9921|AA|Message Accepted by National Shared Health Record Registry'
      });
    }, 1200);
  };

  const simulatedEndpoints = [
    {
      id: 'ep-01',
      name: 'Regional Health Information Exchange (HIE)',
      protocol: 'FHIR R4 / RESTful Endpoint',
      url: 'https://hie.regional-health.demo.net/fhir/r4',
      status: 'Online',
      lastPing: '24ms',
      description: 'Central federated health record index and shared summary repository.'
    },
    {
      id: 'ep-02',
      name: 'National Reference Diagnostic Laboratory LIS',
      protocol: 'HL7 v2.5.1 MLLP over TLS',
      url: 'mllp://lab-lis.central-diagnostic.demo.net:2575',
      status: 'Online',
      lastPing: '18ms',
      description: 'Bidirectional electronic lab order accessioning and result dispatch.'
    },
    {
      id: 'ep-03',
      name: 'Universal Health Shield Insurance Claims Gateway',
      protocol: 'X12 837P / FHIR Claim',
      url: 'https://claims.health-shield.demo.net/v2/preauth',
      status: 'Online',
      lastPing: '65ms',
      description: 'Real-time encounter eligibility verification and copayment pre-adjudication.'
    },
    {
      id: 'ep-04',
      name: 'Civil Registration & Vital Statistics (CRVS)',
      protocol: 'OpenHIE Person Matching / IHE PIX/PDQ',
      url: 'https://crvs.identity.demo.net/pix/v3',
      status: 'Standby',
      lastPing: '110ms',
      description: 'National identity lookup and birth/death registry synchronization.'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Interoperability & Health Information Exchange (HIE)</h1>
            <Badge variant="teal">HL7 FHIR R4 & HL7 v2.5 Gateway</Badge>
          </div>
          <p className="page-description">
            Standards-based integration engine supporting HL7 FHIR Release 4 resources, legacy HL7 v2 messages, DICOM imaging links, and external national registry connectors.
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
              onClick={() => setActiveTab('fhir')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'fhir' ? '#0f766e' : 'transparent',
                color: activeTab === 'fhir' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              FHIR R4 Resource Bundle
            </button>
            <button
              onClick={() => setActiveTab('hl7v2')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'hl7v2' ? '#0f766e' : 'transparent',
                color: activeTab === 'hl7v2' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              HL7 v2 Message Stream
            </button>
            <button
              onClick={() => setActiveTab('endpoints')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'endpoints' ? '#0f766e' : 'transparent',
                color: activeTab === 'endpoints' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Connected Gateways ({simulatedEndpoints.length})
            </button>
          </div>
        </div>
      </div>

      {/* Patient Selector Filter */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Inspect Longitudinal Patient Dataset:
            </span>
            <select
              className="form-select"
              style={{ width: '320px', height: '36px', fontSize: '0.825rem' }}
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.mrn} • {p.gender})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleCopy(activeTab === 'fhir' ? JSON.stringify(fhirBundle, null, 2) : hl7Message)}
            >
              <Copy size={14} />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Payload'}</span>
            </button>

            {activeTab === 'fhir' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleDownloadFhir}
              >
                <Download size={14} />
                <span>Download JSON</span>
              </button>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={handleTransmitHie}
              disabled={simulatingTransmission}
            >
              <Send size={14} />
              <span>{simulatingTransmission ? 'Dispatching...' : 'Simulate HIE Transmission'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transmission Result Alert */}
      {transmissionSuccess && (
        <div className="banner-alert banner-alert-info" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="#0f766e" />
          <div style={{ flex: 1 }}>
            <strong>Interoperability Dispatch Succeeded (HTTP 200 OK)</strong>
            <p style={{ margin: '0.2rem 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {transmissionSuccess.responseAck}
            </p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'fhir' && (
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={18} color="#38bdf8" />
              <strong style={{ fontSize: '0.9rem' }}>HL7 FHIR Release 4 JSON Payload</strong>
            </div>
            <Badge variant="teal">Total Resources: {fhirBundle?.total || 0}</Badge>
          </div>
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#090d16',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.775rem',
              lineHeight: 1.5,
              maxHeight: '520px',
              overflowY: 'auto'
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'hl7v2' && (
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={18} color="#38bdf8" />
              <strong style={{ fontSize: '0.9rem' }}>HL7 v2.5.1 Pipe-and-Hat ADT Message</strong>
            </div>
            <Badge variant="blue">ADT^A08 Patient Information Update</Badge>
          </div>
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#090d16',
              color: '#4ade80',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              lineHeight: 1.8,
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {hl7Message}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Simulated External Integration Endpoints</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              All endpoints operate in local demonstration sandbox mode
            </span>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target System Name</th>
                  <th>Interoperability Protocol</th>
                  <th>Gateway Endpoint URL</th>
                  <th>Network Status</th>
                  <th>Roundtrip Ping</th>
                  <th>Operational Role</th>
                </tr>
              </thead>
              <tbody>
                {simulatedEndpoints.map(ep => (
                  <tr key={ep.id}>
                    <td><strong>{ep.name}</strong></td>
                    <td>
                      <Badge variant="purple">{ep.protocol}</Badge>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0f766e' }}>
                      {ep.url}
                    </td>
                    <td>
                      <Badge variant={ep.status === 'Online' ? 'green' : 'amber'} dot>
                        {ep.status} (Simulated)
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{ep.lastPing}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{ep.description}</td>
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
