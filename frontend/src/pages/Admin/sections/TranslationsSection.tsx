import React, { useState } from 'react';
import { ILanguage } from '../../../models/models';
import FlagNavigation from '../../../components/FlagNavigation/FlagNavigation';
import TranslationsTable from '../Translations/TranslationsTable';
import { usePaginatedTranslationsData } from '../../../hooks/usePaginatedTranslationsData';
import { useReviewCount } from '../../../hooks/useReviewCount';
import SearchBar from '../../../components/SearchBar/SearchBar';
import Pagination from '../../../components/Pagination/Pagination';
import { PAGINATION } from '../../../constants';
import { useSearchPagination } from '../../../hooks/useSearchPagination';
import AlphabetFilter from '../../../components/AlphabetFilter/AlphabetFilter';

const TranslationsSection: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage>();
  const [activeTab, setActiveTab] = useState<'all' | 'review'>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
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
    translations,
    pagination,
    loading: translationsLoading,
    error: translationsError,
  } = usePaginatedTranslationsData({
    page: currentPage,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    letter: selectedLetter || undefined,
    languageCode: selectedLanguage?.code || undefined,
    status: activeTab === 'review' ? 'Review' : undefined,
  });

  const { count: reviewCount, loading: reviewCountLoading } = useReviewCount({
    languageCode: selectedLanguage?.code || undefined,
  });


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

      <div className='mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => {
                setActiveTab('all');
                resetPage();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Translations
              {selectedLanguage && (
                <span className='ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs'>
                  {pagination?.totalCount || 0}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('review');
                resetPage();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'review'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Needs Review
              {reviewCount !== null && reviewCount > 0 && (
                <span className='ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs'>
                  {reviewCount}
                </span>
              )}
              {reviewCountLoading && (
                <span className='ml-2 bg-gray-100 text-gray-400 py-0.5 px-2 rounded-full text-xs'>
                  ...
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {translationsLoading ? (
        <p>Loading...</p>
      ) : translationsError ? (
        <p>Error loading translations.</p>
      ) : activeTab === 'review' &&
        (!pagination || pagination.totalCount === 0) ? (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-2'>
            <svg
              className='mx-auto h-12 w-12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-1'>
            No translations need review
          </h3>
          <p className='text-gray-500'>All translations are up to date!</p>
        </div>
      ) : (
        <>
          <TranslationsTable translations={translations} />

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
    </div>
  );
};

export default TranslationsSection;
