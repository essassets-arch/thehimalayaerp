import { create } from 'zustand';

interface NotificationItem {
  id: string;
  companyId: string;
  userId: string;
  type: string;
  module?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  is_read?: boolean;
  createdAt: string;
}

interface NotificationState {
  toasts: Array<{ id: string; message: string }>;
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isMarkingAllRead: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Partial<NotificationItem>) => void;
  showToast: (message: string) => void;
  dismissToast: (id: string) => void;
  clearNotifications: () => void;
}

const getStoreToken = () => {
  if (typeof window === 'undefined') return null;
  const hasAuthStorage = localStorage.getItem('auth-storage');
  let token = localStorage.getItem('token');
  if (!token && hasAuthStorage) {
    try {
      const auth = JSON.parse(hasAuthStorage);
      token = auth?.state?.accessToken || auth?.state?.token;
    } catch (e) {}
  }
  return token;
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const hasAuthStorage = localStorage.getItem('auth-storage');
  if (hasAuthStorage) {
    try {
      const auth = JSON.parse(hasAuthStorage);
      return auth?.state?.user || null;
    } catch (e) {}
  }
  return null;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,
  isMarkingAllRead: false,

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      isLoading: false,
      isMarkingAllRead: false,
    });
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const token = getStoreToken();
      if (!token) {
        set({ notifications: [], unreadCount: 0, totalCount: 0, isLoading: false });
        return;
      }

      const res = await fetch('/api/backend/notifications?limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        const rawItems = data.items || data.notifications || data || [];
        const items = Array.isArray(rawItems) ? rawItems : [];

        const user = getStoredUser();
        const role = String(user?.role?.code || user?.role || '').toUpperCase();
        const email = String(user?.email || '').toLowerCase();
        const isD2 = role === 'DISPATCH_2' || email.includes('sahad');
        const isD1 =
          (['DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH'].includes(role) ||
            email.includes('ravikant')) &&
          !isD2;

        let filteredItems = items;
        if (isD2) {
          filteredItems = items.filter((n: any) => {
            const r = String(n.route || '');
            const t = String(n.type || '').toUpperCase();
            const tit = String(n.title || '').toLowerCase();
            const msg = String(n.message || '').toLowerCase();
            if (r.startsWith('/dispatch') && !r.startsWith('/dispatch-2')) return false;
            if (t.includes('DISPATCH_1') || n.entityType === 'WorkOrder') return false;
            if (tit.includes('dispatch 1') || tit.includes('factory')) return false;
            if (msg.includes('dispatch 1') || msg.includes('factory')) return false;
            return true;
          });
        } else if (isD1) {
          filteredItems = items.filter((n: any) => {
            const r = String(n.route || '');
            const t = String(n.type || '').toUpperCase();
            const tit = String(n.title || '').toLowerCase();
            const msg = String(n.message || '').toLowerCase();
            if (r.startsWith('/dispatch-2')) return false;
            if (t.includes('DISPATCH_2')) return false;
            if (tit.includes('dispatch 2') || tit.includes('sahad')) return false;
            if (msg.includes('dispatch 2') || msg.includes('sahad')) return false;
            return true;
          });
        }

        const unread = filteredItems.filter((n: any) => !n.isRead && !n.is_read).length;

        set({
          notifications: filteredItems.map((n: any) => ({
            ...n,
            module: n.module || 'SYSTEM',
            priority: n.priority || 'MEDIUM',
            isRead: Boolean(n.isRead ?? n.is_read),
            is_read: Boolean(n.isRead ?? n.is_read),
          })),
          unreadCount: unread,
          totalCount: filteredItems.length,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('[NotificationStore] Fetch failed:', err);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const token = getStoreToken();
      if (!token) return;

      const res = await fetch('/api/backend/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (typeof data.unreadCount === 'number') {
          set({ unreadCount: data.unreadCount });
        }
      }
    } catch (err) {
      console.warn('[NotificationStore] Unread count fetch failed:', err);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      const token = getStoreToken();
      if (!token) return;

      await fetch(`/api/backend/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('[NotificationStore] Mark read failed:', err);
      // Re-sync with backend
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    set({ isMarkingAllRead: true });
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true, is_read: true })),
      unreadCount: 0,
    }));

    try {
      const token = getStoreToken();
      if (token) {
        await fetch('/api/backend/notifications/read-all', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn('[NotificationStore] Mark all read failed:', err);
      get().fetchNotifications();
    } finally {
      set({ isMarkingAllRead: false });
    }
  },

  addNotification: (notification: Partial<NotificationItem>) =>
    set((state) => {
      const isRead = Boolean(notification.isRead ?? notification.is_read);
      const newItem: NotificationItem = {
        id: notification.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        companyId: notification.companyId || '',
        userId: notification.userId || '',
        type: notification.type || 'GENERAL',
        module: notification.module || 'SYSTEM',
        priority: notification.priority || 'MEDIUM',
        title: notification.title || 'Notification',
        message: notification.message || '',
        route: notification.route,
        entityType: notification.entityType,
        entityId: notification.entityId,
        isRead,
        is_read: isRead,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      return {
        notifications: [newItem, ...state.notifications],
        unreadCount: state.unreadCount + (isRead ? 0 : 1),
        totalCount: state.totalCount + 1,
      };
    }),

  showToast: (message: string) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          message,
        },
      ],
    })),

  dismissToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
