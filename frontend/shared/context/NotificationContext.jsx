import { useNotificationStore } from '@/store/notificationStore';

export const useNotifications = () => {
  const store = useNotificationStore();
  
  return {
    toasts: store.toasts,
    showToast: store.showToast,
    dismissToast: store.dismissToast,
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    totalCount: store.totalCount,
    isMarkingAllRead: store.isMarkingAllRead,
    markAllAsRead: store.markAllAsRead,
    addNotification: store.addNotification
  };
};

export const NotificationProvider = ({ children }) => {
  return children;
};
