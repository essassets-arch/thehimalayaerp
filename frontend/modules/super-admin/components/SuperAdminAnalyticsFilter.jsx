import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import "./dashboard.css";

export default function SuperAdminAnalyticsFilter({
  title = "Analytics Filter",
  showBranch = false,
  showCustomer = false,
  showVendor = false,
  showProduct = false,
  showCategory = false,
  showDepartment = false,
  showSalesperson = false,
  showStatus = false,
  showShift = false,
  showMonth = false,
  onExportPDF = null,
  onExportExcel = null,
  customActions = null
}) {
  const {
    period,
    startDate,
    endDate,
    activeDates,
    filters,
    setPeriod,
    setCustomDates,
    setFilter,
    clearAllFilters
  } = useSuperAdminFilter();

  const [showModal, setShowModal] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [dateError, setDateError] = useState('');

  const periodOptions = [
    'Today',
    'Yesterday',
    'This Week',
    'Last Week',
    'This Month',
    'Last Month',
    'This Quarter',
    'Last Quarter',
    'This Financial Year',
    'Last Financial Year',
    'Custom Date Range'
  ];

  const handlePeriodClick = (p) => {
    if (p === 'Custom Date Range') {
      setShowModal(true);
    } else {
      setPeriod(p);
    }
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) {
      setDateError('Please select both Start Date and End Date.');
      return;
    }
    if (new Date(tempStart) > new Date(tempEnd)) {
      setDateError('End Date must be on or after Start Date.');
      return;
    }
    setDateError('');
    setCustomDates(tempStart, tempEnd);
    setShowModal(false);
  };

  return (
    <div className="sa-analytics-filter">
      {/* Header Row */}
      <div className="sa-analytics-filter__header">
        <div className="sa-analytics-filter__title-group">
          <Lucide.Filter size={18} color="#2563eb" />
          <h3 className="sa-analytics-filter__title">{title}</h3>
        </div>

        <div className="sa-analytics-filter__range-badge">
          <Lucide.Calendar size={14} color="#1e3a8a" />
          <span>{activeDates.label}</span>
          <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: 600, borderLeft: '1px solid #bfdbfe', paddingLeft: '8px' }}>
            {activeDates.compareLabel}
          </span>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="sa-analytics-filter__bar">
        {/* Quick Period Pills (Horizontally Scrollable) */}
        <div className="sa-analytics-filter__periods">
          {periodOptions.map(p => (
            <button
              key={p}
              onClick={() => handlePeriodClick(p)}
              className={`sa-analytics-filter__pill ${period === p ? 'is-active' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters & Actions Row */}
      <div className="sa-analytics-filter__select-group">
        {showBranch && (
          <select
            value={filters.branch}
            onChange={(e) => setFilter('branch', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Branch: All Branches</option>
            <option value="Dehradun Plant">Dehradun Plant</option>
            <option value="Haridwar Unit 1">Haridwar Unit 1</option>
            <option value="Roorkee Works">Roorkee Works</option>
          </select>
        )}

        {showDepartment && (
          <select
            value={filters.department}
            onChange={(e) => setFilter('department', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Department: All</option>
            <option value="Store">Store / Procurement</option>
            <option value="Production">Production Floor</option>
            <option value="QC">Quality Control</option>
            <option value="Dispatch">Dispatch & Logistics</option>
            <option value="HR">HR & Payroll</option>
            <option value="Sales">Sales & CRM</option>
            <option value="Finance">Finance & Accounts</option>
          </select>
        )}

        {showCustomer && (
          <select
            value={filters.customer}
            onChange={(e) => setFilter('customer', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Customer: All Clients</option>
            <option value="ABC Infrastructure Ltd">ABC Infrastructure Ltd</option>
            <option value="Urban Construction Corp">Urban Construction Corp</option>
            <option value="Metro Projects India">Metro Projects India</option>
            <option value="Apex Builders & Engineers">Apex Builders & Engineers</option>
            <option value="Smart City Development Group">Smart City Development Group</option>
          </select>
        )}

        {showVendor && (
          <select
            value={filters.vendor}
            onChange={(e) => setFilter('vendor', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Vendor: All Suppliers</option>
            <option value="Supreme Resins Pvt Ltd">Supreme Resins Pvt Ltd</option>
            <option value="Jindal Steel & Power">Jindal Steel & Power</option>
            <option value="Ambuja Cement Supply">Ambuja Cement Supply</option>
            <option value="National Chemicals India">National Chemicals India</option>
          </select>
        )}

        {showProduct && (
          <select
            value={filters.product}
            onChange={(e) => setFilter('product', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Product: All Products</option>
            <option value="FRP Manhole Covers">FRP Manhole Covers</option>
            <option value="RCC Hume Pipes">RCC Hume Pipes</option>
            <option value="FRP Chambers">FRP Chambers</option>
            <option value="FRP Gratings">FRP Gratings</option>
            <option value="Telecom Covers">Telecom Covers</option>
          </select>
        )}

        {showCategory && (
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Category: All Categories</option>
            <option value="FRP Composites">FRP Composites</option>
            <option value="Precast Concrete">Precast Concrete</option>
            <option value="Drainage & Utility">Drainage & Utility</option>
            <option value="Telecom Infra">Telecom Infra</option>
          </select>
        )}

        {showSalesperson && (
          <select
            value={filters.salesperson}
            onChange={(e) => setFilter('salesperson', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Salesperson: All Representatives</option>
            <option value="SuperSales 1">SuperSales 1 (supersales1@himalayaerp.com)</option>
            <option value="SuperSales 2">SuperSales 2 (supersales2@himalayaerp.com)</option>
            <option value="Sales Executive 1">Sales Executive 1 (sales1@himalayaerp.com)</option>
            <option value="Sales Executive 2">Sales Executive 2 (sales2@himalayaerp.com)</option>
            <option value="Sales Executive 3">Sales Executive 3 (sales3@himalayaerp.com)</option>
            <option value="Sales Executive 4">Sales Executive 4 (sales4@himalayaerp.com)</option>
            <option value="Sales Executive 5">Sales Executive 5 (sales5@himalayaerp.com)</option>
            <option value="Sales Executive 6">Sales Executive 6 (sales6@himalayaerp.com)</option>
            <option value="Sales Executive 7">Sales Executive 7 (sales7@himalayaerp.com)</option>
          </select>
        )}

        {showStatus && (
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Status: All Statuses</option>
            <option value="Completed">Completed / Delivered</option>
            <option value="Pending">Pending / In Progress</option>
            <option value="Overdue">Overdue / Delayed</option>
            <option value="Approved">Approved</option>
          </select>
        )}

        {showShift && (
          <select
            value={filters.shift}
            onChange={(e) => setFilter('shift', e.target.value)}
            className="sa-analytics-filter__select"
          >
            <option value="All">Shift: All Shifts</option>
            <option value="Morning Shift">Morning Shift (08:00 - 16:00)</option>
            <option value="Evening Shift">Evening Shift (16:00 - 00:00)</option>
            <option value="Night Shift">Night Shift (00:00 - 08:00)</option>
          </select>
        )}

        {showMonth && (
          <select
            value={filters.salaryMonth}
            onChange={(e) => setFilter('salaryMonth', e.target.value)}
            className="sa-analytics-filter__select"
            style={{ borderColor: '#8b5cf6', background: '#faf5ff' }}
          >
            <option value="July 2026">Salary Month: July 2026</option>
            <option value="June 2026">Salary Month: June 2026</option>
            <option value="May 2026">Salary Month: May 2026</option>
            <option value="April 2026">Salary Month: April 2026</option>
          </select>
        )}

        {/* Clear All Filters Button */}
        <button
          onClick={clearAllFilters}
          className="sa-analytics-filter__btn"
          title="Reset period to This Month and clear secondary filters"
        >
          <Lucide.RotateCcw size={14} />
          <span>Clear All Filters</span>
        </button>

        {/* Export PDF & Excel Actions */}
        <div className="sa-analytics-filter__actions">
          {onExportPDF && (
            <button onClick={onExportPDF} className="sa-analytics-filter__btn">
              <Lucide.FileText size={14} color="#ef4444" />
              <span>Export PDF</span>
            </button>
          )}
          {onExportExcel && (
            <button onClick={onExportExcel} className="sa-analytics-filter__btn">
              <Lucide.FileSpreadsheet size={14} color="#10b981" />
              <span>Export Excel</span>
            </button>
          )}
          {customActions}
        </div>
      </div>

      {/* Custom Date Modal */}
      {showModal && (
        <div className="modal-overlay active" onClick={() => setShowModal(false)} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '90%' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Custom Date Range Selection</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {dateError && (
                <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                  {dateError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Start Date (Inclusive)</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D6E2F0', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>End Date (Inclusive)</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D6E2F0', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCustom}
                  className="sa-analytics-filter__btn--primary"
                  style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}
                >
                  Apply Date Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
