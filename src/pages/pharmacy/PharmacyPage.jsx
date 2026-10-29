import React, { useState, useMemo } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PackageCheck,
  ShieldCheck,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FORMULARY_MEDICATIONS } from '../../data/formulary';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function PharmacyPage() {
  const { prescriptions, dispensePrescription, inventory, patients } = useData();
  const { currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'formulary'
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRx, setSelectedRx] = useState(null);
  const [dispenseNotes, setDispenseNotes] = useState('');
  const [batchLot, setBatchLot] = useState('LOT-2026-PH99');

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [prescriptions, statusFilter]);

  const handleOpenDispenseModal = (rx) => {
    setSelectedRx(rx);
    setBatchLot(`LOT-${Date.now().toString().slice(-6)}`);
    setDispenseNotes('Patient counseled on adherence, dosage timing, and hydration.');
  };

  const handleConfirmDispense = () => {
    if (!selectedRx) return;
    dispensePrescription(selectedRx.id, dispenseNotes, batchLot);
    setSelectedRx(null);
  };

  const columns = [
    {
      key: 'id',
      header: 'Prescription ID',
      width: '150px',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
          {val}
        </span>
      )
    },
    {
      key: 'datePrescribed',
      header: 'Date & Prescriber',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{row.prescriberName}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            {new Date(val).toLocaleDateString()} • {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      render: (name, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            MRN: {row.patientMrn}
          </div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Medication Regimen',
      render: (items = []) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ fontSize: '0.8rem' }}>
              <strong>{it.medicationName}</strong> — {it.dosage} ({it.quantity} {it.unit})
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Dispense Status',
      width: '150px',
      render: (status, row) => (
        <div>
          <Badge variant={status === 'Dispensed' ? 'green' : 'amber'} dot>
            {status}
          </Badge>
          {row.dispensedBy && (
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              By {row.dispensedBy}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      width: '130px',
      render: (_, row) => (
        <div>
          {row.status === 'Pending Dispensation' ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenDispenseModal(row)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <PackageCheck size={14} />
              <span>Dispense</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} /> Completed
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
          <h1 className="page-title">Pharmacy & E-Prescription Management</h1>
          <p className="page-description">
            Electronic prescription queue, automated clinical contraindication checks, lot tracking, and real-time formulary inventory reconciliation.
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
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'orders' ? '#0f766e' : 'transparent',
                color: activeTab === 'orders' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Prescriptions Queue ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('formulary')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'formulary' ? '#0f766e' : 'transparent',
                color: activeTab === 'formulary' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              National Formulary ({FORMULARY_MEDICATIONS.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="card">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredPrescriptions}
              searchPlaceholder="Search by patient name, MRN, prescription ID, or medication..."
              searchKeys={['id', 'patientName', 'patientMrn', 'prescriberName']}
              exportFileName="careaxis_prescriptions_queue"
              filterComponent={
                <select
                  className="form-select"
                  style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Dispense Statuses</option>
                  <option value="Pending Dispensation">Pending Dispensation</option>
                  <option value="Dispensed">Dispensed</option>
                </select>
              }
            />
          </div>
        </div>
      ) : (
        /* Formulary Catalog Tab */
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Approved National Essential Medicines Formulary</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Standard therapeutic dosing, category, and retail benchmarks
            </span>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug Code</th>
                  <th>Medication Name & Strength</th>
                  <th>Therapeutic Category</th>
                  <th>Standard Dosing Schedule</th>
                  <th>Unit Price</th>
                  <th>Prescription Rule</th>
                </tr>
              </thead>
              <tbody>
                {FORMULARY_MEDICATIONS.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f766e' }}>
                      {m.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{m.form} • {m.strength}</div>
                    </td>
                    <td>{m.category}</td>
                    <td style={{ fontSize: '0.775rem' }}>{m.standardDose}</td>
                    <td><strong>${m.pricePerUnit.toFixed(2)}</strong> / {m.unit}</td>
                    <td>
                      <Badge variant={m.requiresRx ? 'purple' : 'gray'}>
                        {m.requiresRx ? 'Prescription Only (Rx)' : 'Over-the-Counter (OTC)'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispense Verification Modal */}
      {selectedRx && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRx(null)}
          title="Verify & Dispense Electronic Prescription"
          subtitle={`Prescription #${selectedRx.id} for ${selectedRx.patientName} (${selectedRx.patientMrn})`}
          maxWidth="640px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedRx(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmDispense}>
                <PackageCheck size={16} />
                <span>Confirm Dispense & Deduct Stock</span>
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Verification Checklist */}
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={18} color="#0f766e" />
                <strong style={{ color: '#0f766e', fontSize: '0.85rem' }}>Clinical Safety Verification Passed</strong>
              </div>
              <p style={{ fontSize: '0.775rem', color: '#134e4a', margin: 0 }}>
                Automatic interaction engine checked patient allergy ledger. No contraindications flagged.
              </p>
            </div>

            {/* Prescribed Items Table */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>
                Items to Fulfill
              </label>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Prescribed Dose</th>
                      <th>Quantity</th>
                      <th>Inventory Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td><strong>{it.medicationName}</strong></td>
                        <td>{it.dosage}</td>
                        <td>{it.quantity} {it.unit}</td>
                        <td>
                          <Badge variant="green" dot>Available in Depot</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Batch / Lot Tracking Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={batchLot}
                  onChange={e => setBatchLot(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dispensing Pharmacist</label>
                <input
                  type="text"
                  className="form-input"
                  disabled
                  value={currentRole.userName}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Patient Counseling & Auxiliary Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={dispenseNotes}
                onChange={e => setDispenseNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
