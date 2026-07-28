'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, DollarSign } from 'lucide-react';
import '../styles/salary.css';
import '@/components/erp-premium-ui.css';

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  type: 'pending' | 'approved' | 'rejected' | 'payroll' | 'default';
}

interface SalaryPageLayoutProps {
  statCards?: StatCardProps[];
  children: React.ReactNode;
}

export function SalaryPageLayout({ statCards = [], children }: SalaryPageLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="erp-page-container">
      {/* Header Card */}
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <DollarSign style={{ width: 24, height: 24, color: '#059669' }} />
            Salary & Payroll Management
          </h2>
          <p className="erp-header-subtitle">
            Manage payroll preparation, HR verification, Super Admin approvals, and Finance disbursements.
          </p>
        </div>

        {/* Tab Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
          {pathname.startsWith('/finance') ? (
            <>
              <Link href="/finance/salary/pending" className={`erp-btn erp-btn-sm ${pathname.includes('/pending') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Pending Payments
              </Link>
              <Link href="/finance/salary/processing" className={`erp-btn erp-btn-sm ${pathname.includes('/processing') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Processing
              </Link>
              <Link href="/finance/salary/paid" className={`erp-btn erp-btn-sm ${pathname.includes('/paid') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Paid Salaries
              </Link>
              <Link href="/finance/salary/history" className={`erp-btn erp-btn-sm ${pathname.includes('/history') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Salary History
              </Link>
            </>
          ) : (
            <>
              <Link href="/hr/salary/prepare" className={`erp-btn erp-btn-sm ${pathname.includes('/prepare') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Prepare Salary
              </Link>
              <Link href="/super-admin/salary-approval" className={`erp-btn erp-btn-sm ${pathname.includes('/salary-approval') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Salary Approval Status
              </Link>
              <Link href="/hr/salary/history" className={`erp-btn erp-btn-sm ${pathname.includes('/history') ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                Salary History
              </Link>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
