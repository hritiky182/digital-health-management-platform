/**
 * CareAxis Unified Local Storage Engine
 * Persistent, reactive store for client-side state with initial seed fallback.
 */

import { APP_CONFIG } from '../app/config';
import {
  SEED_PATIENTS,
  SEED_APPOINTMENTS,
  SEED_ENCOUNTERS,
  SEED_PRESCRIPTIONS,
  SEED_LAB_ORDERS,
  SEED_INVOICES,
  SEED_INVENTORY,
  SEED_AUDIT_LOGS,
  SEED_TELEHEALTH_SESSIONS,
  SEED_ROLLOUT_MILESTONES
} from '../data/seedData';

const { storageKeys } = APP_CONFIG;

// Safe retrieval with fallback
function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${key} from LocalStorage`, err);
    return defaultValue;
  }
}

// Safe persistence
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to LocalStorage`, err);
  }
}

export const StorageService = {
  // Initialize all stores
  initialize() {
    if (!localStorage.getItem(storageKeys.PATIENTS)) {
      this.resetToDefaults();
    }
  },

  // Factory reset back to demonstration seed data
  resetToDefaults() {
    saveToStorage(storageKeys.PATIENTS, SEED_PATIENTS);
    saveToStorage(storageKeys.APPOINTMENTS, SEED_APPOINTMENTS);
    saveToStorage(storageKeys.ENCOUNTERS, SEED_ENCOUNTERS);
    saveToStorage(storageKeys.PRESCRIPTIONS, SEED_PRESCRIPTIONS);
    saveToStorage(storageKeys.LAB_ORDERS, SEED_LAB_ORDERS);
    saveToStorage(storageKeys.INVOICES, SEED_INVOICES);
    saveToStorage(storageKeys.INVENTORY, SEED_INVENTORY);
    saveToStorage(storageKeys.AUDIT_LOGS, SEED_AUDIT_LOGS);
    saveToStorage('careaxis_telehealth_v1', SEED_TELEHEALTH_SESSIONS);
    saveToStorage('careaxis_rollout_v1', SEED_ROLLOUT_MILESTONES);
    saveToStorage(storageKeys.MPI_MERGES, []);
    saveToStorage(storageKeys.SYNC_QUEUE, []);
  },

  // Patients
  getPatients() {
    return loadFromStorage(storageKeys.PATIENTS, SEED_PATIENTS);
  },
  savePatient(newPatient) {
    const list = this.getPatients();
    const updated = [newPatient, ...list];
    saveToStorage(storageKeys.PATIENTS, updated);
    return updated;
  },
  updatePatient(id, updates) {
    const list = this.getPatients();
    const updated = list.map(p => (p.id === id ? { ...p, ...updates } : p));
    saveToStorage(storageKeys.PATIENTS, updated);
    return updated;
  },
  deletePatient(id) {
    const list = this.getPatients();
    const updated = list.filter(p => p.id !== id);
    saveToStorage(storageKeys.PATIENTS, updated);
    return updated;
  },

  // Appointments
  getAppointments() {
    return loadFromStorage(storageKeys.APPOINTMENTS, SEED_APPOINTMENTS);
  },
  saveAppointment(apt) {
    const list = this.getAppointments();
    const updated = [apt, ...list];
    saveToStorage(storageKeys.APPOINTMENTS, updated);
    return updated;
  },
  updateAppointment(id, updates) {
    const list = this.getAppointments();
    const updated = list.map(a => (a.id === id ? { ...a, ...updates } : a));
    saveToStorage(storageKeys.APPOINTMENTS, updated);
    return updated;
  },

  // Encounters
  getEncounters() {
    return loadFromStorage(storageKeys.ENCOUNTERS, SEED_ENCOUNTERS);
  },
  saveEncounter(enc) {
    const list = this.getEncounters();
    const updated = [enc, ...list];
    saveToStorage(storageKeys.ENCOUNTERS, updated);
    return updated;
  },
  updateEncounter(id, updates) {
    const list = this.getEncounters();
    const updated = list.map(e => (e.id === id ? { ...e, ...updates } : e));
    saveToStorage(storageKeys.ENCOUNTERS, updated);
    return updated;
  },

  // Prescriptions
  getPrescriptions() {
    return loadFromStorage(storageKeys.PRESCRIPTIONS, SEED_PRESCRIPTIONS);
  },
  savePrescription(rx) {
    const list = this.getPrescriptions();
    const updated = [rx, ...list];
    saveToStorage(storageKeys.PRESCRIPTIONS, updated);
    return updated;
  },
  updatePrescription(id, updates) {
    const list = this.getPrescriptions();
    const updated = list.map(r => (r.id === id ? { ...r, ...updates } : r));
    saveToStorage(storageKeys.PRESCRIPTIONS, updated);
    return updated;
  },

  // Lab Orders
  getLabOrders() {
    return loadFromStorage(storageKeys.LAB_ORDERS, SEED_LAB_ORDERS);
  },
  saveLabOrder(order) {
    const list = this.getLabOrders();
    const updated = [order, ...list];
    saveToStorage(storageKeys.LAB_ORDERS, updated);
    return updated;
  },
  updateLabOrder(id, updates) {
    const list = this.getLabOrders();
    const updated = list.map(o => (o.id === id ? { ...o, ...updates } : o));
    saveToStorage(storageKeys.LAB_ORDERS, updated);
    return updated;
  },

  // Invoices & Billing
  getInvoices() {
    return loadFromStorage(storageKeys.INVOICES, SEED_INVOICES);
  },
  saveInvoice(inv) {
    const list = this.getInvoices();
    const updated = [inv, ...list];
    saveToStorage(storageKeys.INVOICES, updated);
    return updated;
  },
  updateInvoice(id, updates) {
    const list = this.getInvoices();
    const updated = list.map(i => (i.id === id ? { ...i, ...updates } : i));
    saveToStorage(storageKeys.INVOICES, updated);
    return updated;
  },

  // Inventory
  getInventory() {
    return loadFromStorage(storageKeys.INVENTORY, SEED_INVENTORY);
  },
  updateInventoryItem(id, updates) {
    const list = this.getInventory();
    const updated = list.map(i => (i.id === id ? { ...i, ...updates } : i));
    saveToStorage(storageKeys.INVENTORY, updated);
    return updated;
  },
  addInventoryItem(item) {
    const list = this.getInventory();
    const updated = [item, ...list];
    saveToStorage(storageKeys.INVENTORY, updated);
    return updated;
  },

  // Audit Logs
  getAuditLogs() {
    return loadFromStorage(storageKeys.AUDIT_LOGS, SEED_AUDIT_LOGS);
  },
  addAuditLog(entry) {
    const list = this.getAuditLogs();
    const logItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('Z', ''),
      status: 'SUCCESS',
      ...entry
    };
    const updated = [logItem, ...list];
    saveToStorage(storageKeys.AUDIT_LOGS, updated);
    return logItem;
  },

  // MPI Merge History
  getMpiMerges() {
    return loadFromStorage(storageKeys.MPI_MERGES, []);
  },
  saveMpiMerge(mergeRecord) {
    const list = this.getMpiMerges();
    const updated = [mergeRecord, ...list];
    saveToStorage(storageKeys.MPI_MERGES, updated);
    return updated;
  },

  // Telehealth
  getTelehealthSessions() {
    return loadFromStorage('careaxis_telehealth_v1', SEED_TELEHEALTH_SESSIONS);
  },
  saveTelehealthSession(session) {
    const list = this.getTelehealthSessions();
    const updated = [session, ...list];
    saveToStorage('careaxis_telehealth_v1', updated);
    return updated;
  },

  // Rollout Milestones
  getRolloutMilestones() {
    return loadFromStorage('careaxis_rollout_v1', SEED_ROLLOUT_MILESTONES);
  },
  updateRolloutMilestone(id, updates) {
    const list = this.getRolloutMilestones();
    const updated = list.map(m => (m.id === id ? { ...m, ...updates } : m));
    saveToStorage('careaxis_rollout_v1', updated);
    return updated;
  },

  // Sync Queue (for offline operation simulation)
  getSyncQueue() {
    return loadFromStorage(storageKeys.SYNC_QUEUE, []);
  },
  addToSyncQueue(action) {
    const queue = this.getSyncQueue();
    const item = {
      id: `sync-${Date.now()}`,
      queuedAt: new Date().toISOString(),
      action,
      status: 'Pending Reconnect Sync'
    };
    const updated = [...queue, item];
    saveToStorage(storageKeys.SYNC_QUEUE, updated);
    return updated;
  },
  clearSyncQueue() {
    saveToStorage(storageKeys.SYNC_QUEUE, []);
    return [];
  }
};
