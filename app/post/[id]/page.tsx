"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PostDetails } from '../../../components/posts/PostDetails';
import { CommentSection } from '../../../components/comments/CommentSection';
import Sidebar from '../../../components/layout/Sidebar';
import { postService } from '../../../src/services/postService';
import { communityService, Community } from '../../../src/services/communityService';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Post } from '../../../src/types/post';
import { formatDistanceToNow } from 'date-fns';

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postId = params.id as string;
        const response = await postService.getPost(postId);
        setPost(response);
        
        // Fetch community details using community name
        const communityResponse = await communityService.getCommunityByName(response.community.name);
        setCommunity(communityResponse);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load post');
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">{error || 'Post not found'}</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Link href={`/r/${post.community.name}`}>
              <Button variant="ghost" className="mb-4 gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Button>
            </Link>
            <PostDetails post={post} />
            <div className="mt-8">
              <CommentSection postId={post.id} />
            </div>
          </div>
          
          {community && (
            <div className="lg:col-span-1">
              <Card className="border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                {/* Community Banner */}
                {community.bannerUrl && (
                  <div className="h-24 w-full">
                    {/* Using img instead of Next.js Image due to dynamic src and TypeScript errors */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={community.bannerUrl} 
                      alt={`${community.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  {/* Community Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center -mt-8 border-4 border-white dark:border-gray-800">
                      {community.iconUrl ? (
                        // Using img instead of Next.js Image due to dynamic src and TypeScript errors
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={community.iconUrl} 
                          alt={community.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {community.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                        r/{community.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {community.memberCount.toLocaleString()} members
                      </p>
                    </div>
                  </div>
                  
                  {/* Community Description */}
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {community.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.memberCount.toLocaleString()} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(community.createdAt))} ago</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium">
                      Join Community
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}