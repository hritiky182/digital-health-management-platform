import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  Shield,
  FileText,
  AlertTriangle,
  Lock,
  Download,
  Plus,
  Clock,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFacility } from '../../context/FacilityContext';
import { Badge } from '../../components/common/Badge';
import { BreakGlassModal } from '../../components/feedback/BreakGlassModal';
import { ExportService } from '../../services/exportService';
import { FhirService } from '../../services/fhirService';

export function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    patients,
    encounters,
    appointments,
    prescriptions,
    labOrders,
    invoices,
    auditLogs
  } = useData();
  const { isBreakGlassActive } = useAuth();
  const { facilities } = useFacility();

  const [activeTab, setActiveTab] = useState('overview');
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);

  const patient = useMemo(() => patients.find(p => p.id === id), [patients, id]);

  // Associated records connected across the entire system
  const patientAppointments = useMemo(() => appointments.filter(a => a.patientId === id), [appointments, id]);
  const patientEncounters = useMemo(() => encounters.filter(e => e.patientId === id), [encounters, id]);
  const patientPrescriptions = useMemo(() => prescriptions.filter(p => p.patientId === id), [prescriptions, id]);
  const patientLabOrders = useMemo(() => labOrders.filter(l => l.patientId === id), [labOrders, id]);
  const patientInvoices = useMemo(() => invoices.filter(i => i.patientId === id), [invoices, id]);
  const patientAuditLogs = useMemo(() => auditLogs.filter(a => a.resource?.includes(patient?.mrn || 'NONE')), [auditLogs, patient]);

  if (!patient) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Patient Record Not Located</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          The requested record ID does not match any registered patient in the local repository.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/patients')}>
          Return to Patient Directory
        </button>
      </div>
    );
  }

  // Check if sensitive restricted and whether break glass has been activated
  const isRestrictedLocked = patient.isRestricted && !isBreakGlassActive(patient.id);

  const primaryFacility = facilities.find(f => f.id === patient.primaryFacilityId) || facilities[0];

  const handleExportFhir = () => {
    const fhirBundle = FhirService.generatePatientFhirBundle(patient, patientEncounters, patientPrescriptions, patientLabOrders);
    ExportService.exportToJson(`FHIR_Patient_${patient.mrn}`, fhirBundle);
  };

  const tabs = [
    { id: 'overview', label: 'Demographics & Overview', icon: User },
    { id: 'clinical', label: `Encounters (${patientEncounters.length})`, icon: Stethoscope },
    { id: 'appointments', label: `Appointments (${patientAppointments.length})`, icon: Calendar },
    { id: 'prescriptions', label: `E-Prescriptions (${patientPrescriptions.length})`, icon: Pill },
    { id: 'labs', label: `Laboratory (${patientLabOrders.length})`, icon: FlaskConical },
    { id: 'billing', label: `Billing & Copay (${patientInvoices.length})`, icon: Receipt },
    { id: 'consent', label: 'Consent & Audit Trail', icon: Shield },
  ];

  if (isRestrictedLocked) {
    return (
      <div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/patients')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Directory</span>
        </button>

        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Lock size={30} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
            Protected Sensitive Record (Restricted Access)
          </h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            The clinical chart for <strong>{patient.firstName} {patient.lastName} ({patient.mrn})</strong> is classified under heightened confidentiality protections. Ordinary viewing is disabled by privacy policy.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/patients')}>
              Cancel & Exit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowBreakGlassModal(true)}
              style={{ backgroundColor: '#dc2626' }}
            >
              <AlertTriangle size={16} />
              <span>Initiate Break-Glass Emergency Override</span>
            </button>
          </div>
        </div>

        {showBreakGlassModal && (
          <BreakGlassModal
            isOpen={true}
            patient={patient}
            onClose={() => setShowBreakGlassModal(false)}
            onSuccess={() => setShowBreakGlassModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Top Breadcrumb & Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/patients')}
        >
          <ArrowLeft size={14} />
          <span>Back to Patient Directory</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportFhir}
            title="Export standard HL7 FHIR R4 JSON Bundle"
          >
            <Download size={14} />
            <span>Export FHIR R4 Bundle</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/clinical?patientId=${patient.id}`)}
          >
            <Stethoscope size={14} />
            <span>Start Consultation</span>
          </button>
        </div>
      </div>

      {/* Patient Summary Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #0f766e' }}>
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdfa',
                  border: '2px solid #0f766e',
                  color: '#0f766e',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                    {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
                  </h1>
                  <Badge variant={patient.status === 'Active' ? 'green' : 'gray'}>
                    {patient.status}
                  </Badge>
                  {patient.isRestricted && (
                    <Badge variant="red" dot>
                      Restricted VIP Record
                    </Badge>
                  )}
                  {patient.mergedRecords && patient.mergedRecords.length > 0 && (
                    <Badge variant="purple">
                      Merged ({patient.mergedRecords.length})
                    </Badge>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>MRN: <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f766e' }}>{patient.mrn}</strong></span>
                  <span>•</span>
                  <span>UPID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{patient.upid}</strong></span>
                  <span>•</span>
                  <span>DOB: <strong>{patient.dob}</strong> ({patient.gender})</span>
                  <span>•</span>
                  <span>Blood: <strong style={{ color: '#dc2626' }}>{patient.bloodGroup || 'Unspecified'}</strong></span>
                  <span>•</span>
                  <span>Facility: <strong>{primaryFacility.name}</strong></span>
                </div>
              </div>
            </div>

            {/* Clinical Alert Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Active Clinical Alerts
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {patient.allergies?.length > 0 ? (
                  patient.allergies.map((a, i) => (
                    <Badge key={i} variant="red" dot>
                      Allergy: {a.allergen} ({a.severity})
                    </Badge>
                  ))
                ) : (
                  <Badge variant="gray">No Known Drug Allergies (NKDA)</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Demographics */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Contact & Demographics */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Personal & Residential Demographics</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>National ID Number</span>
                <strong>{patient.nationalId || 'None registered (Document waived)'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Telephone Contact</span>
                <strong>{patient.phone || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Email Address</span>
                <strong>{patient.email || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Residential Address</span>
                <strong>{patient.address?.street}, {patient.address?.district}, {patient.address?.city}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Initial Enrollment Date</span>
                <strong>{patient.registrationDate || '—'}</strong>
              </div>
            </div>
          </div>

          {/* Emergency & Next of Kin */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Emergency Contact & Next of Kin</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Contact Person</span>
                <strong>{patient.emergencyContact?.name || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Relationship</span>
                <strong>{patient.emergencyContact?.relationship || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Contact Phone</span>
                <strong>{patient.emergencyContact?.phone || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Coverage Type</span>
                <Badge variant="blue">{patient.insurance?.coverageType || 'Universal Public Health'}</Badge>
              </div>
            </div>
          </div>

          {/* Chronic Conditions & Current Regimen */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Longitudinal Problem List & Active Medications</h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Chronic Problem List
                </h4>
                {patient.chronicConditions?.length > 0 ? (
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {patient.chronicConditions.map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No recorded chronic morbidities.</p>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Current Active Regimen
                </h4>
                {patient.currentMedications?.length > 0 ? (
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {patient.currentMedications.map((med, i) => (
                      <li key={i}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No active long-term medications documented.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clinical Encounters */}
      {activeTab === 'clinical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patientEncounters.length > 0 ? (
            patientEncounters.map(enc => (
              <div key={enc.id} className="card">
                <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{enc.encounterType}</strong>
                      <Badge variant={enc.status === 'Completed' ? 'green' : 'amber'}>
                        {enc.status}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {new Date(enc.visitDate).toLocaleString()} • Provider: <strong>{enc.providerName}</strong> • {enc.facilityName}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/clinical/${enc.id}`)}
                  >
                    Open Clinical Chart →
                  </button>
                </div>
                <div className="card-body" style={{ fontSize: '0.825rem' }}>
                  {/* Vitals Ribbon */}
                  {enc.vitals?.systolicBp && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#f0fdfa',
                        borderRadius: '6px',
                        border: '1px solid #ccfbf1',
                        marginBottom: '0.85rem',
                        fontSize: '0.8rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span>BP: <strong>{enc.vitals.systolicBp}/{enc.vitals.diastolicBp} mmHg</strong></span>
                      <span>Pulse: <strong>{enc.vitals.heartRate} bpm</strong></span>
                      <span>Temp: <strong>{enc.vitals.temperatureC} °C</strong></span>
                      <span>SpO2: <strong>{enc.vitals.spo2Percent}%</strong></span>
                      <span>BMI: <strong>{enc.vitals.bmi}</strong></span>
                    </div>
                  )}

                  {/* SOAP Summary */}
                  {enc.soapNotes && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155' }}>
                      <div><strong>Subjective:</strong> {enc.soapNotes.subjective}</div>
                      <div><strong>Assessment:</strong> {enc.soapNotes.assessment}</div>
                      <div><strong>Plan:</strong> {enc.soapNotes.plan}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>No clinical encounters recorded yet.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/clinical?patientId=${patient.id}`)}
                style={{ marginTop: '0.75rem' }}
              >
                Start New Consultation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Scheduled & Historical Visits</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/appointments')}
            >
              <Plus size={14} />
              <span>Book Appointment</span>
            </button>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Facility & Department</th>
                  <th>Healthcare Provider</th>
                  <th>Visit Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patientAppointments.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.dateTime).toLocaleString()}</td>
                    <td>{a.facilityName} ({a.department})</td>
                    <td>{a.providerName}</td>
                    <td>{a.reason}</td>
                    <td>
                      <Badge variant={a.status === 'Completed' ? 'green' : a.status === 'Waiting' ? 'amber' : 'blue'}>
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Electronic Medication Prescriptions</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/pharmacy')}
            >
              <Plus size={14} />
              <span>Prescribe Medication</span>
            </button>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Date Issued</th>
                  <th>Medication Items</th>
                  <th>Prescriber</th>
                  <th>Dispensation Status</th>
                </tr>
              </thead>
              <tbody>
                {patientPrescriptions.map(rx => (
                  <tr key={rx.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f766e' }}>
                      {rx.id}
                    </td>
                    <td>{new Date(rx.datePrescribed).toLocaleDateString()}</td>
                    <td>
                      {rx.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem' }}>
                          <strong>{item.medicationName}</strong> — {item.dosage} ({item.quantity} {item.unit})
                        </div>
                      ))}
                    </td>
                    <td>{rx.prescriberName}</td>
                    <td>
                      <Badge variant={rx.status === 'Dispensed' ? 'green' : 'amber'} dot>
                        {rx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Laboratory */}
      {activeTab === 'labs' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Diagnostic Laboratory Results</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/laboratory')}
            >
              <Plus size={14} />
              <span>Order Lab Test</span>
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patientLabOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{order.testName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Barcode Accession: <span style={{ fontFamily: 'var(--font-mono)' }}>{order.barcodeAccession}</span> • Ordered: {new Date(order.orderDateTime).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={order.status === 'Verified' ? 'green' : 'amber'}>
                    {order.status}
                  </Badge>
                </div>

                {order.results?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Measured Value</th>
                          <th>Reference Interval</th>
                          <th>Evaluation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.results.map((res, i) => (
                          <tr key={i}>
                            <td>{res.parameter}</td>
                            <td><strong>{res.value} {res.unit}</strong></td>
                            <td>{res.range}</td>
                            <td>
                              <Badge variant={res.status === 'Normal' ? 'green' : 'red'}>
                                {res.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Specimen in accession queue. Turnaround time: ~4 hours.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Billing & Invoicing */}
      {activeTab === 'billing' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Encounter Financial Statements & Invoices</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/billing')}
            >
              <Plus size={14} />
              <span>Create Invoice</span>
            </button>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>Insurance Coverage</th>
                  <th>Patient Copay</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patientInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inv.id}</td>
                    <td>{inv.invoiceDate}</td>
                    <td>${inv.subtotal?.toFixed(2)}</td>
                    <td style={{ color: '#0f766e' }}>${inv.insuranceCoverage?.toFixed(2)}</td>
                    <td>${inv.patientCopay?.toFixed(2)}</td>
                    <td>
                      <strong style={{ color: inv.balanceDue > 0 ? '#ef4444' : '#10b981' }}>
                        ${inv.balanceDue?.toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <Badge variant={inv.status === 'Paid' ? 'green' : 'amber'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Consent & Audit */}
      {activeTab === 'consent' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Health Information Exchange (HIE) Consent</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Inter-Facility Shared Electronic Record</span>
                <Badge variant={patient.consentSharing?.dataExchangeAllowed ? 'green' : 'red'}>
                  {patient.consentSharing?.dataExchangeAllowed ? 'Consented (Active)' : 'Opted-Out'}
                </Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>De-identified Epidemiological Research</span>
                <Badge variant={patient.consentSharing?.researchUseAnonymized ? 'green' : 'gray'}>
                  {patient.consentSharing?.researchUseAnonymized ? 'Permitted' : 'Declined'}
                </Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Emergency Override Permission</span>
                <Badge variant="teal">Authorized</Badge>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Patient Access History & Audit Trail</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.775rem' }}>
              {patientAuditLogs.map(log => (
                <div key={log.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#0f172a' }}>{log.action}</strong>
                    <span style={{ color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: '#64748b' }}>By {log.user} ({log.role})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
