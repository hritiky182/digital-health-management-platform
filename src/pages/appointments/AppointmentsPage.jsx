import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Stethoscope,
  UserCheck,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function AppointmentsPage() {
  const { appointments, scheduleAppointment, updateAppointmentStatus, patients } = useData();
  const { currentFacility, facilities, isAllFacilities } = useFacility();
  const { currentRole } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('list'); // 'list', 'daily', 'weekly'
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);

  // New Appointment Form state
  const [formData, setFormData] = useState({
    patientId: '',
    facilityId: currentFacility.id === 'all' ? 'fac-1' : currentFacility.id,
    department: 'General Outpatient',
    providerName: 'Dr. Sarah K. Chen, MD',
    dateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    durationMinutes: 30,
    type: 'Follow-up Consultation',
    reason: 'Routine outpatient consultation',
    notes: ''
  });

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (!isAllFacilities && a.facilityId !== currentFacility.id) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, currentFacility, isAllFacilities, statusFilter]);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === formData.patientId);
    const fac = facilities.find(f => f.id === formData.facilityId);

    if (!pat) {
      alert('Please select a registered patient.');
      return;
    }

    scheduleAppointment({
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      patientMrn: pat.mrn,
      facilityId: fac?.id || 'fac-1',
      facilityName: fac?.name || 'Northstar Medical Center',
      department: formData.department,
      providerName: formData.providerName,
      providerRole: 'Physician',
      dateTime: formData.dateTime,
      durationMinutes: Number(formData.durationMinutes),
      type: formData.type,
      reason: formData.reason,
      notes: formData.notes
    });

    setShowBookModal(false);
  };

  const handleCheckIn = (apt) => {
    updateAppointmentStatus(apt.id, 'Waiting');
  };

  const handleStartConsultation = (apt) => {
    updateAppointmentStatus(apt.id, 'In Consultation');
    navigate(`/clinical?patientId=${apt.patientId}&appointmentId=${apt.id}`);
  };

  const columns = [
    {
      key: 'dateTime',
      header: 'Time & Date',
      width: '160px',
      render: (val) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            {new Date(val).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      render: (name, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f766e' }}>{name}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            MRN: {row.patientMrn}
          </div>
        </div>
      )
    },
    {
      key: 'facilityName',
      header: 'Facility & Dept',
      render: (fac, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{fac}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{row.department}</div>
        </div>
      )
    },
    {
      key: 'providerName',
      header: 'Assigned Clinician',
      render: (provider, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{provider}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{row.type}</div>
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Visit Reason',
      render: (reason) => <span style={{ fontSize: '0.8rem', color: '#334155' }}>{reason}</span>
    },
    {
      key: 'status',
      header: 'Queue Status',
      width: '130px',
      render: (status) => (
        <Badge
          variant={
            status === 'Completed' ? 'green' :
            status === 'In Consultation' ? 'teal' :
            status === 'Waiting' ? 'amber' :
            status === 'Checked-In' ? 'blue' : 'gray'
          }
          dot
        >
          {status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Lifecycle Action',
      sortable: false,
      width: '180px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {row.status === 'Scheduled' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleCheckIn(row)}
              title="Check in patient at clinic reception desk"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              <UserCheck size={13} color="#0284c7" />
              <span>Check In</span>
            </button>
          )}

          {(row.status === 'Waiting' || row.status === 'Checked-In') && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStartConsultation(row)}
              title="Commence clinical exam in exam room"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              <Stethoscope size={13} />
              <span>Call to Exam →</span>
            </button>
          )}

          {row.status === 'In Consultation' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/clinical/${row.encounterId || ''}`)}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', backgroundColor: '#0f766e' }}
            >
              <span>Resume Chart →</span>
            </button>
          )}

          {row.status === 'Completed' && (
            <span style={{ fontSize: '0.725rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle2 size={13} /> Visited
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments & Patient Scheduling</h1>
          <p className="page-description">
            Multi-facility provider calendars, outpatient triage queue management, and real-time waiting room progression.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowBookModal(true)}
          >
            <Plus size={16} />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredAppointments}
            searchPlaceholder="Search by patient name, MRN, provider, or visit reason..."
            searchKeys={['patientName', 'patientMrn', 'providerName', 'reason', 'department']}
            exportFileName="careaxis_appointments_schedule"
            filterComponent={
              <select
                className="form-select"
                style={{ width: '150px', height: '36px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Queue Statuses</option>
                <option value="Waiting">Waiting in Clinic</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Checked-In">Checked In</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            }
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowBookModal(false)}
          title="Schedule Patient Consultation"
          subtitle="Reserve clinician appointment slot and dispatch calendar notice"
          maxWidth="600px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowBookModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBookSubmit}
              >
                <CalendarIcon size={16} />
                <span>Confirm & Schedule</span>
              </button>
            </>
          }
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Registered Patient *</label>
              <select
                className="form-select"
                value={formData.patientId}
                onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">-- Select Patient from Directory --</option>
                {patients.filter(p => p.status === 'Active').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.mrn} • DOB: {p.dob})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Facility *</label>
                <select
                  className="form-select"
                  value={formData.facilityId}
                  onChange={e => setFormData({ ...formData, facilityId: e.target.value })}
                >
                  {facilities.filter(f => f.id !== 'all').map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinic Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="General Outpatient">General Outpatient</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Maternity & Antenatal">Maternity & Antenatal</option>
                  <option value="Cardiology Specialist">Cardiology Specialist</option>
                  <option value="Dental Clinic">Dental Clinic</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Healthcare Provider *</label>
                <select
                  className="form-select"
                  value={formData.providerName}
                  onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                >
                  <option value="Dr. Sarah K. Chen, MD">Dr. Sarah K. Chen, MD (Physician)</option>
                  <option value="Dr. Alexis Vance">Dr. Alexis Vance (General Practitioner)</option>
                  <option value="Sister Miriam Ndlovu, RN">Sister Miriam Ndlovu, RN (Nurse Practitioner)</option>
                  <option value="Dr. Helene Dubois, OB/GYN">Dr. Helene Dubois, OB/GYN (Obstetrician)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Appointment Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.dateTime}
                  onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Visit Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Initial Consultation">Initial Consultation</option>
                  <option value="Follow-up Consultation">Follow-up Consultation</option>
                  <option value="Chronic Disease Review">Chronic Disease Review</option>
                  <option value="Prescription Refill">Prescription Refill</option>
                  <option value="Post-Op Assessment">Post-Op Assessment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <select
                  className="form-select"
                  value={formData.durationMinutes}
                  onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chief Complaint / Reason for Visit *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hypertension review, persistent headache"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
