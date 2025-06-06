import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ImagePlus, X, ChevronLeft, ChevronRight, Check, Pencil, Plus, Search } from 'lucide-react';
import { httpClient } from '../../src/lib/api/httpClient';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Topic } from '@/types/topic.types';
import { topicService } from '@/services/topic.service';
import { communityService } from '@/services/communityService';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Step {
  id: string;
  name: string;
}

export function CreateCommunityModal({ open, onOpenChange }: CreateCommunityModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const { theme } = useTheme();

  // Search for topics
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAvailableTopics([]);
      return;
    }

    const searchTopics = async () => {
      if (searchQuery.length < 2) {
        setAvailableTopics([]);
        return;
      }

      try {
        setIsLoadingTopics(true);
        const { topics } = await topicService.getTopics(searchQuery, 1, 10);
        const filteredTopics = topics
          .filter((topic: Topic) => !selectedTopics.some(t => t.id === topic.id))
          .slice(0, 5);
        setAvailableTopics(filteredTopics);
      } catch (error) {
        console.error('Error searching topics:', error);
        toast.error('Failed to search for topics');
        setAvailableTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchTopics();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTopics]);

  const handleTopicSelect = (topic: Topic) => {
    if (!selectedTopics.some(t => t.id === topic.id)) {
      setSelectedTopics([...selectedTopics, topic]);
      setSearchQuery('');
      setAvailableTopics([]);
    }
  };

  const removeTopic = (topicId: string) => {
    setSelectedTopics(selectedTopics.filter(topic => topic.id !== topicId));
  };

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

  const validateCommunityName = (name: string) => {
    const regex = /^[a-zA-Z0-9_]{3,21}$/;
    return regex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on the final step, just go to the next step
    if (currentStep < 3) {
      // Validate name on first step
      if (currentStep === 1 && (!name || !validateCommunityName(name))) {
        toast.error('Invalid community name', {
          description: 'Community names must be 3-21 characters long and can only contain letters, numbers, or underscores.'
        });
        return;
      }
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    // Final submission
    if (!name || !validateCommunityName(name)) {
      toast.error('Invalid community name', {
        description: 'Community names must be 3-21 characters long and can only contain letters, numbers, or underscores.'
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      let iconUrl = iconPreview;
      let bannerUrl = bannerPreview;

      if (iconFile && !iconPreview) {
        iconUrl = await handleImageUpload(iconFile, 'icon');
        if (!iconUrl) {
          setIsSubmitting(false);
          return;
        }
      }
      
      if (bannerFile && !bannerPreview) {
        bannerUrl = await handleImageUpload(bannerFile, 'banner');
        if (!bannerUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create the community with required fields
      const response = await httpClient.post('/communities', {
        name,
        description,
        iconUrl: iconPreview || '',
        bannerUrl: bannerPreview || ''
      });

      // Add topics to the community if any are selected
      if (selectedTopics.length > 0 && response.data?.id) {
        try {
          await topicService.addTopicsToCommunity(response.data.id, selectedTopics.map(t => t.id));
        } catch (topicError) {
          console.error('Error adding topics to community:', topicError);
          toast.warning('Community created, but there was an issue adding some topics.');
        }
      }

      toast.success('Community created successfully!', {
        description: 'Your community is now live and ready for members.',
      });
      
      onOpenChange(false);
      setCurrentStep(1);
      setName('');
      setDescription('');
      setIconFile(null);
      setBannerFile(null);
      setIconPreview('');
      setBannerPreview('');
      setSelectedTopics([]);
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
      setIsSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Name your community</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Community names including capitalization cannot be changed.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">r/</span>
            </div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="communityname"
              className="pl-10"
              required
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Community names must be between 3-21 characters, and can only contain letters, numbers, or underscores.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Add topics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add topics to help people find your community.
        </p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedTopics.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Topics</Label>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  {topic.name}
                  <button
                    type="button"
                    onClick={() => removeTopic(topic.id)}
                    className="ml-2 text-primary/70 hover:text-primary"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label>Available Topics</Label>
          <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
            {isLoadingTopics ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : availableTopics.length > 0 ? (
              availableTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleTopicSelect(topic)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{topic.name}</p>
                      {topic.description && (
                        <p className="text-sm text-gray-500">{topic.description}</p>
                      )}
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))
            ) : searchQuery ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No topics found. Try a different search term.
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Search for topics to add to your community.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Add images (Optional)</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a community icon and banner to make your community stand out.
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Community Icon</Label>
            <div className="flex items-center gap-4">
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
                        const result = reader.result;
                        if (typeof result === 'string') {
                          setIconPreview(result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="icon-upload"
                />
                <Label
                  htmlFor="icon-upload"
                  className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors overflow-hidden"
                >
                  {iconPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Pencil className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-2">
                      <ImagePlus className="h-6 w-6 text-gray-400" />
                      <span className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
                        Upload Icon
                      </span>
                    </div>
                  )}
                </Label>
                {iconPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIconPreview('');
                      setIconFile(null);
                      const input = document.getElementById('icon-upload') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload a square image for your community's icon.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Recommended: 256x256px, JPG or PNG
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Banner Image (Optional)</Label>
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
                      const result = reader.result;
                      if (typeof result === 'string') {
                        setBannerPreview(result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="banner-upload"
              />
              <Label
                htmlFor="banner-upload"
                className="block relative w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors overflow-hidden group"
              >
                {bannerPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Pencil className="h-6 w-6 text-white" />
                      <span className="ml-2 text-white font-medium">Change banner</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload a banner
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Recommended: 1920x384px, JPG or PNG
                    </p>
                  </div>
                )}
              </Label>
              {bannerPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white h-8 w-8 rounded-full p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBannerPreview('');
                    setBannerFile(null);
                    const input = document.getElementById('banner-upload') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your community..."
            rows={4}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This is how new members come to understand your community.
          </p>
        </div>
      </div>
    </div>
  );

  const steps: Step[] = [
    { id: '1', name: 'Basic Info' },
    { id: '2', name: 'Topics' },
    { id: '3', name: 'Images' }
  ];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Create a Community
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {currentStep === 1 && 'Start by giving your community a name.'}
            {currentStep === 2 && 'Add relevant topics to help people find your community.'}
            {currentStep === 3 && 'Add images and a description to make your community stand out.'}
          </DialogDescription>
        </DialogHeader>

        <nav className="flex items-center justify-center" aria-label="Progress">
          <ol role="list" className="flex items-center space-x-4">
            {steps.map((stepItem, stepIdx) => (
              <li key={stepItem.name} className="flex items-center">
                {parseInt(stepItem.id) < currentStep ? (
                  <>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                      <Check className="h-6 w-6 text-white" />
                    </span>
                    {stepIdx !== steps.length - 1 && (
                      <div className="h-0.5 w-10 bg-primary" />
                    )}
                  </>
                ) : parseInt(stepItem.id) === currentStep ? (
                  <>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary">
                      <span className="text-primary">{stepItem.id}</span>
                    </span>
                    {stepIdx !== steps.length - 1 && (
                      <div className="h-0.5 w-10 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </>
                ) : (
                  <>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400">{stepItem.id}</span>
                    </span>
                    {stepIdx !== steps.length - 1 && (
                      <div className="h-0.5 w-10 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStepOne()}
          {currentStep === 2 && renderStepTwo()}
          {currentStep === 3 && renderStepThree()}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onOpenChange(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            <div className="flex items-center gap-2">
              {currentStep < 3 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting || (currentStep === 1 && (!name || name.length < 3))}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Community'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}