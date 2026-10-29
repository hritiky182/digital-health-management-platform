import React, { useState, useMemo } from 'react';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
  DollarSign,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/common/DataTable';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function BillingPage() {
  const { invoices, recordPayment, patients } = useData();
  const { currentFacility, isAllFacilities } = useFacility();
  const { currentRole } = useAuth();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Electronic Card (Simulated POS)');
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (!isAllFacilities && inv.facilityId !== currentFacility.id) return false;
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      return true;
    });
  }, [invoices, currentFacility, isAllFacilities, statusFilter]);

  // Financial aggregates
  const totalInvoiced = filteredInvoices.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalInsurance = filteredInvoices.reduce((s, i) => s + (i.insuranceCoverage || 0), 0);
  const totalPaid = filteredInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalOutstanding = filteredInvoices.reduce((s, i) => s + (i.balanceDue || 0), 0);

  const handleOpenPay = (inv) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(inv.balanceDue?.toFixed(2) || '0.00');
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoiceForPayment || !paymentAmount) return;
    recordPayment(selectedInvoiceForPayment.id, parseFloat(paymentAmount), paymentMethod);
    setSelectedInvoiceForPayment(null);
  };

  const columns = [
    {
      key: 'id',
      header: 'Invoice ID',
      width: '140px',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
          {val}
        </span>
      )
    },
    {
      key: 'invoiceDate',
      header: 'Date & Due',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Due: {row.dueDate}</div>
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
      key: 'subtotal',
      header: 'Gross Total',
      render: (val) => <span>${val?.toFixed(2)}</span>
    },
    {
      key: 'insuranceCoverage',
      header: 'Health Plan Coverage',
      render: (val, row) => (
        <div>
          <div style={{ color: '#0f766e', fontWeight: 600 }}>${val?.toFixed(2)}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{row.insuranceProvider}</div>
        </div>
      )
    },
    {
      key: 'patientCopay',
      header: 'Patient Copay / Balance',
      render: (_, row) => (
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Copay: ${row.patientCopay?.toFixed(2)}</div>
          <div style={{ fontWeight: 700, color: row.balanceDue > 0 ? '#ef4444' : '#10b981' }}>
            Due: ${row.balanceDue?.toFixed(2)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Payment Status',
      width: '160px',
      render: (status, row) => (
        <div>
          <Badge
            variant={
              status === 'Paid' ? 'green' :
              status === 'Partially Paid' ? 'blue' : 'amber'
            }
            dot
          >
            {status}
          </Badge>
          {row.receiptNumber && (
            <div style={{ fontSize: '0.675rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {row.receiptNumber}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Financial Actions',
      sortable: false,
      width: '180px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setViewingInvoice(row)}
            style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
          >
            <FileText size={13} />
            <span>View</span>
          </button>

          {row.balanceDue > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenPay(row)}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              <CreditCard size={13} />
              <span>Record Pay</span>
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
          <h1 className="page-title">Health Financing, Billing & Invoicing</h1>
          <p className="page-description">
            Encounter fee schedule accounting, health insurance pre-authorizations, copayment collection, and official revenue ledger reconciliation.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Total Gross Invoiced"
          value={`$${totalInvoiced.toFixed(2)}`}
          subtext="Consultations, Labs, and Prescriptions"
          icon={Receipt}
          color="teal"
        />
        <MetricCard
          title="Insurance Coverage"
          value={`$${totalInsurance.toFixed(2)}`}
          subtext="Covered by health benefit funds"
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Patient Copay Collected"
          value={`$${totalPaid.toFixed(2)}`}
          subtext="Verified receipts issued"
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Outstanding Patient Balance"
          value={`$${totalOutstanding.toFixed(2)}`}
          subtext="Pending collection at cashier"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredInvoices}
            searchPlaceholder="Search invoice ID, patient name, MRN, or insurance provider..."
            searchKeys={['id', 'patientName', 'patientMrn', 'insuranceProvider', 'receiptNumber']}
            exportFileName="careaxis_billing_ledger"
            filterComponent={
              <select
                className="form-select"
                style={{ width: '170px', height: '36px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Payment Statuses</option>
                <option value="Pending Insurance Claim">Pending Insurance Claim</option>
                <option value="Paid">Fully Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            }
          />
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoiceForPayment(null)}
          title="Record Patient Copayment"
          subtitle={`Invoice #${selectedInvoiceForPayment.id} for ${selectedInvoiceForPayment.patientName}`}
          maxWidth="500px"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedInvoiceForPayment(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmPayment}
              >
                <Receipt size={16} />
                <span>Issue Receipt & Settle Balance</span>
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#64748b' }}>Patient Copay Balance Due:</span>
                <strong style={{ color: '#ef4444' }}>${selectedInvoiceForPayment.balanceDue?.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Health Plan:</span>
                <span>{selectedInvoiceForPayment.insuranceProvider}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount to Collect ($) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tender / Payment Method *</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="Electronic Card (Simulated POS)">Electronic Card (POS Terminal)</option>
                <option value="Mobile Health Wallet (Simulated)">Mobile Health Wallet</option>
                <option value="Bank Direct Debit / Electronic Transfer">Bank Electronic Transfer</option>
                <option value="Hospital Cashier Currency Receipt">Hospital Cashier Currency</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Detail Breakdown Modal */}
      {viewingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setViewingInvoice(null)}
          title={`Official Billing Statement — #${viewingInvoice.id}`}
          subtitle={`Patient: ${viewingInvoice.patientName} (${viewingInvoice.patientMrn}) • Date: ${viewingInvoice.invoiceDate}`}
          maxWidth="640px"
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingInvoice(null)}>
              Close Statement
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.lineItems?.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.description}</strong></td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice?.toFixed(2)}</td>
                      <td><strong>${item.total?.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Subtotal:</span>
                  <strong>${viewingInvoice.subtotal?.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f766e' }}>
                  <span>Insurance Plan Coverage:</span>
                  <strong>-${viewingInvoice.insuranceCoverage?.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Patient Copay Obligation:</span>
                  <strong>${viewingInvoice.patientCopay?.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Amount Paid:</span>
                  <strong>${viewingInvoice.amountPaid?.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '0.35rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700 }}>Balance Due:</span>
                  <strong style={{ color: viewingInvoice.balanceDue > 0 ? '#ef4444' : '#10b981' }}>
                    ${viewingInvoice.balanceDue?.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {viewingInvoice.receiptNumber && (
              <div style={{ backgroundColor: '#f0fdfa', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccfbf1', fontSize: '0.8rem', color: '#134e4a' }}>
                <strong>Settlement Receipt Issued:</strong> #{viewingInvoice.receiptNumber} via {viewingInvoice.paymentMethod} on {viewingInvoice.paidAt ? new Date(viewingInvoice.paidAt).toLocaleString() : 'N/A'}.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
