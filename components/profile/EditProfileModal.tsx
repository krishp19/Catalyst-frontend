"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import authService, { UpdateProfileData, User } from '../../src/services/auth/authService';
import { ImageUpload } from './ImageUpload';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: User;
  onProfileUpdate: (updatedProfile: User) => void;
}

export const EditProfileModal = ({ open, onOpenChange, currentProfile, onProfileUpdate }: EditProfileModalProps) => {
  const [formData, setFormData] = useState<UpdateProfileData>({
    bio: currentProfile.bio || '',
    avatarUrl: currentProfile.avatarUrl || '',
    email: currentProfile.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.updateProfile(formData);
    if (res.data) {
      onProfileUpdate(res.data);
      onOpenChange(false);
    } else {
      setError(res.error?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <ImageUpload
              currentImageUrl={formData.avatarUrl}
              onImageUpload={handleImageUpload}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 