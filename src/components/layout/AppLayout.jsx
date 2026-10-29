import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Breadcrumbs } from './Breadcrumbs';
import { ToastContainer } from '../feedback/ToastContainer';
import { Modal } from '../common/Modal';
import {
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Pill,
  FlaskConical,
  CreditCard,
  RotateCcw
} from 'lucide-react';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'reg_patient',
      title: 'Register New Patient',
      desc: 'Enroll patient, assign UPID, check MPI duplicate flags',
      icon: UserPlus,
      color: '#0f766e',
      path: '/patients/register'
    },
    {
      id: 'schedule_apt',
      title: 'Schedule Appointment',
      desc: 'Book slot, assign clinical provider, triage allocation',
      icon: CalendarPlus,
      color: '#0284c7',
      path: '/appointments'
    },
    {
      id: 'start_encounter',
      title: 'Initiate Clinical Encounter',
      desc: 'Open consultation chart, record vitals, write SOAP note',
      icon: Stethoscope,
      color: '#7c3aed',
      path: '/clinical'
    },
    {
      id: 'rx_order',
      title: 'E-Prescribing & Pharmacy',
      desc: 'Formulary lookup, contraindication review & dispensing',
      icon: Pill,
      color: '#10b981',
      path: '/pharmacy'
    },
    {
      id: 'lab_order',
      title: 'Order Diagnostic Lab Test',
      desc: 'Accessioning, barcoding & pathology review',
      icon: FlaskConical,
      color: '#d97706',
      path: '/laboratory'
    },
    {
      id: 'record_bill',
      title: 'Generate Billing / Record Payment',
      desc: 'Insurance claim copay & official receipt generation',
      icon: CreditCard,
      color: '#475569',
      path: '/billing'
    }
  ];

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <TopNavbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onQuickAction={() => setShowQuickActionModal(true)}
        />

        <main className="content-container">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer />

      {/* Global Quick Action Launcher Modal */}
      <Modal
        isOpen={showQuickActionModal}
        onClose={() => setShowQuickActionModal(false)}
        title="CareAxis Quick Action Hub"
        subtitle="Select a healthcare workflow to launch directly"
        maxWidth="540px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => {
                  setShowQuickActionModal(false);
                  navigate(action.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: `${action.color}15`,
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                    {action.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
