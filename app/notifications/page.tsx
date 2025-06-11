'use client';

import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Bell, CheckCircle, Trash2, MessageSquare, Sun, Moon } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useTheme } from 'next-themes';

type Notification = Awaited<ReturnType<typeof notificationService.getNotifications>>['items'][0];

type TabType = 'notifications' | 'messages';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = async () => {
    console.log('Fetching notifications...');
    try {
      setIsLoading(true);
      console.log('Calling notificationService.getNotifications()...');
      const notificationsData = await notificationService.getNotifications();
      
      console.log('Notifications data:', notificationsData);
      
      setNotifications(notificationsData.items);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      if (error?.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error?.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationMessage = (notification: Notification) => {
    const { username } = notification.actor;
    
    switch (notification.type) {
      case 'post_upvote':
        return `${username} upvoted your post`;
      case 'comment_upvote':
        return `${username} upvoted your comment`;
      case 'new_comment':
        return `${username} commented on your post`;
      case 'comment_reply':
        return `${username} replied to your comment`;
      default:
        return 'New notification';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      setIsDeleting(true);
      // Delete all selected notifications in parallel
      await Promise.all(
        Array.from(selectedNotifications).map(id => 
          notificationService.deleteNotification(id)
        )
      );
      
      // Update the local state to remove the deleted notifications
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.has(n.id))
      );
      
      // Clear the selection
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Failed to delete notifications:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectNotification = (id: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Inbox</h1>
            <p className="text-gray-500 dark:text-gray-400">Your notifications and messages</p>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as TabType)}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-muted/50 h-10">
                <TabsTrigger value="notifications" className="px-4 py-2">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="messages" className="px-4 py-2" disabled>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'notifications' && notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllNotifications}
                      className="text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700"
                    >
                      {selectedNotifications.size === notifications.length ? 'Deselect all' : 'Select all'}
                    </Button>
                    {selectedNotifications.size > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className="text-xs flex items-center gap-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete ({selectedNotifications.size})
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleMarkAllAsRead}
                      className="text-xs flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-800/30"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark all as read
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Bell className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">No notifications yet</p>
                      <p className="text-sm mt-1">When you get notifications, they&apos;ll appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 hover:bg-muted/50 transition-colors flex items-start gap-3 ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNotifications.has(notification.id)}
                            onChange={() => toggleSelectNotification(notification.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800 dark:border-gray-600"
                          />
                          <div className="flex-1 flex items-start gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0 border border-orange-200 dark:border-orange-800">
                              <AvatarImage src={notification.actor.avatarUrl} alt={notification.actor.username} />
                              <AvatarFallback className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300">
                                {notification.actor.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {notification.actor.username}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                                )}
                              </div>
                              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                                {getNotificationMessage(notification)}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="text-xs h-7 px-2 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your messages</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    When you receive messages, they&apos;ll appear here. This feature is coming soon!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
