import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Grid3X3, List } from 'lucide-react';
import { fetcher } from '../../api/fetcher';
import AlphabetFilter from '../../components/AlphabetFilter/AlphabetFilter';
import FlagNavigation from '../../components/FlagNavigation/FlagNavigation';
import SearchBar from '../../components/SearchBar/SearchBar';
import Term from '../../components/Term/Term';
import TermList from '../../components/Term/TermList';
import Pagination from '../../components/Pagination/Pagination';
import TagsSelector from '../../components/TagsSelector/TagsSelector';
import Tooltip from '../../components/Tooltip/Tooltip';
import AddSuggestionModal from '../../components/Modal/AddSuggestionModal';
import { ITerm, ITag, CountryCode } from '../../models/models';
import { LANGUAGE_CONFIG } from '../../config/languageConfig';
import { SWR_KEYS, PAGINATION } from '../../constants';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useToggle } from '../../hooks/useToggle';

interface TermsResponse {
  terms: ITerm[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}

function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLanguage, setSelectedLanguage] = useState<{
    languageId: number;
    name: string;
    code: CountryCode;
  }>({
    languageId: 0,
    name: LANGUAGE_CONFIG.BASE_LANGUAGE_NAME,
    code: LANGUAGE_CONFIG.BASE_LANGUAGE_CODE as CountryCode,
  });
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const { search: searchFilter, setSearch: setSearchFilter, debouncedSearch } =
    useDebouncedSearch();
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { isOpen: showSuggestionModal, open: openSuggestionModal, close: closeSuggestionModal } =
    useToggle();
  const { isOpen: isTagFilterOpen, toggle: toggleTagFilter } = useToggle();

  const { data: availableTags } = useSWR<ITag[]>(SWR_KEYS.TAGS, fetcher);

  const swrKey = [
    '/terms/all',
    currentPage,
    PAGINATION.DEFAULT_PAGE_SIZE,
    debouncedSearch ?? '',
    selectedLetter ?? '',
    selectedLanguage.code,
    selectedTags.map(t => t.tagId).join(','),
  ];

  const { data, error, isLoading } = useSWR<TermsResponse>(
    swrKey,
    () =>
      fetcher('/terms/all', {
        params: {
          page: currentPage,
          pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          search: debouncedSearch || undefined,
          letter: selectedLetter || undefined,
          languageCode: selectedLanguage.code,
          tags:
            selectedTags.length > 0
              ? selectedTags.map(t => t.tagId).join(',')
              : undefined,
        },
      }),
    { keepPreviousData: true }
  );

  const terms = data?.terms || [];
  const totalCount = data?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_PAGE_SIZE);

  const handleLanguageChange = (language: { name: string; code: CountryCode }) => {
    setSelectedLanguage({ languageId: 0, name: language.name, code: language.code });
    setCurrentPage(1);
  };

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const handleTagsChange = (tags: ITag[]) => {
    setSelectedTags(tags);
    setCurrentPage(1);
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>Error Loading Terms</h2>
          <p className='text-gray-600'>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-100'>
      <FlagNavigation setLanguage={handleLanguageChange} selectedLanguage={selectedLanguage} />

      <div className='container mx-auto px-4 py-6'>
        <AlphabetFilter activeLetter={selectedLetter} onFilterChange={handleLetterChange} />

        <div className='space-y-6 mb-8'>
          <div className='flex flex-col sm:flex-row justify-between items-start gap-4'>
            <button
              onClick={openSuggestionModal}
              className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition'
            >
              <Plus />
              Suggest new term
            </button>

            <SearchBar
              value={searchFilter}
              onChange={setSearchFilter}
              placeholder='Search terms...'
              className='w-full sm:w-96 px-4 py-2 rounded-lg shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200'
            />

            <div className='flex items-center gap-2'>
              <button
                onClick={toggleTagFilter}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isTagFilterOpen
                    ? 'bg-black text-white hover:bg-blue-700 shadow-md'
                    : 'bg-white text-black hover:bg-gray-200 border border-gray-200 shadow-sm'
                }`}
              >
                Filter by Tags
              </button>

              <div className='flex bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid3X3 className='w-4 h-4' /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className='w-4 h-4' /> List
                </button>
              </div>
            </div>
          </div>

          {showSuggestionModal && (
            <AddSuggestionModal
              languageCode={selectedLanguage.code}
              onClose={closeSuggestionModal}
              variant='new'
            />
          )}

          {isTagFilterOpen && (
            <TagsSelector
              tags={availableTags}
              selectedTags={selectedTags}
              onChange={handleTagsChange}
            />
          )}
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3'></div>
              <p className='text-gray-600 text-sm'>Loading terms...</p>
            </div>
          </div>
        ) : terms.length === 0 ? (
          <div className='text-center text-gray-500 py-12'>
            <p className='text-lg mb-2'>No terms found</p>
            <p className='text-sm'>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {terms.map((term) => (
                  <Tooltip key={term.termId + term.languageCode} description={term.description} reference={term.reference}>
                    <Term term={term} currentLanguage={selectedLanguage} />
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className='space-y-4'>
                {terms.map((term) => (
                  <TermList key={term.termId + term.languageCode} term={term} currentLanguage={selectedLanguage} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className='mt-8'>
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={changePage}
                  isLoading={isLoading}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
