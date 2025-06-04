import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ImagePlus, X } from 'lucide-react';
import { httpClient } from '../../src/lib/api/httpClient';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCommunityModal({ open, onOpenChange }: CreateCommunityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleImageUpload = async (file: File, type: 'icon' | 'banner') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'catalyst_preset');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (type === 'icon') {
        setIconPreview(data.secure_url);
      } else {
        setBannerPreview(data.secure_url);
      }
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.', {
        description: 'Make sure the image is not too large and is in a supported format.',
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let iconUrl = iconPreview;
      let bannerUrl = bannerPreview;

      if (iconFile && !iconPreview) {
        iconUrl = await handleImageUpload(iconFile, 'icon');
        if (!iconUrl) {
          setIsLoading(false);
          return;
        }
      }
      if (bannerFile && !bannerPreview) {
        bannerUrl = await handleImageUpload(bannerFile, 'banner');
        if (!bannerUrl) {
          setIsLoading(false);
          return;
        }
      }

      const response = await httpClient.post('/api/communities', {
        name,
        description,
        iconUrl,
        bannerUrl,
      });

      toast.success('Community created successfully!', {
        description: 'Your community is now live and ready for members.',
      });
      
      onOpenChange(false);
      // Reset form
      setName('');
      setDescription('');
      setIconFile(null);
      setBannerFile(null);
      setIconPreview('');
      setBannerPreview('');
    } catch (error: any) {
      console.error('Error creating community:', error);
      
      if (error.response?.status === 409) {
        toast.error('Community name already exists', {
          description: 'Please choose a different name for your community.',
          action: {
            label: 'Try Again',
            onClick: () => setName(''),
          },
        });
      } else if (error.response?.status === 400) {
        toast.error('Invalid community details', {
          description: 'Please check your input and try again.',
        });
      } else if (error.response?.status === 401) {
        toast.error('Authentication required', {
          description: 'Please log in to create a community.',
        });
      } else {
        toast.error('Failed to create community', {
          description: 'An unexpected error occurred. Please try again later.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Create a Community</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Create a new community to share and discuss topics with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Community Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., programming"
              required
              className="border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your community..."
              required
              className="border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Community Icon</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIconFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setIconPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="icon-upload"
                />
                <Label
                  htmlFor="icon-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {iconPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          setIconPreview('');
                          setIconFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Upload icon</span>
                    </>
                  )}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Banner Image</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBannerFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBannerPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="banner-upload"
                />
                <Label
                  htmlFor="banner-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {bannerPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          setBannerPreview('');
                          setBannerFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Upload banner</span>
                    </>
                  )}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 