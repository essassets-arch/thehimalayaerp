import { useNotificationStore } from '@/store/notificationStore';
import { useShallow } from 'zustand/react/shallow';

export const useToast = () => {
  return useNotificationStore(
    useShallow((state) => ({
      addToast: state.showToast,
      removeToast: state.dismissToast,
      showToast: state.showToast
    }))
  );
};

export const ToastProvider = ({ children }) => {
  return children;
};
