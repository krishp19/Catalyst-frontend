import { Search as SearchIcon, XCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { SearchResults } from '../search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';
import { useRef, useEffect } from 'react';

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onResultClick?: (e?: React.MouseEvent) => void;
}

export const SearchBar = ({ 
  className = '',
  autoFocus = false,
  onResultClick = () => {}
}: SearchBarProps) => {
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    isSearching,
    handleResultClick: defaultHandleResultClick,
  } = useSearch();

  const handleResultClick = (e?: React.MouseEvent) => {
    if (defaultHandleResultClick) {
      defaultHandleResultClick(e);
    }
    if (onResultClick) {
      onResultClick(e);
    }
  };
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
        <Input
          type="search"
          placeholder="Search posts, communities, and more..."
          className="w-full pl-10 pr-10 bg-background border border-border/70 hover:border-orange-500/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200 shadow-sm rounded-lg h-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && query.trim()) {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }
          }}
        />
        {query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden rounded-lg shadow-xl border border-border bg-background">
          <div className="max-h-[400px] overflow-y-auto">
            <SearchResults
              results={results}
              isLoading={isSearching}
              onResultClick={handleResultClick}
              query={query}
            />     
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
