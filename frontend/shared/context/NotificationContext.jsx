'use client';

import React, { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useShallow } from 'zustand/react/shallow';
import { initializePushNotifications } from '@/shared/firebase/messaging';

import { useAuthStore } from '@/store/authStore';

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
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken && typeof window !== 'undefined') {
      // 1. Initial fetch of unread notifications from DB
      fetchNotifications();

      // 2. Initialize Firebase Push Notifications
      initializePushNotifications().catch((e) =>
        console.error('[NotificationProvider] Failed to init FCM push:', e)
      );

      // 3. Poll the full collection as a delivery-independent fallback.  Polling
      // only the count can leave the badge updated while the bell panel remains
      // empty whenever an FCM foreground message is missed.
      const interval = setInterval(() => {
        const { fetchNotifications, fetchUnreadCount } = useNotificationStore.getState();
        fetchNotifications().catch((e) =>
          console.warn('[NotificationProvider] Failed to poll notifications:', e)
        );
        fetchUnreadCount().catch((e) =>
          console.warn('[NotificationProvider] Failed to poll unread count:', e)
        );
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [fetchNotifications, accessToken]);

  return children;
};
