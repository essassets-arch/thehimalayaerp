import React from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import "../components/dashboard.css";

export default function HRAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);

  const deptHRData = [
    { dept: 'Production Floor Staff', headCount: 12, payroll: '₹3,40,000', overtime: '₹28,000', attendance: '96.2%', status: 'Processed' },
    { dept: 'Store & Procurement', headCount: 4, payroll: '₹1,20,000', overtime: '₹8,500', attendance: '98.0%', status: 'Processed' },
    { dept: 'Dispatch & Logistics', headCount: 3, payroll: '₹95,000', overtime: '₹5,000', attendance: '94.5%', status: 'Processed' },
    { dept: 'Quality Control (QC)', headCount: 2, payroll: '₹80,000', overtime: '₹3,500', attendance: '99.0%', status: 'Processed' },
    { dept: 'Finance & Admin', headCount: 3, payroll: '₹1,15,000', overtime: '₹0', attendance: '97.5%', status: 'Processed' }
  ];

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
            <p>Payroll costs, overtime, bonuses, attendance telemetry & employee cost efficiency</p>
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

      {/* HR KPIs */}
      <div className="sa-financial-grid">
        <div className="sa-financial-card" style={{ '--kpi-accent': '#8b5cf6' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Gross Payroll ({filters.salaryMonth})</span>
            <Lucide.CreditCard size={18} color="#8b5cf6" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.salaryCost)}</span>
          </div>
          <div className="sa-card-subtext">24 Active Employees</div>
          <div className="sa-card-footer">
            <span className="kpi-success">HR Approved Monthly Payroll</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#f59e0b' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Overtime & Shift Allowance</span>
            <Lucide.Clock size={18} color="#f59e0b" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">₹45,000</span>
          </div>
          <div className="sa-card-subtext">142 Overtime Hours Logged</div>
          <div className="sa-card-footer">
            <span className="kpi-warning">Filtered for period: {activeDates.label}</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#10b981' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Avg Attendance Rate</span>
            <Lucide.CheckCircle size={18} color="#10b981" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">96.8%</span>
          </div>
          <div className="sa-card-subtext">Filtered for period: {activeDates.label}</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Low Absenteeism Rate</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#2563eb' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Avg Employee Cost</span>
            <Lucide.UserCheck size={18} color="#2563eb" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">₹31,250</span>
            <span style={{ fontSize: '12px', color: '#5E6B82' }}>/ Employee</span>
          </div>
          <div className="sa-card-subtext">Base Salary + Overtime</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Healthy Cost Structure</span>
          </div>
        </div>
      </div>

      {/* Department Payroll Breakdown */}
      <div className="dashboard-card" style={{ padding: '20px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="card-title">Department-Wise Payroll Ledger</h3>
            <p className="card-subtitle">Salary Month: <strong>{filters.salaryMonth}</strong> | Daily Activity Filter: <strong>{activeDates.label}</strong></p>
          </div>
        </div>

        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Staff Count</th>
                <th>Gross Payroll</th>
                <th>Overtime Outflow</th>
                <th>Attendance %</th>
                <th>Payroll Status</th>
              </tr>
            </thead>
            <tbody>
              {deptHRData.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 750, color: '#24345C' }}>{d.dept}</td>
                  <td style={{ fontWeight: 650 }}>{d.headCount} Staff</td>
                  <td style={{ fontWeight: 750, color: '#8b5cf6' }}>{d.payroll}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 650 }}>{d.overtime}</td>
                  <td>
                    <span className="dashboard-badge badge-success">{d.attendance}</span>
                  </td>
                  <td>
                    <span className="dashboard-badge badge-info">{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
