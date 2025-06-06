"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Image, Link2, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import defaultAvatar from '../../assets/avatar.webp';

export const CreatePostBox = () => {
  const router = useRouter();
  const { user, setIsLoginModalOpen } = useAuth();
  
  const handleCreatePost = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to the parent
    
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    // Use window.location for immediate navigation
    window.location.href = '/create-post';
  };
  
  const handleContainerClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    // Use window.location for immediate navigation
    window.location.href = '/create-post';
  };
  
  return (
    <Card 
      className="p-3 mb-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleContainerClick}
    >
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
          onClick={handleContainerClick}
          readOnly
        />
      </div>
      
      <div className="flex justify-between mt-3">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 hover:bg-background"
          onClick={handleCreatePost}
        >
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