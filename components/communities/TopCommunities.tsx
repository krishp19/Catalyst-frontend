"use client";

import React, { useEffect, useState } from 'react';
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
      toast.error('Please log in to join communities', {
        description: 'You need to be logged in to join a community.',
      });
      return;
    }

    setJoiningId(communityId);
    try {
      const response = await communityService.joinCommunity(communityId);
      toast.success(response.message || 'Successfully joined the community!');
      await fetchCommunities();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to join communities', {
          description: 'You need to be logged in to join a community.',
        });
      } else if (error.response?.status === 409) {
        toast.error(error.response.data.message || 'Already a member', {
          description: 'You are already a member of this community.',
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to join community', {
          description: 'An error occurred while trying to join the community.',
        });
      }
    } finally {
      setJoiningId(null);
    }
  };

  const handleViewAll = () => {
    router.push('/communities');
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Growing Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Growing Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Growing Communities</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ul className="divide-y">
          {communities.map((community, index) => (
            <li key={community.id} className="p-3 hover:bg-muted/50 transition-colors">
              <a href={`/r/${community.name}`} className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}
                </span>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={community.iconUrl} alt={community.name} />
                  <AvatarFallback>{community.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">r/{community.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {community.memberCount.toLocaleString()} members
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleJoin(community.id);
                  }}
                  disabled={joiningId === community.id}
                >
                  {joiningId === community.id ? 'Joining...' : 'Join'}
                </Button>
              </a>
            </li>
          ))}
        </ul>
        
        <div className="p-3">
          <Button 
            variant="ghost" 
            className="w-full text-sm" 
            size="sm"
            onClick={handleViewAll}
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};