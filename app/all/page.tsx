import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { CommunityInfo } from '../../components/communities/CommunityInfo';
import { TopCommunities } from '../../components/communities/TopCommunities';
import { MorePosts } from '../../components/posts/MorePosts';

export default function AllPostsPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar />
      
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-lg shadow">
              <div className="p-4 border-b border-border">
                <h1 className="text-xl font-bold">All Posts</h1>
                <p className="text-sm text-muted-foreground">Latest posts from all communities</p>
              </div>
              <div className="p-4">
                <MorePosts limit={20} />
              </div>
            </div>
          </div>
          
          {/* Sidebar/Right Column */}
          <div className="space-y-4">
            <CommunityInfo />
            <TopCommunities />
            
            <div className="bg-card rounded-lg shadow p-4">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground">
                Browse all posts from across the platform. Discover new communities and engage with the latest content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
