import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CheckCircle2, User, FileSignature } from 'lucide-react';

export const ProofOfDeliveryModal = ({ isOpen, onClose, onConfirm, deliveryNumber }) => {
  const [recipientName, setRecipientName] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName.trim()) return;

    setLoading(true);
    try {
      await onConfirm({
        recipientName: recipientName.trim(),
        signature: signatureText.trim() || recipientName.trim(),
        notes: notes.trim()
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Delivery & Proof"
      subtitle={`Record proof of delivery for #${deliveryNumber || 'Package'}`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Recipient Full Name"
          placeholder="e.g. Emily Watson or Front Desk Guard"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          icon={User}
          required
        />

        <Input
          label="Digital Signature / Code"
          placeholder="Recipient signature name or delivery code"
          value={signatureText}
          onChange={(e) => setSignatureText(e.target.value)}
          icon={FileSignature}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
            Delivery Notes / Location Left
          </label>
          <textarea
            placeholder="e.g. Handed directly to recipient / Left with concierge"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Button
            type="submit"
            variant="success"
            icon={CheckCircle2}
            isLoading={loading}
            disabled={!recipientName.trim()}
            style={{ flex: 1 }}
          >
            Confirm & Mark Delivered
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
