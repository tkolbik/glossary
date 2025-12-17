import React, { useState } from 'react';
import { ITranslation } from '../../../models/models';
import { LucideEdit, LucideTrash, LucideClock } from 'lucide-react';
import TermsModal from '../Terms/TermsModal';
import FlagRenderer from '../../../components/FlagNavigation/FlagRenderer';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { useAdminOperations } from '../../../hooks/useAdminOperations';
import { formatDate } from '../../../utils/dateUtils';

interface TranslationsTableProps {
  translations: ITranslation[];
}

const TranslationsTable: React.FC<TranslationsTableProps> = ({
  translations,
}) => {
  const {
    deleteTranslationByTermAndLanguage,
    markTranslationReviewed,
    updateTranslation,
  } = useAdminOperations();
  const [showModal, setShowModal] = useState(false);
  const [translationToEdit, setTranslationToEdit] =
    useState<ITranslation | null>(null);
  const [translationToDelete, setTranslationToDelete] =
    useState<ITranslation | null>(null);

  const handleEditClick = (translation: ITranslation) => {
    setTranslationToEdit(translation);
    setShowModal(true);
  };

  const handleDeleteClick = (translation: ITranslation) => {
    setTranslationToDelete(translation);
  };

  const confirmDelete = async (translation: ITranslation) => {
    try {
      await deleteTranslationByTermAndLanguage(
        translation.termId,
        translation.languageCode
      );
      setTranslationToDelete(null);
    } catch (error) {}
  };

  const markAsReviewed = async (translation: ITranslation) => {
    try {
      await markTranslationReviewed(
        translation.termId,
        translation.languageCode
      );
    } catch (error) {}
  };

  return (
    <div className='space-y-4'>
      {translations.map((t) => (
        <div
          key={`${t.termId}-${t.languageCode}`}
          className={`p-5 rounded shadow flex justify-between items-center ${
            t.status === 'Review'
              ? 'bg-yellow-100 border-l-4 border-yellow-500'
              : 'bg-white'
          }`}
        >
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <FlagRenderer
                countryCode={t.languageCode}
                title={t.languageCode}
                className='w-6 h-4'
              />
              <p className='font-semibold'>{t.name}</p>
              {t.status === 'Review' && (
                <>
                  <span className='ml-2 px-2 py-0.5 text-xs bg-yellow text-black rounded-full'>
                    Needs Review
                  </span>
                  <button
                    onClick={() => markAsReviewed(t)}
                    className='text-sm text-yellow-600 underline hover:text-yellow-800'
                  >
                    Mark as Reviewed
                  </button>
                </>
              )}
            </div>
            <p className='text-sm text-gray-600'>{t.description}</p>
            {t.createdAt && (
              <p className='text-xs text-gray-400 mt-2 flex items-center gap-1'>
                <LucideClock className='w-3 h-3' />
                {formatDate(t.createdAt)}
              </p>
            )}
          </div>
          <div className='flex items-center gap-3'>
            <button
              className='text-primary px-4 py-2 hover:scale-110'
              onClick={() => handleEditClick(t)}
            >
              <LucideEdit />
            </button>
            <button
              className='text-red px-4 py-2 hover:scale-110'
              onClick={() => handleDeleteClick(t)}
            >
              <LucideTrash />
            </button>
          </div>
        </div>
      ))}

      {showModal && translationToEdit && (
        <TermsModal
          closeFn={() => {
            setShowModal(false);
            setTranslationToEdit(null);
          }}
          tags={[]}
          initialData={translationToEdit}
          onSubmit={async (data) => {
            await updateTranslation({
              termId: translationToEdit.termId,
              languageCode: translationToEdit.languageCode,
              name: data.name,
              description: data.description,
            });
          }}
          variant='translation'
        />
      )}

      {translationToDelete && (
        <ConfirmModal
          title='Confirm Deletion'
          message={
            <>
              Delete translation <strong>"{translationToDelete?.name}"</strong>?
            </>
          }
          confirmLabel='Delete'
          cancelLabel='Cancel'
          onCancel={() => setTranslationToDelete(null)}
          onConfirm={() =>
            translationToDelete && confirmDelete(translationToDelete)
          }
        />
      )}
    </div>
  );
};

export default TranslationsTable;
