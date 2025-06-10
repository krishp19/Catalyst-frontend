import React from 'react';
import Link from 'next/link';
import { SearchResult } from '@/services/searchService';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SearchResultsProps {
  results: SearchResult | null;
  isLoading: boolean;
  onResultClick?: () => void;
  query: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  onResultClick,
  query,
}) => {
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
              onClick={onResultClick}
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
              href={`/r/${post.community.name}/comments/${post.id}`}
              className="block px-4 py-3 hover:bg-accent transition-colors border-t"
              onClick={onResultClick}
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
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.commentCount} comments</span>
                    </div>
                  </div>
                </div>
                {post.imageUrl && (
                  <div className="flex-shrink-0 w-16 h-16 bg-muted rounded overflow-hidden">
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

      {/* View All Results */}
      {(results.communities.length > 0 || results.posts.length > 0) && (
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm p-2 text-center">
          <button 
            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
            onClick={onResultClick}
          >
            View all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
};
