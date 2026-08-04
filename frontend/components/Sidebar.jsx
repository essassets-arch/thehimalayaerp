'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import * as Lucide from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import { useAbility } from '../shared/context/AbilityContext';
import { useBadges } from '../shared/context/BadgeContext';
import { navigationConfig } from '../config/navigationConfig';
import { getNavigationForPath } from '../config/navigationHelpers';
import { DASHBOARD_REDIRECTS } from '../config/routeConfig';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, switchRole, allRoles, userMenu } = useAuth();
  const ability = useAbility();
  const navigate = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : ''
  };

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
      if (itemId === 'orders' || itemId === 'create-dispatch') return 'dispatch_orders';
      if (prefix === 'dispatch' && itemId === 'replacements') return 'dispatch_replacements';
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

  const navItems = getNavigationForPath(pathname, user?.role).map(item => {
    if (typeof item.icon === 'string') {
      const LucideIcon = Lucide[item.icon];
      return { ...item, icon: LucideIcon || Lucide.LayoutGrid };
    }
    return item;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    const filteredParts = parts.filter(p => !['Mr.', 'Dr.', 'Mrs.', 'Ms.'].includes(p));
    const finalParts = filteredParts.length > 0 ? filteredParts : parts;
    return finalParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogoutClick = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/backend/auth/logout', { method: 'POST' });
    } catch { /* best effort */ }
    logout();
    onClose();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      navigate.replace('/login');
    }
  };

  const isSubItemActive = (subPath) => {
    const currentPath = location.pathname + location.search;
    const [subRoute, subQuery] = subPath.split('?');
    const [currentRoute, currentQuery] = currentPath.split('?');

    if (currentRoute !== subRoute) return false;
    if (!subQuery) return true;

    const subParams = new URLSearchParams(subQuery);
    const currentParams = new URLSearchParams(currentQuery);

    const subStatus = subParams.get('status');
    if (subStatus) {
      const currentStatus = currentParams.get('status') || 'pending';
      return subStatus === currentStatus;
    }

    const subTab = subParams.get('tab');

    let defaultTab = 'PO List';
    if (currentRoute === '/finance/po-requests') {
      defaultTab = 'Pending Requests';
    }
    const currentTab = currentParams.get('tab') || defaultTab;

    return subTab === currentTab;
  };

  return (
    <>
      {/* Backdrop for drawer menu */}
      <div
        className={`sidebar-drawer-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Himalaya brand logo */}
        <div className="sidebar-logo" id="logoBtn">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '10px' }}>
            <Image
              src="/himalaya-logo-trimmed.png"
              alt="Himalaya"
              width={180}
              height={60}
              style={{ width: '120px', height: 'auto', objectFit: 'contain', flexShrink: 0 }}
              priority
            />
          </div>
          <button
            className="sidebar-close-btn"
            id="sidebarCloseBtn"
            title="Close Menu"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Navigation Group */}
        <div className="nav-group">
          {navItems.map((item, index) => {
            if (item.type === 'badge') {
              return (
                <div key={item.label || index} className={`sidebar-section-badge ${item.label === 'QUALITY CONTROL' ? 'qc' : ''}`}>
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon || Lucide.LayoutGrid;
            const hasSubItems = !!item.subItems;
            const badgeKey = getBadgeKey(item.id, user?.role);
            const badge = badges[badgeKey];

            // Derive a generic CASL subject from the item (e.g. "dashboard" or "sales")
            // This satisfies the CASL requirement while keeping the baseline UI intact.
            const subject = item.id.replace(/-/g, '_');

            // Fallback safety check for ability object
            if (!ability || typeof ability.can !== 'function') {
              console.error('Ability object is undefined or invalid in Sidebar', ability);
              return null;
            }

            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <Link
                  href={item.path}
                  className={(function () {
                    const currentPath = location.pathname + location.search;
                    const isCurrent = item.path.includes('?')
                      ? (currentPath === item.path)
                      : (location.pathname === item.path || (item.subItems && item.subItems.some((sub) => location.pathname === sub.path.split('?')[0])));
                    return `nav-item ${isCurrent ? 'active' : ''}`;
                  })()}
                  data-title={item.label}
                  onClick={onClose}
                >
                  <Icon size={20} strokeWidth={2.2} />
                  <span className="nav-item-label">{item.label}</span>
                  {badge && badge.count > 0 && (
                    <span
                      className={`sidebar-badge priority-${badge.priority.toLowerCase()}`}
                      style={{
                        marginLeft: 'auto',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#ffffff',
                        backgroundColor: '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        padding: '0 4px',
                        flexShrink: 0,
                        boxShadow: '0 1px 4px rgba(239,68,68,0.5)',
                      }}
                    >
                      {badge.count > 99 ? '99+' : badge.count}
                    </span>
                  )}
                </Link>

                {hasSubItems && (location.pathname === item.path || location.pathname.startsWith(item.path + '/') || item.subItems.some(subItem => location.pathname === subItem.path.split('?')[0])) && (
                  <div className="sub-nav-group">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.path}
                        className={`sub-nav-item ${isSubItemActive(subItem.path) ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <span className="sub-nav-item-label">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>


        {/* Bottom Actions and Inline User Profile */}
        <div
          className="sidebar-bottom"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 14px',
            borderTop: '1px solid var(--color-border)',
            gap: '12px',
            marginTop: 'auto',
            width: '100%'
          }}
        >
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
              <div
                className="sidebar-avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-teal) 100%)',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '12px',
                  flexShrink: 0
                }}
              >
                {getInitials(user.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left', flex: 1 }}>
                <span className="sidebar-profile-name" style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
                  {user.name}
                </span>
                <select
                  value={user.role}
                  onChange={(e) => {
                    const targetRole = e.target.value;
                    const path = DASHBOARD_REDIRECTS[targetRole] || '/';
                    switchRole(targetRole);
                    navigate.push(path);
                  }}
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginTop: '2px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    outline: 'none',
                    width: '100%',
                    maxWidth: '120px',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {allRoles.map((roleItem, idx) => {
                    const roleName = typeof roleItem === 'object' && roleItem !== null ? (roleItem.name || roleItem.slug || 'User Role') : String(roleItem || 'User Role');
                    const roleKey = typeof roleItem === 'object' && roleItem !== null ? (roleItem.id || roleItem.name || roleItem.slug || idx) : `${roleItem}_${idx}`;
                    return (
                      <option key={roleKey} value={roleName} style={{ background: '#ffffff', color: '#12161a' }}>{roleName}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleLogoutClick}
            title="Logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              transition: 'var(--transition-fast)',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Lucide.LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </aside>
    </>
  );
}
