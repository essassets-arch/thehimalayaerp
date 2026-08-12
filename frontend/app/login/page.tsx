'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { KeyRound, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
    'ADMIN': '/admin/dashboard',
    'SUPER_ADMIN': '/super-admin/dashboard',
  };
  // Also support friendly names from local roles
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
    'Admin': '/admin/dashboard',
    'Super Admin': '/super-admin/dashboard',
  };
  return map[role] || friendly[role] || '/sales/dashboard';
}

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'super.admin@himalayaerp.com' },
  { role: 'SuperSales 1', email: 'supersales1@himalayaerp.com' },
  { role: 'SuperSales 2', email: 'supersales2@himalayaerp.com' },
  { role: 'Sales Executive 1', email: 'sales1@himalayaerp.com' },
  { role: 'Sales Executive 2', email: 'sales2@himalayaerp.com' },
  { role: 'Sales Executive 3', email: 'sales3@himalayaerp.com' },
  { role: 'Sales Executive 4', email: 'sales4@himalayaerp.com' },
  { role: 'Sales Executive 5', email: 'sales5@himalayaerp.com' },
  { role: 'Sales Executive 6', email: 'sales6@himalayaerp.com' },
  { role: 'Sales Executive 7', email: 'sales7@himalayaerp.com' },
  { role: 'Plant Head', email: 'plant.head@himalayaerp.com' },
  { role: 'Production Operator', email: 'production.operator@himalayaerp.com' },
  { role: 'Dispatch 1', email: 'ravikant.tiwari@himalayaerp.com' },
  { role: 'Dispatch 2', email: 'sahad.dispatch@himalayaerp.com' },
  { role: 'Finance Executive', email: 'finance.executive@himalayaerp.com' },
  { role: 'Finance Manager', email: 'sahad.accounts@himalayaerp.com' },
  { role: 'Store Manager', email: 'store.manager@himalayaerp.com' },
  { role: 'HR', email: 'hr@himalayaerp.com' },
] as const;

/** Map backend role codes to friendly display strings */
function toFriendlyRole(code: string, email?: string): string {
  const e = email?.toLowerCase().trim() || '';
  if (e === 'supersales1@himalayaerp.com') return 'SuperSales 1';
  if (e === 'supersales2@himalayaerp.com') return 'SuperSales 2';
  const normalizedCode = code.trim().toUpperCase();
  const acronymRoles: Record<string, string> = {
    HR: 'HR',
    QC: 'QC',
    SUPER_SALES: 'SuperSales',
    DISPATCH_EXECUTIVE: 'Dispatch 1',
    DISPATCH_2: 'Dispatch 2',
  };

  return acronymRoles[normalizedCode] || normalizedCode
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferDemoRoleFromEmail(email: string): string {
  const e = email.toLowerCase().trim();
  if (e === 'ravikant.tiwari@himalayaerp.com') return 'Dispatch 1';
  if (e === 'sahad.dispatch@himalayaerp.com') return 'Dispatch 2';
  if (e === 'supersales1@himalayaerp.com') return 'SuperSales 1';
  if (e === 'supersales2@himalayaerp.com') return 'SuperSales 2';
  if (e.includes('super.sales') || e.includes('supersales')) return 'SuperSales';
  if (e.includes('sales')) return 'Sales Executive';
  if (e.includes('plant')) return 'Plant Head';
  if (e.includes('production')) return 'Production Operator';
  if (e.includes('dispatch2') || e.includes('dispatch.2') || e.includes('dispatch_2') || e.includes('dispatch-2')) return 'Dispatch 2';
  if (e.includes('dispatch')) return 'Dispatch 1';
  if (e.includes('accounts') || (e.includes('finance') && e.includes('manager'))) return 'Finance Manager';
  if (e.includes('finance')) return 'Finance Executive';
  if (e.includes('store')) return 'Store Manager';
  if (e.includes('qc')) return 'QC';
  if (e.includes('hr')) return 'HR';
  if (e.includes('super') || e.includes('admin')) return 'Super Admin';
  return 'Sales Executive';
}

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Sales' | 'Dispatch' | 'Finance' | 'Production' | 'Admin'>('All');

  const getPasswordForEmail = (emailStr: string): string => {
    const e = emailStr.toLowerCase().trim();
    if (e === 'ravikant.tiwari@himalayaerp.com') {
      return 'Dispatch@1';
    }
    if (e === 'sahad.dispatch@himalayaerp.com') {
      return 'Dispatch@2';
    }
    if (e === 'sahad.accounts@himalayaerp.com') {
      return 'Hcpp1@5253';
    }
    const salesMatch = e.match(/^sales(\d+)@himalayaerp\.com$/);
    if (salesMatch) {
      return `HimalayaSales#${salesMatch[1]}`;
    }
    const superSalesMatch = e.match(/^supersales(\d+)@himalayaerp\.com$/);
    if (superSalesMatch) {
      return `HimalayaSuperSales#${superSalesMatch[1]}`;
    }
    return 'admin123';
  };

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

  const handleSelectAccount = (accountEmail: string) => {
    const defaultPass = getPasswordForEmail(accountEmail);
    setEmail(accountEmail);
    setPassword(defaultPass);
    executeLogin(accountEmail, defaultPass);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }
    await executeLogin(email, password);
  };

  const filteredAccounts = DEMO_ACCOUNTS.filter((acc) => {
    if (selectedCategory === 'All') return true;
    const e = acc.email.toLowerCase();
    const r = acc.role.toLowerCase();
    if (selectedCategory === 'Sales') return r.includes('sales') || e.includes('sales');
    if (selectedCategory === 'Dispatch') return r.includes('dispatch') || e.includes('dispatch') || e.includes('tiwari');
    if (selectedCategory === 'Finance') return r.includes('finance') || e.includes('finance') || e.includes('accounts');
    if (selectedCategory === 'Production') return r.includes('production') || r.includes('plant') || e.includes('plant') || e.includes('operator');
    if (selectedCategory === 'Admin') return r.includes('admin') || r.includes('hr') || r.includes('store') || e.includes('hr') || e.includes('store');
    return true;
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
          justify-content: flex-start;
          background: linear-gradient(145deg, #EFF6FF 0%, #F0F9FF 40%, #E0F2FE 70%, #EEF2FF 100%);
          padding: 16px 12px 32px;
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
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59,174,235,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -100px;
          left: -100px;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 18px;
          padding: 24px 20px;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.02),
            0 8px 24px rgba(47,67,117,0.07),
            0 24px 48px rgba(47,67,117,0.05);
          border: 1px solid rgba(226,232,240,0.85);
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.35s ease-out both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .brand-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }

        .logo-box {
          padding: 6px 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
          border: 1.5px solid #DBEAFE;
          margin-bottom: 2px;
          box-shadow: 0 2px 6px rgba(47,67,117,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-label {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          pointer-events: none;
          transition: color 0.2s;
        }

        .login-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: #F8FAFD;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          color: #1E293B;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .login-input::placeholder { color: #CBD5E1; }
        .login-input:focus {
          background: #FFFFFF;
          border-color: #3BAEEB;
          box-shadow: 0 0 0 3px rgba(59,174,235,0.12);
        }
        .login-input:focus + .login-icon,
        .login-input-wrap:focus-within .login-icon {
          color: #3BAEEB;
        }

        .login-input-pr { padding-right: 42px; }

        .pass-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #3BAEEB; }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #E2E8F0 50%, transparent 100%);
        }

        .login-btn {
          width: 100%;
          padding: 13px;
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
          box-shadow: 0 4px 18px rgba(47,67,117,0.20);
          transition: all 0.2s;
          margin-top: 2px;
          min-height: 44px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(47,67,117,0.26);
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
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        .category-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 6px;
          margin-bottom: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .category-tabs::-webkit-scrollbar { display: none; }

        .cat-tab {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10.5px;
          font-weight: 700;
          border: 1px solid #E2E8F0;
          background: #F8FAFD;
          color: #64748B;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .cat-tab.active {
          background: #3BAEEB;
          color: #FFFFFF;
          border-color: #3BAEEB;
          box-shadow: 0 2px 6px rgba(59,174,235,0.25);
        }

        .demo-accounts-scroll {
          max-height: 220px;
          overflow-y: auto;
          padding-right: 4px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          -webkit-overflow-scrolling: touch;
        }
        .demo-accounts-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .demo-accounts-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }

        .demo-account-btn {
          border-radius: 10px;
          padding: 8px 10px;
          color: #1E293B;
          font-size: 11px;
          font-weight: 600;
          text-align: left;
          transition: all 0.15s ease;
          min-height: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          min-width: 0;
        }
        .demo-account-btn:hover:not(:disabled) {
          border-color: #3BAEEB !important;
          background: #F0F9FF !important;
        }
        .demo-account-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .demo-email-text {
          display: block;
          color: #64748B;
          font-size: 9.5px;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        @media (max-width: 480px) {
          .login-root {
            padding: 10px 8px 24px;
          }
          .login-card {
            padding: 16px 14px;
            border-radius: 16px;
            gap: 14px;
          }
          .logo-box {
            padding: 6px 12px;
          }
          .demo-accounts-scroll {
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
            max-height: 180px;
          }
        }

        @media (max-width: 340px) {
          .demo-accounts-scroll {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* ── Brand ─────────────────────────────── */}
          <div className="brand-wrapper">
            <div className="logo-box">
              <Image
                src="/himalaya-logo-trimmed.png"
                alt="Himalaya"
                width={240}
                height={80}
                style={{ width: '135px', height: 'auto', objectFit: 'contain' }}
                priority
              />
            </div>
          </div>

          <div className="login-divider" />

          {/* ── Error ──────────────────────────────── */}
          {error && <div className="login-error">{error}</div>}

          {/* ── Form ───────────────────────────────── */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="login-label">Email Address</label>
              <div className="login-input-wrap">
                <Mail size={15} className="login-icon" />
                <input
                  type="email"
                  id="login-email"
                  data-testid="login-email"
                  className="login-input"
                  placeholder="user@himalayaerp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <KeyRound size={15} className="login-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="login-password"
                  data-testid="login-password"
                  className="login-input login-input-pr"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" id="login-submit" data-testid="login-submit" disabled={loading} className="login-btn">
              <ShieldCheck size={16} />
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>

            {/* Quick Demo Accounts Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div className="login-label" style={{ color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Quick Demo Login (18 Accounts)</span>
                <span style={{ fontSize: '10px', color: '#3BAEEB', fontWeight: 700 }}>Auto Sign-In</span>
              </div>

              <div className="login-input-wrap">
                <ShieldCheck size={16} className="login-icon" style={{ color: '#3BAEEB' }} />
                <select
                  id="demo-account-select"
                  data-testid="demo-account-select"
                  className="login-input"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    paddingRight: '36px',
                    cursor: loading ? 'default' : 'pointer',
                    fontWeight: 600,
                    color: email ? '#0284C7' : '#64748B',
                    background: email ? '#F0F9FF' : '#F8FAFD',
                    border: email ? '1.5px solid #3BAEEB' : '1.5px solid #E2E8F0',
                  }}
                  value={email}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectAccount(e.target.value);
                    }
                  }}
                  disabled={loading}
                >
                  <option value="" disabled>-- Select Demo Account to Auto Sign-In --</option>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <option key={acc.role} value={acc.email} style={{ color: '#1E293B', padding: '6px' }}>
                      {acc.role} — {acc.email}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '14px', pointerEvents: 'none', color: '#64748B', fontSize: '11px' }}>
                  ▼
                </div>
              </div>

              {/* Popular Quick Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '2px' }}>
                {[
                  { role: 'Super Admin', email: 'super.admin@himalayaerp.com' },
                  { role: 'Sales Executive 1', email: 'sales1@himalayaerp.com' },
                  { role: 'Dispatch 1', email: 'ravikant.tiwari@himalayaerp.com' },
                  { role: 'Finance Executive', email: 'finance.executive@himalayaerp.com' },
                  { role: 'HR', email: 'hr@himalayaerp.com' },
                ].map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSelectAccount(acc.email)}
                      className="cat-tab"
                      style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        background: isSelected ? '#3BAEEB' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        borderColor: isSelected ? '#3BAEEB' : '#E2E8F0',
                        fontWeight: 600,
                      }}
                    >
                      {acc.role}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
