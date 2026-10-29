import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useOffline } from './OfflineContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentRole } = useAuth();
  const { success, error, warning, info } = useToast();
  const { isOfflineMode, queueOfflineAction } = useOffline();

  // Primary data states
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [mpiMerges, setMpiMerges] = useState([]);
  const [telehealthSessions, setTelehealthSessions] = useState([]);
  const [rolloutMilestones, setRolloutMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize and load
  const refreshAllData = useCallback(() => {
    StorageService.initialize();
    setPatients(StorageService.getPatients());
    setAppointments(StorageService.getAppointments());
    setEncounters(StorageService.getEncounters());
    setPrescriptions(StorageService.getPrescriptions());
    setLabOrders(StorageService.getLabOrders());
    setInvoices(StorageService.getInvoices());
    setInventory(StorageService.getInventory());
    setAuditLogs(StorageService.getAuditLogs());
    setMpiMerges(StorageService.getMpiMerges());
    setTelehealthSessions(StorageService.getTelehealthSessions());
    setRolloutMilestones(StorageService.getRolloutMilestones());
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // PATIENT ACTIONS
  const addPatient = (patientData) => {
    const generatedMrn = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedUpid = `UPID-NA-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPatient = {
      id: `pat-${Date.now()}`,
      mrn: generatedMrn,
      upid: generatedUpid,
      registrationDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      isRestricted: false,
      consentSharing: {
        dataExchangeAllowed: true,
        researchUseAnonymized: true,
        emergencyOverridePermitted: true,
        lastUpdated: new Date().toISOString().slice(0, 10)
      },
      ...patientData
    };

    const updated = StorageService.savePatient(newPatient);
    setPatients(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'PATIENT_REGISTER',
      category: 'Patient Admin',
      resource: `Registered ${newPatient.firstName} ${newPatient.lastName} (${generatedMrn})`,
      facility: newPatient.primaryFacilityId,
      status: 'SUCCESS',
      details: 'Assigned Master Patient Index UPID and created initial demographic baseline.'
    });

    if (isOfflineMode) {
      queueOfflineAction(`Registered Patient: ${newPatient.firstName} ${newPatient.lastName} (${generatedMrn})`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    success('Patient Registered', `${newPatient.firstName} ${newPatient.lastName} enrolled with MRN ${generatedMrn}.`);
    return newPatient;
  };

  const updatePatient = (id, updates) => {
    const updated = StorageService.updatePatient(id, updates);
    setPatients(updated);
    const pat = updated.find(p => p.id === id);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'PATIENT_UPDATE',
      category: 'Patient Admin',
      resource: `Updated Patient: ${pat?.mrn}`,
      facility: pat?.primaryFacilityId || 'Network',
      status: 'SUCCESS',
      details: `Modified fields: ${Object.keys(updates).join(', ')}`
    });

    if (isOfflineMode) {
      queueOfflineAction(`Updated Patient Record: ${pat?.mrn}`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    success('Record Updated', `Patient ${pat?.firstName} ${pat?.lastName} updated successfully.`);
  };

  const deactivatePatient = (id, reason) => {
    const pat = patients.find(p => p.id === id);
    const updated = StorageService.updatePatient(id, {
      status: 'Inactive',
      deactivationReason: reason,
      deactivatedAt: new Date().toISOString()
    });
    setPatients(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'PATIENT_DEACTIVATE',
      category: 'Patient Admin',
      resource: `Deactivated Patient: ${pat?.mrn}`,
      facility: pat?.primaryFacilityId || 'Network',
      status: 'SUCCESS',
      details: `Reason: ${reason}`
    });

    setAuditLogs(StorageService.getAuditLogs());
    warning('Patient Deactivated', `Record for ${pat?.firstName} ${pat?.lastName} marked inactive.`);
  };

  // APPOINTMENT ACTIONS
  const scheduleAppointment = (aptData) => {
    const newApt = {
      id: `apt-${Date.now()}`,
      status: 'Scheduled',
      triageVitalsRecorded: false,
      ...aptData
    };

    const updated = StorageService.saveAppointment(newApt);
    setAppointments(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'APPOINTMENT_SCHEDULED',
      category: 'Scheduling',
      resource: `Appointment for ${newApt.patientName} with ${newApt.providerName}`,
      facility: newApt.facilityId,
      status: 'SUCCESS',
      details: `Scheduled for ${newApt.dateTime}. Reason: ${newApt.reason}`
    });

    if (isOfflineMode) {
      queueOfflineAction(`Scheduled Appointment: ${newApt.patientName}`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    success('Appointment Scheduled', `Booked for ${newApt.patientName} on ${new Date(newApt.dateTime).toLocaleString()}.`);
    return newApt;
  };

  const updateAppointmentStatus = (id, newStatus) => {
    const apt = appointments.find(a => a.id === id);
    const updated = StorageService.updateAppointment(id, { status: newStatus });
    setAppointments(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'APPOINTMENT_STATUS_CHANGE',
      category: 'Scheduling',
      resource: `Appointment ${id} -> ${newStatus}`,
      facility: apt?.facilityId,
      status: 'SUCCESS',
      details: `Patient: ${apt?.patientName}, Provider: ${apt?.providerName}`
    });

    setAuditLogs(StorageService.getAuditLogs());
    info('Appointment Updated', `Status changed to "${newStatus}".`);
  };

  // ENCOUNTER ACTIONS
  const createEncounter = (encData) => {
    const newEnc = {
      id: `enc-${Date.now()}`,
      visitDate: new Date().toISOString(),
      status: 'In Progress',
      prescriptions: [],
      labOrders: [],
      diagnoses: [],
      soapNotes: { subjective: '', objective: '', assessment: '', plan: '' },
      vitals: {},
      isRestricted: false,
      ...encData
    };

    const updated = StorageService.saveEncounter(newEnc);
    setEncounters(updated);

    // If linked to an appointment, update appointment status to In Consultation
    if (encData.appointmentId) {
      updateAppointmentStatus(encData.appointmentId, 'In Consultation');
    }

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'ENCOUNTER_START',
      category: 'Clinical',
      resource: `Encounter #${newEnc.id} for ${newEnc.patientName}`,
      facility: newEnc.facilityId,
      status: 'SUCCESS',
      details: `Provider: ${newEnc.providerName}. Department: ${newEnc.department}`
    });

    if (isOfflineMode) {
      queueOfflineAction(`Initiated Encounter: ${newEnc.patientName}`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    success('Clinical Encounter Started', `Encounter active for ${newEnc.patientName}.`);
    return newEnc;
  };

  const updateEncounter = (id, updates) => {
    const updated = StorageService.updateEncounter(id, updates);
    setEncounters(updated);
    const enc = updated.find(e => e.id === id);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: updates.status === 'Completed' ? 'ENCOUNTER_COMPLETE' : 'ENCOUNTER_SAVE',
      category: 'Clinical',
      resource: `Encounter #${id} (${enc?.patientName})`,
      facility: enc?.facilityId,
      status: 'SUCCESS',
      details: updates.status === 'Completed' ? 'Encounter finalized and closed.' : 'Clinical notes/vitals saved.'
    });

    if (isOfflineMode) {
      queueOfflineAction(`Saved Encounter notes: #${id}`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    if (updates.status === 'Completed') {
      success('Encounter Finalized', 'Clinical consultation completed and signed.');
    } else {
      success('Encounter Saved', 'Clinical chart documentation updated.');
    }
  };

  // PRESCRIPTION ACTIONS
  const createPrescription = (rxData) => {
    const newRx = {
      id: `rx-${Date.now()}`,
      datePrescribed: new Date().toISOString(),
      status: 'Pending Dispensation',
      dispensedBy: null,
      dispensedAt: null,
      ...rxData
    };

    const updated = StorageService.savePrescription(newRx);
    setPrescriptions(updated);

    // Also link to encounter if specified
    if (newRx.encounterId) {
      const enc = encounters.find(e => e.id === newRx.encounterId);
      if (enc) {
        StorageService.updateEncounter(newRx.encounterId, {
          prescriptions: [...(enc.prescriptions || []), newRx.id]
        });
        setEncounters(StorageService.getEncounters());
      }
    }

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'E_PRESCRIPTION_CREATED',
      category: 'Pharmacy',
      resource: `Rx #${newRx.id} for ${newRx.patientName}`,
      facility: newRx.facilityId,
      status: 'SUCCESS',
      details: `Prescribed ${newRx.items?.length || 0} items. Prescriber: ${newRx.prescriberName}`
    });

    if (isOfflineMode) {
      queueOfflineAction(`Created Prescription for: ${newRx.patientName}`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    success('Prescription Sent', `E-Prescription routed to pharmacy dispensing queue.`);
    return newRx;
  };

  const dispensePrescription = (rxId, dispensingNotes = '', batchNumber = '') => {
    const rx = prescriptions.find(r => r.id === rxId);
    const updated = StorageService.updatePrescription(rxId, {
      status: 'Dispensed',
      dispensedBy: currentRole.userName,
      dispensedAt: new Date().toISOString(),
      dispensingNotes,
      batchNumber: batchNumber || `LOT-${Date.now().toString().slice(-6)}`
    });
    setPrescriptions(updated);

    // Deduct stock from inventory
    if (rx?.items) {
      rx.items.forEach(item => {
        const invItem = inventory.find(i => i.name.toLowerCase().includes(item.medicationName.split(' ')[0].toLowerCase()));
        if (invItem) {
          const newStock = Math.max(0, invItem.currentStock - (item.quantity || 1));
          StorageService.updateInventoryItem(invItem.id, {
            currentStock: newStock,
            status: newStock <= invItem.reorderLevel ? 'Low Stock' : 'Normal'
          });
        }
      });
      setInventory(StorageService.getInventory());
    }

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'MEDICATION_DISPENSED',
      category: 'Pharmacy',
      resource: `Rx #${rxId} (${rx?.patientName})`,
      facility: rx?.facilityId,
      status: 'SUCCESS',
      details: `Verified by ${currentRole.userName}. Batch ${batchNumber || 'Auto-assigned'}. Stock adjusted.`
    });

    setAuditLogs(StorageService.getAuditLogs());
    success('Prescription Dispensed', `Medications verified and dispensed for ${rx?.patientName}.`);
  };

  // LAB ACTIONS
  const createLabOrder = (orderData) => {
    const generatedAccession = `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: `labord-${Date.now()}`,
      orderDateTime: new Date().toISOString(),
      status: 'Ordered',
      barcodeAccession: generatedAccession,
      results: [],
      collectedAt: null,
      collectedBy: null,
      processedAt: null,
      verifiedBy: null,
      ...orderData
    };

    const updated = StorageService.saveLabOrder(newOrder);
    setLabOrders(updated);

    // Link to encounter
    if (newOrder.encounterId) {
      const enc = encounters.find(e => e.id === newOrder.encounterId);
      if (enc) {
        StorageService.updateEncounter(newOrder.encounterId, {
          labOrders: [...(enc.labOrders || []), newOrder.id]
        });
        setEncounters(StorageService.getEncounters());
      }
    }

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'LAB_ORDER_TRANSMITTED',
      category: 'Diagnostics',
      resource: `${newOrder.testName} for ${newOrder.patientName}`,
      facility: newOrder.facilityId,
      status: 'SUCCESS',
      details: `Generated barcode accession: ${generatedAccession}`
    });

    if (isOfflineMode) {
      queueOfflineAction(`Ordered Lab: ${newOrder.testName} (${newOrder.patientName})`);
    }

    setAuditLogs(StorageService.getAuditLogs());
    success('Lab Test Ordered', `Order placed with Barcode ${generatedAccession}.`);
    return newOrder;
  };

  const updateLabOrderStatus = (orderId, newStatus, updates = {}) => {
    const order = labOrders.find(o => o.id === orderId);
    const updated = StorageService.updateLabOrder(orderId, {
      status: newStatus,
      ...updates
    });
    setLabOrders(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'LAB_WORKFLOW_UPDATE',
      category: 'Diagnostics',
      resource: `Order #${orderId} (${order?.testName}) -> ${newStatus}`,
      facility: order?.facilityId,
      status: 'SUCCESS',
      details: updates.verifiedBy ? `Verified by ${updates.verifiedBy}` : `Status update: ${newStatus}`
    });

    setAuditLogs(StorageService.getAuditLogs());
    success('Lab Status Updated', `${order?.testName} updated to "${newStatus}".`);
  };

  // INVOICE & BILLING ACTIONS
  const createInvoice = (invData) => {
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'Pending Insurance Claim',
      amountPaid: 0,
      balanceDue: invData.patientCopay || invData.subtotal,
      receiptNumber: null,
      paidAt: null,
      ...invData
    };

    const updated = StorageService.saveInvoice(newInv);
    setInvoices(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'INVOICE_GENERATED',
      category: 'Billing',
      resource: `Invoice #${newInv.id} for ${newInv.patientName}`,
      facility: newInv.facilityId,
      status: 'SUCCESS',
      details: `Subtotal: $${newInv.subtotal?.toFixed(2)}. Copay: $${newInv.patientCopay?.toFixed(2)}.`
    });

    setAuditLogs(StorageService.getAuditLogs());
    success('Invoice Generated', `Invoice created for ${newInv.patientName}.`);
    return newInv;
  };

  const recordPayment = (invoiceId, amount, paymentMethod = 'Electronic Card') => {
    const inv = invoices.find(i => i.id === invoiceId);
    const receiptNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAmountPaid = (inv?.amountPaid || 0) + Number(amount);
    const newBalance = Math.max(0, (inv?.patientCopay || inv?.subtotal || 0) - newAmountPaid);
    const isFull = newBalance === 0;

    const updated = StorageService.updateInvoice(invoiceId, {
      amountPaid: newAmountPaid,
      balanceDue: newBalance,
      status: isFull ? 'Paid' : 'Partially Paid',
      paymentMethod,
      receiptNumber: receiptNo,
      paidAt: new Date().toISOString()
    });
    setInvoices(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'PAYMENT_RECORDED',
      category: 'Billing',
      resource: `Invoice #${invoiceId} ($${amount})`,
      facility: inv?.facilityId,
      status: 'SUCCESS',
      details: `Receipt #${receiptNo}. Method: ${paymentMethod}. New balance: $${newBalance.toFixed(2)}`
    });

    setAuditLogs(StorageService.getAuditLogs());
    success('Payment Recorded', `Receipt #${receiptNo} generated for $${amount}.`);
  };

  // INVENTORY ACTIONS
  const adjustStock = (itemId, quantityChange, reason = 'Routine Stock Adjustment') => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newStock = Math.max(0, item.currentStock + quantityChange);
    const newStatus = newStock <= item.reorderLevel ? 'Low Stock' : 'Normal';

    const updated = StorageService.updateInventoryItem(itemId, {
      currentStock: newStock,
      status: newStatus
    });
    setInventory(updated);

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'STOCK_ADJUSTMENT',
      category: 'Supply Chain',
      resource: `${item.name} (${quantityChange > 0 ? '+' : ''}${quantityChange})`,
      facility: item.facilityId,
      status: 'SUCCESS',
      details: `New stock level: ${newStock} ${item.unit}. Reason: ${reason}`
    });

    setAuditLogs(StorageService.getAuditLogs());
    success('Inventory Adjusted', `${item.name} stock updated to ${newStock} ${item.unit}.`);
  };

  // MPI MERGE WORKFLOW
  const mergePatients = (targetPatientId, duplicatePatientId, fieldOverrides = {}, mergeReason = '') => {
    const target = patients.find(p => p.id === targetPatientId);
    const duplicate = patients.find(p => p.id === duplicatePatientId);

    if (!target || !duplicate) {
      error('Merge Failed', 'Could not locate both candidate records.');
      return false;
    }

    // 1. Reassign all appointments
    const updatedApts = appointments.map(a => {
      if (a.patientId === duplicatePatientId) {
        return {
          ...a,
          patientId: targetPatientId,
          patientName: `${target.firstName} ${target.lastName}`,
          patientMrn: target.mrn,
          mergedFromMrn: duplicate.mrn
        };
      }
      return a;
    });
    setAppointments(updatedApts);
    StorageService.getAppointments();

    // 2. Reassign all encounters
    const updatedEncs = encounters.map(e => {
      if (e.patientId === duplicatePatientId) {
        return {
          ...e,
          patientId: targetPatientId,
          patientName: `${target.firstName} ${target.lastName}`,
          patientMrn: target.mrn,
          mergedFromMrn: duplicate.mrn
        };
      }
      return e;
    });
    setEncounters(updatedEncs);

    // 3. Reassign prescriptions
    const updatedRxs = prescriptions.map(r => {
      if (r.patientId === duplicatePatientId) {
        return {
          ...r,
          patientId: targetPatientId,
          patientName: `${target.firstName} ${target.lastName}`,
          patientMrn: target.mrn,
          mergedFromMrn: duplicate.mrn
        };
      }
      return r;
    });
    setPrescriptions(updatedRxs);

    // 4. Reassign lab orders
    const updatedLabs = labOrders.map(l => {
      if (l.patientId === duplicatePatientId) {
        return {
          ...l,
          patientId: targetPatientId,
          patientName: `${target.firstName} ${target.lastName}`,
          patientMrn: target.mrn,
          mergedFromMrn: duplicate.mrn
        };
      }
      return l;
    });
    setLabOrders(updatedLabs);

    // 5. Combine allergies & chronic conditions
    const combinedAllergies = [
      ...(target.allergies || []),
      ...(duplicate.allergies || []).filter(a => !(target.allergies || []).some(ta => ta.allergen === a.allergen))
    ];
    const combinedConditions = Array.from(new Set([...(target.chronicConditions || []), ...(duplicate.chronicConditions || [])]));

    // Update target patient with merged history and field overrides
    const updatedTarget = {
      ...target,
      ...fieldOverrides,
      allergies: combinedAllergies,
      chronicConditions: combinedConditions,
      mergedRecords: [
        ...(target.mergedRecords || []),
        {
          id: duplicate.id,
          mrn: duplicate.mrn,
          upid: duplicate.upid,
          mergedAt: new Date().toISOString(),
          mergedBy: currentRole.userName,
          reason: mergeReason
        }
      ]
    };

    // Mark duplicate patient as Merged / Inactive
    const updatedDuplicate = {
      ...duplicate,
      status: 'Merged',
      mergedIntoId: targetPatientId,
      mergedIntoMrn: target.mrn,
      mergedAt: new Date().toISOString(),
      mergedBy: currentRole.userName,
      mergeReason
    };

    const newPatientList = patients.map(p => {
      if (p.id === targetPatientId) return updatedTarget;
      if (p.id === duplicatePatientId) return updatedDuplicate;
      return p;
    });

    setPatients(newPatientList);
    localStorage.setItem(APP_CONFIG.storageKeys.PATIENTS, JSON.stringify(newPatientList));

    // Save merge event
    const mergeRecord = {
      id: `merge-${Date.now()}`,
      targetMrn: target.mrn,
      targetName: `${target.firstName} ${target.lastName}`,
      duplicateMrn: duplicate.mrn,
      duplicateName: `${duplicate.firstName} ${duplicate.lastName}`,
      mergedAt: new Date().toISOString(),
      performedBy: currentRole.userName,
      reason: mergeReason
    };
    const updatedMerges = StorageService.saveMpiMerge(mergeRecord);
    setMpiMerges(updatedMerges);

    // Audit log
    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'MPI_RECORD_MERGE',
      category: 'Identity Management',
      resource: `Merged ${duplicate.mrn} -> ${target.mrn}`,
      facility: 'National Master Patient Index',
      status: 'SUCCESS',
      details: `Merged clinical encounters, prescriptions, and lab history. Duplicate marked Inactive/Merged. Reason: ${mergeReason}`
    });

    setAuditLogs(StorageService.getAuditLogs());
    success('MPI Merge Completed', `Record ${duplicate.mrn} successfully consolidated into ${target.mrn}.`);
    return true;
  };

  // RESET DEMO DATA
  const resetDemoData = () => {
    StorageService.resetToDefaults();
    refreshAllData();
    success('Demo Reset', 'All LocalStorage data restored to factory demonstration state.');
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        patients,
        appointments,
        encounters,
        prescriptions,
        labOrders,
        invoices,
        inventory,
        auditLogs,
        mpiMerges,
        telehealthSessions,
        rolloutMilestones,
        // Actions
        addPatient,
        updatePatient,
        deactivatePatient,
        scheduleAppointment,
        updateAppointmentStatus,
        createEncounter,
        updateEncounter,
        createPrescription,
        dispensePrescription,
        createLabOrder,
        updateLabOrderStatus,
        createInvoice,
        recordPayment,
        adjustStock,
        mergePatients,
        resetDemoData,
        refreshAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
