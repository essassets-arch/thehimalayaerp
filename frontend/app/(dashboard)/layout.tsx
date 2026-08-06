'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import HeroBanner from '@/components/HeroBanner';
import ToastContainer from '@/components/ToastContainer';
import { useAuthStore } from '@/store/authStore';
import { useERPStore } from '@/store/erpStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useBadgeStore } from '@/store/badgeStore';
import { ERPProvider } from '@/shared/context/ERPContext';
import MockDataSeeder from '@/components/MockDataSeeder';
import { getNavigationForPath, getModuleKeyFromPath } from '@/config/navigationHelpers';
import AuthGuard from '@/shared/components/AuthGuard';

import * as Lucide from 'lucide-react';
import { Box, Wrench, ShieldAlert, Award, MoreHorizontal, LayoutGrid } from 'lucide-react';

const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    color: '#fff',
    gap: '12px'
  }}>
    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Loading Workspace...</div>
    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Synchronizing environment node</div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s: any) => s.user);
  const userMenu = useAuthStore((s: any) => s.userMenu) || [];
  const state = useERPStore((s: any) => s.state);
  
  const router = useRouter();
  const pathname = usePathname();
  const badges = useBadgeStore((s: any) => s.badges);

  const getBadgeKey = (itemId: string, role: string) => {
    let prefix = String(role).toLowerCase().replace(/\s+/g, '_');
    if (prefix === 'plant_head') prefix = 'plant';
    
    if (prefix === 'store') {
      if (itemId === 'material-requests') return 'store_material_requests';
      if (itemId === 'low-stock-alerts') return 'store_low_stock_alerts';
    }
    if (prefix === 'qc' && itemId === 'pending') {
      return 'qc_pending';
    }
    if (prefix === 'dispatch') {
      if (itemId === 'orders') return 'dispatch_orders';
      if (itemId === 'replacements') return 'dispatch_replacements';
    }
    if (prefix === 'finance_executive') {
      if (itemId === 'payment-verification') return 'finance_payment_verification';
    }
    if (prefix === 'hr') {
      if (itemId === 'leaves') return 'hr_leaves';
    }
    
    const normalizedItem = String(itemId).replace(/-/g, '_');
    return `${prefix}_${normalizedItem}`;
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const toasts = useNotificationStore((s: any) => s.toasts);
  const showToast = useNotificationStore((s: any) => s.showToast);
  const dismissToast = useNotificationStore((s: any) => s.dismissToast);
  
  const [globalSearch, setGlobalSearch] = useState('');

  const removeToast = (id: number) => {
    if (dismissToast) dismissToast(id);
  };

  const handleActionClick = (actionName: string, message: string) => {
    if (showToast) showToast(message);
  };

  const baseNavItems = getNavigationForPath(pathname, user?.role);

  const navItems = baseNavItems
    .filter((item: any) => item.type !== 'badge' && item.id)
    .map((item: any) => {
    if (typeof item.icon === 'string') {
      const LucideIcon = (Lucide as any)[item.icon];
      return { ...item, icon: LucideIcon || LayoutGrid };
    }
    return item;
  });

  const primaryBottomNavItems = navItems.length > 4 ? navItems.slice(0, 3) : navItems;
  const secondaryBottomNavItems = navItems.length > 4 ? navItems.slice(3) : [];
  const hasMore = secondaryBottomNavItems.length > 0;

  const getRoleStats = () => {
    return [];
  };

  // Hydration fix for Zustand
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const routeModule = pathname?.split('/').filter(Boolean)[0];
  const roleClass = routeModule
    ? `role-${routeModule}`
    : user ? `role-${user.role.toLowerCase().replace(/\s+/g, '-')}` : '';

  return (
    <AuthGuard>
    <ERPProvider>
      <div className={`app-container ${roleClass}`}>
      <MockDataSeeder />
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <main className="main-viewport">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="mobile-header">
          <div className="mobile-header-left">
            <div className="mobile-logo">
              <Image src="/himalaya-logo-trimmed.png" alt="Himalaya" width={240} height={80} style={{ width: '150px', height: 'auto', objectFit: 'contain' }} priority />
            </div>
          </div>
          <button
            className="mobile-menu-toggle"
            id="mobileMenuToggle"
            title="Open Menu"
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>
        </div>

        {/* Global Header & Hero Stats */}
        <HeroBanner
          stats={(((user as any)?.role === 'Super Admin') ? [] : getRoleStats()) as any}
          notifications={state.notifications || []}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          onNavigate={async (id: string) => {
            if (id === 'Logout') {
              try {
                await fetch('/api/backend/auth/logout', { method: 'POST' });
              } catch { /* best effort */ }
              useAuthStore.getState().logout();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              } else {
                router.push('/login');
              }
            }
          }}
          onAddLead={() => router.push('/sales/leads')}
          onCreateQuote={() => router.push('/sales/quotations')}
          onActionClick={handleActionClick}
          isDashboard={pathname.endsWith('/dashboard')}
        />

        {/* Dynamic Route Content */}
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>

        {/* Mobile Bottom Tab Bar */}
        <div className="mobile-bottom-nav">
          <a
            className="mobile-nav-item"
            onClick={() => {
              const moduleKey = getModuleKeyFromPath(pathname) || 'Sales';
              const prefix = {
                'Sales': '/sales',
                'Production': '/production',
                'Plant Head': '/plant-head',
                'Store': '/store',
                'QC': '/qc',
                'Dispatch': '/dispatch',
                'Finance Executive': '/finance-executive',
                'Finance': '/finance',
                'HR': '/hr',
                'Admin': '/admin',
                'Super Admin': '/super-admin'
              }[moduleKey] || '/sales';
              router.push(`${prefix}/dashboard`);
            }}
            style={{ cursor: 'pointer' }}
          >
            <span style={{ fontSize: '20px' }}>🏠</span>
            <span>Dashboard</span>
          </a>

          <a
            className="mobile-nav-item"
            onClick={() => {
              const moduleKey = getModuleKeyFromPath(pathname) || 'Sales';
              const prefix = {
                'Sales': '/sales',
                'Production': '/production',
                'Plant Head': '/plant-head',
                'Store': '/store',
                'QC': '/qc',
                'Dispatch': '/dispatch',
                'Finance Executive': '/finance-executive',
                'Finance': '/finance',
                'HR': '/hr',
                'Admin': '/admin',
                'Super Admin': '/super-admin'
              }[moduleKey] || '/sales';
              router.push(`${prefix}/profile`);
            }}
            style={{ cursor: 'pointer' }}
          >
            <span style={{ fontSize: '20px' }}>👤</span>
            <span>My Profile</span>
          </a>

          <a
            className="mobile-nav-item"
            onClick={() => {
              const roleCode = String(user?.role?.code || '').toUpperCase();
              const moduleKey = getModuleKeyFromPath(pathname) || 'Sales';
              const prefix = {
                'Sales': '/sales',
                'Production': '/production',
                'Plant Head': '/plant-head',
                'Store': '/store',
                'QC': '/qc',
                'Dispatch': '/dispatch',
                'Finance Executive': '/finance-executive',
                'Finance': '/finance',
                'HR': '/hr',
                'Admin': '/admin',
                'Super Admin': '/super-admin'
              }[moduleKey] || '/sales';
              
              if (roleCode.includes('HR') || roleCode.includes('SUPER_ADMIN')) {
                router.push(`${prefix}/expense-management`);
              } else {
                router.push(`${prefix}/profile`);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <span style={{ fontSize: '20px' }}>🪙</span>
            <span>Expenses</span>
          </a>
        </div>

      </main>

      {/* Dynamic Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
    </ERPProvider>
    </AuthGuard>
  );
}
