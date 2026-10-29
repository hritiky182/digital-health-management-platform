import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';

// Module Pages
import { CommandCenterDashboard } from '../pages/dashboard/CommandCenterDashboard';
import { PatientDirectoryPage } from '../pages/patients/PatientDirectoryPage';
import { PatientRegistrationPage } from '../pages/patients/PatientRegistrationPage';
import { PatientProfilePage } from '../pages/patients/PatientProfilePage';
import { MasterPatientIndexPage } from '../pages/patients/MasterPatientIndexPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { ClinicalEncountersPage } from '../pages/clinical/ClinicalEncountersPage';
import { EncounterConsultationPage } from '../pages/clinical/EncounterConsultationPage';
import { PharmacyPage } from '../pages/pharmacy/PharmacyPage';
import { LaboratoryPage } from '../pages/laboratory/LaboratoryPage';
import { BillingPage } from '../pages/billing/BillingPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { TelehealthPage } from '../pages/telehealth/TelehealthPage';
import { InteroperabilityPage } from '../pages/interoperability/InteroperabilityPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { SecurityAuditPage } from '../pages/security/SecurityAuditPage';
import { ImplementationPlanPage } from '../pages/implementation/ImplementationPlanPage';
import { SupportPage } from '../pages/support/SupportPage';

/**
 * Route protection gatekeeper:
 * Directs unauthenticated users to /login while preserving target route in state.
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout />;
}

export const router = createBrowserRouter([
  // Public Authentication Route
  {
    path: '/login',
    element: <LoginPage />
  },

  // Protected Enterprise Application Routes
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <CommandCenterDashboard /> },
      
      // Patient Administration & MPI
      { path: 'patients', element: <PatientDirectoryPage /> },
      { path: 'patients/register', element: <PatientRegistrationPage /> },
      { path: 'patients/:id', element: <PatientProfilePage /> },
      { path: 'mpi', element: <MasterPatientIndexPage /> },

      // Appointments & Scheduling
      { path: 'appointments', element: <AppointmentsPage /> },

      // Clinical Encounters & EHR
      { path: 'clinical', element: <ClinicalEncountersPage /> },
      { path: 'clinical/new', element: <EncounterConsultationPage /> },
      { path: 'clinical/:id', element: <EncounterConsultationPage /> },

      // Diagnostics & Pharmacy
      { path: 'pharmacy', element: <PharmacyPage /> },
      { path: 'laboratory', element: <LaboratoryPage /> },

      // Health Financing & Logistics
      { path: 'billing', element: <BillingPage /> },
      { path: 'inventory', element: <InventoryPage /> },

      // Telehealth, Interop & Governance
      { path: 'telehealth', element: <TelehealthPage /> },
      { path: 'interoperability', element: <InteroperabilityPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'security', element: <SecurityAuditPage /> },
      { path: 'implementation', element: <ImplementationPlanPage /> },
      { path: 'support', element: <SupportPage /> },

      // Fallback inside application
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ]
  },

  // Global Wildcard Fallback
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

