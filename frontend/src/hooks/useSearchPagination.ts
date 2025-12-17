import { useState, useCallback } from 'react';
import { useDebouncedSearch } from './useDebouncedSearch';

interface UseSearchPaginationConfig {
  initialPage?: number;
  debounceDelay?: number;
}

export const useSearchPagination = ({
  initialPage = 1,
  debounceDelay,
}: UseSearchPaginationConfig = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [prevInitialPage, setPrevInitialPage] = useState(initialPage);
  const { search, setSearch, debouncedSearch, clearSearch } =
    useDebouncedSearch(debounceDelay);

  if (initialPage !== prevInitialPage) {
    setPrevInitialPage(initialPage);
    setCurrentPage(initialPage);
  }

  const resetPage = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const clearFilters = useCallback(() => {
    clearSearch();
    resetPage();
  }, [clearSearch, resetPage]);

  return {
    search,
    setSearch,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    resetPage,
    clearFilters,
  };
};


