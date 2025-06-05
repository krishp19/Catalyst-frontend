"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { communityService, Community, ApiResponse } from '../../src/services/communityService';
import { Users, ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../src/store/hooks';

export const TopCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const { user, setIsLoginModalOpen } = useAuth();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  const fetchCommunities = async () => {
    try {
      const data = await communityService.getCommunities();
      setCommunities(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoin = async (communityId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setJoiningId(communityId);
    try {
      await communityService.joinCommunity(communityId);
      toast.success('Successfully joined the community');
      // Refresh the communities list
      fetchCommunities();
    } catch (error) {
      toast.error('Failed to join community');
      console.error('Error joining community:', error);
    } finally {
      setJoiningId(null);
    }
  };

  const handleViewAll = () => {
    router.push('/communities');
  };

  if (loading) {
    return (
      <Card className="mb-4 border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-900 dark:text-white">Top Growing Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-orange-100 dark:bg-orange-900/30 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-orange-100 dark:bg-orange-900/30 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-900 dark:text-white">Top Growing Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-600 dark:text-orange-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-gray-900 dark:text-white">Top Growing Communities</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ul className="divide-y divide-orange-100 dark:divide-orange-900/30">
          {communities.map((community, index) => (
            <li 
              key={community.id} 
              className="p-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              <Link href={`/r/${community.name}`} className="flex items-center gap-3">
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400 w-6">
                  {index + 1}
                </span>
                
                <Avatar className="h-8 w-8 border border-orange-100 dark:border-orange-900/30">
                  <AvatarImage src={community.iconUrl} alt={community.name} />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {community.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    r/{community.name}
                  </p>
                  <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                    <Users className="h-3 w-3 mr-1" />
                    {community.memberCount.toLocaleString()} members
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 ${
                    joiningId === community.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleJoin(community.id);
                  }}
                  disabled={joiningId === community.id}
                >
                  {joiningId === community.id ? 'Joining...' : 'Join'}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="p-3">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20" 
            size="sm"
            onClick={handleViewAll}
          >
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};