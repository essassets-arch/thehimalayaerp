import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  toasts: [],
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  isMarkingAllRead: false,
  addNotification: (notification: any) => set((state: any) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + (notification.isRead || notification.is_read ? 0 : 1),
    totalCount: state.totalCount + 1
  })),
  showToast: (message: string) => set((state: any) => ({
    toasts: [...state.toasts, { id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, message }]
  })),
  dismissToast: (id: string) => set((state: any) => ({
    toasts: state.toasts.filter((t: any) => t.id !== id)
  })),
  markAllAsRead: () => set((state: any) => ({
    notifications: state.notifications.map((n: any) => ({ ...n, is_read: true })),
    unreadCount: 0
  }))
}));
