import React, { FC } from 'react';
import Modal from '../../../components/Modal/Modal';
import SynonymsModalContent from '../../../components/Modal/SynonymsModal';

interface IProps {
  closeFn: () => void;
  termId: number;
  termName: string;
}

const SynonymsModal: FC<IProps> = ({
  closeFn,
  termId,
  termName,
}) => {
  return (
    <Modal closeFn={closeFn}>
      <div className='mb-4'>
        <h2 className='text-xl font-bold text-primary'>Manage Synonyms</h2>
        <p className='text-sm text-gray-600'>
          Term: <span className='font-medium'>{termName}</span>
        </p>
      </div>
      <SynonymsModalContent termId={termId} />
    </Modal>
  );
};

export default SynonymsModal;
