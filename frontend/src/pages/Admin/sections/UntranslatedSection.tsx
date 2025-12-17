import React, { useState } from 'react';
import { ILanguage, ITerm } from '../../../models/models';
import FlagNavigation from '../../../components/FlagNavigation/FlagNavigation';
import TermsModal from '../Terms/TermsModal';
import FileUpload from '../../../components/FileUpload/FileUpload';
import ImportModal from '../../../components/Modal/ImportModal';
import { useAdminOperations } from '../../../hooks/useAdminOperations';
import { usePaginatedUntranslatedData } from '../../../hooks/usePaginatedUntranslatedData';
import SearchBar from '../../../components/SearchBar/SearchBar';
import Pagination from '../../../components/Pagination/Pagination';
import { PAGINATION } from '../../../constants';
import { useSearchPagination } from '../../../hooks/useSearchPagination';

const UntranslatedSection: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage>();
  const [activeTerm, setActiveTerm] = useState<ITerm | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const { createTranslation, importTranslations } = useAdminOperations();
  const {
    search,
    setSearch,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    resetPage,
    clearFilters,
  } = useSearchPagination();

  const {
    terms: untranslatedTerms,
    pagination,
    loading: isUntranslatedTermsLoading,
    error: untranslatedTermsError,
  } = usePaginatedUntranslatedData({
    page: currentPage,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    search: search || undefined,
    languageCode: selectedLanguage?.code || '',
  });

  const handleTranslationSubmit = async (data: ITerm) => {
    if (!selectedLanguage) return;
    await createTranslation({
      termId: data.termId,
      languageCode: selectedLanguage.code,
      name: data.name,
      description: data.description,
    });
    setActiveTerm(null);
  };

  const handleHeadersExtracted = (headers: string[], file: File) => {
    setHeaders(headers);
    setFile(file);
    setShowImportModal(true);
  };

  const handleMappingSubmit = async (mapping: Record<string, string>, customDate?: string) => {
    setShowImportModal(false);
    const formData = new FormData();
    formData.append('file', file!);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('languageCode', selectedLanguage?.code || '');

    try {
      await importTranslations(formData);
    } catch (error) {}
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div>
      <div className='mb-6'>
        <FlagNavigation
          setLanguage={(language) => {
            setSelectedLanguage(language);
            resetPage();
          }}
          selectedLanguage={selectedLanguage}
          excludeBaseLanguage={true}
        />
      </div>

      {showImportModal && (
        <ImportModal
          headers={headers}
          onSubmit={handleMappingSubmit}
          closeFn={() => setShowImportModal(false)}
          variant='translation'
          selectedLanguageCode={selectedLanguage?.code}
        />
      )}

      <div className='max-w-5xl mx-auto'>
        {selectedLanguage ? (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold'>
                Terms not yet translated to {selectedLanguage.name}
              </h2>
              <div className='flex items-center gap-4'>
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder='Search untranslated terms...'
                />
                {search && (
                  <button
                    onClick={handleClearFilters}
                    className='px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50'
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className='mb-4'>
              <FileUpload
                onHeadersExtracted={handleHeadersExtracted}
                displayString='Translate using excel'
              />
            </div>

            {isUntranslatedTermsLoading ? (
              <p>Loading...</p>
            ) : untranslatedTermsError ? (
              <p className='text-red-500'>Failed to load terms.</p>
            ) : (
              <>
                <div className='space-y-4'>
                  {untranslatedTerms?.map((term) => (
                    <div
                      key={term.termId}
                      className='p-4 bg-white rounded shadow flex justify-between items-center'
                    >
                      <div>
                        <p className='font-semibold'>{term.name}</p>
                        <p className='text-sm text-gray-600'>
                          {term.description}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {term.reference}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTerm(term)}
                        className='bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600'
                      >
                        Translate
                      </button>
                    </div>
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className='mt-8'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <p className='text-gray-600'>Select a language to view untranslated terms</p>
        )}
      </div>

      {activeTerm && (
        <TermsModal
          closeFn={() => setActiveTerm(null)}
          tags={[]}
          onSubmit={handleTranslationSubmit}
          initialData={activeTerm}
          selectedLanguageCode={selectedLanguage?.code}
          variant='translation'
        />
      )}
    </div>
  );
};

export default UntranslatedSection;
