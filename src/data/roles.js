/**
 * CareAxis User Roles and Permissions Definition
 * Fictional healthcare roles with discrete permission sets and primary modules.
 */

export const USER_ROLES = [
  {
    id: 'platform_admin',
    name: 'Platform Administrator',
    badge: 'System Admin',
    userName: 'Dr. Alexis Vance',
    userEmail: 'alexis.vance@careaxis-health.demo.net',
    avatar: 'AV',
    description: 'Full administrative access to platform configuration, security audits, MPI resolution, and cross-facility oversight.',
    department: 'Digital Health Directorate',
    facilityId: 'all',
    homeRoute: '/dashboard',
    permissions: [
      'patients:read', 'patients:write', 'patients:delete',
      'clinical:read', 'clinical:write',
      'mpi:resolve', 'mpi:merge',
      'pharmacy:read', 'pharmacy:write',
      'lab:read', 'lab:write',
      'billing:read', 'billing:write',
      'inventory:read', 'inventory:write',
      'analytics:view', 'interop:manage',
      'security:audit', 'security:breakglass',
      'config:manage', 'telehealth:access'
    ]
  },
  {
    id: 'facility_manager',
    name: 'Facility Manager',
    badge: 'Operations',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@northstar.demo.net',
    avatar: 'ER',
    description: 'Manages hospital facility operations, bed occupancy, department workloads, scheduling, and staff allocations.',
    department: 'Hospital Administration',
    facilityId: 'fac-1',
    homeRoute: '/dashboard',
    permissions: [
      'patients:read', 'appointments:manage',
      'analytics:view', 'inventory:read', 'inventory:write',
      'billing:read', 'security:audit', 'config:view'
    ]
  },
  {
    id: 'receptionist',
    name: 'Receptionist & Patient Registration Specialist',
    badge: 'Registration',
    userName: 'Marcus Thorne',
    userEmail: 'marcus.t@riverside.demo.net',
    avatar: 'MT',
    description: 'Patient demographic intake, identity verification, scheduling appointments, checking in arrivals, and MPI duplicate review.',
    department: 'Patient Admissions & Intake',
    facilityId: 'fac-2',
    homeRoute: '/patients',
    permissions: [
      'patients:read', 'patients:write',
      'appointments:manage', 'appointments:checkin',
      'mpi:view'
    ]
  },
  {
    id: 'physician',
    name: 'Physician / Medical Specialist',
    badge: 'Clinical MD',
    userName: 'Dr. Sarah K. Chen, MD',
    userEmail: 'dr.chen@northstar.demo.net',
    avatar: 'SC',
    description: 'Comprehensive clinical evaluation, diagnostic reviews, SOAP encounter documentation, e-prescribing, and lab orders.',
    department: 'Internal Medicine & Specialist Clinic',
    facilityId: 'fac-1',
    homeRoute: '/clinical',
    permissions: [
      'patients:read', 'patients:write',
      'clinical:read', 'clinical:write',
      'prescriptions:write', 'lab:order',
      'telehealth:access', 'appointments:read',
      'security:breakglass'
    ]
  },
  {
    id: 'nurse',
    name: 'Nurse / Triage Officer',
    badge: 'Clinical Care',
    userName: 'Sister Miriam Ndlovu, RN',
    userEmail: 'miriam.n@riverside.demo.net',
    avatar: 'MN',
    description: 'Triage assessment, vital signs recording, queue management, outpatient nursing care, and vaccination documentation.',
    department: 'Outpatient Triage & Emergency Unit',
    facilityId: 'fac-2',
    homeRoute: '/clinical',
    permissions: [
      'patients:read', 'clinical:vitals',
      'appointments:read', 'appointments:checkin',
      'telehealth:access'
    ]
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    badge: 'Pharmacy',
    userName: 'David O. Amara, BPharm',
    userEmail: 'david.amara@careaxis-health.demo.net',
    avatar: 'DA',
    description: 'Reviews electronic prescriptions, drug-drug interaction alerts, dispensing verification, counseling, and stock levels.',
    department: 'Central Pharmacy & Dispensing',
    facilityId: 'fac-1',
    homeRoute: '/pharmacy',
    permissions: [
      'patients:read', 'prescriptions:read',
      'prescriptions:dispense', 'inventory:read', 'inventory:write'
    ]
  },
  {
    id: 'lab_technician',
    name: 'Laboratory Technician',
    badge: 'Diagnostic Lab',
    userName: 'Dr. Tariq Al-Mansoor, MLS',
    userEmail: 'tariq.m@central-lab.demo.net',
    avatar: 'TM',
    description: 'Specimen accessioning, diagnostic test processing, reference range validation, critical value flagging, and lab reporting.',
    department: 'Central Diagnostic Pathology Lab',
    facilityId: 'fac-4',
    homeRoute: '/laboratory',
    permissions: [
      'patients:read', 'lab:read', 'lab:process',
      'lab:verify', 'inventory:read'
    ]
  },
  {
    id: 'billing_specialist',
    name: 'Billing Specialist',
    badge: 'Finance',
    userName: 'Grace Mutua, CPA',
    userEmail: 'grace.m@northstar.demo.net',
    avatar: 'GM',
    description: 'Invoicing, encounter fee compilation, health insurance pre-authorizations, copayment collection, and financial ledger tracking.',
    department: 'Patient Accounts & Revenue Cycle',
    facilityId: 'fac-1',
    homeRoute: '/billing',
    permissions: [
      'patients:read', 'billing:read',
      'billing:write', 'billing:receipts', 'analytics:view'
    ]
  },
  {
    id: 'inventory_manager',
    name: 'Inventory & Supply Chain Manager',
    badge: 'Supply Chain',
    userName: 'Lucas Van Der Merwe',
    userEmail: 'lucas.v@careaxis-health.demo.net',
    avatar: 'LV',
    description: 'Oversees pharmaceuticals, lab reagents, PPE, consumables, multi-facility inter-store requisitions, and expiry tracking.',
    department: 'Central Medical Supplies Depot',
    facilityId: 'all',
    homeRoute: '/inventory',
    permissions: [
      'inventory:read', 'inventory:write',
      'inventory:transfer', 'analytics:view'
    ]
  },
  {
    id: 'health_data_analyst',
    name: 'Health Data Analyst',
    badge: 'Surveillance & BI',
    userName: 'Kavita Patel, MSc',
    userEmail: 'kavita.p@careaxis-health.demo.net',
    avatar: 'KP',
    description: 'Epidemiological trends, disease surveillance indicators, population health analytics, facility workload, and data de-identification.',
    department: 'Epidemiology & Health Intelligence Unit',
    facilityId: 'all',
    homeRoute: '/analytics',
    permissions: [
      'analytics:view', 'analytics:export',
      'patients:read_anonymized', 'interop:view'
    ]
  },
  {
    id: 'implementation_manager',
    name: 'Implementation Manager',
    badge: 'E-Health Rollout',
    userName: 'Thomas B. Sterling, PMP',
    userEmail: 'thomas.s@careaxis-health.demo.net',
    avatar: 'TS',
    description: 'Facility digital readiness audits, staff training tracking, connectivity validation, rollout milestones, and system go-live readiness.',
    department: 'Digital Transformation Project Management Office',
    facilityId: 'all',
    homeRoute: '/implementation',
    permissions: [
      'implementation:manage', 'config:view',
      'analytics:view', 'security:audit'
    ]
  },
  {
    id: 'support_specialist',
    name: 'Support Specialist',
    badge: 'Service Desk',
    userName: 'Zoe K. Lin',
    userEmail: 'zoe.lin@careaxis-support.demo.net',
    avatar: 'ZL',
    description: 'Technical incident triage, user assistance, hardware connectivity troubleshooting, knowledge base, and training support.',
    department: 'Enterprise Healthcare IT Service Desk',
    facilityId: 'all',
    homeRoute: '/support',
    permissions: [
      'support:manage', 'audit:read',
      'patients:read', 'config:view'
    ]
  }
];
