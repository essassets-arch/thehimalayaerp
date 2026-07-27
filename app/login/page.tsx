'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { KeyRound, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { delay } from '@/lib/delay';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await delay(800);

      let role: any = 'Sales';
      let redirectPath = '/sales/dashboard';

      const emailLower = email.toLowerCase();
      if (emailLower.includes('sales-admin')) { role = 'Sales Admin'; redirectPath = '/sales/dashboard'; }
      else if (emailLower.includes('sales')) { role = 'Sales'; redirectPath = '/sales/dashboard'; }
      else if (emailLower.includes('super-admin')) { role = 'Super Admin'; redirectPath = '/super-admin/dashboard'; }
      else if (emailLower.includes('admin')) { role = 'Admin'; redirectPath = '/admin/dashboard'; }
      else if (emailLower.includes('plant')) { role = 'Plant Head'; redirectPath = '/plant-head/dashboard'; }
      else if (emailLower.includes('production')) { role = 'Production'; redirectPath = '/production/dashboard'; }
      else if (emailLower.includes('store')) { role = 'Store'; redirectPath = '/store/dashboard'; }
      else if (emailLower.includes('qc')) { role = 'QC'; redirectPath = '/qc/dashboard'; }
      else if (emailLower.includes('dispatch')) { role = 'Dispatch'; redirectPath = '/dispatch/dashboard'; }
      else if (emailLower.includes('finance-exec')) { role = 'Finance Executive'; redirectPath = '/finance-executive/dashboard'; }
      else if (emailLower.includes('finance')) { role = 'Finance'; redirectPath = '/finance/dashboard'; }
      else if (emailLower.includes('hr')) { role = 'HR'; redirectPath = '/hr/dashboard'; }

      login(role, { name: email.split('@')[0], email, role });
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #EFF6FF 0%, #F0F9FF 40%, #E0F2FE 70%, #EEF2FF 100%);
          padding: 20px;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Decorative blobs */
        .login-root::before {
          content: '';
          position: fixed;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59,174,235,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -100px;
          left: -100px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.04),
            0 8px 32px rgba(47,67,117,0.08),
            0 32px 64px rgba(47,67,117,0.06);
          border: 1px solid rgba(226,232,240,0.8);
          display: flex;
          flex-direction: column;
          gap: 28px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
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
          padding: 13px 14px 13px 42px;
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
          padding: 14px;
          background: linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14.5px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(47,67,117,0.22);
          transition: all 0.2s;
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(47,67,117,0.28);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-error {
          background: #FFF5F5;
          border: 1.5px solid #FECACA;
          border-radius: 10px;
          padding: 11px 16px;
          color: #DC2626;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          line-height: 1.5;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        .role-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .role-pill {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 20px;
          background: #F0F9FF;
          color: #0284C7;
          border: 1px solid #BAE6FD;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Outfit', sans-serif;
        }
        .role-pill:hover {
          background: #E0F2FE;
          border-color: #7DD3FC;
        }

        @media (max-width: 480px) {
          .login-card { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* ── Brand ─────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <div style={{
              padding: '12px 28px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
              border: '1.5px solid #DBEAFE',
              marginBottom: '6px',
              boxShadow: '0 2px 8px rgba(47,67,117,0.06)',
            }}>
              <Image
                src="/himalaya-logo-trimmed.png"
                alt="Himalaya"
                width={240}
                height={80}
                style={{ width: '190px', height: 'auto', objectFit: 'contain' }}
                priority
              />
            </div>

          </div>

          <div className="login-divider" />

          {/* ── Error ──────────────────────────────── */}
          {error && <div className="login-error">{error}</div>}

          {/* ── Form ───────────────────────────────── */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label className="login-label">Email Address</label>
              <div className="login-input-wrap">
                <Mail size={15} className="login-icon" />
                <input
                  type="email"
                  className="login-input"
                  placeholder="sales@himalayaerp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <KeyRound size={15} className="login-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
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

            {/* Remember / Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', color: '#64748B', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#3BAEEB', cursor: 'pointer', width: '14px', height: '14px' }}
                />
                Remember me
              </label>
              <a
                href="#forgot"
                style={{ color: '#3BAEEB', textDecoration: 'none', fontWeight: '600', fontSize: '12.5px' }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-btn">
              <ShieldCheck size={16} />
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>




        </div>
      </div>
    </>
  );
}
