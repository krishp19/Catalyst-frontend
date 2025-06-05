'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Community } from '../../../src/services/communityService';
import { communityService } from '../../../src/services/communityService';
import { postService, Post, PostSort } from '../../../src/services/postService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Share2, 
  Flag, 
  Plus,
  ArrowUp, 
  ArrowDown, 
  MessageCircle,
  Pin,
  MoreHorizontal,
  Link as LinkIcon,
  Bookmark,
  FileText,
  MessageSquareMore
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../src/hooks/useAuth';

interface CommunityPageClientProps {
  initialCommunity: Community;
}

export default function CommunityPageClient({ initialCommunity }: CommunityPageClientProps) {
  const [community, setCommunity] = useState<Community>(initialCommunity);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<PostSort>(PostSort.HOT);

  const sortOptions = [PostSort.HOT, PostSort.NEW, PostSort.TOP];

  const PinIcon = Pin;
  const DotsHorizontalIcon = MoreHorizontal;
  const BookmarkIcon = Bookmark;
  const DocumentTextIcon = FileText;
  const ChatBubbleLeftIcon = MessageSquareMore;
  const ArrowUpIcon = ArrowUp;
  const ArrowDownIcon = ArrowDown;
  const ShareIcon = Share2;

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const memberStatus = await communityService.isMember(community.id);
        setIsMember(memberStatus);
      } catch (error) {
        console.error('Error checking membership:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [community.id]);

  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await postService.getPosts({
          communityId: community.id,
          page: currentPage,
          limit: 10,
          sort
        });
        setPosts(response.items);
        setTotalPages(response.meta.totalPages);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to fetch posts');
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [community.id, currentPage, sort]);

  const handleJoin = async () => {
    try {
      if (isMember) {
        await communityService.leaveCommunity(community.id);
        toast.success('Successfully left the community');
        setIsMember(false);
      } else {
        await communityService.joinCommunity(community.id);
        toast.success('Successfully joined the community');
        setIsMember(true);
      }
    } catch (error) {
      toast.error('Failed to update membership');
      console.error('Error updating membership:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        {community.bannerUrl ? (
          <Image
            src={community.bannerUrl}
            alt={`${community.name} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Community Info */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative -mt-16 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg border border-orange-100 dark:border-orange-900/30 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={community.iconUrl} alt={community.name} />
                <AvatarFallback className="bg-orange-500 text-white text-2xl">
                  {community.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  r/{community.name}
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  {community.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-orange-500" />
                    <span>{community.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-orange-500" />
                    <span>Created by u/{community.creator.username}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              <Button
                onClick={handleJoin}
                variant={isMember ? "outline" : "default"}
                className={`w-full md:w-auto transition-all duration-200 ${
                  isMember 
                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isMember ? 'Leave' : 'Join'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full md:w-auto border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all duration-200"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Posts</h2>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={sort === PostSort.HOT ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSort(PostSort.HOT)}
                      className={`transition-all duration-200 ${
                        sort === PostSort.HOT ? 'bg-orange-500 hover:bg-orange-600' : ''
                      }`}
                    >
                      Hot
                    </Button>
                    <Button
                      variant={sort === PostSort.NEW ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSort(PostSort.NEW)}
                      className={`transition-all duration-200 ${
                        sort === PostSort.NEW ? 'bg-orange-500 hover:bg-orange-600' : ''
                      }`}
                    >
                      New
                    </Button>
                    <Button
                      variant={sort === PostSort.TOP ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSort(PostSort.TOP)}
                      className={`transition-all duration-200 ${
                        sort === PostSort.TOP ? 'bg-orange-500 hover:bg-orange-600' : ''
                      }`}
                    >
                      Top
                    </Button>
                  </div>
                </div>
                <Link 
                  href={`/create-post?communityId=${community.id}`}
                  className="inline-flex"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              </div>
              <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
              
              {/* Posts Section */}
              <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Loading State */}
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        {/* Post Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <img
                                  src={post.author.avatarUrl || '/default-avatar.png'}
                                  alt={post.author.username}
                                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                                />
                                {post.isPinned && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                                    <PinIcon className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {post.author.username}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">•</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Posted in r/{post.community.name}
                                </div>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <DotsHorizontalIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-4">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-500 transition-colors duration-200">
                            {post.title}
                          </h2>
                          {post.type === 'text' && (
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {post.content}
                            </p>
                          )}
                          {post.type === 'image' && post.imageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-200"
                              />
                            </div>
                          )}
                          {post.type === 'link' && post.linkUrl && (
                            <a
                              href={post.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center text-blue-500 hover:text-blue-600"
                            >
                              <LinkIcon className="w-4 h-4 mr-1" />
                              {post.linkUrl}
                            </a>
                          )}
                        </div>

                        {/* Post Footer */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200">
                                <ArrowUpIcon className="w-5 h-5" />
                                <span>{post.upvotes}</span>
                              </button>
                              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200">
                                <ArrowDownIcon className="w-5 h-5" />
                                <span>{post.downvotes}</span>
                              </button>
                              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                <span>{post.commentCount} Comments</span>
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                                <BookmarkIcon className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                                <ShareIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <DocumentTextIcon className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Be the first to share something in this community!
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {posts.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Page {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* About Community */}
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-orange-100 dark:border-orange-900/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About Community</h3>
              <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Description</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {community.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Created</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(community.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Members</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {community.memberCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Community Rules */}
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-orange-100 dark:border-orange-900/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Rules</h3>
              <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Be respectful and follow Reddit's content policy.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 