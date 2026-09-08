'use client';

import { useState, useEffect } from 'react';
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
    PRODUCTION_PLANNER: 'Production Planner',
    PRODUCTION_OPERATOR: 'Production Operator',
    PLANT_HEAD: 'Plant Head',
    STORE_MANAGER: 'Store Manager',
  };

  return acronymRoles[normalizedCode] || normalizedCode
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LoginPage() {
  const { login, isAuthenticated, user, role, accessToken } = useAuthStore();
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, automatically navigate to the user's dashboard
  useEffect(() => {
    const effectiveToken = accessToken || (typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('himalaya_token') || sessionStorage.getItem('token')) : null);
    const effectiveUser = user || (typeof window !== 'undefined' ? (() => {
      try {
        const raw = localStorage.getItem('erpUser') || sessionStorage.getItem('erpUser');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })() : null);

    if (effectiveToken && !effectiveToken.startsWith('demo-token-') && (isAuthenticated || effectiveUser)) {
      const targetRole = (effectiveUser?.role || role || '') as string;
      const targetPath = getDefaultPath(targetRole);
      router.replace(targetPath);
      return;
    }
    setCheckingSession(false);
  }, [isAuthenticated, accessToken, user, role, router]);

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/backend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, identifier: loginEmail, password: loginPass }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 504 || res.status === 503) {
          throw new Error('Backend service is unavailable. Please try again shortly.');
        }
        throw new Error(json?.message || 'Login failed. Please try again.');
      }

      const data = json?.data || json || {};
      const receivedToken = data.accessToken;
      const receivedUser = data.user;
      if (!receivedToken || !receivedUser) {
        throw new Error('Unexpected response from server. Missing access token.');
      }

      const friendlyRole = toFriendlyRole(receivedUser.role, receivedUser.email);
      login(friendlyRole, { ...receivedUser, role: friendlyRole }, receivedToken);

      const redirectPath = getDefaultPath(receivedUser.role);
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

  if (checkingSession) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EFF6FF',
        fontFamily: "'Outfit', sans-serif",
        gap: '12px'
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid #3B82F6',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '14px' }}>Checking session…</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
          background: #EFF6FF;
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
          padding: 24px 16px;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
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
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
          margin: auto 0;
          box-sizing: border-box;
        }

        .login-card {
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.02),
            0 12px 30px rgba(47,67,117,0.08),
            0 24px 48px rgba(47,67,117,0.05);
          border: 1px solid rgba(226,232,240,0.9);
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
        }

        .brand-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          width: 100%;
        }

        .logo-box {
          padding: 10px 22px;
          border-radius: 14px;
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
          border: 1.5px solid #DBEAFE;
          box-shadow: 0 2px 6px rgba(47,67,117,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portal-title {
          font-size: 14px;
          font-weight: 600;
          color: #64748B;
          margin-top: 2px;
        }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #E2E8F0 50%, transparent 100%);
        }

        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-sizing: border-box;
        }

        .form-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
        }

        .login-label {
          display: block;
          margin-bottom: 2px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .login-input {
          width: 100% !important;
          height: 48px !important;
          min-height: 48px !important;
          box-sizing: border-box !important;
          border: 1.5px solid #d5dfef !important;
          border-radius: 11px !important;
          background: #eaf1fc !important;
          padding: 0 16px 0 46px !important;
          font-size: 14.5px !important;
          font-weight: 500 !important;
          font-family: 'Outfit', sans-serif !important;
          color: #101828 !important;
          outline: none !important;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02) !important;
        }

        .login-input::placeholder {
          color: #8294ad !important;
          font-weight: 400 !important;
        }

        .login-input:hover {
          border-color: #7b9ed8 !important;
          background: #f5f8fd !important;
        }

        .login-input:focus {
          border-color: #2563EB !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14) !important;
        }

        .login-input-pass {
          padding-left: 46px !important;
          padding-right: 46px !important;
        }

        .login-icon {
          position: absolute !important;
          left: 15px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 18px !important;
          height: 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #8294ad !important;
          pointer-events: none !important;
          z-index: 2 !important;
          transition: color 0.2s ease !important;
        }

        .login-input-wrap:focus-within .login-icon {
          color: #2563EB !important;
        }

        .pass-toggle {
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 0 !important;
          background: transparent !important;
          color: #8294ad !important;
          cursor: pointer !important;
          border-radius: 8px !important;
          padding: 0 !important;
          z-index: 3 !important;
          transition: all 0.2s ease !important;
        }

        .pass-toggle:hover {
          color: #101828 !important;
          background: rgba(0, 0, 0, 0.06) !important;
        }

        .pass-toggle svg {
          width: 18px !important;
          height: 18px !important;
          flex-shrink: 0 !important;
        }

        .login-btn {
          width: 100%;
          height: 48px;
          margin-top: 6px;
          padding: 12px;
          background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3BAEEB 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(37,99,235,0.35);
          filter: brightness(1.03);
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

        @media (max-width: 480px) {
          .login-root {
            padding: 16px 12px;
          }
          .login-card {
            padding: 24px 18px;
            border-radius: 16px;
          }
          .logo-box {
            padding: 8px 16px;
          }
          .portal-title {
            font-size: 12.5px;
          }
          .login-input {
            height: 46px !important;
            min-height: 46px !important;
            padding-left: 44px !important;
            font-size: 13.5px !important;
          }
        }
      `}</style>

      <div className="login-root">
        <div className="login-main-container">

          {/* ── Main Credentials Card ─────────────────────────────── */}
          <div className="login-card">

            {/* Brand Logo & Subtitle */}
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
              <p className="portal-title">Enterprise Resource Planning Portal</p>
            </div>

            <div className="login-divider" />

            {/* Error Banner */}
            {error && <div className="login-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="login-form">

              {/* Email */}
              <div className="form-group">
                <label htmlFor="login-email" className="login-label">Email Address</label>
                <div className="login-input-wrap">
                  <span className="login-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    id="login-email"
                    data-testid="login-email"
                    className="login-input"
                    placeholder="admin@thehimalaya.cloud"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="login-password" className="login-label">Password</label>
                <div className="login-input-wrap">
                  <span className="login-icon">
                    <KeyRound size={18} />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="login-password"
                    data-testid="login-password"
                    className="login-input login-input-pass"
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
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
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

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
              🔒 Protected by Himalayan Role-Based Access Control
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
