import { useState, useEffect, useCallback } from 'react';
import { search, SearchParams, SearchResult } from '@/services/searchService';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SearchParams['type']>('all');
  const [sort, setSort] = useState<SearchParams['sort']>('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timerId = setTimeout(async () => {
      try {
        const data = await search({ query, type, sort, limit: 5 });
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [query, type, sort]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  const handleResultClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement;
      if (target.href) {
        window.location.href = target.href;
      }
    }
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery: handleSearch,
    type,
    setType,
    sort,
    setSort,
    isSearching,
    results,
    isOpen,
    setIsOpen,
    handleResultClick,
  };
};
