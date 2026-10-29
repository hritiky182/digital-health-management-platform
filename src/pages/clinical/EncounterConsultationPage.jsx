import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Stethoscope,
  Activity,
  AlertTriangle,
  Pill,
  FlaskConical,
  Receipt,
  FileCheck,
  Plus,
  Trash2,
  Search,
  Lock
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFacility } from '../../context/FacilityContext';
import { ICD_CODES } from '../../data/icdCodes';
import { FORMULARY_MEDICATIONS } from '../../data/formulary';
import { LAB_TEST_CATALOG } from '../../data/labTests';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function EncounterConsultationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    encounters,
    patients,
    createEncounter,
    updateEncounter,
    createPrescription,
    createLabOrder,
    createInvoice,
    updateAppointmentStatus
  } = useData();
  const { currentRole, isBreakGlassActive } = useAuth();
  const { currentFacility, facilities } = useFacility();

  const isNew = !id || id === 'new';
  const queryPatientId = searchParams.get('patientId');
  const queryAppointmentId = searchParams.get('appointmentId');

  // Existing encounter lookup
  const existingEncounter = useMemo(() => {
    if (isNew) return null;
    return encounters.find(e => e.id === id);
  }, [encounters, id, isNew]);

  // Selected patient
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (existingEncounter) return existingEncounter.patientId;
    if (queryPatientId) return queryPatientId;
    return patients[0]?.id || '';
  });

  const patient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Vitals State
  const [vitals, setVitals] = useState({
    systolicBp: 130,
    diastolicBp: 84,
    heartRate: 72,
    respiratoryRate: 16,
    temperatureC: 36.7,
    spo2Percent: 99,
    weightKg: 70,
    heightCm: 170
  });

  // SOAP State
  const [soap, setSoap] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Diagnoses
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [icdSearch, setIcdSearch] = useState('');

  // Prescription modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxMedId, setRxMedId] = useState(FORMULARY_MEDICATIONS[0]?.id || '');
  const [rxDose, setRxDose] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [prescriptionsAdded, setPrescriptionsAdded] = useState([]);

  // Lab order modal
  const [showLabModal, setShowLabModal] = useState(false);
  const [labTestId, setLabTestId] = useState(LAB_TEST_CATALOG[0]?.id || '');
  const [labIndication, setLabIndication] = useState('');
  const [labOrdersAdded, setLabOrdersAdded] = useState([]);

  // Populate from existing encounter if editing
  useEffect(() => {
    if (existingEncounter) {
      setSelectedPatientId(existingEncounter.patientId);
      if (existingEncounter.vitals) {
        setVitals({
          systolicBp: existingEncounter.vitals.systolicBp || 120,
          diastolicBp: existingEncounter.vitals.diastolicBp || 80,
          heartRate: existingEncounter.vitals.heartRate || 72,
          respiratoryRate: existingEncounter.vitals.respiratoryRate || 16,
          temperatureC: existingEncounter.vitals.temperatureC || 36.6,
          spo2Percent: existingEncounter.vitals.spo2Percent || 99,
          weightKg: existingEncounter.vitals.weightKg || 70,
          heightCm: existingEncounter.vitals.heightCm || 170
        });
      }
      if (existingEncounter.soapNotes) {
        setSoap(existingEncounter.soapNotes);
      }
      if (existingEncounter.diagnoses) {
        setSelectedDiagnoses(existingEncounter.diagnoses);
      }
    }
  }, [existingEncounter]);

  // Automated BMI Calculation
  const bmi = useMemo(() => {
    if (!vitals.weightKg || !vitals.heightCm) return null;
    const heightM = vitals.heightCm / 100;
    const val = (vitals.weightKg / (heightM * heightM)).toFixed(1);
    return isNaN(val) ? null : val;
  }, [vitals.weightKg, vitals.heightCm]);

  // Vitals Clinical Alerts
  const vitalsAlerts = useMemo(() => {
    const list = [];
    if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) {
      list.push({ text: `Elevated Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg (Stage 1/2 HTN Range)`, type: 'amber' });
    }
    if (vitals.temperatureC >= 38.0) {
      list.push({ text: `Pyrexia / Fever: ${vitals.temperatureC} °C`, type: 'red' });
    }
    if (vitals.heartRate > 100) {
      list.push({ text: `Tachycardia: ${vitals.heartRate} bpm`, type: 'amber' });
    }
    if (vitals.spo2Percent < 95) {
      list.push({ text: `Hypoxemia Risk: Oxygen Saturation ${vitals.spo2Percent}%`, type: 'red' });
    }
    return list;
  }, [vitals]);

  // Allergy Interaction Warnings for Prescriptions
  const allergyWarning = useMemo(() => {
    if (!patient || !rxMedId) return null;
    const med = FORMULARY_MEDICATIONS.find(m => m.id === rxMedId);
    if (!med) return null;

    const patientAllergies = patient.allergies?.map(a => a.allergen.toLowerCase()) || [];
    const medCategory = (med.category || '').toLowerCase();
    const medName = med.name.toLowerCase();

    for (const allg of patientAllergies) {
      if (medName.includes(allg) || medCategory.includes(allg)) {
        return `CONTRAINDICATION ALERT: Patient has documented allergy to "${allg.toUpperCase()}". Prescribing "${med.name}" may cause severe reaction!`;
      }
      if (allg.includes('penicillin') && medCategory.includes('penicillin')) {
        return `CONTRAINDICATION ALERT: Cross-sensitivity with documented Penicillin allergy.`;
      }
    }
    return null;
  }, [patient, rxMedId]);

  const handleAddDiagnosis = (codeObj) => {
    if (!selectedDiagnoses.some(d => d.code === codeObj.code)) {
      setSelectedDiagnoses([...selectedDiagnoses, { ...codeObj, type: selectedDiagnoses.length === 0 ? 'Primary' : 'Secondary' }]);
    }
    setIcdSearch('');
  };

  const handleRemoveDiagnosis = (code) => {
    setSelectedDiagnoses(selectedDiagnoses.filter(d => d.code !== code));
  };

  const handleAddPrescriptionItem = () => {
    const med = FORMULARY_MEDICATIONS.find(m => m.id === rxMedId);
    if (!med) return;

    setPrescriptionsAdded([
      ...prescriptionsAdded,
      {
        medicationId: med.id,
        medicationName: med.name,
        dosage: rxDose || med.standardDose,
        quantity: 30,
        unit: med.unit,
        instructions: rxInstructions || 'Take as directed by clinician',
        status: 'Pending Dispensation'
      }
    ]);

    setShowRxModal(false);
    setRxDose('');
    setRxInstructions('');
  };

  const handleAddLabOrderItem = () => {
    const test = LAB_TEST_CATALOG.find(t => t.id === labTestId);
    if (!test) return;

    setLabOrdersAdded([
      ...labOrdersAdded,
      {
        testId: test.id,
        testName: test.name,
        specimen: test.specimen,
        clinicalIndication: labIndication || 'Clinical assessment',
        priority: 'Routine',
        cost: test.cost
      }
    ]);

    setShowLabModal(false);
    setLabIndication('');
  };

  const handleSaveDraft = () => {
    if (!patient) return;

    const payload = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientMrn: patient.mrn,
      facilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
      facilityName: currentFacility.name,
      department: 'General Outpatient',
      providerName: currentRole.userName,
      encounterType: 'Outpatient Consultation',
      status: 'In Progress',
      vitals: {
        ...vitals,
        bmi,
        recordedBy: currentRole.userName,
        recordedAt: new Date().toISOString()
      },
      soapNotes: soap,
      diagnoses: selectedDiagnoses
    };

    if (existingEncounter) {
      updateEncounter(existingEncounter.id, payload);
    } else {
      createEncounter(payload);
    }
  };

  const handleFinalizeAndSign = () => {
    if (!patient) return;
    if (selectedDiagnoses.length === 0) {
      alert('Please document at least one clinical diagnosis code before finalizing.');
      return;
    }

    const payload = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientMrn: patient.mrn,
      facilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
      facilityName: currentFacility.name,
      department: 'General Outpatient',
      providerName: currentRole.userName,
      encounterType: 'Outpatient Consultation',
      status: 'Completed',
      vitals: {
        ...vitals,
        bmi,
        recordedBy: currentRole.userName,
        recordedAt: new Date().toISOString()
      },
      soapNotes: soap,
      diagnoses: selectedDiagnoses
    };

    let targetEncId = existingEncounter?.id;

    if (existingEncounter) {
      updateEncounter(existingEncounter.id, payload);
    } else {
      const created = createEncounter(payload);
      targetEncId = created.id;
    }

    // Create Prescriptions if added
    if (prescriptionsAdded.length > 0) {
      createPrescription({
        encounterId: targetEncId,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientMrn: patient.mrn,
        facilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
        prescriberName: currentRole.userName,
        items: prescriptionsAdded
      });
    }

    // Create Lab Orders if added
    labOrdersAdded.forEach(lab => {
      createLabOrder({
        encounterId: targetEncId,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientMrn: patient.mrn,
        facilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
        orderingProvider: currentRole.userName,
        testId: lab.testId,
        testName: lab.testName,
        specimen: lab.specimen,
        clinicalIndication: lab.clinicalIndication,
        priority: lab.priority
      });
    });

    // Auto-generate invoice billing statement
    const consultationFee = 45.00;
    const labTotal = labOrdersAdded.reduce((s, l) => s + (l.cost || 20), 0);
    const rxTotal = prescriptionsAdded.length * 15.00;
    const subtotal = consultationFee + labTotal + rxTotal;
    const copayPercentage = patient.insurance?.copayPercentage || 10;
    const insuranceCoverage = subtotal * ((100 - copayPercentage) / 100);
    const patientCopay = subtotal * (copayPercentage / 100);

    createInvoice({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientMrn: patient.mrn,
      facilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
      encounterId: targetEncId,
      insuranceProvider: patient.insurance?.provider || 'Universal Health Shield',
      policyNumber: patient.insurance?.policyNumber || 'DEMO-POL',
      lineItems: [
        { description: 'Outpatient Clinical Consultation', category: 'Consultation', quantity: 1, unitPrice: consultationFee, total: consultationFee },
        ...labOrdersAdded.map(l => ({ description: l.testName, category: 'Laboratory', quantity: 1, unitPrice: l.cost || 25, total: l.cost || 25 })),
        ...prescriptionsAdded.map(p => ({ description: p.medicationName, category: 'Pharmacy', quantity: 1, unitPrice: 15, total: 15 }))
      ],
      subtotal,
      insuranceCoverage,
      patientCopay,
      amountPaid: 0,
      balanceDue: patientCopay
    });

    // If there was an appointment linked, mark as completed
    if (queryAppointmentId) {
      updateAppointmentStatus(queryAppointmentId, 'Completed');
    }

    navigate('/clinical');
  };

  const isCompleted = existingEncounter?.status === 'Completed';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/clinical')}
        >
          <ArrowLeft size={14} />
          <span>Back to Encounters</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isCompleted && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSaveDraft}
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleFinalizeAndSign}
              >
                <CheckCircle2 size={14} />
                <span>Finalize & Sign Clinical Encounter</span>
              </button>
            </>
          )}
          {isCompleted && (
            <Badge variant="green" dot>
              Signed & Finalized
            </Badge>
          )}
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #0f766e' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdfa',
                  border: '2px solid #0f766e',
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                {patient ? `${patient.firstName[0]}${patient.lastName[0]}` : 'PT'}
              </div>
              <div>
                {isNew && !queryPatientId ? (
                  <div style={{ marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block' }}>Select Patient</label>
                    <select
                      className="form-select"
                      style={{ height: '32px', fontSize: '0.825rem' }}
                      value={selectedPatientId}
                      onChange={e => setSelectedPatientId(e.target.value)}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} ({p.mrn} • DOB: {p.dob})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                  </h2>
                )}

                {patient && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.775rem', color: '#64748b' }}>
                    <span>MRN: <strong style={{ color: '#0f766e', fontFamily: 'var(--font-mono)' }}>{patient.mrn}</strong></span>
                    <span>•</span>
                    <span>UPID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{patient.upid}</strong></span>
                    <span>•</span>
                    <span>DOB: <strong>{patient.dob}</strong> ({patient.gender})</span>
                    <span>•</span>
                    <span>Blood: <strong style={{ color: '#dc2626' }}>{patient.bloodGroup || 'Unspecified'}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Allergies Alert Badges */}
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {patient?.allergies?.length > 0 ? (
                patient.allergies.map((a, i) => (
                  <Badge key={i} variant="red" dot>
                    Allergy: {a.allergen} ({a.severity})
                  </Badge>
                ))
              ) : (
                <Badge variant="gray">No Known Allergies (NKDA)</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Warning Banners */}
      {vitalsAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {vitalsAlerts.map((alt, i) => (
            <div key={i} className={`banner-alert banner-alert-${alt.type}`} style={{ padding: '0.5rem 0.85rem' }}>
              <AlertTriangle size={15} />
              <span>{alt.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Consultation Sections Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Section 1: Objective Physiological Vitals */}
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#0f766e" />
              <h3 style={{ fontSize: '0.925rem', fontWeight: 600 }}>1. Physiological Vital Signs & Biometrics</h3>
            </div>
            {bmi && (
              <Badge variant={bmi >= 25 ? 'amber' : 'green'}>
                Calculated BMI: {bmi} kg/m²
              </Badge>
            )}
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.systolicBp}
                  onChange={e => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.diastolicBp}
                  onChange={e => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heart Rate (bpm)</label>
                <input
                  type="number"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.heartRate}
                  onChange={e => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.temperatureC}
                  onChange={e => setVitals({ ...vitals, temperatureC: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SpO2 (%)</label>
                <input
                  type="number"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.spo2Percent}
                  onChange={e => setVitals({ ...vitals, spo2Percent: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.weightKg}
                  onChange={e => setVitals({ ...vitals, weightKg: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  disabled={isCompleted}
                  value={vitals.heightCm}
                  onChange={e => setVitals({ ...vitals, heightCm: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: SOAP Documentation */}
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope size={18} color="#0f766e" />
              <h3 style={{ fontSize: '0.925rem', fontWeight: 600 }}>2. SOAP Clinical Consultation Notes</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Standard Subjective / Objective / Assessment / Plan
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                [S] Subjective — Chief Complaint & History of Presenting Illness
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                disabled={isCompleted}
                placeholder="Patient states symptoms, duration, exacerbating factors, home medication compliance..."
                value={soap.subjective}
                onChange={e => setSoap({ ...soap, subjective: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                [O] Objective — Physical Examination & Clinical Findings
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                disabled={isCompleted}
                placeholder="Systemic examination: cardiovascular, respiratory auscultation, abdominal palpation, neurological..."
                value={soap.objective}
                onChange={e => setSoap({ ...soap, objective: e.target.value })}
              />
            </div>

            {/* Assessment & ICD-10 Picker */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                [A] Assessment — Diagnoses & Clinical Reasoning
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={isCompleted}
                placeholder="Diagnostic summary, risk stratification, differential diagnoses..."
                value={soap.assessment}
                onChange={e => setSoap({ ...soap, assessment: e.target.value })}
              />

              {/* ICD-10 Diagnosis Search & Select */}
              <div style={{ marginTop: '0.75rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                  ICD-10 Diagnostic Coding Catalog
                </label>
                {!isCompleted && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search ICD-10 code or condition (e.g. hypertension, diabetes, pneumonia)..."
                      value={icdSearch}
                      onChange={e => setIcdSearch(e.target.value)}
                    />
                  </div>
                )}

                {icdSearch.trim() && (
                  <div style={{ maxHeight: '140px', overflowY: 'auto', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    {ICD_CODES.filter(c => c.code.toLowerCase().includes(icdSearch.toLowerCase()) || c.description.toLowerCase().includes(icdSearch.toLowerCase())).map(c => (
                      <div
                        key={c.code}
                        onClick={() => handleAddDiagnosis(c)}
                        style={{ padding: '0.35rem 0.65rem', cursor: 'pointer', fontSize: '0.775rem', display: 'flex', justifyContent: 'space-between' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdfa'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        <strong>{c.code} — {c.description}</strong>
                        <span style={{ color: '#64748b' }}>{c.category}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Diagnoses Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedDiagnoses.map(d => (
                    <span
                      key={d.code}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        fontSize: '0.775rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <strong>{d.code}</strong> {d.description}
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDiagnosis(d.code)}
                          style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0 2px' }}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {selectedDiagnoses.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No ICD-10 diagnosis attached yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                [P] Plan — Therapeutic Management & Patient Education
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                disabled={isCompleted}
                placeholder="Prescribed therapy, diagnostics ordered, dietary instructions, review timeframe..."
                value={soap.plan}
                onChange={e => setSoap({ ...soap, plan: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Integrated Orders (Prescriptions & Laboratory) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* E-Prescriptions */}
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={16} color="#0f766e" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Prescriptions Attached ({prescriptionsAdded.length})</h3>
              </div>
              {!isCompleted && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowRxModal(true)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Plus size={13} />
                  <span>Add Medication</span>
                </button>
              )}
            </div>
            <div className="card-body" style={{ minHeight: '100px' }}>
              {prescriptionsAdded.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {prescriptionsAdded.map((p, i) => (
                    <div key={i} style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.medicationName}</div>
                      <div style={{ color: '#64748b' }}>{p.dosage} • {p.instructions}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', textAlign: 'center', marginTop: '1.5rem' }}>
                  No electronic prescriptions added to this consultation.
                </p>
              )}
            </div>
          </div>

          {/* Diagnostic Lab Orders */}
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlaskConical size={16} color="#0284c7" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Lab Tests Ordered ({labOrdersAdded.length})</h3>
              </div>
              {!isCompleted && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowLabModal(true)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Plus size={13} />
                  <span>Order Lab Test</span>
                </button>
              )}
            </div>
            <div className="card-body" style={{ minHeight: '100px' }}>
              {labOrdersAdded.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {labOrdersAdded.map((l, i) => (
                    <div key={i} style={{ padding: '0.5rem', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: '#0369a1' }}>{l.testName}</div>
                      <div style={{ color: '#64748b' }}>Specimen: {l.specimen} • Indication: {l.clinicalIndication}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', textAlign: 'center', marginTop: '1.5rem' }}>
                  No laboratory investigations ordered for this encounter.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Medication Modal */}
      {showRxModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRxModal(false)}
          title="Add Electronic Prescription"
          subtitle="Lookup National Formulary item with automated allergy checking"
          maxWidth="560px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowRxModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddPrescriptionItem}>
                Attach Prescription
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {allergyWarning && (
              <div className="banner-alert banner-alert-danger" style={{ padding: '0.65rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{allergyWarning}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Formulary Medication *</label>
              <select
                className="form-select"
                value={rxMedId}
                onChange={e => setRxMedId(e.target.value)}
              >
                {FORMULARY_MEDICATIONS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.strength} • {m.form})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dosage & Frequency</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 500 mg once daily with meal"
                value={rxDose}
                onChange={e => setRxDose(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Patient Counseling Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Take 30 minutes before breakfast. Avoid taking with antacids."
                value={rxInstructions}
                onChange={e => setRxInstructions(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Lab Test Modal */}
      {showLabModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowLabModal(false)}
          title="Order Diagnostic Laboratory Investigation"
          subtitle="Generates specimen barcode requisition and routes to LIMS queue"
          maxWidth="560px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowLabModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddLabOrderItem}>
                Place Lab Order
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Diagnostic Test Panel *</label>
              <select
                className="form-select"
                value={labTestId}
                onChange={e => setLabTestId(e.target.value)}
              >
                {LAB_TEST_CATALOG.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.panel} • Turnaround: {t.tatHours}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Indication / Diagnosis Rationale *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hypertension baseline renal function evaluation"
                value={labIndication}
                onChange={e => setLabIndication(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
