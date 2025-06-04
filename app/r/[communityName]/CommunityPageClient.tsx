'use client';

import { useState, useEffect } from 'react';
import { Community } from '../../../src/services/communityService';
import { communityService } from '../../../src/services/communityService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Calendar, Users, MessageSquare, Share2, Flag, Plus } from 'lucide-react';

interface CommunityPageClientProps {
  initialCommunity: Community;
}

export default function CommunityPageClient({ initialCommunity }: CommunityPageClientProps) {
  const [community, setCommunity] = useState<Community>(initialCommunity);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const memberStatus = await communityService.isMember(community.id);
        setIsMember(memberStatus);
      } catch (error) {
        console.error('Error checking membership:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [community.id]);

  const handleJoin = async () => {
    try {
      if (isMember) {
        await communityService.leaveCommunity(community.id);
        toast.success('Successfully left the community');
        setIsMember(false);
      } else {
        await communityService.joinCommunity(community.id);
        toast.success('Successfully joined the community');
        setIsMember(true);
      }
    } catch (error) {
      toast.error('Failed to update membership');
      console.error('Error updating membership:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        {community.bannerUrl ? (
          <Image
            src={community.bannerUrl}
            alt={`${community.name} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        )}
      </div>

      {/* Community Info */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative -mt-16 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800">
                <AvatarImage src={community.iconUrl} alt={community.name} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {community.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  r/{community.name}
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  {community.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-orange-500" />
                    <span>{community.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-orange-500" />
                    <span>Created by u/{community.creator.username}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              <Button
                onClick={handleJoin}
                variant={isMember ? "outline" : "default"}
                className={`w-full md:w-auto ${
                  isMember 
                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isMember ? 'Leave' : 'Join'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full md:w-auto border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Posts</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </div>
              <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
              {/* Posts will be added here */}
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No posts yet. Be the first to post!
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* About Community */}
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-orange-100 dark:border-orange-900/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About Community</h3>
              <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Description</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {community.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Created</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(community.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Members</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {community.memberCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Community Rules */}
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-orange-100 dark:border-orange-900/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Rules</h3>
              <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Be respectful and follow Reddit's content policy.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 