"use client";

import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Cake, Users, Eye } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface CommunityInfoProps {
  communityName?: string;
  members?: number;
  online?: number;
  createdAt?: Date;
  description?: string;
}

export const CommunityInfo = ({
  communityName = 'Home',
  members = 123456,
  online = 4567,
  createdAt = new Date(2020, 0, 1),
  description = 'Your personalized Catalyst homepage. Come here to check in with your favorite communities.',
}: CommunityInfoProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-t-md">
        <CardTitle className="text-lg">{communityName === 'Home' ? 'Home' : `r/${communityName}`}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 pt-4 space-y-4">
        <p className="text-sm">{description}</p>
        
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Members</span>
            </div>
            <span className="font-medium">{members.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>Online</span>
            </div>
            <span className="font-medium">{online.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Cake className="h-4 w-4 text-muted-foreground" />
              <span>Created</span>
            </div>
            <span className="font-medium">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-3">
        <Button className="w-full">
          {communityName === 'Home' ? 'Create Post' : 'Join'}
        </Button>
      </CardFooter>
    </Card>
  );
};