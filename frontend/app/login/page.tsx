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
    if (e.includes('finance')) {
      return 'Password@123';
    }
    if (e === 'ravikant.tiwari@himalayaerp.com') {
      return 'Dispatch@1';
    }
    if (e === 'sahad.dispatch@himalayaerp.com') {
      return 'Dispatch@2';
    }
    if (e === 'sahad.accounts@himalayaerp.com') {
      return 'Hcpp1@5253';
    }
    if (e === 'hr@himalayaerp.com') {
      return 'admin123';
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
          font-size: 11.5px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
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
          color: #94A3B8;
          pointer-events: none;
          transition: color 0.2s;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-input {
          width: 100% !important;
          padding: 12px 14px 12px 44px !important;
          background: #F8FAFD;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          color: #1E293B;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box !important;
        }
        .login-input::placeholder { color: #CBD5E1; }
        .login-input:focus {
          background: #FFFFFF;
          border-color: #3BAEEB;
          box-shadow: 0 0 0 3px rgba(59,174,235,0.12);
        }
        .login-input:focus ~ .login-icon,
        .login-input-wrap:focus-within .login-icon {
          color: #3BAEEB;
        }

        .login-input-pr {
          padding-right: 44px !important;
        }

        .pass-toggle {
          position: absolute;
          right: 14px;
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

        .demo-accounts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .demo-account-btn {
          border-radius: 12px;
          padding: 10px 12px;
          color: #1E293B;
          font-size: 11.5px;
          font-weight: 700;
          text-align: left;
          transition: all 0.15s ease;
          min-height: 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          min-width: 0;
          background: #F8FAFD;
          border: 1px solid #E2E8F0;
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
          font-size: 10px;
          font-weight: 500;
          margin-top: 3px;
          word-break: break-word;
          line-height: 1.3;
          width: 100%;
        }

        @media (max-width: 480px) {
          .login-root {
            padding: 12px 10px 32px;
          }
          .login-card {
            padding: 20px 16px;
            border-radius: 18px;
            gap: 16px;
          }
          .logo-box {
            padding: 8px 16px;
          }
          .demo-accounts-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .demo-account-btn {
            padding: 8px 10px;
            min-height: 48px;
          }
          .demo-email-text {
            font-size: 9.5px;
          }
        }

        @media (max-width: 340px) {
          .demo-accounts-grid {
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
                <Mail size={16} className="login-icon" />
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
                  style={{ paddingLeft: '44px', paddingRight: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <KeyRound size={16} className="login-icon" />
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
                  style={{ paddingLeft: '44px', paddingRight: '44px', boxSizing: 'border-box' }}
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
            <button type="submit" id="login-submit" data-testid="login-submit" disabled={loading} className="login-btn">
              <ShieldCheck size={16} />
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>

            {/* ── Demo Accounts ─────────────────────────── */}
            <div>
              <div className="login-label" style={{ marginBottom: '8px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Select Account — Prefills Email Field</span>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                {(['All', 'Sales', 'Finance', 'Dispatch', 'Production', 'Admin'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: selectedCategory === cat ? '1px solid #3BAEEB' : '1px solid #E2E8F0',
                      background: selectedCategory === cat ? '#3BAEEB' : '#F8FAFD',
                      color: selectedCategory === cat ? '#FFFFFF' : '#64748B',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="demo-accounts-grid">
                {filteredAccounts.map((account) => {
                  const isSelected = email === account.email;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSelectAccount(account.email)}
                      title={`Select ${account.role}`}
                      className="demo-account-btn"
                      style={{
                        border: isSelected ? '1.5px solid #3BAEEB' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0F9FF' : '#F8FAFD',
                        cursor: loading ? 'default' : 'pointer',
                      }}
                    >
                      <span style={{ display: 'block', color: isSelected ? '#0284C7' : '#1E293B', fontWeight: 700, fontSize: '11px' }}>
                        {account.role}
                      </span>
                      <span className="demo-email-text">
                        {account.email}
                      </span>
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

