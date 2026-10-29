import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Lock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BreakGlassModal } from '../../components/feedback/BreakGlassModal';

export function PatientDirectoryPage() {
  const { patients, deactivatePatient } = useData();
  const { currentFacility, isAllFacilities } = useFacility();
  const { hasPermission, isBreakGlassActive } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [deactivatingPatient, setDeactivatingPatient] = useState(null);
  const [restrictedTargetPatient, setRestrictedTargetPatient] = useState(null);

  // Scoped patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Facility filter
      if (selectedFacility !== 'all' && p.primaryFacilityId !== selectedFacility) {
        return false;
      }
      if (!isAllFacilities && p.primaryFacilityId !== currentFacility.id) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [patients, selectedFacility, selectedStatus, currentFacility, isAllFacilities]);

  const handleRowClick = (patient) => {
    if (patient.isRestricted && !isBreakGlassActive(patient.id)) {
      setRestrictedTargetPatient(patient);
    } else {
      navigate(`/patients/${patient.id}`);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '—';
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return `${age} yrs`;
  };

  const columns = [
    {
      key: 'mrn',
      header: 'MRN & UPID',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f766e', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            {row.mrn}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            {row.upid}
          </div>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Patient Full Name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{row.firstName} {row.middleName ? `${row.middleName} ` : ''}{row.lastName}</span>
            {row.isRestricted && (
              <span title="Restricted Record — Break-Glass Required">
                <Lock size={13} color="#dc2626" />
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            {row.phone || row.email || 'No contact provided'}
          </div>
        </div>
      )
    },
    {
      key: 'dob',
      header: 'Age & Sex',
      width: '130px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{calculateAge(val)}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{row.gender} • {row.bloodGroup || 'Blood unk.'}</div>
        </div>
      )
    },
    {
      key: 'allergies',
      header: 'Clinical Alerts',
      render: (allergies = []) => (
        <div>
          {allergies.length > 0 ? (
            <Badge variant="red" dot>
              {allergies[0].allergen}
              {allergies.length > 1 ? ` (+${allergies.length - 1})` : ''}
            </Badge>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No known allergies</span>
          )}
        </div>
      )
    },
    {
      key: 'registrationDate',
      header: 'Enrolled On',
      width: '120px',
      render: (val) => <span style={{ fontSize: '0.775rem', color: '#475569' }}>{val || '—'}</span>
    },
    {
      key: 'status',
      header: 'Record Status',
      width: '110px',
      render: (status) => (
        <Badge
          variant={
            status === 'Active' ? 'green' :
            status === 'Merged' ? 'purple' : 'gray'
          }
          dot
        >
          {status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      width: '110px',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleRowClick(row)}
            title="Inspect Patient Health Profile"
            style={{ padding: '0.25rem 0.5rem' }}
          >
            <Eye size={13} />
            <span>View</span>
          </button>
          {hasPermission('patients:delete') && row.status === 'Active' && (
            <button
              className="btn-icon"
              onClick={() => setDeactivatingPatient(row)}
              title="Deactivate Patient Record"
              style={{ padding: '0.25rem', color: '#94a3b8' }}
            >
              <Trash2 size={14} />
            </button>
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
          <h1 className="page-title">National Patient Directory</h1>
          <p className="page-description">
            Master patient demographic index, medical record numbers (MRN), unique identifiers (UPID), and active longitudinal health records.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/patients/register')}
          >
            <UserPlus size={16} />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredPatients}
            searchPlaceholder="Search by name, MRN, UPID, or phone number..."
            searchKeys={['mrn', 'upid', 'firstName', 'lastName', 'phone', 'nationalId']}
            exportFileName="careaxis_patients_registry"
            onRowClick={handleRowClick}
            filterComponent={
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ width: '130px', height: '36px', fontSize: '0.8rem' }}
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Merged">Merged Records</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            }
          />
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {deactivatingPatient && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivatingPatient(null)}
          onConfirm={() => {
            deactivatePatient(deactivatingPatient.id, 'Administrative deactivation request.');
            setDeactivatingPatient(null);
          }}
          title="Deactivate Patient Record?"
          message={`Are you sure you want to deactivate ${deactivatingPatient.firstName} ${deactivatingPatient.lastName} (${deactivatingPatient.mrn})? Historical clinical encounters will remain preserved in the audit archive, but new appointments cannot be scheduled.`}
          confirmText="Deactivate Record"
          danger={true}
        />
      )}

      {/* Break-Glass Modal for Restricted Records */}
      {restrictedTargetPatient && (
        <BreakGlassModal
          isOpen={true}
          onClose={() => setRestrictedTargetPatient(null)}
          patient={restrictedTargetPatient}
          onSuccess={() => {
            const pid = restrictedTargetPatient.id;
            setRestrictedTargetPatient(null);
            navigate(`/patients/${pid}`);
          }}
        />
      )}
    </div>
  );
}
