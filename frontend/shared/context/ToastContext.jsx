import { useNotificationStore } from '@/store/notificationStore';

export const useToast = () => {
  const store = useNotificationStore();
  
  return {
    addToast: store.showToast,
    removeToast: store.dismissToast,
    showToast: store.showToast
  };
};

export const ToastProvider = ({ children }) => {
  return children;
};
