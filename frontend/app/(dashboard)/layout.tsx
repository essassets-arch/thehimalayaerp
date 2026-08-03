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
import { getNavigationForPath } from '@/config/navigationHelpers';
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
    if (user?.role === 'Super Admin') return [];

    const orders = state.orders || [];
    const samples = state.samples || [];
    const rawInv = state.rawInventory || [];

    const runningOrders = orders.filter((o: any) => o.productionStatus === 'Running').length;
    const pendingSamples = samples.filter((s: any) => s.status === 'Pending').length;
    const lowStock = rawInv.filter((i: any) => i.stock <= i.reorderLevel).length;

    return [
      { id: 'role-title', title: 'Session Role', value: user?.role || 'Guest', subtext: 'Access Level Active', theme: 'students-theme', icon: Award, action: 'Role', msg: `Logged in as ${user?.role}` },
      { id: 'active-orders', title: 'Running Orders', value: runningOrders, subtext: 'Production Running', theme: 'blue-theme', icon: Wrench, action: 'Orders', msg: 'Navigating to Orders...' },
      { id: 'pending-requests', title: 'Low Stock Items', value: lowStock, subtext: 'Awaiting Refill', theme: 'amber-theme', icon: Box, action: 'Stock', msg: 'Awaiting restocking check...' },
      { id: 'pending-samples', title: 'Pending Samples', value: pendingSamples, subtext: 'Testing Queue', theme: 'faculty-theme', icon: ShieldAlert, action: 'Samples', msg: 'Navigating to Samples...' }
    ];
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
              router.push('/login');
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

      </main>

      {/* Dynamic Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile Sticky Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {primaryBottomNavItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          const badgeKey = getBadgeKey(item.id, user?.role);
          const badge = badges[badgeKey];
          return (
            <div
              key={item.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
              onClick={() => {
                router.push(item.path);
                setIsMoreMenuOpen(false);
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {badge && badge.count > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '0px',
                    right: '8px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    fontSize: '9px',
                    fontWeight: '800',
                    color: '#ffffff',
                    backgroundColor: '#ef4444',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    lineHeight: 1,
                    boxShadow: '0 1px 4px rgba(239,68,68,0.5)',
                  }}
                >
                  {badge.count > 9 ? '9+' : badge.count}
                </span>
              )}
            </div>
          );
        })}

        {hasMore && (
          <div
            className={`mobile-nav-item ${secondaryBottomNavItems.some((item: any) => pathname === item.path) ? 'active' : ''}`}
            onClick={() => setIsMoreMenuOpen(prev => !prev)}
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </div>
        )}
      </div>

      {/* More Menu Backdrop Overlay */}
      <div
        className={`more-menu-backdrop ${isMoreMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMoreMenuOpen(false)}
      ></div>

      {/* More Menu Bottom Drawer Sheet */}
      <div className={`more-menu-sheet ${isMoreMenuOpen ? 'open' : ''}`}>
        <div className="more-menu-handle" onClick={() => setIsMoreMenuOpen(false)}></div>
        <h3 className="more-menu-title">Select Module</h3>
        <div className="more-menu-grid">
          {secondaryBottomNavItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const badgeKey = getBadgeKey(item.id, user?.role);
            const badge = badges[badgeKey];
            return (
              <div
                key={item.id}
                className={`more-menu-item ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
                onClick={() => {
                  router.push(item.path);
                  setIsMoreMenuOpen(false);
                }}
              >
                <Icon size={24} />
                <span>{item.label}</span>
                {badge && badge.count > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '12px',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      fontSize: '9px',
                      fontWeight: '800',
                      color: '#ffffff',
                      backgroundColor: '#ef4444',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      lineHeight: 1,
                      boxShadow: '0 1px 4px rgba(239,68,68,0.5)',
                    }}
                  >
                    {badge.count > 9 ? '9+' : badge.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </ERPProvider>
    </AuthGuard>
  );
}
