import React, { useState } from 'react';
import {
  HelpCircle,
  FileQuestion,
  LifeBuoy,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Plus,
  Send
} from 'lucide-react';
import { APP_CONFIG } from '../../app/config';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function SupportPage() {
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Hardware / Barcode Scanner');
  const [ticketDetail, setTicketDetail] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const [tickets, setTickets] = useState([
    {
      id: 'TICK-9041',
      subject: 'Laboratory Accession Barcode Scanner Calibration',
      category: 'Hardware',
      facility: 'Riverside Community Clinic',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2026-10-28T14:20:00',
      assignedTo: 'Zoe K. Lin (Support Specialist)'
    },
    {
      id: 'TICK-8812',
      subject: 'Master Patient Index Merge Consultation Review',
      category: 'Data Governance',
      facility: 'Northstar Medical Center',
      status: 'Resolved',
      priority: 'Medium',
      createdAt: '2026-10-27T09:15:00',
      assignedTo: 'Zoe K. Lin (Support Specialist)'
    }
  ]);

  const guides = [
    {
      title: 'Enrolling Patients Without Conventional National IDs',
      category: 'Registration & MPI',
      summary: 'Under CareAxis identity protocols, patients without documentation (refugees, neonates, emergent trauma victims) can be registered with document waiver. The system automatically assigns a generated UPID.'
    },
    {
      title: 'Executing a Break-Glass Emergency Clinical Override',
      category: 'Security & Privacy',
      summary: 'Restricted records require an attested medical justification before access is unlocked. Every override initiates a 30-minute session and generates an audit dispatch to the National Security Officer.'
    },
    {
      title: 'Resolving Master Patient Index (MPI) Duplicates',
      category: 'Identity Management',
      summary: 'When multi-facility duplicate candidates are flagged, compare demographic fields side-by-side. Merging consolidates all clinical encounters and prescriptions into the primary record while retiring the duplicate.'
    },
    {
      title: 'Offline Store-and-Forward Operation during Network Outages',
      category: 'Infrastructure',
      summary: 'During cellular or fiber outages, CareAxis switches to local offline store-and-forward caching. All vital signs, consultations, and dispensing actions are queued and synchronized automatically upon reconnection.'
    }
  ];

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const newT = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      category: ticketCategory,
      facility: 'Central Operations Hub',
      status: 'Open',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
      assignedTo: 'Tier 1 Service Desk'
    };

    setTickets([newT, ...tickets]);
    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketDetail('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Enterprise Healthcare IT Service Desk & Support</h1>
            <Badge variant="teal">24/7 National Operations Desk</Badge>
          </div>
          <p className="page-description">
            Clinical standard operating procedures, technical troubleshooting guides, and incident dispatch for healthcare workers across the network.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowNewTicketModal(true)}
          >
            <Plus size={16} />
            <span>Open Support Incident Ticket</span>
          </button>
        </div>
      </div>

      {ticketSuccess && (
        <div className="banner-alert banner-alert-info" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="#0f766e" />
          <span>Support incident logged. An IT service desk specialist has been dispatched.</span>
        </div>
      )}

      {/* Standard Operating Procedures & Knowledge Articles */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} color="#0f766e" />
          <span>Clinical & Administrative Knowledge Base</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {guides.map((g, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="card-body">
                <Badge variant="blue" style={{ marginBottom: '0.5rem' }}>{g.category}</Badge>
                <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {g.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                  {g.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Tickets Worklist */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Active Incident & Maintenance Tickets</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Direct SLA dispatch tracking
          </span>
        </div>
        <div className="table-responsive" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject Summary</th>
                <th>Category</th>
                <th>Facility Origin</th>
                <th>Assigned Specialist</th>
                <th>Priority</th>
                <th>Resolution Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f766e' }}>
                    {t.id}
                  </td>
                  <td><strong>{t.subject}</strong></td>
                  <td>{t.category}</td>
                  <td>{t.facility}</td>
                  <td>{t.assignedTo}</td>
                  <td>
                    <Badge variant={t.priority === 'High' ? 'red' : 'amber'}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={t.status === 'Resolved' ? 'green' : 'blue'} dot>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showNewTicketModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowNewTicketModal(false)}
          title="Dispatch IT Support Incident Ticket"
          subtitle="Route technical anomaly or hardware issue to enterprise service desk"
          maxWidth="560px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowNewTicketModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateTicket}
              >
                <Send size={15} />
                <span>Submit Incident Report</span>
              </button>
            </>
          }
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Incident Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Barcode label printer alignment issue at pharmacy"
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Category *</label>
              <select
                className="form-select"
                value={ticketCategory}
                onChange={e => setTicketCategory(e.target.value)}
              >
                <option value="Hardware / Barcode Scanner">Hardware / Barcode Scanner</option>
                <option value="Network Connectivity / Offline Sync">Network Connectivity / Offline Sync</option>
                <option value="Clinical Documentation / EHR Chart">Clinical Documentation / EHR Chart</option>
                <option value="Master Patient Index Deduplication">Master Patient Index Deduplication</option>
                <option value="Pharmacy & Dispensation Accounting">Pharmacy & Dispensation Accounting</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Symptoms & Device Description *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe error code, workstation terminal number, and frequency..."
                value={ticketDetail}
                onChange={e => setTicketDetail(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
