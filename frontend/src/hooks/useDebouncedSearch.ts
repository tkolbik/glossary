import { useState, useEffect, useCallback } from 'react';

export const useDebouncedSearch = (delay: number = 300) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search, delay]);

  const clearSearch = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
  }, []);

  return {
    search,
    setSearch,
    debouncedSearch,
    clearSearch,
  };
};
