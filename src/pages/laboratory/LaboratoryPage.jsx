import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  FileCheck,
  Search,
  Filter,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { LAB_TEST_CATALOG } from '../../data/labTests';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function LaboratoryPage() {
  const { labOrders, updateLabOrderStatus, patients } = useData();
  const { currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState('worklist'); // 'worklist' or 'catalog'
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderForResults, setSelectedOrderForResults] = useState(null);
  const [resultValues, setResultValues] = useState({});
  const [pathologistNotes, setPathologistNotes] = useState('');

  const filteredOrders = useMemo(() => {
    return labOrders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    });
  }, [labOrders, statusFilter]);

  const handleOpenResultsModal = (order) => {
    setSelectedOrderForResults(order);
    const catalogItem = LAB_TEST_CATALOG.find(t => t.id === order.testId) || LAB_TEST_CATALOG[0];

    const initial = {};
    catalogItem.parameters.forEach(p => {
      // Find existing or set standard normal midpoint
      const existing = order.results?.find(r => r.parameter === p.name);
      if (existing) {
        initial[p.name] = existing.value;
      } else {
        initial[p.name] = typeof p.normalMin === 'number'
          ? ((p.normalMin + p.normalMax) / 2).toFixed(1)
          : 'Negative';
      }
    });

    setResultValues(initial);
    setPathologistNotes(order.pathologistNotes || 'Specimen processed on automated analyzer. Controls within 2SD.');
  };

  const handleConfirmSaveResults = () => {
    if (!selectedOrderForResults) return;

    const catalogItem = LAB_TEST_CATALOG.find(t => t.id === selectedOrderForResults.testId) || LAB_TEST_CATALOG[0];

    const formattedResults = catalogItem.parameters.map(p => {
      const val = resultValues[p.name];
      let status = 'Normal';

      if (typeof p.normalMin === 'number') {
        const numVal = parseFloat(val);
        if (numVal > p.normalMax) status = numVal >= (p.criticalHigh || 999) ? 'Critical High' : 'High';
        else if (numVal < p.normalMin) status = numVal <= (p.criticalLow || -999) ? 'Critical Low' : 'Low';
      } else {
        if (val === 'Positive') status = 'Critical';
      }

      return {
        parameter: p.name,
        value: val,
        unit: p.unit,
        range: `${p.normalMin} - ${p.normalMax}`,
        status
      };
    });

    updateLabOrderStatus(selectedOrderForResults.id, 'Verified', {
      results: formattedResults,
      pathologistNotes,
      processedAt: new Date().toISOString(),
      verifiedBy: currentRole.userName
    });

    setSelectedOrderForResults(null);
  };

  const handleCollectSpecimen = (order) => {
    updateLabOrderStatus(order.id, 'Specimen Collected', {
      collectedAt: new Date().toISOString(),
      collectedBy: currentRole.userName
    });
  };

  const columns = [
    {
      key: 'barcodeAccession',
      header: 'Accession Barcode',
      width: '170px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={18} color="#0f766e" />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f766e', fontSize: '0.8rem' }}>
              {val}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
              Order ID: {row.id}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'testName',
      header: 'Test Investigation',
      render: (test, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{test}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            Specimen: <strong>{row.specimen}</strong> • Priority: {row.priority}
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
      key: 'orderingProvider',
      header: 'Order Details',
      render: (provider, row) => (
        <div>
          <div>{provider}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            {new Date(row.orderDateTime).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'LIMS Status',
      width: '160px',
      render: (status, row) => (
        <div>
          <Badge
            variant={
              status === 'Verified' ? 'green' :
              status === 'Specimen Collected' ? 'blue' : 'amber'
            }
            dot
          >
            {status}
          </Badge>
          {row.verifiedBy && (
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              Signed by {row.verifiedBy}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Processing Action',
      sortable: false,
      width: '170px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {row.status === 'Ordered' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleCollectSpecimen(row)}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              Collect Specimen
            </button>
          )}

          {row.status === 'Specimen Collected' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenResultsModal(row)}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              <FlaskConical size={13} />
              <span>Enter Results</span>
            </button>
          )}

          {row.status === 'Verified' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleOpenResultsModal(row)}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              <FileCheck size={13} color="#10b981" />
              <span>View Results</span>
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
          <h1 className="page-title">Diagnostic Laboratory Information System (LIMS)</h1>
          <p className="page-description">
            Specimen accessioning, barcode tracking, reference interval verification, critical result escalations, and automated pathologist reporting.
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
              onClick={() => setActiveTab('worklist')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'worklist' ? '#0f766e' : 'transparent',
                color: activeTab === 'worklist' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Specimen Worklist ({labOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '4px',
                background: activeTab === 'catalog' ? '#0f766e' : 'transparent',
                color: activeTab === 'catalog' ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Diagnostic Test Catalog ({LAB_TEST_CATALOG.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'worklist' ? (
        <div className="card">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredOrders}
              searchPlaceholder="Search barcode accession, test name, patient, or MRN..."
              searchKeys={['barcodeAccession', 'testName', 'patientName', 'patientMrn']}
              exportFileName="careaxis_lims_orders"
              filterComponent={
                <select
                  className="form-select"
                  style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All LIMS Statuses</option>
                  <option value="Ordered">Ordered (Pending Draw)</option>
                  <option value="Specimen Collected">Specimen Accessioned</option>
                  <option value="Verified">Verified & Signed</option>
                </select>
              }
            />
          </div>
        </div>
      ) : (
        /* Test Catalog Tab */
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Standard Laboratory Investigation Directory</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Standard specimen requirements, biological reference intervals, and TAT targets
            </span>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Code</th>
                  <th>Test Name & Panel</th>
                  <th>Specimen Tube / Container</th>
                  <th>Target Turnaround Time</th>
                  <th>Standard Cost</th>
                  <th>Parameters Evaluated</th>
                </tr>
              </thead>
              <tbody>
                {LAB_TEST_CATALOG.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f766e' }}>
                      {t.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{t.panel}</div>
                    </td>
                    <td>{t.specimen}</td>
                    <td>
                      <Badge variant="blue">
                        <Clock size={12} /> {t.tatHours} Hours
                      </Badge>
                    </td>
                    <td><strong>${t.cost.toFixed(2)}</strong></td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {t.parameters.map(p => p.name).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enter / Review Results Modal */}
      {selectedOrderForResults && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrderForResults(null)}
          title={`Diagnostic Results Entry — ${selectedOrderForResults.testName}`}
          subtitle={`Accession: ${selectedOrderForResults.barcodeAccession} • Patient: ${selectedOrderForResults.patientName} (${selectedOrderForResults.patientMrn})`}
          maxWidth="700px"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedOrderForResults(null)}
              >
                Close
              </button>
              {selectedOrderForResults.status !== 'Verified' && (
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmSaveResults}
                >
                  <FileCheck size={16} />
                  <span>Verify & Authorize Lab Release</span>
                </button>
              )}
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parameter Name</th>
                    <th>Reference Interval</th>
                    <th style={{ width: '180px' }}>Recorded Value</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(LAB_TEST_CATALOG.find(t => t.id === selectedOrderForResults.testId) || LAB_TEST_CATALOG[0]).parameters.map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ fontSize: '0.775rem', color: '#64748b' }}>
                        {p.normalMin} - {p.normalMax}
                      </td>
                      <td>
                        {typeof p.normalMin === 'number' ? (
                          <input
                            type="number"
                            step="0.1"
                            className="form-input"
                            style={{ height: '32px', fontSize: '0.85rem' }}
                            disabled={selectedOrderForResults.status === 'Verified'}
                            value={resultValues[p.name] || ''}
                            onChange={e => setResultValues({ ...resultValues, [p.name]: e.target.value })}
                          />
                        ) : (
                          <select
                            className="form-select"
                            style={{ height: '32px', fontSize: '0.85rem' }}
                            disabled={selectedOrderForResults.status === 'Verified'}
                            value={resultValues[p.name] || 'Negative'}
                            onChange={e => setResultValues({ ...resultValues, [p.name]: e.target.value })}
                          >
                            <option value="Negative">Negative</option>
                            <option value="Positive">Positive (Flagged)</option>
                          </select>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-group">
              <label className="form-label">Pathologist & Laboratory Technician Findings</label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={selectedOrderForResults.status === 'Verified'}
                value={pathologistNotes}
                onChange={e => setPathologistNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
