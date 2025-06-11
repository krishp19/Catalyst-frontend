"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, Calendar, Mail, Edit2, MessageSquare, ThumbsUp, ThumbsDown, LayoutGrid } from "lucide-react";
import authService from "../../src/services/auth/authService";
import type { User } from "@/services/auth/types";
import defaultAvatar from "../../assets/avatar.webp";
import Sidebar from "../../components/layout/Sidebar";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
import HtmlContent from "../../components/common/HtmlContent";

// Type for items that can be either posts or comments
type VotableItem = Post | Comment;

// Type guard to check if an item is a Post
const isPost = (item: VotableItem): item is Post => {
  return (item as Post).title !== undefined;
};

// Type guard to check if an item is a Comment
const isComment = (item: VotableItem): item is Comment => {
  return (item as Comment).content !== undefined && (item as Comment).postId !== undefined;
};

// Custom Avatar component to handle both local and remote images
const AvatarImage = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => {
  const isExternal = src.startsWith('http');
  
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="128px"
      className={className}
      unoptimized={isExternal}
    />
  );
};



// Define the Post and Comment interfaces with all required properties
type Post = {
  id: string;
  title: string;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  type: string;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  authorId: string;
  author: { username: string };
  communityId: string;
  community?: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

type Comment = {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  authorId: string;
  author: { username: string };
  postId: string;
  post: { title: string; community?: { name: string } | null; communityId: string };
  createdAt: string;
  updatedAt: string;
}

// Extend the User type to include the additional fields we expect
interface ExtendedUser extends Omit<User, 'upvoted' | 'downvoted' | 'posts' | 'comments'> {
  upvoted?: Array<Post | Comment>;
  downvoted?: Array<Post | Comment>;
  posts?: Post[];
  comments?: Comment[];
}

// Helper types for the profile page
interface Community {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isNsfw: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage = () => {
  // State management
  const [profile, setProfile] = useState<ExtendedUser | null>(null);
  const [loading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Helper function to safely get community name
  const getCommunityName = (post: { community?: { name: string } | null; communityId: string }): string => {
    return post.community?.name || post.communityId || 'unknown';
  };
  
  // Helper function to safely get post community info
  const getPostCommunityInfo = (post: { community?: { name: string } | null; communityId?: string }): string => {
    if (!post) return '';
    if (post.community?.name) {
      return `r/${post.community.name}`;
    }
    if (post.communityId) {
      return `r/${post.communityId}`;
    }
    return '';
  };

  // Helper function to safely render content
  const renderContent = (content: unknown): React.ReactNode => {
    if (typeof content === 'string' || typeof content === 'number') {
      return content;
    }
    return null;
  };

  // Helper function to safely get author username
  const getAuthorUsername = (author: { username?: string } | undefined): string => {
    return author?.username || 'unknown';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setError(null);
        const res = await authService.getProfile();
        if (res.data) {
          setProfile(res.data);
        } else {
          setError(res.error?.message || "Failed to load profile");
        }
      } catch (err) {
        setError("An error occurred while loading the profile");
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const renderContentType = (content: string | null) => {
    if (!content) return null;
    
    // Check if content is a URL
    try {
      const url = new URL(content);
      return url.href;
    } catch (e) {
      return content;
    }
  };

  const handleProfileUpdate = (updatedProfile: ExtendedUser) => {
    setProfile(updatedProfile);
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Profile not found</p>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error loading profile</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Handle case when profile is not found
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">The requested profile could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="overflow-hidden bg-card border border-border shadow-lg rounded-xl mb-6 dark:bg-gray-800 dark:border-gray-700">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-orange-500 to-orange-600 relative dark:from-orange-600 dark:to-orange-700">
            <div className="absolute bottom-4 right-4">
              <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
                <Edit2 className="h-4 w-4 mr-2" /> Edit Cover
              </Button>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="px-6 pb-6 relative">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
              <div className="relative group">
                <div className="relative w-32 h-32 rounded-full border-4 border-background bg-white dark:bg-gray-700 shadow-lg">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-700">
                    <AvatarImage
                      src={profile.avatarUrl || (typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src)}
                      alt={profile.username || 'User avatar'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900 transition-all duration-200 transform hover:scale-110 border-2 border-white dark:border-gray-700"
                  style={{
                    boxShadow: '0 0 0 2px var(--orange-500)'
                  }}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  {profile.username}
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800">ID: {profile.id.slice(0, 6)}...</span>
                </h2>
                <div className="flex flex-col md:flex-row gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                value={profile.reputationScore} 
                label="Reputation" 
                icon={<ThumbsUp className="h-4 w-4" />} 
                color="orange" 
              />
              <StatsCard 
                value={profile.postScore} 
                label="Post Karma" 
                icon={<MessageSquare className="h-4 w-4" />} 
                color="blue" 
              />
              <StatsCard 
                value={profile.commentScore} 
                label="Comment Karma" 
                icon={<MessageSquare className="h-4 w-4" />} 
                color="green" 
              />
              <StatsCard 
                value={profile.communityScore} 
                label="Community Karma" 
                icon={<LayoutGrid className="h-4 w-4" />} 
                color="purple" 
              />
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs 
          defaultValue="overview" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-5 h-12 mb-6 bg-muted/50 dark:bg-gray-700/50 rounded-xl p-1 border border-border dark:border-gray-700">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 transition-colors"
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Posts
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Comments
            </TabsTrigger>
            <TabsTrigger 
              value="upvoted" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 transition-colors"
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Upvoted
            </TabsTrigger>
            <TabsTrigger 
              value="downvoted" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 transition-colors"
            >
              <ThumbsDown className="h-4 w-4 mr-2" /> Downvoted
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent posts and comments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.posts?.slice(0, 3).map((post: Post) => (
                  <Card key={post.id} className="p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        {post.content && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            <HtmlContent html={post.content} className="prose-sm max-w-none" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Posted in {getPostCommunityInfo(post)}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {profile?.comments?.slice(0, 3).map((comment: Comment) => (
                  <Card key={comment.id} className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">
                          Commented on <span className="font-medium">{comment.post.title}</span>
                        </div>
                        <div className="text-foreground">
                          <HtmlContent html={comment.content} className="prose-sm max-w-none" />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{comment.upvotes - comment.downvotes} Likes</span>
                          <span>•</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!profile?.posts?.length && !profile?.comments?.length) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity to show
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Posts</CardTitle>
                <CardDescription>Posts you&apos;ve created</CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.posts?.length ? (
                      profile.posts.map((post: Post) => (
                        <Card key={post.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <span>{getPostCommunityInfo(post)}</span>
                                <span>•</span>
                                <span>Posted by u/{getAuthorUsername(post.author)}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-medium text-lg">{post.title}</h4>
                              <div className="flex gap-3 mt-2">
                                {post.imageUrl && (
                                  <div className="relative w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                      src={post.imageUrl}
                                      alt={post.title}
                                      fill
                                      className="object-cover"
                                      sizes="128px"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  {post.content && (
                                    <div className="text-sm text-muted-foreground">
                                      <HtmlContent html={post.content} className="prose-sm max-w-none" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{post.upvotes - post.downvotes} Likes</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>{post.commentCount} comments</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg font-medium">No posts yet</p>
                        <p className="text-sm mt-1">When you create a post, it will appear here.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Comments</CardTitle>
                <CardDescription>Comments you&apos;ve made</CardDescription>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.comments?.length ? (
                      profile.comments.map((comment: Comment) => (
                        <Card key={comment.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground mb-1">
                                Commented on <span className="font-medium">
                                  {renderContent(comment.post?.title) || 'a post'}
                                </span>
                                {comment.post && (
                                  <span> in {getPostCommunityInfo(comment.post as Post)}</span>
                                )}
                              </div>
                              <div className="text-foreground">
                              <HtmlContent html={comment.content} className="prose-sm max-w-none" />
                            </div>
                              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>{comment.upvotes - comment.downvotes} Likes</span>
                                </div>
                                <span>•</span>
                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg font-medium">No comments yet</p>
                        <p className="text-sm mt-1">When you make a comment, it will appear here.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upvoted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upvoted Content</CardTitle>
                <CardDescription>Posts and comments you&apos;ve upvoted</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.upvoted?.length ? (
                  <div className="space-y-4">
                    {profile.upvoted?.map((item: VotableItem) => (
                      <Card key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <ThumbsUp className="h-3 w-3 text-green-500" />
                          <span>Upvoted • {new Date('createdAt' in item ? item.createdAt : '').toLocaleDateString()}</span>
                        </div>
                        {isPost(item) ? (
                          <>
                            <h4 className="font-medium">{item.title}</h4>
                            {item.content && <p className="text-sm text-muted-foreground mt-1">{item.content}</p>}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{item.upvotes - item.downvotes} Likes</span>
                              <span>•</span>
                              <span>{item.commentCount || 0} comments</span>
                              {isPost(item) && item.communityId && (
                                <>
                                  <span>•</span>
                                  <span>{getPostCommunityInfo(item)}</span>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-foreground">{item.content}</p>
                            <div className="text-sm text-muted-foreground mt-1">
                              Comment on: {item.post?.title || 'Post'}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{item.upvotes - item.downvotes} Likes</span>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No upvoted content</p>
                    <p className="text-sm mt-1">When you upvote posts or comments, they will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downvoted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Downvoted Content</CardTitle>
                <CardDescription>Posts and comments you&apos;ve downvoted</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.downvoted?.length ? (
                  <div className="space-y-4">
                    {profile.downvoted?.map((item: VotableItem) => (
                      <Card key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <ThumbsDown className="h-3 w-3 text-red-500" />
                          <span>Downvoted • {new Date('createdAt' in item ? item.createdAt : '').toLocaleDateString()}</span>
                        </div>
                        {isPost(item) ? (
                          <>
                            <h4 className="font-medium">{item.title}</h4>
                            {item.content && <p className="text-sm text-muted-foreground mt-1">{item.content}</p>}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{item.upvotes - item.downvotes} Likes</span>
                              <span>•</span>
                              <span>{item.commentCount || 0} comments</span>
                              {'community' in item && (
                                <>
                                  <span>•</span>
                                  <span>r/{item.community?.name}</span>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-foreground">{item.content}</p>
                            <div className="text-sm text-muted-foreground mt-1">
                              Comment on: {item.post?.title || 'Post'}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{item.upvotes - item.downvotes} Likes</span>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No downvoted content</p>
                    <p className="text-sm mt-1">When you downvote posts or comments, they will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {isEditModalOpen && (
            <EditProfileModal
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              currentProfile={{
                id: profile.id,
                username: profile.username,
                email: profile.email,
                bio: profile.bio || null,
                avatarUrl: profile.avatarUrl,
                reputationScore: profile.reputationScore,
                postScore: profile.postScore,
                commentScore: profile.commentScore,
                communityScore: profile.communityScore,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
              }}
              onProfileUpdate={(updatedProfile) => {
                setProfile(prev => ({
                  ...prev!,
                  ...updatedProfile,
                  upvoted: prev?.upvoted || [],
                  downvoted: prev?.downvoted || [],
                  posts: prev?.posts || [],
                  comments: prev?.comments || []
                }));
              }}
            />
          )}
    </div>
  );
};

// Stats Card Component with color variants
const StatsCard = ({ 
  value, 
  label, 
  icon, 
  color = 'orange' 
}: { 
  value: number, 
  label: string, 
  icon: React.ReactNode,
  color?: 'orange' | 'blue' | 'green' | 'purple'
}) => {
  const colorClasses = {
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800/50',
      hover: 'hover:border-orange-300 dark:hover:border-orange-700',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      hover: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800/50',
      hover: 'hover:border-green-300 dark:hover:border-green-700',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800/50',
      hover: 'hover:border-purple-300 dark:hover:border-purple-700',
    },
  };

  const colors = colorClasses[color] || colorClasses.orange;

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 