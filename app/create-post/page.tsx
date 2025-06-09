'use client';

import { useState, useEffect, useRef } from 'react';
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
  const tagSearchRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

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

  // Search for tags when input changes
  useEffect(() => {
    const searchTags = async () => {
      if (tagSearch.trim().length > 0) {
        try {
          const results = await tagService.getTags(tagSearch);
          setAvailableTags(results);
          setShowTagDropdown(true);
        } catch (error) {
          console.error('Error searching tags:', error);
          setAvailableTags([]);
        }
      } else {
        setAvailableTags([]);
        setShowTagDropdown(false);
      }
    };

    const timer = setTimeout(searchTags, 300);
    return () => clearTimeout(timer);
  }, [tagSearch]);

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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags {formData.tags.length > 0 && `(${formData.tags.length}/5)`}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Add tags (max 5)"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onFocus={() => tagSearch.trim() && setShowTagDropdown(true)}
                      className="border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors duration-200"
                      ref={tagSearchRef}
                      disabled={formData.tags.length >= 5}
                    />
                    {showTagDropdown && availableTags.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {availableTags.map((tag) => (
                          <div
                            key={tag.id}
                            className="px-4 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                            onClick={() => handleTagSelect(tag.name)}
                          >
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-orange-200 dark:bg-orange-800/50 hover:bg-orange-300 dark:hover:bg-orange-700/70"
                          >
                            <span className="sr-only">Remove tag</span>
                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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