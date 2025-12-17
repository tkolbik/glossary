import React, { ReactNode } from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  title?: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = 'Please Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal closeFn={onCancel}>
      <div className='p-4'>
        <h2 className='text-lg font-bold mb-4'>{title}</h2>
        <div className='mb-6 text-sm text-gray-700'>{message}</div>
        <div className='flex justify-end gap-4'>
          <button
            onClick={onCancel}
            className='text-black px-4 py-2 rounded hover:bg-gray-300'
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className='text-red px-4 py-2 rounded hover:bg-red-700'
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
