import React, { useState } from 'react';
import { 
  User, Calendar, Mail, Phone, Shield, Award, CheckCircle, XCircle, 
  Clock, FileText, TrendingUp, AlertTriangle, Truck, DollarSign
} from 'lucide-react';
import StatusBadge from '../../../shared/components/StatusBadge';
import DataTable from '../../../shared/components/DataTable';

export default function EmployeeDetail({ emp, state, onBack }) {
  const [activeTab, setActiveTab] = useState('performance');

  if (!emp) return null;

  // Calculate generic/specific stats
  const dept = emp.department;

  // Get matching leaves from state
  const empLeaves = (state.leaves || []).filter(l => l.empId === emp.id || l.empName === emp.name);

  // Render department-specific data
  const renderDepartmentContent = () => {
    switch (dept) {
      case 'Sales': {
        const empLeads = (state.sales?.leads || []).filter(l => l.salesperson === emp.name);
        const empOrders = (state.sales?.orders || []).filter(o => o.salesperson === emp.name);
        
        // Mock targets / call logs
        const leadsCount = empLeads.length || emp.leads || 0;
        const revenue = empOrders.reduce((sum, o) => sum + (o.payment?.totalAmount || 0), 0) || emp.salesRevenue || 0;
        const target = emp.target || (emp.name === 'Rahul' || emp.name === 'Rahul Sharma' ? 2000000 : emp.name === 'Amit' ? 1500000 : 1000000);
        const progress = Math.min(100, Math.round((revenue / target) * 100)) || 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Sales Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div className="app-card border-left-blue" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>LEADS ASSIGNED</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', display: 'block' }}>{leadsCount}</span>
              </div>
              <div className="app-card border-left-emerald" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>REVENUE GENERATED</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', display: 'block' }}>₹{(revenue).toLocaleString()}</span>
              </div>
              <div className="app-card border-left-purple" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>TARGET PROGRESS</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7', display: 'block' }}>{progress}%</span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="app-card" style={{ margin: 0, padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-text-primary)' }}>Target Progress Breakdown</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span>Target: <strong>₹{target.toLocaleString()}</strong></span>
                <span>Achieved: <strong style={{ color: '#10b981' }}>₹{revenue.toLocaleString()}</strong></span>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)' }} />
              </div>
            </div>

            {/* Leads Table */}
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Assigned CRM Leads</h4>
              <DataTable
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Company', accessor: 'companyName', render: (row) => <strong>{row.companyName}</strong> },
                  { header: 'Contact', accessor: 'contactPerson' },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
                  { header: 'Requirements', accessor: 'requirements' }
                ]}
                data={empLeads}
                emptyMessage="No leads assigned to this employee."
              />
            </div>

            {/* Orders Table */}
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Sales Orders Created</h4>
              <DataTable
                columns={[
                  { header: 'Order No', accessor: 'orderNo', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.orderNo}</strong> },
                  { header: 'Customer', accessor: 'customer.name' },
                  { header: 'Products', accessor: 'products' },
                  { header: 'Amount', accessor: 'payment.totalAmount', render: (row) => `₹${(row.payment?.totalAmount || 0).toLocaleString()}` },
                  { header: 'Stage', accessor: 'status', render: (row) => <span style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{row.status}</span> }
                ]}
                data={empOrders}
                emptyMessage="No sales orders recorded for this employee."
              />
            </div>
          </div>
        );
      }
      case 'Production': {
        const empWOs = (state.workOrders || []).filter(wo => wo.assignedTo === emp.name || wo.stage === emp.role);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div className="app-card border-left-blue" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>TASKS COMPLETED</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', display: 'block' }}>{emp.tasksCompleted || 0}</span>
              </div>
              <div className="app-card border-left-purple" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>SHIFT TYPE</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7', display: 'block' }}>General Shift</span>
              </div>
            </div>

            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Associated Work Orders</h4>
              <DataTable
                columns={[
                  { header: 'WO#', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
                  { header: 'Product', accessor: 'productName' },
                  { header: 'Qty', accessor: 'quantity' },
                  { header: 'Progress', accessor: 'progress', render: (row) => `${row.progress}%` },
                  { header: 'Stage', accessor: 'stage' },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={empWOs}
                emptyMessage="No active work orders explicitly assigned."
              />
            </div>
          </div>
        );
      }
      case 'QC': {
        // Find samples where employee was inspector
        const empInspections = (state.sales?.samples || []).filter(s => s.inspector === emp.name || s.inspector === 'Elena QA');
        const passedCount = empInspections.filter(s => s.status === 'Approved' || s.status === 'Passed').length;
        const failedCount = empInspections.filter(s => s.status === 'Failed' || s.status === 'Rejected' || s.status === 'Lost').length;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div className="app-card border-left-blue" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>TOTAL INSPECTED</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', display: 'block' }}>{empInspections.length}</span>
              </div>
              <div className="app-card border-left-emerald" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>PASSED</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', display: 'block' }}>{passedCount}</span>
              </div>
              <div className="app-card border-left-red" style={{ margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: 'bold' }}>FAILED</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', display: 'block' }}>{failedCount}</span>
              </div>
            </div>

            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Quality Control Registry</h4>
              <DataTable
                columns={[
                  { header: 'Sample ID', accessor: 'id' },
                  { header: 'Lead/Customer', accessor: 'leadName' },
                  { header: 'Product Item', accessor: 'product' },
                  { header: 'Quantity', accessor: 'quantity' },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
                data={empInspections}
                emptyMessage="No inspection records found for this inspector."
              />
            </div>
          </div>
        );
      }
      case 'Store': {
        const empMRs = (state.materialRequests || []).filter(mr => mr.requester === emp.name || mr.requester === 'Store Team');
        const empPOs = (state.purchaseOrders || []).filter(po => po.history?.some(h => h.remarks.includes(emp.name) || h.remarks.toLowerCase().includes('store')));
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Material Indents Handled</h4>
              <DataTable
                columns={[
                  { header: 'MR ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
                  { header: 'Work Order', accessor: 'workOrderId' },
                  { header: 'Materials', accessor: 'materials', render: (row) => row.materials.map(m => `${m.materialName} (${m.quantityRequested})`).join(', ') },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
                data={empMRs}
                emptyMessage="No material requests processed."
              />
            </div>

            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Associated Purchase Indents</h4>
              <DataTable
                columns={[
                  { header: 'PO#', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
                  { header: 'Items Requested', accessor: 'items', render: (row) => row.items.map(i => `${i.name} (x${i.quantity})`).join(', ') },
                  { header: 'Notes', accessor: 'notes' },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
                data={empPOs}
                emptyMessage="No purchase orders created by this account."
              />
            </div>
          </div>
        );
      }
      case 'Dispatch': {
        const empDeliveries = (state.dispatches || []).filter(d => d.driverName === emp.name || d.driverName === 'Ramesh Singh');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Deliveries Logs</h4>
              <DataTable
                columns={[
                  { header: 'DSP Ref', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
                  { header: 'Order Ref', accessor: 'orderNo' },
                  { header: 'Customer', accessor: 'customerName' },
                  { header: 'LR Number', accessor: 'lrNumber' },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
                data={empDeliveries}
                emptyMessage="No deliveries logged under this operator."
              />
            </div>
          </div>
        );
      }
      case 'Finance': {
        const empPayments = (state.payments || []).filter(p => p.verified === emp.name || p.verified === 'Approved');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Verified Transaction Journals</h4>
              <DataTable
                columns={[
                  { header: 'Invoice#', accessor: 'invoiceNo' },
                  { header: 'Customer', accessor: 'customerName' },
                  { header: 'Amount', accessor: 'totalAmount', render: (row) => `₹${row.totalAmount.toLocaleString()}` },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
                  { header: 'Verification', accessor: 'verified' }
                ]}
                data={empPayments}
                emptyMessage="No payments audit trace logs found."
              />
            </div>
          </div>
        );
      }
      case 'Plant': {
        const empApprovals = (state.materialRequests || []).filter(mr => mr.status === 'Issued' || mr.status === 'Approved');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Operation Sign-Offs (Material Approvals)</h4>
              <DataTable
                columns={[
                  { header: 'Request ID', accessor: 'id' },
                  { header: 'Work Order', accessor: 'workOrderId' },
                  { header: 'Requested By', accessor: 'requester' },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
                data={empApprovals}
                emptyMessage="No administrative clearances recorded."
              />
            </div>
          </div>
        );
      }
      case 'HR': {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="app-card" style={{ margin: 0 }}>
              <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Leave Applications Registry</h4>
              <DataTable
                columns={[
                  { header: 'Leave ID', accessor: 'id' },
                  { header: 'Start Date', accessor: 'startDate' },
                  { header: 'End Date', accessor: 'endDate' },
                  { header: 'Duration (Days)', accessor: 'duration' },
                  { header: 'Reason', accessor: 'reason' },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
                data={empLeaves}
                emptyMessage="No leave applications on file."
              />
            </div>
            <div className="app-card border-left-blue" style={{ margin: 0, padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-text-primary)' }}>Payroll Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Base Salary (Monthly):</span>
                  <strong>₹{(emp.salary || 30000).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PF Contribution:</span>
                  <strong>₹{((emp.salary || 30000) * 0.12).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Net Take-home Pay:</span>
                  <strong>₹{((emp.salary || 30000) * 0.88).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return <p style={{ color: '#5E6B82' }}>No custom records for this department.</p>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>Employee Profile Detail</h2>
          <span style={{ fontSize: '11px', color: '#475569' }}>Roster Personnel Core File & Verification Audit</span>
        </div>
        <button
          className="action-btn"
          style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      {/* Main Profile Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Left Card: Core Employee Info */}
        <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', margin: 0 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)', border: '2px solid var(--color-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
              <User size={36} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>{emp.name}</h3>
            <span style={{ fontSize: '11px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>{emp.role}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={14} color="#5E6B82" />
              <span>Dept: <strong>{emp.department}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={14} color="#5E6B82" />
              <span>Joined: <strong>{emp.joiningDate || 'N/A'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={14} color="#5E6B82" />
              <span style={{ wordBreak: 'break-all' }}>{emp.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={14} color="#5E6B82" />
              <span>{emp.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={14} color="#5E6B82" />
              <span>Attendance: <strong>{emp.attendance || 100}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <span style={{ color: '#5E6B82' }}>Status:</span>
              <StatusBadge status={emp.active ? 'Active' : 'Inactive'} />
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Tab Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '16px' }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'performance' ? '2px solid var(--color-primary)' : 'none',
                color: activeTab === 'performance' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
              onClick={() => setActiveTab('performance')}
            >
              Performance & Records
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'attendance' ? '2px solid var(--color-primary)' : 'none',
                color: activeTab === 'attendance' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
              onClick={() => setActiveTab('attendance')}
            >
              Leaves & Attendance History
            </button>
          </div>

          {/* Tab Contents */}
          <div>
            {activeTab === 'performance' && renderDepartmentContent()}
            {activeTab === 'attendance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="app-card border-left-amber" style={{ margin: 0, padding: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-text-primary)' }}>Leaves Profile</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px' }}>
                    <span>Leaves Taken:</span>
                    <strong>{emp.leavesTaken || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span>Leave Balance:</span>
                    <strong>{15 - (emp.leavesTaken || 0)} Days</strong>
                  </div>
                </div>

                <div className="app-card" style={{ margin: 0 }}>
                  <h4 className="card-heading" style={{ fontSize: '13px', marginBottom: '10px' }}>Recent Leaves Log</h4>
                  <DataTable
                    columns={[
                      { header: 'Leave ID', accessor: 'id' },
                      { header: 'Start Date', accessor: 'startDate' },
                      { header: 'End Date', accessor: 'endDate' },
                      { header: 'Days', accessor: 'duration' },
                      { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
                    ]}
                    data={empLeaves}
                    emptyMessage="No recent leave history recorded."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
