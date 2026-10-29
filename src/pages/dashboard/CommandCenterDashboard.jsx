import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  UserPlus,
  Clock,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useFacility } from '../../context/FacilityContext';
import { useData } from '../../context/DataContext';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';

export function CommandCenterDashboard() {
  const { currentRole } = useAuth();
  const { currentFacility, isAllFacilities } = useFacility();
  const {
    patients,
    appointments,
    encounters,
    prescriptions,
    labOrders,
    invoices,
    inventory,
    auditLogs
  } = useData();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('7d'); // 'today', '7d', '30d'

  // Filter entities according to active facility scope
  const facilityFilter = (item) => {
    if (isAllFacilities) return true;
    return item.facilityId === currentFacility.id || item.primaryFacilityId === currentFacility.id;
  };

  const scopedPatients = useMemo(() => patients.filter(facilityFilter), [patients, currentFacility, isAllFacilities]);
  const scopedAppointments = useMemo(() => appointments.filter(facilityFilter), [appointments, currentFacility, isAllFacilities]);
  const scopedEncounters = useMemo(() => encounters.filter(facilityFilter), [encounters, currentFacility, isAllFacilities]);
  const scopedPrescriptions = useMemo(() => prescriptions.filter(facilityFilter), [prescriptions, currentFacility, isAllFacilities]);
  const scopedLabOrders = useMemo(() => labOrders.filter(facilityFilter), [labOrders, currentFacility, isAllFacilities]);
  const scopedInvoices = useMemo(() => invoices.filter(facilityFilter), [invoices, currentFacility, isAllFacilities]);
  const scopedInventory = useMemo(() => inventory.filter(facilityFilter), [inventory, currentFacility, isAllFacilities]);

  // Derived real-time metrics
  const totalRegistered = scopedPatients.length;
  const waitingPatients = scopedAppointments.filter(a => a.status === 'Waiting' || a.status === 'Checked-In').length;
  const inConsultation = scopedAppointments.filter(a => a.status === 'In Consultation').length;
  const pendingLabs = scopedLabOrders.filter(l => l.status === 'Ordered' || l.status === 'Specimen Collected').length;
  const pendingRx = scopedPrescriptions.filter(p => p.status === 'Pending Dispensation').length;
  const lowStockItems = scopedInventory.filter(i => i.status === 'Low Stock').length;
  const outstandingRevenue = scopedInvoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

  // Weekly Trend Chart Data (simulated distribution based on records)
  const encounterTrendData = [
    { day: 'Mon', outpatient: 32, emergency: 8, tele: 4 },
    { day: 'Tue', outpatient: 41, emergency: 12, tele: 7 },
    { day: 'Wed', outpatient: 38, emergency: 6, tele: 9 },
    { day: 'Thu', outpatient: 45, emergency: 14, tele: 11 },
    { day: 'Fri', outpatient: 52, emergency: 10, tele: 8 },
    { day: 'Sat', outpatient: 24, emergency: 16, tele: 3 },
    { day: 'Sun', outpatient: 18, emergency: 9, tele: 2 },
  ];

  // Appointment Status Pie Data
  const appointmentDistribution = [
    { name: 'Completed', value: scopedAppointments.filter(a => a.status === 'Completed').length || 4, color: '#10b981' },
    { name: 'In Consultation', value: inConsultation || 1, color: '#0f766e' },
    { name: 'Waiting / Checked In', value: waitingPatients || 2, color: '#f59e0b' },
    { name: 'Scheduled', value: scopedAppointments.filter(a => a.status === 'Scheduled').length || 3, color: '#0284c7' },
  ];

  // Recent operational alert messages
  const alerts = [
    lowStockItems > 0 && {
      id: 'alt-stock',
      type: 'warning',
      text: `${lowStockItems} inventory consumable/pharmaceutical items below mandatory reorder threshold.`,
      action: () => navigate('/inventory'),
      actionText: 'View Stock'
    },
    pendingLabs > 0 && {
      id: 'alt-lab',
      type: 'info',
      text: `${pendingLabs} laboratory specimens awaiting technician accessioning and analysis.`,
      action: () => navigate('/laboratory'),
      actionText: 'Open LIMS'
    },
    pendingRx > 0 && {
      id: 'alt-rx',
      type: 'teal',
      text: `${pendingRx} e-prescriptions queued in dispensary awaiting pharmacist verification.`,
      action: () => navigate('/pharmacy'),
      actionText: 'Dispense'
    }
  ].filter(Boolean);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">Executive Command Center</h1>
            <Badge variant="teal">Live Operations</Badge>
          </div>
          <p className="page-description">
            Unified operational overview for <strong>{currentFacility.name}</strong>. Real-time patient queues, clinical activity, laboratory turnaround, and pharmacy fulfillment status.
          </p>
        </div>

        <div className="page-actions">
          {/* Date range filter */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              padding: '2px'
            }}
          >
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: dateRange === r.id ? '#0f766e' : 'transparent',
                  color: dateRange === r.id ? '#ffffff' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/patients/register')}
          >
            <UserPlus size={15} />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Operational Notice / Banner */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {alerts.map(alt => (
            <div
              key={alt.id}
              className={`banner-alert banner-alert-${alt.type === 'warning' ? 'warning' : 'info'}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <AlertTriangle size={16} />
                <span>{alt.text}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={alt.action}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.725rem' }}
              >
                {alt.actionText} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="metric-grid">
        <MetricCard
          title="Active Registered Patients"
          value={totalRegistered}
          subtext="Unique Master Patient Index records"
          icon={Users}
          color="teal"
          onClick={() => navigate('/patients')}
        />
        <MetricCard
          title="In Queue / Waiting"
          value={waitingPatients}
          subtext={`${inConsultation} in clinical exam room`}
          icon={Clock}
          color="amber"
          onClick={() => navigate('/appointments')}
        />
        <MetricCard
          title="Lab Tests Awaiting TAT"
          value={pendingLabs}
          subtext="Under accessioning & analysis"
          icon={FlaskConical}
          color="blue"
          onClick={() => navigate('/laboratory')}
        />
        <MetricCard
          title="Prescriptions Queued"
          value={pendingRx}
          subtext="Pending pharmacy dispensing"
          icon={Pill}
          color="purple"
          onClick={() => navigate('/pharmacy')}
        />
        <MetricCard
          title="Outstanding Patient Balance"
          value={`$${outstandingRevenue.toFixed(2)}`}
          subtext="Pending insurance claims & copay"
          icon={Receipt}
          color="green"
          onClick={() => navigate('/billing')}
        />
      </div>

      {/* Analytics & Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Encounter Volumes Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Clinical Encounter Volumes</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Outpatient vs. Acute Emergency vs. Telehealth consultations
              </p>
            </div>
            <Badge variant="teal">Weekly Trend</Badge>
          </div>
          <div className="card-body" style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={encounterTrendData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={35} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="outpatient" name="Outpatient Visits" stroke="#0f766e" strokeWidth={2} fillOpacity={1} fill="url(#colorOutpatient)" />
                <Area type="monotone" dataKey="emergency" name="Emergency Intake" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEmergency)" />
                <Area type="monotone" dataKey="tele" name="Telehealth" stroke="#0284c7" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Distribution Donut */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Daily Appointment Flow</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Distribution across clinic queue lifecycle</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/appointments')}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              Manage Schedule
            </button>
          </div>
          <div className="card-body" style={{ height: '240px', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {appointmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {appointmentDistribution.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: '#475569', flex: 1 }}>{item.name}</span>
                  <strong style={{ color: '#0f172a' }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Clinic Waiting Queue & Recent Audit Events */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Waiting Queue Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Active Waiting Queue</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Patients currently checked-in at reception</p>
            </div>
            <Badge variant="amber">{scopedAppointments.filter(a => a.status === 'Waiting' || a.status === 'Checked-In' || a.status === 'In Consultation').length} Active</Badge>
          </div>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scopedAppointments.slice(0, 5).map(apt => (
                  <tr key={apt.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{apt.patientName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{apt.reason}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {apt.patientMrn}
                    </td>
                    <td>{apt.department}</td>
                    <td>
                      <Badge
                        variant={
                          apt.status === 'In Consultation' ? 'teal' :
                          apt.status === 'Waiting' ? 'amber' :
                          apt.status === 'Checked-In' ? 'blue' : 'green'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/clinical')}
                        style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                      >
                        Consult →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Audit Events Stream */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tamper-Evident System Audit Feed</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Immutable ledger of clinical and security actions</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/security')}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              Full Audit Log
            </button>
          </div>
          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.8rem'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: log.status === 'AUDITED_OVERRIDE' ? '#fef2f2' : '#f0fdfa',
                    color: log.status === 'AUDITED_OVERRIDE' ? '#dc2626' : '#0f766e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Activity size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.action}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '1px' }}>
                    {log.resource}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>
                    By <strong>{log.user}</strong> ({log.role}) • {log.facility || 'Network'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
