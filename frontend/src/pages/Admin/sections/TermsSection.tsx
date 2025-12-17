import React, { useState } from 'react';
import toast from 'react-hot-toast';
import TermsModalManager from '../Terms/TermsModalManager';
import FileUpload from '../../../components/FileUpload/FileUpload';
import TermsTable from '../Terms/TermsTable';
import { Plus, Trash2, Download } from 'lucide-react';
import ImportModal from '../../../components/Modal/ImportModal';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { useAdminData } from '../../../hooks/useAdminData';
import { useAdminOperations } from '../../../hooks/useAdminOperations';
import { usePaginatedTermsData } from '../../../hooks/usePaginatedTermsData';
import { useSearchPagination } from '../../../hooks/useSearchPagination';
import AlphabetFilter from '../../../components/AlphabetFilter/AlphabetFilter';
import SearchBar from '../../../components/SearchBar/SearchBar';
import Pagination from '../../../components/Pagination/Pagination';
import { LANGUAGE_CONFIG } from '../../../config/languageConfig';
import { PAGINATION } from '../../../constants';
import { termsApi } from '../../../api/termsApi';

const TermsSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const {
    search,
    setSearch,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    resetPage
  } = useSearchPagination();

  const [selectedLetter, setSelectedLetter] = useState<string>('');

  const { terms, pagination, loading, error } = usePaginatedTermsData({
    page: currentPage,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    letter: selectedLetter || undefined,
    languageCode: LANGUAGE_CONFIG.BASE_LANGUAGE_CODE,
  });

  const { tags } = useAdminData();
  const { deleteAllTerms, importTerms } = useAdminOperations();

  const [headers, setHeaders] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

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
    if (customDate) {
      formData.append('createdAt', customDate);
    }
    await importTerms(formData);
  };

  const handleExportTerms = async () => {
    try {
      const response = await termsApi.exportDocx();

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glossary_export_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to export DOCX';
      toast.error(message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    return <p className='text-red-500 font-medium'>Error loading terms.</p>;
  }

  return (
    <div>
      <TermsModalManager
        showModal={showModal}
        setShowModal={setShowModal}
        tags={tags}
      />

      <div className='mb-6 space-y-4'>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder='Search terms...'
        />

        <AlphabetFilter
          activeLetter={selectedLetter}
          onFilterChange={(letter) => {
            setSelectedLetter(letter);
            resetPage();
          }}
        />
      </div>

      <div className='flex flex-wrap gap-3 mb-6'>
        <FileUpload
          onHeadersExtracted={handleHeadersExtracted}
          displayString='Upload glossary from excel'
        />
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition'
        >
          <Plus className='w-4 h-4' />
          Add Term
        </button>
        <button
          onClick={handleExportTerms}
          className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90  transition'
        >
          <Download className='w-4 h-4' />
          Export DOCX
        </button>
        <button
          onClick={() => setShowDeleteAllModal(true)}
          className='flex items-center gap-2 px-4 py-2 bg-red text-white rounded-lg shadow hover:bg-red/90 transition'
        >
          <Trash2 className='w-4 h-4' />
          Delete All
        </button>
      </div>

      {showImportModal && (
        <ImportModal
          headers={headers}
          onSubmit={handleMappingSubmit}
          closeFn={() => setShowImportModal(false)}
          variant='term'
        />
      )}

      {showDeleteAllModal && (
        <ConfirmModal
          title='Delete All Terms'
          message={
            <>
              <div className='text-red-600 font-semibold mb-2'>
                WARNING: This action cannot be undone!
              </div>
              <p>
                Are you sure you want to delete{' '}
                <strong>ALL terms and translations</strong>?
              </p>
              <p className='text-sm text-gray-600 mt-2'>
                This will permanently remove all terms and their associated
                translations from the database.
              </p>
            </>
          }
          confirmLabel='Delete All'
          cancelLabel='Cancel'
          onCancel={() => setShowDeleteAllModal(false)}
          onConfirm={async () => {
            await deleteAllTerms();
            setShowDeleteAllModal(false);
          }}
        />
      )}

      <TermsTable terms={terms} tags={tags} />

      {pagination && pagination.totalPages > 1 && (
        <div className='mt-8'>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default TermsSection;
