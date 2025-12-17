import React from 'react';
import TermsModal from './TermsModal';
import { ITag } from '../../../models/models';
import { LANGUAGE_CONFIG } from '../../../config/languageConfig';
import { useAdminOperations } from '../../../hooks/useAdminOperations';

interface ModalManagerProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  tags: ITag[] | undefined;
}

const TermsModalManager: React.FC<ModalManagerProps> = ({
  showModal,
  setShowModal,
  tags,
}) => {
  const { createTerm } = useAdminOperations();

  return (
    <>
      {showModal && (
        <TermsModal
          onSubmit={async (data) => {
            await createTerm(data);
          }}
          closeFn={() => setShowModal(false)}
          tags={tags}
          variant='term'
          selectedLanguageCode={LANGUAGE_CONFIG.BASE_LANGUAGE_CODE}
        />
      )}
    </>
  );
};

export default TermsModalManager;
