import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ImagePlus, X, ChevronLeft, ChevronRight, Check, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Topic } from '@/types/topic.types';
import { topicService } from '@/services/topic.service';
import { communityService } from '../../src/services/communityService';

export interface CommunityData {
  id?: string;
  name: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  topics?: Topic[];
}

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community?: CommunityData;
  onSuccess?: () => void;
}

interface Step {
  id: string;
  name: string;
}

export function CreateCommunityModal({ open, onOpenChange, community, onSuccess }: CreateCommunityModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState(community?.name || '');
  const [description, setDescription] = useState(community?.description || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>(community?.iconUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(community?.bannerUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(community?.topics || []);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const topicSearchRef = useRef<HTMLInputElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  
  // Reset form when community prop changes
  useEffect(() => {
    if (community) {
      setName(community.name || '');
      setDescription(community.description || '');
      setIconPreview(community.iconUrl || '');
      setBannerPreview(community.bannerUrl || '');
      setSelectedTopics(community.topics || []);
    } else {
      setName('');
      setDescription('');
      setIconPreview('');
      setBannerPreview('');
      setSelectedTopics([]);
    }
  }, [community]);
  const { theme } = useTheme();

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Memoized topic search function
  const searchTopics = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAvailableTopics([]);
      return;
    }

    if (query.length < 2) {
      setAvailableTopics([]);
      return;
    }

    try {
      setIsLoadingTopics(true);
      const { topics } = await topicService.getTopics(query, 1, 10);
      const filteredTopics = topics
        .filter((topic: Topic) => !selectedTopics.some(t => t.id === topic.id))
        .slice(0, 10);
      setAvailableTopics(filteredTopics);
    } catch (error) {
      console.error('Error searching topics:', error);
      toast.error('Failed to search for topics');
      setAvailableTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [selectedTopics]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchTopics(query);
    }, 500),
    [searchTopics]
  );

  // Handle topic search input change
  const handleTopicSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node) &&
          topicSearchRef.current && !topicSearchRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

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

      let communityId = community?.id;
      
      if (communityId) {
        // Update existing community using the communityService
        await communityService.updateCommunity(communityId, {
          name,
          description,
          iconUrl: iconPreview || null,
          bannerUrl: bannerPreview || null,
          topics: selectedTopics.map(topic => topic.id)
        });
        
        // Note: The topic updates are now handled by the backend in a single transaction
        
        toast.success('Community updated successfully!');
      } else {
        // Create new community using the communityService
        const newCommunity = await communityService.createCommunity({
          name,
          description,
          iconUrl: iconPreview || null,
          bannerUrl: bannerPreview || null,
          topics: selectedTopics.map(t => t.id)
        });
        
        communityId = newCommunity.id;
        
        toast.success('Community created successfully!', {
          description: 'Your community is now live and ready for members.',
        });
      }
      
      // Reset form and close modal
      onOpenChange(false);
      setCurrentStep(1);
      
      // Only reset form if not in edit mode
      if (!community) {
        setName('');
        setDescription('');
        setIconFile(null);
        setBannerFile(null);
        setIconPreview('');
        setBannerPreview('');
        setSelectedTopics([]);
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Topics</Label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedTopics.length}/10 topics
            </span>
          </div>
          
          {/* Selected Topics */}
          {selectedTopics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="inline-flex items-center bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                >
                  <span className="font-medium">{topic.name}</span>
                  <button
                    type="button"
                    onClick={() => removeTopic(topic.id)}
                    className="ml-1.5 text-primary/60 hover:text-primary/100 focus:outline-none transition-colors duration-200 flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20"
                    aria-label={`Remove topic ${topic.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Topic Search */}
          <div className="relative" ref={topicDropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={selectedTopics.length >= 10 ? 'Maximum 10 topics reached' : 'Search and add topics...'}
                value={searchQuery}
                onChange={handleTopicSearchChange}
                onFocus={() => searchQuery.trim() && setSearchQuery(searchQuery)}
                className={`pl-10 ${selectedTopics.length >= 10 ? 'opacity-70 cursor-not-allowed' : ''}`}
                ref={topicSearchRef}
                disabled={selectedTopics.length >= 10}
              />
              {isLoadingTopics && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Topic Suggestions */}
            {searchQuery.trim() && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2">
                {availableTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`px-3 py-1.5 rounded-full text-sm cursor-pointer flex items-center gap-1.5 ${
                          selectedTopics.some(t => t.id === topic.id)
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                        }`}
                        onClick={() => handleTopicSelect(topic)}
                      >
                        <span className="font-medium">{topic.name}</span>
                        {selectedTopics.some(t => t.id === topic.id) && (
                          <span className="text-xs text-green-500">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() && !isLoadingTopics ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    No topics found. Try a different search term.
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selectedTopics.length >= 10 ? (
              'Maximum of 10 topics reached. Remove topics to add more.'
            ) : (
              `Add up to ${10 - selectedTopics.length} more topics to help people find your community.`
            )}
          </p>
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
                      <div className="relative w-full h-full">
                        <Image
                          src={iconPreview}
                          alt="Icon preview"
                          fill
                          className="object-cover"
                        />
                      </div>
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
                  Upload a square image for your community&apos;s icon.
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
                    <div className="relative w-full h-full">
                      <Image
                        src={bannerPreview}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    </div>
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{community ? 'Edit Community' : 'Create Community'}</DialogTitle>
          <DialogDescription>
            {community 
              ? 'Update your community details and settings.'
              : 'Create a new community to share and discuss content with others.'}
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