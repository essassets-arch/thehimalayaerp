'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { KeyRound, Mail, ShieldCheck, Eye, EyeOff, Zap, Search, ChevronDown, ChevronUp, User, Building, Shield } from 'lucide-react';

function getDefaultPath(role: string): string {
  const map: Record<string, string> = {
    'SALES': '/sales/dashboard',
    'SALES_ADMIN': '/sales/dashboard',
    'SALES_EXECUTIVE': '/sales/dashboard',
    'SALES_MANAGER': '/sales/dashboard',
    'PLANT_HEAD': '/plant-head/dashboard',
    'PRODUCTION': '/production/dashboard',
    'PRODUCTION_PLANNER': '/production/dashboard',
    'PRODUCTION_OPERATOR': '/production/dashboard',
    'STORE': '/store/dashboard',
    'STORE_MANAGER': '/store/dashboard',
    'QC': '/qc/dashboard',
    'QC_INSPECTOR': '/qc/dashboard',
    'DISPATCH': '/dispatch/dashboard',
    'DISPATCH_EXECUTIVE': '/dispatch/dashboard',
    'DISPATCH_2': '/dispatch-2/dashboard',
    'FINANCE': '/finance/dashboard',
    'FINANCE_EXECUTIVE': '/finance-executive/dashboard',
    'FINANCE_MANAGER': '/finance/dashboard',
    'HR': '/hr/dashboard',
    'BACK_OFFICE': '/back-office/daily-report',
    'ADMIN': '/admin/dashboard',
    'SUPER_ADMIN': '/super-admin/dashboard',
  };

  const friendly: Record<string, string> = {
    'Sales': '/sales/dashboard',
    'Sales Admin': '/sales/dashboard',
    'SuperSales': '/supersales/dashboard',
    'Super Sales': '/supersales/dashboard',
    'SUPER_SALES': '/supersales/dashboard',
    'Plant Head': '/plant-head/dashboard',
    'Production': '/production/dashboard',
    'Production Planner': '/production/dashboard',
    'Production Operator': '/production/dashboard',
    'Store': '/store/dashboard',
    'Store Manager': '/store/dashboard',
    'QC': '/qc/dashboard',
    'Dispatch': '/dispatch/dashboard',
    'Dispatch 1': '/dispatch/dashboard',
    'Dispatch Executive': '/dispatch/dashboard',
    'Dispatch 2': '/dispatch-2/dashboard',
    'Dispatch2': '/dispatch-2/dashboard',
    'Finance': '/finance/dashboard',
    'Finance Executive': '/finance-executive/dashboard',
    'Finance Manager': '/finance/dashboard',
    'HR': '/hr/dashboard',
    'Back Office': '/back-office/daily-report',
    'BACK_OFFICE': '/back-office/daily-report',
    'Admin': '/admin/dashboard',
    'Super Admin': '/super-admin/dashboard',
  };

  return map[role] || friendly[role] || '/sales/dashboard';
}

/** Map backend role codes to friendly display strings */
function toFriendlyRole(code: string, email?: string): string {
  const normalizedCode = (code || '').trim().toUpperCase();
  const acronymRoles: Record<string, string> = {
    HR: 'HR',
    QC: 'QC',
    SUPER_SALES: 'SuperSales',
    DISPATCH_EXECUTIVE: 'Dispatch 1',
    DISPATCH_2: 'Dispatch 2',
    BACK_OFFICE: 'Back Office',
  };

  return acronymRoles[normalizedCode] || normalizedCode
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface QuickAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  dept: string;
  category: 'Admin & HR' | 'Sales' | 'Finance' | 'Dispatch' | 'Production' | 'Store';
  color: string;
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  // Super Admin & HR
  { email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl', name: 'Super Admin', role: 'Super Admin', dept: 'Super Admin Department', category: 'Admin & HR', color: '#6366F1' },
  { email: 'nahin.v@himalayaerp.com', password: 'HR@hcppl', name: 'Nahin V', role: 'HR Manager', dept: 'HR Department', category: 'Admin & HR', color: '#EC4899' },
  { email: 'abbas.b@himalayaerp.com', password: 'dataAnalyst#2101', name: 'Abbas B', role: 'Back Office / Admin', dept: 'Super Admin Dept', category: 'Admin & HR', color: '#8B5CF6' },

  // Sales & SuperSales
  { email: 'supersales1@himalayaerp.com', password: 'supersales123', name: 'SuperSales 1', role: 'SuperSales Lead', dept: 'Sales Department', category: 'Sales', color: '#F59E0B' },
  { email: 'supersales2@himalayaerp.com', password: 'supersales124', name: 'SuperSales 2', role: 'SuperSales Lead', dept: 'Sales Department', category: 'Sales', color: '#F59E0B' },
  { email: 'sales1@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 1', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales2@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 2', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales3@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 3', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales4@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 4', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales5@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 5', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales6@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 6', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales7@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 7', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#3B82F6' },
  { email: 'sales11@himalayaerp.com', password: 'Himalayacc@2025', name: 'Sales 11', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#0EA5E9' },
  { email: 'sales12@himalayaerp.com', password: 'Jyoti@2258', name: 'Jyoti (Sales 12)', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#0EA5E9' },
  { email: 'sales13@himalayaerp.com', password: 'Himalaya@2026', name: 'Sales 13', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#0EA5E9' },
  { email: 'sales14@himalayaerp.com', password: 'ARHIMALAYA12', name: 'Sales 14', role: 'Sales Executive', dept: 'Sales Department', category: 'Sales', color: '#0EA5E9' },

  // Finance
  { email: 'sahad.m@himalayaerp.com', password: 'Hcppl@5253', name: 'Sahad M', role: 'Finance Manager', dept: 'Finance Department', category: 'Finance', color: '#10B981' },
  { email: 'trushna.g@himalayaerp.com', password: 'Himalaya@3252', name: 'Trushna G', role: 'Finance Executive', dept: 'Finance Department', category: 'Finance', color: '#059669' },

  // Dispatch
  { email: 'ravikant.t@himalayaerp.com', password: 'Logistics@hcppl', name: 'Ravikant T', role: 'Dispatch 1 (Cat 1)', dept: 'Dispatch Department', category: 'Dispatch', color: '#D97706' },
  { email: 'sahad.dispatch@himalayaerp.com', password: 'Sahad@5253', name: 'Sahad Dispatch', role: 'Dispatch 2 (Cat 2)', dept: 'Dispatch Department', category: 'Dispatch', color: '#B45309' },

  // Production & Plant Head
  { email: 'sana.r@himalayaerp.com', password: 'Himalaya@1234', name: 'Sana R', role: 'Plant Head', dept: 'Production Department', category: 'Production', color: '#8B5CF6' },
  { email: 'moksha.n@himalayaerp.com', password: 'Production@hcppl', name: 'Moksha N', role: 'Production Planner', dept: 'Production Department', category: 'Production', color: '#6366F1' },
  { email: 'hussain.t@himalayaerp.com', password: 'Rnd@hcppl', name: 'Hussain T', role: 'Production / R&D', dept: 'Production Department', category: 'Production', color: '#4F46E5' },

  // Store
  { email: 'makhdum@himalayaerp.com', password: 'Store@hcppl', name: 'Makhdum', role: 'Store Manager', dept: 'Store Department', category: 'Store', color: '#0284C7' },
];

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Login State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickLogin, setShowQuickLogin] = useState(true);

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/backend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.toLowerCase().trim(), password: loginPass }),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch (_) {}

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid email or password.');
        }
        if (res.status === 403) {
          throw new Error('Your account has been disabled. Please contact your administrator.');
        }
        if (res.status === 504 || res.status === 503) {
          throw new Error('Backend service is unavailable. Please try again shortly.');
        }
        throw new Error(json?.message || 'Login failed. Please try again.');
      }

      const { accessToken, user } = json.data || {};
      if (!accessToken || !user) {
        throw new Error('Unexpected response from server. Missing access token.');
      }

      const friendlyRole = toFriendlyRole(user.role, user.email);
      login(friendlyRole, { ...user, role: friendlyRole }, accessToken);

      const redirectPath = getDefaultPath(user.role);
      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }
    await executeLogin(email, password);
  };

  const handleQuickSelect = (acc: QuickAccount, autoSubmit: boolean = false) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    if (autoSubmit) {
      executeLogin(acc.email, acc.password);
    }
  };

  const categories = ['All', 'Admin & HR', 'Sales', 'Finance', 'Dispatch', 'Production', 'Store'];

  const filteredAccounts = QUICK_ACCOUNTS.filter(acc => {
    const matchesCat = activeCategory === 'All' || acc.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q) || acc.role.toLowerCase().includes(q) || acc.dept.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
        }

        .login-root {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #EFF6FF 0%, #F0F9FF 40%, #E0F2FE 70%, #EEF2FF 100%);
          padding: 32px 16px;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .login-root::before {
          content: '';
          position: fixed;
          top: -120px;
          right: -120px;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(59,174,235,0.14) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .login-main-container {
          width: 100%;
          max-width: 980px;
          display: grid;
          grid-template-columns: 390px 1fr;
          gap: 24px;
          align-items: start;
          position: relative;
          z-index: 1;
          margin: auto 0;
        }

        @media (max-width: 880px) {
          .login-main-container {
            grid-template-columns: 1fr;
            max-width: 440px;
          }
        }

        .login-card {
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          padding: 28px 24px;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.02),
            0 12px 30px rgba(47,67,117,0.08),
            0 24px 48px rgba(47,67,117,0.05);
          border: 1px solid rgba(226,232,240,0.9);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .quick-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 24px 22px;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.02),
            0 12px 30px rgba(47,67,117,0.07);
          border: 1.5px solid rgba(219, 234, 254, 0.85);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .brand-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .logo-box {
          padding: 8px 18px;
          border-radius: 14px;
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
          border: 1.5px solid #DBEAFE;
          box-shadow: 0 2px 6px rgba(47,67,117,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portal-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #64748B;
          margin-top: 2px;
        }

        .login-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .login-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
          transition: color 0.2s;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
        }

        .login-input {
          width: 100% !important;
          padding: 12px 14px 12px 44px !important;
          background: #F8FAFD;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          color: #1E293B;
          font-size: 13.5px;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box !important;
          min-height: 46px;
        }
        .login-input::placeholder { color: #CBD5E1; }
        .login-input:focus {
          background: #FFFFFF;
          border-color: #3BAEEB;
          box-shadow: 0 0 0 3px rgba(59,174,235,0.12);
        }
        .login-input-wrap:focus-within .login-icon {
          color: #3BAEEB;
        }

        .login-input-pr {
          padding-right: 44px !important;
        }

        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          z-index: 2;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #3BAEEB; }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #E2E8F0 50%, transparent 100%);
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(47,67,117,0.20);
          transition: all 0.2s;
          min-height: 46px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(47,67,117,0.26);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-error {
          background: #FFF5F5;
          border: 1.5px solid #FECACA;
          border-radius: 10px;
          padding: 10px 14px;
          color: #DC2626;
          font-size: 12.5px;
          font-weight: 500;
          text-align: center;
          line-height: 1.4;
        }

        /* Quick Login Section Styles */
        .quick-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 12px;
        }

        .quick-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quick-title {
          font-size: 15px;
          font-weight: 800;
          color: #1E293B;
          letter-spacing: -0.01em;
        }

        .quick-badge {
          background: #EFF6FF;
          color: #2563EB;
          border: 1px solid #BFDBFE;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .filter-pills {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .pill-btn {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          color: #64748B;
          transition: all 0.15s;
        }
        .pill-btn:hover {
          background: #EEF2F6;
          color: #1E293B;
        }
        .pill-btn.active {
          background: #2563EB;
          color: #ffffff;
          border-color: #2563EB;
          box-shadow: 0 2px 6px rgba(37,99,235,0.25);
        }

        .quick-search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .quick-search-input {
          width: 100%;
          padding: 8px 12px 8px 34px;
          border-radius: 10px;
          border: 1px solid #CBD5E1;
          font-size: 12.5px;
          background: #ffffff;
          outline: none;
          color: #1E293B;
        }
        .quick-search-input:focus {
          border-color: #3BAEEB;
          box-shadow: 0 0 0 2px rgba(59,174,235,0.15);
        }

        .accounts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 10px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
        }

        .account-card {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.15s ease;
          position: relative;
        }
        .account-card:hover {
          border-color: #93C5FD;
          background: #F8FBFF;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37,99,235,0.06);
        }

        .acc-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .acc-avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          flex-shrink: 0;
        }

        .acc-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .acc-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #1E293B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .acc-role {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .acc-email {
          font-size: 10.5px;
          color: #94A3B8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .acc-actions {
          display: flex;
          gap: 6px;
          margin-top: 2px;
        }

        .btn-fill {
          flex: 1;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: #F1F5F9;
          color: #475569;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          transition: all 0.1s;
        }
        .btn-fill:hover {
          background: #E2E8F0;
          color: #1E293B;
        }

        .btn-quick-login {
          flex: 1.2;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
          color: #ffffff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.1s;
        }
        .btn-quick-login:hover {
          background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }

        @media (max-width: 480px) {
          .login-root { padding: 16px 12px; }
          .login-card { padding: 22px 18px; border-radius: 16px; }
          .quick-card { padding: 18px 14px; border-radius: 16px; }
          .accounts-grid { grid-template-columns: 1fr; max-height: 320px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-main-container">

          {/* ── Left: Main Credentials Form ──────────────────────── */}
          <div className="login-card">

            {/* Brand */}
            <div className="brand-wrapper">
              <div className="logo-box">
                <Image
                  src="/himalaya-logo-trimmed.png"
                  alt="Himalaya"
                  width={240}
                  height={80}
                  style={{ width: '140px', height: 'auto', objectFit: 'contain' }}
                  priority
                />
              </div>
              <p className="portal-title">Enterprise Resource Planning Portal</p>
            </div>

            <div className="login-divider" />

            {/* Error */}
            {error && <div className="login-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className="login-label">Email Address</label>
                <div className="login-input-wrap">
                  <Mail size={16} className="login-icon" />
                  <input
                    type="email"
                    id="login-email"
                    data-testid="login-email"
                    className="login-input"
                    placeholder="name@himalayaerp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className="login-label">Password</label>
                <div className="login-input-wrap">
                  <KeyRound size={16} className="login-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="login-password"
                    data-testid="login-password"
                    className="login-input login-input-pr"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(p => !p)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit"
                data-testid="login-submit"
                disabled={loading}
                className="login-btn"
              >
                <ShieldCheck size={18} />
                {loading ? 'Authenticating…' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              🔒 Protected by Himalayan Role-Based Access Control
            </div>
          </div>

          {/* ── Right: Quick Login Staff Selector ─────────────────── */}
          <div className="quick-card">
            <div className="quick-header">
              <div className="quick-title-wrap">
                <Zap size={18} style={{ color: '#2563EB' }} />
                <span className="quick-title">Quick Demo Login</span>
                <span className="quick-badge">{filteredAccounts.length} Staff</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickLogin(s => !s)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showQuickLogin ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {showQuickLogin && (
              <>
                {/* Search Box */}
                <div className="quick-search-box">
                  <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    className="quick-search-input"
                    placeholder="Search by role, name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Pills */}
                <div className="filter-pills">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Accounts Grid */}
                <div className="accounts-grid">
                  {filteredAccounts.map((acc) => (
                    <div key={acc.email} className="account-card">
                      <div className="acc-info">
                        <div className="acc-avatar" style={{ backgroundColor: acc.color }}>
                          {acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="acc-meta">
                          <div className="acc-name">{acc.name}</div>
                          <div className="acc-role">{acc.role}</div>
                          <div className="acc-email">{acc.email}</div>
                        </div>
                      </div>
                      <div className="acc-actions">
                        <button
                          type="button"
                          className="btn-fill"
                          onClick={() => handleQuickSelect(acc, false)}
                          title="Fill credentials in form"
                        >
                          Auto-Fill
                        </button>
                        <button
                          type="button"
                          className="btn-quick-login"
                          disabled={loading}
                          onClick={() => handleQuickSelect(acc, true)}
                          title="Auto-fill and log in immediately"
                        >
                          <Zap size={12} /> Login
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredAccounts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '13px', gridColumn: '1 / -1' }}>
                      No staff accounts match your filter.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
