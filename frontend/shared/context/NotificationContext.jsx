'use client';

import React, { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useShallow } from 'zustand/react/shallow';
import { initializePushNotifications } from '@/shared/firebase/messaging';

export const useNotifications = () => {
  return useNotificationStore(
    useShallow((state) => ({
      toasts: state.toasts,
      showToast: state.showToast,
      dismissToast: state.dismissToast,
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      totalCount: state.totalCount,
      isLoading: state.isLoading,
      isMarkingAllRead: state.isMarkingAllRead,
      fetchNotifications: state.fetchNotifications,
      fetchUnreadCount: state.fetchUnreadCount,
      markAsRead: state.markAsRead,
      markAllAsRead: state.markAllAsRead,
      addNotification: state.addNotification,
    }))
  );
};

export const NotificationProvider = ({ children }) => {
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAuthStorage = localStorage.getItem('auth-storage');
      let token = localStorage.getItem('token');
      if (!token && hasAuthStorage) {
        try {
          const auth = JSON.parse(hasAuthStorage);
          token = auth?.state?.token;
        } catch (e) {}
      }
      if (token) {
        // Initial fetch of unread notifications from DB
        fetchNotifications();
        // Initialize Firebase Push Notifications
        initializePushNotifications();
      }
    }
  }, [fetchNotifications]);

  return children;
};
