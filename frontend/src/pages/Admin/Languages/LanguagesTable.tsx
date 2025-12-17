import React, { useState } from 'react';
import { ILanguage } from '../../../models/models';
import { LucideTrash, LucideAlertTriangle } from 'lucide-react';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import FlagRenderer from '../../../components/FlagNavigation/FlagRenderer';
import { useAdminOperations } from '../../../hooks/useAdminOperations';
import { isBaseLanguage } from '../../../config/languageConfig';

interface LanguagesTableProps {
  languages: ILanguage[];
}

const LanguagesTable: React.FC<LanguagesTableProps> = ({ languages }) => {
  const { deleteLanguage } = useAdminOperations();
  const [languageToDelete, setLanguageToDelete] = useState<ILanguage | null>(
    null
  );

  const handleDeleteClick = (language: ILanguage) => {
    setLanguageToDelete(language);
  };

  const confirmDelete = async (language: ILanguage) => {
    try {
      await deleteLanguage(language.languageId);
      setLanguageToDelete(null);
    } catch (error) {}
  };

  return (
    <div className='space-y-4'>
      {languages.map((language) => (
        <div
          key={language.languageId}
          className='p-5 bg-white rounded shadow flex justify-between items-center'
        >
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 flex-shrink-0'>
                <FlagRenderer
                  countryCode={language.code}
                  title={language.name}
                />
              </div>
              <div>
                <p className='font-semibold text-lg'>{language.name}</p>
                <p className='text-sm text-gray-500'>Code: {language.code}</p>
              </div>
            </div>
            {isBaseLanguage(language.code) && (
              <div className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                <LucideAlertTriangle className='w-3 h-3' />
                Base Language
              </div>
            )}
          </div>
          <div className='flex items-center gap-3'>
            {!isBaseLanguage(language.code) && (
              <button
                className='text-red-500 px-4 py-2 hover:scale-110 transition-transform'
                onClick={() => handleDeleteClick(language)}
                title='Delete language'
              >
                <LucideTrash className='w-5 h-5' />
              </button>
            )}
            {isBaseLanguage(language.code) && (
              <span className='text-gray-400 text-sm'>
                Cannot delete base language
              </span>
            )}
          </div>
        </div>
      ))}

      {languageToDelete && (
        <ConfirmModal
          title='Confirm Language Deletion'
          message={
            <>
              Are you sure you want to delete the language{' '}
              <strong>"{languageToDelete.name}"</strong>?
              <br />
              <br />
              <span className='text-red-600 font-medium'>
                Warning: This action cannot be undone and will remove all
                translations for this language.
              </span>
            </>
          }
          confirmLabel='Delete Language'
          cancelLabel='Cancel'
          onCancel={() => setLanguageToDelete(null)}
          onConfirm={() => languageToDelete && confirmDelete(languageToDelete)}
        />
      )}
    </div>
  );
};

export default LanguagesTable;
