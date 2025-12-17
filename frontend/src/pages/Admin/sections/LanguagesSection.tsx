import React from 'react';
import { Plus } from 'lucide-react';
import LanguagesTable from '../Languages/LanguagesTable';
import AddLanguageModal from '../../../components/Modal/AddLanguageModal';
import { useAdminData } from '../../../hooks/useAdminData';
import { useState } from 'react';

const LanguagesSection: React.FC = () => {
  const { languages } = useAdminData();
  const [showAddModal, setShowAddModal] = useState(false);

  const usedLanguageCodes = languages?.map((lang) => lang.code) || [];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Languages</h2>
          <p className='text-gray-600 mt-1'>
            Manage available languages for translations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition'
        >
          <Plus className='w-4 h-4' />
          Add Language
        </button>
      </div>

      {languages && languages.length > 0 ? (
        <LanguagesTable languages={languages} />
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>No languages found</p>
          <p className='text-gray-400 text-sm mt-1'>
            Add your first language to get started
          </p>
        </div>
      )}

      {showAddModal && (
        <AddLanguageModal
          closeFn={() => setShowAddModal(false)}
          usedLanguages={usedLanguageCodes}
        />
      )}
    </div>
  );
};

export default LanguagesSection;
