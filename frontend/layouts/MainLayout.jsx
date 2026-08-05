'use client';

import { useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import HeroBanner from '../components/HeroBanner';
import ToastContainer from '../components/ToastContainer';
import { useAuth } from '../shared/context/AuthContext';
import { useERP } from '../shared/context/ERPContext';
import { useNotifications } from '../shared/context/NotificationContext';
import { useBadges } from '../shared/context/BadgeContext';

import { navigationConfig } from '../app/navigationConfig';
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

export default function MainLayout() {
  const { user, userMenu } = useAuth();
  const { state } = useERP();

  const navigate = useRouter();
  const location = { pathname: usePathname(), search: "" };
  const { badges = {} } = useBadges() || {};

  const getBadgeKey = (itemId, role) => {
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
  const { toasts = [], showToast, dismissToast } = useNotifications() || {};
  const [globalSearch, setGlobalSearch] = useState('');

  const removeToast = (id) => {
    if (dismissToast) dismissToast(id);
  };

  const handleActionClick = (actionName, message) => {
    if (showToast) showToast(message);
  };

  let baseNavItems = [];
  if (user && userMenu && userMenu.length > 0) {
    baseNavItems = userMenu;
  }

  const navItems = baseNavItems.map(item => {
    if (typeof item.icon === 'string') {
      const LucideIcon = Lucide[item.icon];
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

  return (
    <div className={`app-container ${user ? `role-${user.role.toLowerCase().replace(/\s+/g, '-')}` : ''}`}>
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
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="35" r="14" fill="#dcf26b" />
                <circle cx="33" cy="65" r="14" fill="#a0c544" />
                <circle cx="67" cy="65" r="14" fill="#6a9b2b" />
                <path d="M50 35 L33 65 L67 65 Z" fill="rgba(220, 242, 107, 0.2)" />
              </svg>
            </div>
            <span className="mobile-brand-title">Himalaya</span>
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
        {!location.pathname.includes('daily-task') && (
          <HeroBanner
            stats={user?.role === 'Super Admin' ? [] : getRoleStats()}
            notifications={state.notifications || []}
            searchQuery={globalSearch}
            setSearchQuery={setGlobalSearch}
            onNavigate={(id) => {
              if (id === 'Logout') {
                router.push('/login');
              }
            }}
            onAddLead={() => router.push('/sales/leads')}
            onCreateQuote={() => router.push('/sales/quotations')}
            onActionClick={handleActionClick}
            isDashboard={location.pathname.endsWith('/dashboard')}
          />
        )}

        {/* Dynamic Route Content */}
        <Suspense fallback={<PageLoader />}>
          <Outlet context={{ showToast, globalSearch, setGlobalSearch }} />
        </Suspense>


      </main>

      {/* Dynamic Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}
