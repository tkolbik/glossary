import React, { useState, useMemo } from 'react';
import { ISuggestion, ITerm, ITranslation } from '../../../models/models';
import SuggestionModal from '../../../components/Modal/SuggestionModal';
import SuggestionCard from '../../../components/SuggestionCard/SuggestionCard';
import { useAdminData } from '../../../hooks/useAdminData';
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { isBaseLanguageCode } from '../../../utils/languageUtils';

type FilterType = 'all' | 'new' | 'change';
type SortType = 'newest' | 'oldest' | 'name' | 'email';

const SuggestionsSection = () => {
  const { suggestions, suggestionsLoading, terms, translations } =
    useAdminData();
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ISuggestion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const getCurrentDescription = (
    suggestion: ISuggestion
  ): string | undefined => {
    if (suggestion.termId === null) return undefined;

    if (isBaseLanguageCode(suggestion.languageCode)) {
      const term = terms.find((t: ITerm) => t.termId === suggestion.termId);
      return term?.description;
    } else {
      const translation = translations.find(
        (t: ITranslation) =>
          t.termId === suggestion.termId &&
          t.languageCode === suggestion.languageCode
      );
      return translation?.description;
    }
  };

  const filteredAndSortedSuggestions = useMemo(() => {
    if (!suggestions) return [];

    let filtered = suggestions;

    if (filterType === 'new') {
      filtered = filtered.filter((s) => s.termId === null);
    } else if (filterType === 'change') {
      filtered = filtered.filter((s) => s.termId !== null);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.suggestedName?.toLowerCase().includes(searchLower) ||
          s.termName?.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower) ||
          s.reasoning?.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return b.suggestionId - a.suggestionId;
        case 'oldest':
          return a.suggestionId - b.suggestionId;
        case 'name':
          const nameA = (a.suggestedName || a.termName || '').toLowerCase();
          const nameB = (b.suggestedName || b.termName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        case 'email':
          return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        default:
          return 0;
      }
    });

    return filtered;
  }, [suggestions, searchTerm, filterType, sortType]);

  const newSuggestions = suggestions?.filter((s) => s.termId === null) || [];
  const changeSuggestions = suggestions?.filter((s) => s.termId !== null) || [];

  const getStats = () => ({
    total: suggestions?.length || 0,
    new: newSuggestions.length,
    change: changeSuggestions.length,
  });

  const stats = getStats();

  if (suggestionsLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {selectedSuggestion && (
        <SuggestionModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
        />
      )}

      <div className='bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Suggestions Review
        </h1>
        <p className='text-gray-600 mb-4'>
          Review and manage user suggestions for terms and translations
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Clock className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Total Suggestions</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <CheckCircle className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>New Terms</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.new}</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <XCircle className='w-5 h-5 text-orange-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Changes</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.change}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col lg:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search suggestions...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            <Filter className='w-4 h-4' />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent'
                >
                  <option value='all'>All Suggestions</option>
                  <option value='new'>New Terms</option>
                  <option value='change'>Changes</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sort By
                </label>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent'
                >
                  <option value='newest'>Newest First</option>
                  <option value='oldest'>Oldest First</option>
                  <option value='name'>Name A-Z</option>
                  <option value='email'>Email A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredAndSortedSuggestions.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <Clock className='w-12 h-12 mx-auto' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No suggestions found
          </h3>
          <p className='text-gray-500'>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No suggestions have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredAndSortedSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.suggestionId}
              suggestion={suggestion}
              onClick={() => setSelectedSuggestion(suggestion)}
              type={suggestion.termId === null ? 'new' : 'change'}
              currentDescription={getCurrentDescription(suggestion)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsSection;
