import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertOctagon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function BreakGlassModal({
  isOpen,
  onClose,
  patient,
  onSuccess
}) {
  const [justification, setJustification] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { activateBreakGlass, currentRole } = useAuth();
  const { warning } = useToast();

  const handleConfirm = () => {
    if (!justification.trim() || justification.trim().length < 15) {
      setErrorText('A comprehensive clinical emergency justification (minimum 15 characters) is required by medical audit protocols.');
      return;
    }
    if (!agreed) {
      setErrorText('You must acknowledge that this emergency override is logged in the permanent security ledger.');
      return;
    }

    activateBreakGlass(patient.id, patient.mrn, justification.trim());
    warning(
      'Break-Glass Override Active',
      `Emergency privileged access granted for ${patient.mrn}. Security operations team notified.`
    );
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restricted Record — Break-Glass Emergency Override"
      subtitle={`Patient: ${patient?.firstName} ${patient?.lastName} (${patient?.mrn})`}
      maxWidth="560px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel Access
          </button>
          <button
            className="btn btn-danger"
            onClick={handleConfirm}
            style={{ backgroundColor: '#dc2626' }}
          >
            <ShieldAlert size={16} />
            <span>Authorize Emergency Override</span>
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.85rem',
            display: 'flex',
            gap: '0.75rem'
          }}
        >
          <AlertOctagon size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8125rem', color: '#991b1b', lineHeight: 1.4 }}>
            <strong>WARNING: PROTECTED SENSITIVE HEALTH RECORD</strong>
            <p style={{ marginTop: '0.25rem' }}>
              This record is classified under restricted clinical protection. Unauthorized access is a statutory violation.
              Executing a Break-Glass override will generate an immutable, high-priority audit dispatch to the National Information Security Governance Officer.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>
            Mandatory Emergency Clinical Justification <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Document the acute clinical emergency, referral mandate, or trauma resuscitation requirement necessitating immediate access..."
            value={justification}
            onChange={e => {
              setJustification(e.target.value);
              setErrorText('');
            }}
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '3px' }}
          />
          <span>
            I, <strong>{currentRole?.userName}</strong> ({currentRole?.name}), attest under clinical oath that this access is medically required for acute care delivery.
          </span>
        </label>

        {errorText && (
          <div style={{ fontSize: '0.775rem', color: '#dc2626', fontWeight: 500 }}>
            {errorText}
          </div>
        )}
      </div>
    </Modal>
  );
}
