import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { MpiService } from '../../services/mpiService';
import { Badge } from '../../components/common/Badge';

export function PatientRegistrationPage() {
  const { patients, addPatient } = useData();
  const { facilities, currentFacility } = useFacility();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    dob: '',
    gender: 'Female',
    bloodGroup: 'O+',
    hasNationalId: true,
    nationalId: '',
    phone: '',
    email: '',
    addressStreet: '',
    addressDistrict: '',
    addressCity: 'Capital City',
    addressPostalCode: '',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    primaryFacilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
    insuranceProvider: 'Universal Health Shield (Demonstration)',
    policyNumber: '',
    allergyInput: '',
    chronicConditionsInput: '',
    registrationNotes: '',
    isRestricted: false,
    consentSharing: true
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Live duplicate detection against existing registered patients
  const duplicateMatches = useMemo(() => {
    if (!formData.firstName || !formData.lastName) return [];

    const candidate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      nationalId: formData.nationalId,
      phone: formData.phone
    };

    return MpiService.checkNewPatientForDuplicates(candidate, patients);
  }, [formData.firstName, formData.lastName, formData.dob, formData.nationalId, formData.phone, patients]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birth = new Date(formData.dob);
      if (birth > new Date()) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
    }
    if (!formData.phone.trim()) newErrors.phone = 'Contact phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const allergies = formData.allergyInput.trim()
      ? formData.allergyInput.split(',').map(a => ({ allergen: a.trim(), severity: 'Moderate' }))
      : [];

    const chronicConditions = formData.chronicConditionsInput.trim()
      ? formData.chronicConditionsInput.split(',').map(c => c.trim())
      : [];

    const payload = {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
      preferredName: formData.preferredName.trim() || formData.firstName.trim(),
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      nationalId: formData.hasNationalId ? (formData.nationalId.trim() || `ID-${Date.now().toString().slice(-8)}`) : null,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: {
        street: formData.addressStreet.trim(),
        district: formData.addressDistrict.trim(),
        city: formData.addressCity.trim(),
        postalCode: formData.addressPostalCode.trim()
      },
      emergencyContact: {
        name: formData.emergencyName.trim(),
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone.trim()
      },
      primaryFacilityId: formData.primaryFacilityId,
      insurance: {
        provider: formData.insuranceProvider,
        policyNumber: formData.policyNumber || `DEMO-${Date.now().toString().slice(-5)}`,
        status: 'Active',
        copayPercentage: 10
      },
      allergies,
      chronicConditions,
      currentMedications: [],
      isRestricted: formData.isRestricted,
      consentSharing: {
        dataExchangeAllowed: formData.consentSharing,
        researchUseAnonymized: true,
        emergencyOverridePermitted: true,
        lastUpdated: new Date().toISOString().slice(0, 10)
      }
    };

    setTimeout(() => {
      const created = addPatient(payload);
      setSubmitting(false);
      navigate(`/patients/${created.id}`);
    }, 400);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/patients')}
            style={{ marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Patient Directory</span>
          </button>
          <h1 className="page-title">Patient Intake & Demographic Enrollment</h1>
          <p className="page-description">
            Register a patient into the CareAxis Master Patient Index (MPI). Assigns a national UPID and internal MRN.
          </p>
        </div>
      </div>

      {/* Duplicate Prevention Alert Box */}
      {duplicateMatches.length > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} color="#d97706" />
            <h4 style={{ color: '#92400e', fontWeight: 600, fontSize: '0.925rem' }}>
              Master Patient Index: Possible Duplicate Match Detected ({duplicateMatches.length})
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            The demographic details entered closely match existing patient records in the repository. Please review to avoid creating redundant health records.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {duplicateMatches.slice(0, 3).map((match, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {match.existingPatient.firstName} {match.existingPatient.lastName} ({match.existingPatient.mrn})
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    DOB: {match.existingPatient.dob} • Phone: {match.existingPatient.phone} • Reasons: {match.reasons.join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge variant={match.score >= 85 ? 'red' : 'amber'}>
                    {match.score}% Match
                  </Badge>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/patients/${match.existingPatient.id}`)}
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                  >
                    Inspect Record →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Section 1: Identification & Facility */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Fingerprint size={18} />
              <span>1. Identity Verification & Facility Enrollment</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Primary Care Facility *</label>
                <select
                  name="primaryFacilityId"
                  className="form-select"
                  value={formData.primaryFacilityId}
                  onChange={handleChange}
                >
                  {facilities.filter(f => f.id !== 'all').map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.level})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">National Identity Document</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', height: '38px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={formData.hasNationalId}
                      onChange={() => setFormData(p => ({ ...p, hasNationalId: true }))}
                    />
                    <span>Available</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!formData.hasNationalId}
                      onChange={() => setFormData(p => ({ ...p, hasNationalId: false, nationalId: '' }))}
                    />
                    <span>Unregistered / Refugee / None</span>
                  </label>
                </div>
              </div>

              {formData.hasNationalId && (
                <div className="form-group">
                  <label className="form-label">National Identification Number</label>
                  <input
                    type="text"
                    name="nationalId"
                    className="form-input"
                    placeholder="e.g. ID-880412-5501"
                    value={formData.nationalId}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Personal Demographics */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              2. Personal Demographics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="e.g. Tariq"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <span className="form-error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Middle Name(s)</label>
                <input
                  type="text"
                  name="middleName"
                  className="form-input"
                  placeholder="e.g. Kwame"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name (Family Name) *</label>
                <input
                  type="text"
                  name="lastName"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="e.g. Mwangi"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <span className="form-error-text">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  className={`form-input ${errors.dob ? 'error' : ''}`}
                  value={formData.dob}
                  onChange={handleChange}
                />
                {errors.dob && <span className="form-error-text">{errors.dob}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Biological Sex / Gender *</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Non-binary</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Residence */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              3. Contact & Address Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Telephone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="form-error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="patient@example-health.org"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Street Address</label>
                <input
                  type="text"
                  name="addressStreet"
                  className="form-input"
                  placeholder="e.g. 42 Acacia Terrace"
                  value={formData.addressStreet}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District / Suburb</label>
                <input
                  type="text"
                  name="addressDistrict"
                  className="form-input"
                  placeholder="e.g. Eastern Riverbank"
                  value={formData.addressDistrict}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contact */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              4. Emergency Contact Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  className="form-input"
                  placeholder="e.g. Chidi Okafor"
                  value={formData.emergencyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship to Patient</label>
                <select
                  name="emergencyRelationship"
                  className="form-select"
                  value={formData.emergencyRelationship}
                  onChange={handleChange}
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent / Guardian</option>
                  <option value="Child">Son / Daughter</option>
                  <option value="Sibling">Brother / Sister</option>
                  <option value="Friend">Neighbor / Friend</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Clinical Alerts & Governance */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} />
              <span>5. Initial Clinical Baseline & Privacy Classification</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Known Allergies (Comma separated)</label>
                <input
                  type="text"
                  name="allergyInput"
                  className="form-input"
                  placeholder="e.g. Penicillin, Sulfa drugs, Latex"
                  value={formData.allergyInput}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Known Chronic Conditions (Comma separated)</label>
                <input
                  type="text"
                  name="chronicConditionsInput"
                  className="form-input"
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                  value={formData.chronicConditionsInput}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="consentSharing"
                  checked={formData.consentSharing}
                  onChange={handleChange}
                />
                <span>Consent granted for inter-facility National Health Information Exchange (HIE) clinical sharing.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', color: '#b91c1c' }}>
                <input
                  type="checkbox"
                  name="isRestricted"
                  checked={formData.isRestricted}
                  onChange={handleChange}
                />
                <span><strong>Classify as Sensitive Restricted Record</strong> (Requires Break-Glass emergency override to view).</span>
              </label>
            </div>
          </div>

        </div>

        {/* Form Footer */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/patients')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <UserPlus size={16} />
            <span>{submitting ? 'Registering...' : 'Enroll Patient & Assign UPID'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
