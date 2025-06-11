import React from 'react';
import Link from 'next/link';
import { SearchResult } from '@/services/searchService';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SearchResultsProps {
  results: SearchResult | null;
  isLoading: boolean;
  onResultClick?: (e?: React.MouseEvent) => void;
  query: string;
  type?: 'all' | 'posts' | 'communities';
  sort?: 'relevance' | 'newest' | 'top';
  onTypeChange?: (type: 'all' | 'posts' | 'communities') => void;
  onSortChange?: (sort: 'relevance' | 'newest' | 'top') => void;
}

export const SearchResults: React.FC<SearchResultsProps> = (props) => {
  // Set default values for optional props
  const { 
    type = 'all', 
    sort = 'relevance', 
    onTypeChange = () => {}, 
    onSortChange = () => {},
    onResultClick = () => {},
    results = { communities: [], posts: [] },
    isLoading = false,
    query = ''
  } = props;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 border-2 border-muted-foreground/20 border-t-orange-500 rounded-full animate-spin" />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const hasResults = results.communities.length > 0 || results.posts.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
      </div>
    );
  }


  return (
    <div className="w-full">
      {/* Search Filters */}
      <div className="sticky top-0 z-10 p-3 bg-background border-b">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground text-xs font-medium">Search in:</span>
            <Button
              variant={type === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('all')}
              className={`h-7 px-2.5 text-xs rounded-md transition-all ${type === 'all' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
            >
              All
            </Button>
            <Button
              variant={type === 'posts' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('posts')}
              className={`h-7 px-2.5 text-xs rounded-md transition-all ${type === 'posts' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
            >
              Posts
            </Button>
            <Button
              variant={type === 'communities' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('communities')}
              className={`h-7 px-2.5 text-xs rounded-md transition-all ${type === 'communities' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
            >
              Communities
            </Button>
          </div>
          <div className="flex items-center gap-1 text-xs ml-auto">
            <span className="text-muted-foreground text-xs font-medium">Sort by:</span>
            <Button
              variant={sort === 'relevance' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSortChange('relevance')}
              className={`h-7 px-2.5 text-xs rounded-md transition-all ${sort === 'relevance' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
            >
              Relevance
            </Button>
            <Button
              variant={sort === 'newest' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSortChange('newest')}
              className={`h-7 px-2.5 text-xs rounded-md transition-all ${sort === 'newest' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
            >
              Newest
            </Button>
            <Button
              variant={sort === 'top' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSortChange('top')}
              className={`h-7 px-2.5 text-xs rounded-md transition-all ${sort === 'top' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
            >
              Top
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Communities Section */}
        {results.communities.length > 0 && (
          <div className="border-b">
            <div className="sticky top-0 z-10 px-4 py-2 text-xs font-medium text-muted-foreground bg-background/95 backdrop-blur-sm">
              COMMUNITIES
            </div>
            {results.communities.map((community) => (
              <Link
                key={`community-${community.id}`}
                href={`/r/${community.name}`}
                className="block px-4 py-3 hover:bg-accent transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onResultClick) {
                    onResultClick(e);
                  }
                  // Use a small timeout to ensure the modal closes before navigation
                  setTimeout(() => {
                    window.location.href = `/r/${community.name}`;
                  }, 50);
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {community.iconUrl && (
                      <AvatarImage src={community.iconUrl} alt={community.name} />
                    )}
                    <AvatarFallback>
                      {community.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">r/{community.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {community.memberCount.toLocaleString()} members
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Posts Section */}
        {results.posts.length > 0 && (
          <div>
            <div className="sticky top-0 z-10 px-4 py-2 text-xs font-medium text-muted-foreground bg-background/95 backdrop-blur-sm">
              POSTS
            </div>
            {results.posts.map((post) => (
              <Link
                key={`post-${post.id}`}
                href={`/post/${post.id}`}
                className="block px-4 py-3 hover:bg-accent transition-colors border-t"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onResultClick) {
                    onResultClick(e);
                  }
                  // Use a small timeout to ensure the modal closes before navigation
                  setTimeout(() => {
                    window.location.href = `/post/${post.id}`;
                  }, 50);
                }}
              >
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <span>r/{post.community.name}</span>
                      <span>•</span>
                      <span>Posted by u/{post.author.username}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <h4 className="font-medium line-clamp-2">{post.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{post.score}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                  {post.imageUrl && (
                    <div className="flex-shrink-0 w-20 h-16 bg-muted rounded overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Results Link */}
        {hasResults && query.trim() && (
          <div className="p-4 text-center border-t">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="text-sm font-medium text-orange-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onResultClick) {
                  onResultClick(e);
                }
                // Use a small timeout to ensure the modal closes before navigation
                setTimeout(() => {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }, 50);
              }}
            >
              View all results for &quot;{query}&quot;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
