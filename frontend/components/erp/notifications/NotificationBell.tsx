'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      // In a real app, you would query the specific user's notifications
      // For this prototype, we'll just mock it or query a stub endpoint
      try {
        const res = await axios.get<Notification[]>('/api/backend/notifications/unread');
        return res.data;
      } catch (e) {
        return []; // Fallback for prototype
      }
    },
    refetchInterval: 30000, // Poll every 30s
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-blue-600 hover:underline cursor-pointer">
              Mark all read
            </span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-medium text-gray-900 leading-tight">
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap mt-0.5">
                      {formatDistanceToNow(new Date(notification.createdAt))}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 line-clamp-2">
                    {notification.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
