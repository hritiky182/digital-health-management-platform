import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { ExportService } from '../../services/exportService';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';

export function AnalyticsPage() {
  const { patients, encounters, labOrders, facilities } = useData();
  const { currentFacility, isAllFacilities } = useFacility();

  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '1y'

  // Top Morbidity Diagnoses Data
  const morbidityData = [
    { diagnosis: 'Hypertension (I10)', count: 142, category: 'Cardiovascular' },
    { diagnosis: 'Type 2 Diabetes (E11)', count: 98, category: 'Endocrine' },
    { diagnosis: 'Upper Resp Infection (J06)', count: 84, category: 'Respiratory' },
    { diagnosis: 'P. falciparum Malaria (B50)', count: 62, category: 'Infectious' },
    { diagnosis: 'Gastroenteritis (A09)', count: 45, category: 'Gastrointestinal' },
    { diagnosis: 'Unspecified Asthma (J45)', count: 38, category: 'Respiratory' },
  ];

  // Facility Workload Census Data
  const facilityWorkload = [
    { facility: 'Northstar Hospital', outpatients: 412, admissions: 82, labTests: 650, occupancy: '84%' },
    { facility: 'Riverside Clinic', outpatients: 285, admissions: 14, labTests: 180, occupancy: '62%' },
    { facility: 'Meadowbrook Hospital', outpatients: 190, admissions: 48, labTests: 310, occupancy: '75%' },
    { facility: 'Central Diagnostic Lab', outpatients: 0, admissions: 0, labTests: 1420, occupancy: 'N/A' },
  ];

  // Epidemiological Monthly Trends
  const epidemiologicalTrends = [
    { month: 'May', hypertension: 95, respiratory: 60, malaria: 40 },
    { month: 'Jun', hypertension: 105, respiratory: 72, malaria: 35 },
    { month: 'Jul', hypertension: 110, respiratory: 88, malaria: 30 },
    { month: 'Aug', hypertension: 125, respiratory: 95, malaria: 45 },
    { month: 'Sep', hypertension: 135, respiratory: 110, malaria: 55 },
    { month: 'Oct', hypertension: 142, respiratory: 84, malaria: 62 },
  ];

  // Age Pyramid Demographics
  const ageDistribution = [
    { group: '0-14 yrs', males: 24, females: 28 },
    { group: '15-29 yrs', males: 45, females: 52 },
    { group: '30-49 yrs', males: 68, females: 74 },
    { group: '50-64 yrs', males: 55, females: 58 },
    { group: '65+ yrs', males: 38, females: 44 },
  ];

  const handleExportSanitized = () => {
    ExportService.exportToCsv('CareAxis_Epidemiological_Surveillance_Report', morbidityData, [
      { key: 'diagnosis', label: 'ICD-10 Clinical Condition' },
      { key: 'category', label: 'Disease Classification' },
      { key: 'count', label: 'Reported Incident Cases' }
    ]);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Population Health Surveillance & Analytics</h1>
            <Badge variant="teal">De-Identified Public Health BI</Badge>
          </div>
          <p className="page-description">
            Aggregated morbidity incidence, epidemiological surveillance trends, facility bed occupancy benchmarks, and laboratory turnaround metrics.
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
            {[
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '1y', label: 'Calendar Year 2026' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: timeRange === r.id ? '#0f766e' : 'transparent',
                  color: timeRange === r.id ? '#ffffff' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportSanitized}
            title="Download de-identified epidemiological report without PII"
          >
            <Download size={14} />
            <span>Export Anonymized CSV</span>
          </button>
        </div>
      </div>

      {/* Surveillance Summary Cards */}
      <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Leading Morbidity Incidence"
          value="Essential HTN"
          subtext="142 cases reported this period"
          icon={Activity}
          color="teal"
        />
        <MetricCard
          title="Average Hospital Occupancy"
          value="78.2%"
          subtext="Across Northstar & Meadowbrook"
          icon={Building2}
          color="blue"
        />
        <MetricCard
          title="Mean Lab Turnaround Time"
          value="3.4 Hours"
          subtext="96.2% within SLA target"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Visualizations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Top 6 Morbidity Diagnoses */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Top Morbidity Diagnoses (ICD-10)</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Cumulative outpatient & inpatient clinical encounters</p>
            </div>
            <Badge variant="teal">Disease Registry</Badge>
          </div>
          <div className="card-body" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={morbidityData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="diagnosis"
                  type="category"
                  width={210}
                  tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 500 }}
                  interval={0}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Case Count" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Surveillance Trends */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Multi-Month Disease Incidence Surveillance</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Chronic hypertension vs. acute respiratory vs. malaria</p>
            </div>
            <Badge variant="blue">6-Month Trend</Badge>
          </div>
          <div className="card-body" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={epidemiologicalTrends} margin={{ top: 10, right: 20, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="hypertension" name="Hypertension" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="respiratory" name="Acute Respiratory" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="malaria" name="Malaria" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Facility Workload Table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Facility Workload & Operational Census Comparison</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Multi-tier healthcare throughput analysis
          </span>
        </div>
        <div className="table-responsive" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Healthcare Facility</th>
                <th>Outpatient Consultations</th>
                <th>Inpatient Admissions</th>
                <th>Diagnostic Lab Tests</th>
                <th>Inpatient Bed Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {facilityWorkload.map((f, i) => (
                <tr key={i}>
                  <td><strong>{f.facility}</strong></td>
                  <td>{f.outpatients} visits</td>
                  <td>{f.admissions} admissions</td>
                  <td>{f.labTests} tests processed</td>
                  <td>
                    <Badge variant={f.occupancy.includes('8') ? 'amber' : 'teal'}>
                      {f.occupancy}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
