"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUpload = ({ currentImageUrl, onImageUpload }: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'profile-avatars');

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/dtvydrk6x/image/upload`;
      console.log('Uploading to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary Error Response:', errorData);
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload Success Response:', data);

      if (data.secure_url) {
        onImageUpload(data.secure_url);
      } else {
        throw new Error('No secure URL received from Cloudinary');
      }
    } catch (err) {
      console.error('Upload error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted">
        {currentImageUrl ? (
          <Image
            src={currentImageUrl}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full relative"
          disabled={loading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload"
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}; 