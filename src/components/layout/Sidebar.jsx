import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Fingerprint,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  PackageCheck,
  Video,
  Network,
  BarChart3,
  ShieldCheck,
  Milestone,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Activity,
  HeartPulse,
  LogOut
} from 'lucide-react';
import { APP_CONFIG } from '../../app/config';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export function Sidebar({ collapsed, onToggle }) {
  const { currentRole, logout } = useAuth();
  const { appointments, encounters, prescriptions, labOrders, inventory } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic live counters from data
  const waitingAppointmentsCount = appointments.filter(a => a.status === 'Waiting' || a.status === 'Checked-In').length;
  const activeEncountersCount = encounters.filter(e => e.status === 'In Progress').length;
  const pendingRxCount = prescriptions.filter(p => p.status === 'Pending Dispensation').length;
  const pendingLabCount = labOrders.filter(l => l.status === 'Ordered' || l.status === 'Specimen Collected').length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;

  const navSections = [
    {
      title: 'Clinical Operations',
      items: [
        { name: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Patient Directory', path: '/patients', icon: Users },
        { name: 'Master Patient Index', path: '/mpi', icon: Fingerprint, badge: 'MPI' },
        { name: 'Appointments & Queue', path: '/appointments', icon: Calendar, count: waitingAppointmentsCount },
        { name: 'Clinical Encounters', path: '/clinical', icon: Stethoscope, count: activeEncountersCount },
        { name: 'Telehealth & Outreach', path: '/telehealth', icon: Video },
      ]
    },
    {
      title: 'Diagnostics & Support',
      items: [
        { name: 'Pharmacy & E-Rx', path: '/pharmacy', icon: Pill, count: pendingRxCount },
        { name: 'Diagnostic Laboratory', path: '/laboratory', icon: FlaskConical, count: pendingLabCount },
        { name: 'Billing & Invoicing', path: '/billing', icon: Receipt },
        { name: 'Medical Inventory', path: '/inventory', icon: PackageCheck, count: lowStockCount, countAlert: lowStockCount > 0 },
      ]
    },
    {
      title: 'Enterprise & Governance',
      items: [
        { name: 'Interoperability (FHIR)', path: '/interoperability', icon: Network },
        { name: 'Health Analytics & BI', path: '/analytics', icon: BarChart3 },
        { name: 'Security & Audit Logs', path: '/security', icon: ShieldCheck },
        { name: 'Rollout Readiness', path: '/implementation', icon: Milestone },
        { name: 'Service Desk & Support', path: '/support', icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0 1.25rem',
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#090d16'
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(15, 118, 110, 0.4)'
          }}
        >
          <HeartPulse size={20} />
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.15, overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#f8fafc' }}>
              {APP_CONFIG.name}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Digital Health Platform
            </div>
          </div>
        )}
      </div>

      {/* Nav List Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '1rem 0.5rem' : '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {navSections.map(section => (
          <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.75rem 0.35rem 0.75rem'
                }}
              >
                {section.title}
              </div>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: collapsed ? '0.65rem 0' : '0.55rem 0.75rem',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '6px',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#0f766e' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 150ms ease',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0, color: isActive ? '#ffffff' : '#cbd5e1' }} />
                  {!collapsed && (
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  )}
                  {!collapsed && item.count !== undefined && item.count > 0 && (
                    <span
                      style={{
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        backgroundColor: item.countAlert ? '#ef4444' : isActive ? '#ffffff' : '#334155',
                        color: item.countAlert ? '#ffffff' : isActive ? '#0f766e' : '#f8fafc'
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#1e293b',
                        color: '#38bdf8',
                        border: '1px solid #334155'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sign Out Action */}
      <div style={{ padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title={collapsed ? 'Sign Out / Lock Session' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.65rem',
            width: '100%',
            padding: collapsed ? '0.5rem 0' : '0.5rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out / Lock</span>}
        </button>
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div
          style={{
            padding: '0.65rem 1rem',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#64748b'
          }}
        >
          <div>
            <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{APP_CONFIG.version}</div>
            <div>{APP_CONFIG.buildNumber}</div>
          </div>
          <div
            style={{
              padding: '0.2rem 0.4rem',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 600
            }}
          >
            LTS
          </div>
        </div>
      )}
    </aside>
  );
}
