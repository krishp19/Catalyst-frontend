'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { postService, PostType, type CreatePostDto } from '../../src/services/postService';
import { communityService, Community } from '../../src/services/communityService';
import { tagService } from '../../src/services/tag.service';
import { Tag } from '../../src/types/tag.types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ImageUpload } from '../../components/ui/image-upload';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import { 
  Loader2, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileText,
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { EmojiTitleInput } from 'components/editor/EmojiTitleInput';

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [postType, setPostType] = useState<PostType>(PostType.TEXT);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    tags: [] as string[],
  });
  const [tagSearch, setTagSearch] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const tagSearchRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Memoized tag search function
  const searchTags = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAvailableTags([]);
      setShowTagDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await tagService.getTags(query);
      setAvailableTags(results);
      setShowTagDropdown(true);
    } catch (error) {
      console.error('Error searching tags:', error);
      setAvailableTags([]);
      toast.error('Failed to search tags');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchTags(query);
    }, 500),
    []
  );

  // Handle tag search input change
  const handleTagSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setTagSearch(query);
    debouncedSearch(query);
  };

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await communityService.getJoinedCommunities();
        setCommunities(response.items);
        
        // Pre-select community from URL if provided
        const communityId = searchParams.get('communityId');
        if (communityId) {
          setSelectedCommunity(communityId);
        }
      } catch (error) {
        toast.error('Failed to fetch communities');
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedCommunity) {
      toast.error('Please select a community');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (postType === PostType.TEXT && !formData.content.trim()) {
      toast.error('Please enter post content');
      return;
    }

    if (postType === PostType.IMAGE && !formData.imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    if (postType === PostType.LINK && !formData.linkUrl) {
      toast.error('Please enter a link URL');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare the post data according to the backend's expected format
      const postData: CreatePostDto = {
        title: formData.title,
        content: formData.content,
        type: postType,
        communityId: selectedCommunity,
        ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
        ...(formData.linkUrl && { linkUrl: formData.linkUrl }),
        ...(formData.tags?.length ? { tags: formData.tags } : {})
      };
      
      if (!postData.content) delete postData.content;

      console.log('Submitting post data:', postData);
      
      // Create the post with all data including tags
      const response = await postService.createPost(postData);
      console.log('Post created successfully:', response);
      
      toast.success('Post created successfully!');
      
      // Redirect to the community page after successful post creation
      const community = communities.find(c => c.id === selectedCommunity);
      if (community) {
        router.push(`/r/${community.name}`);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  };

  // Handle tag selection from dropdown
  const handleTagSelect = (tagName: string) => {
    if (!formData.tags.includes(tagName) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
    setTagSearch('');
    setShowTagDropdown(false);
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node) &&
          tagSearchRef.current && !tagSearchRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href={selectedCommunity ? `/r/${communities.find(c => c.id === selectedCommunity)?.name}` : '/'}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              Create Post
            </h1>
          </div>

          <Card className="border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Community Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Choose a Community
                    {!selectedCommunity && (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Required
                      </span>
                    )}
                  </label>
                  <Select
                    value={selectedCommunity}
                    onValueChange={setSelectedCommunity}
                  >
                    <SelectTrigger className="w-full border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors duration-200">
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={community.iconUrl} alt={community.name} />
                              <AvatarFallback className="bg-orange-500 text-white">
                                {community.name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>r/{community.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Post Type Selection */}
                <Tabs 
                  value={postType} 
                  onValueChange={(value) => setPostType(value as PostType)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                    <TabsTrigger 
                      value={PostType.TEXT} 
                      className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      <FileText className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger 
                      value={PostType.IMAGE} 
                      className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger 
                      value={PostType.LINK} 
                      className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Link
                    </TabsTrigger>
                  </TabsList>

                  {/* Title Input with Emoji Picker */}
                  <div className="mt-6">
                    <EmojiTitleInput
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="Give your post a title"
                      required
                    />
                  </div>

                  {/* Content based on post type */}
                  <TabsContent value={PostType.TEXT} className="mt-4">
                    <div className="mt-2">
                      <RichTextEditor
                        content={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        placeholder="Write your post content here..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value={PostType.IMAGE} className="mt-4">
                    <div className="rounded-lg border-2 border-dashed border-orange-200 dark:border-orange-800 p-6">
                      <ImageUpload
                        onImageUpload={handleImageUpload}
                        currentImageUrl={formData.imageUrl}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value={PostType.LINK} className="mt-4">
                    <Input
                      name="linkUrl"
                      type="url"
                      placeholder="Paste your link here"
                      value={formData.linkUrl}
                      onChange={handleInputChange}
                      className="border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors duration-200"
                      required
                    />
                  </TabsContent>
                </Tabs>

                {/* Tags Input */}
                <div className="mt-6 space-y-2 relative" ref={tagDropdownRef}>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.tags.length}/5 tags
                    </span>
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={formData.tags.length >= 5 ? 'Maximum 5 tags reached' : 'Search and add tags...'}
                        value={tagSearch}
                        onChange={handleTagSearchChange}
                        onFocus={() => tagSearch.trim() && setShowTagDropdown(true)}
                        className={`border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors duration-200 pr-10 ${
                          formData.tags.length >= 5 ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        ref={tagSearchRef}
                        disabled={formData.tags.length >= 5}
                      />
                      {isSearching && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        </div>
                      )}
                    </div>
                    {showTagDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2">
                        {availableTags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                              <div
                                key={tag.id}
                                className={`px-3 py-1.5 rounded-full text-sm cursor-pointer flex items-center gap-1.5 ${
                                  formData.tags.includes(tag.name)
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                }`}
                                onClick={() => handleTagSelect(tag.name)}
                              >
                                <span className="font-medium">#{tag.name}</span>
                                {formData.tags.includes(tag.name) && (
                                  <span className="text-xs text-green-500">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : tagSearch.trim() ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No tags found. Press Enter to create "{tagSearch}"
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    {formData.tags.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {formData.tags.map((tag) => (
                          <div
                            key={tag}
                            className="flex-shrink-0 inline-flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 transition-colors duration-200 hover:bg-orange-200 dark:hover:bg-orange-800/40"
                          >
                            <span className="text-orange-500">#</span>
                            <span className="font-medium max-w-[120px] truncate" title={tag}>
                              {tag}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeTag(tag);
                              }}
                              className="ml-1.5 text-orange-400 hover:text-orange-600 dark:hover:text-orange-100 focus:outline-none transition-colors duration-200 flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-500/20 flex-shrink-0"
                              aria-label={`Remove tag ${tag}`}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.tags.length >= 5 ? (
                          'Maximum of 5 tags reached. Remove tags to add more.'
                        ) : (
                          `Add up to ${5 - formData.tags.length} more tags`
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Add up to 5 tags to help others find your post
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  disabled={submitting || !selectedCommunity}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}