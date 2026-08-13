'use client';

import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import HRDashboardView from '@/modules/hr/components/HRDashboardView';
import { backendFetch } from '@/lib/backendFetch';
import "../components/dashboard.css";

export default function HRAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const [employees, setEmployees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isCancelled = false;

    async function loadData() {
      try {
        const [empRes, expRes, leaveRes] = await Promise.allSettled([
          backendFetch('/api/backend/admin/employees'),
          backendFetch('/expenses/all'),
          backendFetch('/api/backend/leaves')
        ]);

        if (!isCancelled) {
          if (empRes.status === 'fulfilled') {
            const raw = empRes.value;
            const empList = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : []));
            if (empList.length > 0) setEmployees(empList);
          }
          if (expRes.status === 'fulfilled') {
            const rawExp = expRes.value;
            const expList = Array.isArray(rawExp) ? rawExp : (Array.isArray(rawExp?.data) ? rawExp.data : []);
            if (expList.length > 0) setExpenses(expList);
          }
          if (leaveRes.status === 'fulfilled') {
            const rawLeaves = leaveRes.value;
            const leaveList = Array.isArray(rawLeaves) ? rawLeaves : (Array.isArray(rawLeaves?.data) ? rawLeaves.data : []);
            if (leaveList.length > 0) setLeaves(leaveList);
          }
        }
      } catch (err) {
        // Fall back to context state
      }
    }

    loadData();
    return () => { isCancelled = true; };
  }, []);

  return (
    <div className="super-dashboard">
      <header className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div className="dashboard-header-left">
          <div className="dashboard-header-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <Lucide.Users size={26} />
          </div>
          <div className="dashboard-heading">
            <div className="dashboard-heading-row">
              <h1>HR & Payroll Expenditure Analytics</h1>
              <span className="dashboard-badge badge-info">Salary Month: {filters.salaryMonth}</span>
            </div>
            <p>Real-time workforce telemetry, attendance, leave analytics, exit clearances & payroll outlay</p>
          </div>
        </div>
      </header>

      {/* Shared Analytics Filter Bar with Dedicated Salary Month Selector */}
      <SuperAdminAnalyticsFilter
        title="HR & Payroll Filter Control"
        showBranch={true}
        showDepartment={true}
        showMonth={true}
      />

      {/* Full Dynamic HR Dashboard View */}
      <HRDashboardView
        employees={employees}
        leaves={leaves}
        expenses={expenses}
        filters={filters}
        activeDates={activeDates}
        hideHeader={true}
      />
    </div>
  );
}
