import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  Plus,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Activity,
  FileText,
  Search
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';

export function ClinicalEncountersPage() {
  const { encounters, patients, appointments } = useData();
  const { currentFacility, isAllFacilities } = useFacility();
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEncounters = useMemo(() => {
    return encounters.filter(e => {
      if (!isAllFacilities && e.facilityId !== currentFacility.id) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
  }, [encounters, currentFacility, isAllFacilities, statusFilter]);

  const columns = [
    {
      key: 'visitDate',
      header: 'Consultation Date',
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
      header: 'Patient Full Name',
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
      key: 'encounterType',
      header: 'Encounter Type',
      render: (type, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{type}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{row.facilityName} ({row.department})</div>
        </div>
      )
    },
    {
      key: 'providerName',
      header: 'Attending Clinician',
      render: (provider) => <span>{provider}</span>
    },
    {
      key: 'diagnoses',
      header: 'Primary Diagnosis',
      render: (diagnoses = []) => (
        <div>
          {diagnoses.length > 0 ? (
            <div style={{ fontSize: '0.8rem' }}>
              <strong style={{ color: '#0f172a' }}>{diagnoses[0].code}</strong>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{diagnoses[0].description}</div>
            </div>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Assessment in progress</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (status) => (
        <Badge variant={status === 'Completed' ? 'green' : 'amber'} dot>
          {status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Consultation Chart',
      sortable: false,
      width: '150px',
      render: (_, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/clinical/${row.id}`)}
          style={{
            backgroundColor: row.status === 'Completed' ? '#ffffff' : '#0f766e',
            color: row.status === 'Completed' ? '#0f766e' : '#ffffff',
            border: '1px solid #0f766e',
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem'
          }}
        >
          <FileText size={13} />
          <span>{row.status === 'Completed' ? 'Review Note' : 'Resume Chart'}</span>
        </button>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Electronic Health Records & Clinical Encounters</h1>
          <p className="page-description">
            Structured SOAP consultation charts, objective physiological vitals, ICD-10 diagnostic coding, and e-prescribing integration.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/clinical/new')}
          >
            <Plus size={16} />
            <span>Start Direct Consultation</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredEncounters}
            searchPlaceholder="Search by patient name, MRN, provider, or diagnosis code..."
            searchKeys={['patientName', 'patientMrn', 'providerName', 'encounterType']}
            exportFileName="careaxis_clinical_encounters"
            filterComponent={
              <select
                className="form-select"
                style={{ width: '150px', height: '36px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Consultation States</option>
                <option value="In Progress">In Progress (Open)</option>
                <option value="Completed">Completed & Signed</option>
              </select>
            }
          />
        </div>
      </div>
    </div>
  );
}
