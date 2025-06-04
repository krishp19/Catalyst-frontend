"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { mockPosts } from '../../lib/mock-data';
import { PostDetails } from '../../components/posts/PostDetails';
import { CommentSection } from '@/components/comments/CommentSection';
import { CommunityInfo } from '@/components/communities/CommunityInfo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PostPage() {
  const params = useParams();
  const post = mockPosts.find(p => p.id === params.id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/40">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <PostDetails post={post} />
            <Card className="p-4">
              <CommentSection postId={post.id} />
            </Card>
          </div>
          
          <div className="space-y-4">
            <CommunityInfo
              communityName={post.community.name}
              members={post.community.members}
              createdAt={new Date(post.community.createdAt)}
              description={post.community.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
}