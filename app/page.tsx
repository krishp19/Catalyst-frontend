import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { PostList } from '../components/posts/PostList';
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
          <div className="lg:col-span-3">
            <CreatePostBox />
            <PostList />
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