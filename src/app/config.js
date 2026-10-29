/**
 * CareAxis - Application Global Configuration
 * Centralized settings for brand, facilities, system version, and simulation parameters.
 */

export const APP_CONFIG = {
  name: 'CareAxis',
  fullName: 'CareAxis — Digital Health Platform',
  tagline: 'Enterprise National-Scale eHealth System',
  version: 'v4.2.0-LTS (Enterprise)',
  environment: 'Simulation & Demonstration Environment',
  isDemo: true,
  buildNumber: 'CA-2026.10-R3',
  supportEmail: 'support@careaxis-health.demo.net',
  copyright: '© 2026 CareAxis Health Network Technologies. Demonstration Prototype.',
  
  // Storage keys for LocalStorage persistence
  storageKeys: {
    PATIENTS: 'careaxis_patients_v1',
    ENCOUNTERS: 'careaxis_encounters_v1',
    APPOINTMENTS: 'careaxis_appointments_v1',
    PRESCRIPTIONS: 'careaxis_prescriptions_v1',
    LAB_ORDERS: 'careaxis_lab_orders_v1',
    INVOICES: 'careaxis_invoices_v1',
    INVENTORY: 'careaxis_inventory_v1',
    AUDIT_LOGS: 'careaxis_audit_logs_v1',
    MPI_MERGES: 'careaxis_mpi_merges_v1',
    ACTIVE_ROLE: 'careaxis_active_role_v1',
    ACTIVE_FACILITY: 'careaxis_active_facility_v1',
    SYSTEM_CONFIG: 'careaxis_sys_config_v1',
    SYNC_QUEUE: 'careaxis_sync_queue_v1',
  },

  // MPI matching sensitivity defaults
  mpiDefaults: {
    nameWeight: 0.35,
    dobWeight: 0.25,
    nationalIdWeight: 0.25,
    phoneWeight: 0.15,
    duplicateThreshold: 75, // score >= 75 is candidate duplicate
    autoFlagThreshold: 90,  // score >= 90 is high confidence
  },

  // Offline / sync parameters
  offlineSettings: {
    maxOfflineHours: 72,
    syncIntervalSeconds: 30,
    storeAndForwardEnabled: true,
  }
};
