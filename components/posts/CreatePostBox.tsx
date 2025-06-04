"use client";

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Image, Link2, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import defaultAvatar from '../../assets/avatar.webp';

export const CreatePostBox = () => {
  const { user, setIsLoginModalOpen } = useAuth();
  
  const handleCreatePost = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    // In a real app, this would open a post creation form or navigate to a post creation page
    alert('Create post functionality would open here');
  };
  
  return (
    <Card className="p-3 mb-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          {user ? (
            <>
              <AvatarImage src={user.avatar || defaultAvatar.src} alt={user.username} />
              <AvatarFallback>{user.username?.[0]}</AvatarFallback>
            </>
          ) : (
            <AvatarFallback>?</AvatarFallback>
          )}
        </Avatar>
        
        <Input 
          placeholder="Create Post" 
          className="bg-muted cursor-pointer"
          onClick={handleCreatePost}
          readOnly
        />
      </div>
      
      <div className="flex justify-between mt-3">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCreatePost}>
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Image</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCreatePost}>
          <Link2 className="h-4 w-4" />
          <span className="hidden sm:inline">Link</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCreatePost}>
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Post</span>
        </Button>
      </div>
    </Card>
  );
};