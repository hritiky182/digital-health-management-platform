import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  dashboard: 'Command Center',
  patients: 'Patient Directory',
  register: 'New Registration',
  mpi: 'Master Patient Index (MPI)',
  appointments: 'Appointments & Scheduling',
  clinical: 'Clinical Encounters (EHR)',
  pharmacy: 'Pharmacy & E-Prescriptions',
  laboratory: 'Diagnostic Laboratory',
  billing: 'Health Financing & Invoicing',
  inventory: 'Medical Inventory & Supplies',
  telehealth: 'Telehealth & Outreach',
  interoperability: 'Interoperability (FHIR / HL7)',
  analytics: 'Population Health Analytics',
  security: 'Security, Privacy & Audit',
  implementation: 'Rollout Readiness & Plan',
  support: 'Service Desk & Support'
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: '#64748b',
        marginBottom: '1rem'
      }}
    >
      <Link
        to="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          textDecoration: 'none'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#0f766e'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} color="#cbd5e1" />
            {isLast ? (
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{label}</span>
            ) : (
              <Link
                to={to}
                style={{ color: '#64748b', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#0f766e'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
