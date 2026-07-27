import { useBadgeStore } from '@/store/badgeStore';

export const useBadges = () => {
  const store = useBadgeStore();
  
  return {
    badges: store.badges,
    setBadge: store.setBadge
  };
};

export const BadgeProvider = ({ children }) => {
  return children;
};
