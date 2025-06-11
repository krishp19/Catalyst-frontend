import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { PostList } from '../components/posts/PostList';
import { MorePosts } from '../components/posts/MorePosts';
import { CreatePostBox } from '../components/posts/CreatePostBox';
import { CommunityInfo } from '../components/communities/CommunityInfo';
import { TopCommunities } from '../components/communities/TopCommunities';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar />
      
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <CreatePostBox />
            <div className="space-y-6">
              <PostList showJoinedCommunities={true} />
              <div className="mt-6 flex justify-center">
                <a 
                  href="/all" 
                  className="group inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200"
                >
                  View more posts
                  <svg 
                    className="ml-1 w-4 h-4 transition-transform duration-200 transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Sidebar/Right Column */}
          <div className="space-y-4">
            <CommunityInfo />
            <TopCommunities />
            
            <div className="text-xs text-center text-muted-foreground space-y-2">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Privacy Policy</a>
              </div>
              
              <p>© 2025 Catalyst. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}