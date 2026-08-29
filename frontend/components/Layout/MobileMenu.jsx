'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, Package, Truck, DollarSign, Users, 
  Settings, Shield, BarChart3, ClipboardList, Building2,
  LogOut, UserCircle
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../shared/context/AuthContext';

export const MobileMenu = ({ isSuperAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = { pathname: usePathname(), search: "" };
  const navigate = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/sales', icon: Package, label: 'Sales' },
    { path: '/dispatch', icon: Truck, label: 'Dispatch' },
    { path: '/finance', icon: DollarSign, label: 'Finance' },
    { path: '/production', icon: ClipboardList, label: 'Production' },
    { path: '/hr', icon: Users, label: 'HR' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const adminItems = [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  const allItems = isSuperAdmin 
    ? [...navItems, ...adminItems] 
    : navItems;

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await fetch('/api/backend/auth/logout', { method: 'POST' });
    } catch { /* best effort */ }
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      navigate.push('/login');
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 h-full max-h-screen flex flex-col bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HE</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Himalaya ERP</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 bg-gray-50 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            {isSuperAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Super Admin
              </span>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1 min-h-0">
          {allItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex-shrink-0 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-gray-50 transition text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
