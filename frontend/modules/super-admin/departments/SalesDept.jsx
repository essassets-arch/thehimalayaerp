import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

/* ── Inline responsive styles injected once ──────────────────────────── */
const SALES_DEPT_STYLES = `
  .sales-dept-root {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* CRM + Funnel side-by-side on desktop, stacked on mobile */
  .sales-crm-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 24px;
  }

  /* Orders + Payments side-by-side */
  .sales-orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  /* CRM metric rows */
  .crm-metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    font-size: 13px;
    gap: 8px;
  }
  .crm-metric-row:last-child { border-bottom: none; }
  .crm-metric-label { color: #5E6B82; flex: 1; }
  .crm-metric-value { font-weight: 700; font-size: 14px; }

  /* Funnel step */
  .funnel-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .funnel-step-bar {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 8px 14px;
    width: 90%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.15s;
  }
  .funnel-step-bar:hover { transform: scaleX(1.02); }
  .funnel-arrow { color: #8893A7; margin: 2px 0; font-size: 10px; }

  /* Scrollable table wrappers */
  .sales-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* App card reset for dept */
  .sales-dept-root .app-card {
    margin: 0 !important;
  }

  /* ── Responsive breakpoints ───────────────────────────────────────── */
  @media (max-width: 900px) {
    .sales-crm-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .sales-dept-root {
      gap: 16px;
    }
    .sales-orders-grid {
      grid-template-columns: 1fr;
    }
    .crm-metric-value {
      font-size: 13px;
    }
  }
`;

function InjectStyles({ id, css }) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
  return null;
}

/* ── Funnel pipeline colours ─────────────────────────────────────────── */
const FUNNEL_COLORS = ['#0ea5e9', '#38bdf8', '#a855f7', '#c084fc', '#10b981', '#34d399'];

export default function SalesDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  /* ── Inject styles once ─────────────────────────────────────────────── */
  InjectStyles({ id: 'sales-dept-styles', css: SALES_DEPT_STYLES });

  /* ── Data: filter Sales employees ──────────────────────────────────── */
  const salesEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'Sales'
  );

  /* ── Live KPI calculations ──────────────────────────────────────────── */
  const totalLeads      = state.sales?.leads?.length || 0;
  const newLeads        = state.sales?.leads?.filter(l => l.status === 'New').length || 0;
  const followUpLeads   = state.sales?.leads?.filter(l => l.status === 'Follow-up' || l.status === 'Sample Stage').length || 0;
  const qualifiedLeads  = state.sales?.leads?.filter(l => ['Converted', 'Quotation', 'Sample Stage'].includes(l.status)).length || 0;
  const convertedLeads  = state.sales?.leads?.filter(l => l.status === 'Converted').length || 0;
  const conversionRate  = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const totalRevenue    = (state.sales?.orders || []).reduce(
    (sum, o) => sum + (o.payment?.totalAmount || 0), 0
  );

  const pendingPayments = (state.payments || []).filter(p => p.status !== 'Paid');

  /* ── Funnel pipeline stages ─────────────────────────────────────────── */
  const funnelStages = [
    { label: 'Leads',       val: `${totalLeads} Leads`,                                              color: FUNNEL_COLORS[0] },
    { label: 'Qualified',   val: `${qualifiedLeads} Qualified`,                                      color: FUNNEL_COLORS[1] },
    { label: 'Quotation',   val: `${state.sales?.quotations?.length || 0} Quotations`,                      color: FUNNEL_COLORS[2] },
    { label: 'Sample',      val: `${state.sales?.samples?.length || 0} Samples`,                            color: FUNNEL_COLORS[3] },
    { label: 'Approved',    val: `${state.sales?.samples?.filter(s => s.status === 'Approved').length || 0} Approved`, color: FUNNEL_COLORS[4] },
    { label: 'Orders',      val: `${state.sales?.orders?.length || 0} Orders`,                              color: FUNNEL_COLORS[5] },
  ];

  /* ── Employee columns ───────────────────────────────────────────────── */
  const employeeColumns = [
    { header: 'Employee',  accessor: 'name',         render: (row) => <strong>{row.name}</strong> },
    { header: 'Leads',     accessor: 'leads' },
    { header: 'Quotations',accessor: 'quotations' },
    { header: 'Orders',    accessor: 'orders' },
    {
      header: 'Revenue',
      accessor: 'salesRevenue',
      render: (row) => `\u20B9${(row.salesRevenue || 0).toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} />
    },
  ];

  /* ── Employee drill-down ────────────────────────────────────────────── */
  if (deptEmployee) {
    return (
      <EmployeeDetail
        emp={deptEmployee}
        state={state}
        onBack={() => setDeptEmployee(null)}
      />
    );
  }

  /* ── CRM metric rows data ───────────────────────────────────────────── */
  const crmMetrics = [
    { label: 'Total Leads Active',  value: totalLeads,        color: '#1e293b' },
    { label: 'New Leads Today',     value: newLeads,          color: '#0ea5e9' },
    { label: 'Follow-ups Pending',  value: followUpLeads,     color: '#f59e0b' },
    { label: 'Qualified Leads',     value: qualifiedLeads,    color: '#a855f7' },
    { label: 'Converted Leads',     value: convertedLeads,    color: '#10b981' },
    { label: 'Conversion Rate',     value: `${conversionRate}%`, color: '#10b981' },
  ];

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="sales-dept-root">

      {/* Header */}
      <DepartmentHeader
        title="Sales Department Command Center"
        subtitle="Full sales-force performance, pipeline status, and receivables monitoring"
        onBack={onBack}
      />

      {/* KPI Strip */}
      <DepartmentKPI
        data={[
          { title: 'Total Sales Employees', value: salesEmployees.length },
          { title: 'Active Sales Users',    value: salesEmployees.filter(e => e.active).length },
          { title: 'Total Leads',           value: totalLeads },
          { title: 'Converted Leads',       value: convertedLeads },
          { title: 'Conversion Rate',       value: `${conversionRate}%` },
          { title: 'Total Revenue',         value: `\u20B9${totalRevenue.toLocaleString()}` },
        ]}
      />

      {/* CRM Overview + Funnel – responsive 2-col → 1-col */}
      <div className="sales-crm-grid">

        {/* CRM Overview */}
        <div className="app-card">
          <h3 className="card-heading" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
            CRM Overview Metrics
          </h3>
          <p style={{ fontSize: '11px', color: '#8893A7', marginBottom: '16px' }}>
            Live pipeline numbers from ERP state
          </p>

          {crmMetrics.map((m, i) => (
            <div key={i} className="crm-metric-row">
              <span className="crm-metric-label">{m.label}</span>
              <span className="crm-metric-value" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Sales Funnel */}
        <div className="app-card">
          <h3 className="card-heading" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
            Sales Funnel Pipeline
          </h3>
          <p style={{ fontSize: '11px', color: '#8893A7', marginBottom: '16px' }}>
            Stage-by-stage conversion flow
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {funnelStages.map((s, idx) => (
              <div key={idx} className="funnel-step">
                <div
                  className="funnel-step-bar"
                  style={{ border: `1.5px solid ${s.color}` }}
                >
                  <strong style={{ fontSize: '12px', color: '#1e293b' }}>{s.label}</strong>
                  <span style={{ fontSize: '11px', color: s.color, fontWeight: 700 }}>{s.val}</span>
                </div>
                {idx < funnelStages.length - 1 && (
                  <span className="funnel-arrow">&#9660;</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sales Team Roster */}
      <EmployeeTable
        employees={salesEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />

      {/* Orders + Payments – auto-fit responsive grid */}
      <div className="sales-orders-grid">

        {/* Recent Sales Orders */}
        <div className="app-card">
          <h3 className="card-heading" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>
            Recent Sales Orders
          </h3>
          <div className="sales-table-wrap">
            <DataTable
              columns={[
                {
                  header: 'Order #',
                  accessor: 'orderNo',
                  render: (row) => (
                    <strong style={{ color: 'var(--color-primary, #0ea5e9)' }}>{row.orderNo}</strong>
                  ),
                },
                { header: 'Customer', accessor: 'customer.name' },
                {
                  header: 'Amount',
                  accessor: 'payment.totalAmount',
                  render: (row) => `\u20B9${(row.payment?.totalAmount || 0).toLocaleString()}`,
                },
                {
                  header: 'Stage',
                  accessor: 'status',
                  render: (row) => (
                    <span style={{
                      background: 'rgba(59,130,246,0.1)',
                      color: '#3b82f6',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}>
                      {row.status}
                    </span>
                  ),
                },
              ]}
              data={state.sales?.orders || []}
              emptyMessage="No active orders found."
            />
          </div>
        </div>

        {/* Sales Payments & Collections */}
        <div className="app-card">
          <h3 className="card-heading" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>
            Sales Payments &amp; Collections
          </h3>
          <div className="sales-table-wrap">
            <DataTable
              columns={[
                { header: 'Invoice #',  accessor: 'invoiceNo' },
                { header: 'Customer',   accessor: 'customerName' },
                {
                  header: 'Due Amount',
                  accessor: 'totalAmount',
                  render: (row) => `\u20B9${((row.totalAmount || 0) - (row.paidAmount || 0)).toLocaleString()}`,
                },
                { header: 'Due Date',   accessor: 'dueDate' },
              ]}
              data={pendingPayments}
              emptyMessage="No outstanding invoices found."
            />
          </div>
        </div>

      </div>
    </div>
  );
}
