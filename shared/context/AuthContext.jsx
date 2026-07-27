import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    user: store.user,
    role: store.role,
    isAuthenticated: store.isAuthenticated,
    login: async (email, password) => {
      // Logic handled in login page, but we'll mock for backward compat if needed
      return null;
    },
    logout: store.logout,
    switchRole: (role) => store.login(role, store.user),
    allRoles: [
      'Sales', 'Sales Admin', 'Plant Head', 'Production', 
      'Store', 'QC', 'Dispatch', 'Finance Executive', 'Finance', 
      'HR', 'Admin', 'Super Admin'
    ],
    userMenu: [] // Will need proper config mapping based on role
  };
};

export const AuthProvider = ({ children }) => {
  return children;
};
