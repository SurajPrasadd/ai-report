import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title = 'Confirm Action',
  message, confirmLabel = 'Confirm', isLoading,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={isLoading}>{confirmLabel}</Button>
      </>
    }>
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <FiAlertTriangle style={{ fontSize: 24, color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
    </div>
  </Modal>
);

export default ConfirmDialog;
