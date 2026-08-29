'use client';

import { Activity, CalendarDays, Factory, Gauge, History, Package, ShieldCheck, Truck, TriangleAlert } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const text = (value, fallback = '—') => value === undefined || value === null || value === '' ? fallback : value;
const dateText = value => value ? new Date(value).toLocaleDateString('en-IN') : '—';
const statusOf = value => String(value || 'Scheduled').replaceAll('_', ' ');
const Card = ({ title, subtitle, icon: Icon, children, action }) => <section className="ph-command-card"><header><div><h2>{Icon && <Icon size={18}/>} {title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</header>{children}</section>;
const Metrics = ({ items }) => <div className="ph-metrics">{items.map(item => <div className="ph-metric" key={item.label}><span>{item.label}</span><strong className={item.tone || ''}>{item.value}</strong></div>)}</div>;
const Table = ({ columns = [], rows = [], empty = 'No data available' }) => (
  <div className="ph-table-wrap">
    <table>
      <thead>
        <tr>
          {columns.map((column, columnIndex) => (
            <th key={`${column.key || column.label || 'column'}-${columnIndex}`}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row, rowIndex) => {
          const rowKey = row._key || `${row.id || row.workOrderId || row.orderId || 'row'}-${rowIndex}`;
          return (
            <tr key={rowKey}>
              {columns.map((column, columnIndex) => (
                <td key={`${rowKey}-${column.key || column.label || 'column'}-${columnIndex}`}>
                  {column.render ? column.render(row) : text(row[column.key])}
                </td>
              ))}
            </tr>
          );
        }) : (
          <tr><td colSpan={columns.length} className="ph-empty">{empty}</td></tr>
        )}
      </tbody>
    </table>
  </div>
);
const Button = ({ children, onClick }) => <button className="ph-link-button" onClick={onClick}>{children}</button>;

export default function PlantHeadCommandDashboard({ state, dashboardData, productionAnalyticsData, departmentFilter, navigate }) {
  const production = dashboardData?.production || {};
  const dispatch = dashboardData?.dispatch || {};
  const store = dashboardData?.store || {};
  const qc = dashboardData?.qc || {};
  const workOrders = Array.isArray(state?.workOrders) ? state.workOrders : [];
  const machines = Array.isArray(productionAnalyticsData?.machines) ? productionAnalyticsData.machines : [];
  const today = new Date().toISOString().slice(0, 10);
  const qty = row => n(row.quantity ?? row.plannedQty ?? row.qty);
  const completed = workOrders.filter(row => ['COMPLETED','CLOSED','QC_PASSED'].includes(String(row.status || '').toUpperCase()));
  const plannedTarget = workOrders.reduce((sum,row) => sum + qty(row), 0);
  const actualProduction = completed.reduce((sum,row) => sum + qty(row), 0);
  const achievement = plannedTarget > 0 ? `${Math.round(actualProduction / plannedTarget * 100)}%` : 'Not Configured';
  const qcTotal = n(qc.inspectedToday) || n(qc.passed) + n(qc.failed) + n(qc.rejected);
  const qcPassRate = qcTotal > 0 ? `${Math.round(n(qc.passed) / qcTotal * 100)}%` : 'Not Available';
  const delayedOrders = workOrders.filter(row => String(row.status || '').toUpperCase().includes('DELAY') || (row.targetDate && new Date(row.targetDate) < new Date() && !['COMPLETED','CLOSED','QC_PASSED'].includes(String(row.status || '').toUpperCase())));

  const planningRows = workOrders.slice(0, 8).map(row => ({ ...row, product: row.productName || row.product || row.products, plannedQty: qty(row), machine: row.machine || row.productionLine || 'Not Assigned', shift: row.shift || 'Not Assigned', start: row.startDate || row.plannedStartDate, target: row.targetDate || row.deliveryDate }));
  const capacityRows = machines.map(machine => { const capacity = n(machine.capacity); const load = n(machine.plannedLoad); const actual = n(machine.actualOutput); return { id: machine.id || machine.machine, line: machine.productionLine || machine.machine || machine.name, capacity: capacity || 'Not Configured', load, actual, available: capacity ? Math.max(0, capacity - load) : 'Not Configured', utilization: capacity ? `${Math.round(load / capacity * 100)}%` : 'Not Configured', status: capacity ? (load > capacity ? 'Overloaded' : 'Available') : 'Not Configured' }; });
  const totalCapacity = machines.reduce((sum,row) => sum + n(row.capacity), 0);
  const plannedLoad = machines.reduce((sum,row) => sum + n(row.plannedLoad), 0);
  const approvalSources = [
    ...(state?.materialRequests || []).map(row => ({ ...row, type: 'Material Approval' })),
    ...(state?.purchaseIndents || []).map(row => ({ ...row, type: 'Material Indent' })),
    ...(state?.replacementRequests || []).map(row => ({ ...row, type: 'Replacement Request' })),
    ...(state?.returnRequests || []).map(row => ({ ...row, type: 'Return Request' }))
  ].filter(row => /APPROV|REJECT|RETURN|CLOSED|ISSUED/i.test(String(row.status || ''))).sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)).slice(0, 8);
  const safeInventoryValue = n(store.totalValue);
  const sourceCategories = Array.isArray(productionAnalyticsData?.categories) ? productionAnalyticsData.categories : [];
  const emptyRccPipes = { category: 'RCC Pipes', orders: 0, qty: 0, weight: 0, cost: 0, rejected: 0, dispatched: 0, pending: 0 };
  const categories = sourceCategories.some(row => String(row.category || '').toLowerCase() === 'rcc pipes') ? sourceCategories : [...sourceCategories, emptyRccPipes];
  const productWiseProduction = Object.values(workOrders.reduce((result, row) => {
    const product = row.productName || row.product || row.products || 'Unspecified Product';
    if (!result[product]) result[product] = { product, quantity: 0 };
    result[product].quantity += ['COMPLETED','CLOSED','QC_PASSED'].includes(String(row.status || '').toUpperCase()) ? qty(row) : 0;
    return result;
  }, {})).filter(row => row.quantity > 0);
  const categoryWiseProduction = categories.map(row => ({ category: row.category || 'Uncategorized', quantity: n(row.qty) })).filter(row => row.quantity > 0);
  const pieColors = ['#337a86','#2563eb','#84cc16','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

  return <div className="ph-command-sections">
    <Card title="Daily KPI Dashboard" subtitle="Plant-wide operational performance" icon={Gauge}><Metrics items={[
      {label:'Production Target',value:plannedTarget || 'Not Configured'}, {label:'Actual Production',value:actualProduction}, {label:'Achievement',value:achievement}, {label:'Work Orders Completed',value:completed.length}, {label:'QC Pass Rate',value:qcPassRate}, {label:'Delayed Orders',value:delayedOrders.length,tone:'danger'}, {label:'Ready for Dispatch',value:n(dispatch.readyForDispatch)}
    ]}/></Card>

    <Card title="Production Status — Work Orders" icon={Activity} action={<Button onClick={() => navigate.push('/plant-head/planning')}>View Production Details</Button>}><Metrics items={[
      {label:'Planned',value:n(production.planned)}, {label:'Material Waiting',value:n(production.materialWaiting)}, {label:'In Production',value:n(production.inProduction)}, {label:'QC Pending',value:n(production.qcPending)}, {label:'QC Passed',value:n(production.qcPassed)}, {label:'Completed Today',value:n(production.completedToday)}, {label:'Delayed',value:n(production.delayed),tone:'danger'}, {label:'Efficiency',value:Number.isFinite(Number(production.efficiency)) ? `${n(production.efficiency)}%` : 'Not Available'}
    ]}/></Card>

    <Card title="Production Planning Calendar" subtitle="Upcoming and active production schedule" icon={CalendarDays} action={<Button onClick={() => navigate.push('/plant-head/planning')}>View Full Planning Calendar</Button>}><div className="ph-view-tabs"><span>Day</span><span>Week</span><span>Month</span></div><Table rows={planningRows} empty="No production plans available." columns={[{key:'scheduleDate',label:'Date',render:r=>dateText(r.start)},{key:'id',label:'Sales Order',render:r=>r.orderNo || r.id},{key:'product',label:'Product'},{key:'plannedQty',label:'Planned Qty'},{key:'machine',label:'Machine/Line'},{key:'shift',label:'Shift'},{key:'startDate',label:'Start Date',render:r=>dateText(r.start)},{key:'targetDate',label:'Target Date',render:r=>dateText(r.target)},{key:'status',label:'Status',render:r=><span className="ph-status">{statusOf(r.status)}</span>}]}/></Card>

    <Card title="Capacity Planning" icon={Factory}><Metrics items={[{label:'Total Production Capacity',value:totalCapacity || 'Not Configured'},{label:'Planned Load',value:plannedLoad || 0},{label:'Actual Production',value:actualProduction},{label:'Available Capacity',value:totalCapacity ? Math.max(0,totalCapacity-plannedLoad) : 'Not Configured'},{label:'Capacity Utilization',value:totalCapacity ? `${Math.round(plannedLoad/totalCapacity*100)}%` : 'Not Configured'}]}/><Table rows={capacityRows} empty="Capacity is not configured. Add machine or production-line capacity to begin planning." columns={[{key:'line',label:'Production Line'},{key:'capacity',label:'Capacity'},{key:'load',label:'Planned Load'},{key:'actual',label:'Actual Output'},{key:'available',label:'Available'},{key:'utilization',label:'Utilization'},{key:'status',label:'Status'}]}/></Card>

    <Card title="Production Delay Analysis" icon={TriangleAlert}><Metrics items={[{label:'Total Delayed Orders',value:delayedOrders.length},{label:'Material Delays',value:delayedOrders.filter(r=>/material/i.test(r.delayReason||'')).length},{label:'Machine Delays',value:delayedOrders.filter(r=>/machine/i.test(r.delayReason||'')).length},{label:'QC/Rework Delays',value:delayedOrders.filter(r=>/qc|rework/i.test(r.delayReason||'')).length},{label:'Other Delays',value:delayedOrders.filter(r=>!/material|machine|qc|rework/i.test(r.delayReason||'')).length}]}/><Table rows={delayedOrders} empty="No delayed production orders." columns={[{key:'id',label:'Sales Order',render:r=>r.orderNo || r.id},{key:'productName',label:'Product'},{key:'targetDate',label:'Planned Date',render:r=>dateText(r.targetDate)},{key:'delayDuration',label:'Delay Duration',render:r=>text(r.delayDuration,'—')},{key:'delayReason',label:'Delay Reason',render:r=>text(r.delayReason,'Planning Delay')},{key:'responsibleDepartment',label:'Responsible Department',render:r=>text(r.responsibleDepartment,'Production')},{key:'revisedDate',label:'Revised Date',render:r=>dateText(r.revisedDate)},{key:'status',label:'Status',render:r=>statusOf(r.status)}]}/></Card>

    <Card title="QC Status — Inspections" icon={ShieldCheck}><Metrics items={[{label:'Inspected Today',value:n(qc.inspectedToday)},{label:'Passed',value:n(qc.passed)},{label:'Failed',value:n(qc.failed)},{label:'Rework Jobs',value:n(qc.rework)},{label:'Rejected',value:n(qc.rejected)},{label:'Pass Rate',value:qcTotal ? `${Math.round(n(qc.passed)/qcTotal*100)}%` : 'Not Available'},{label:'Rejection Rate',value:qcTotal ? `${Math.round((n(qc.failed)+n(qc.rejected))/qcTotal*100)}%` : 'Not Available'}]}/></Card>
    <Card title="QC Inspection Quality Distribution"><div className="ph-quality-grid">{[['Passed',qc.passed],['Failed',qc.failed],['Rework',qc.rework],['Rejected',qc.rejected]].map(([label,value])=><div key={label}><strong>{n(value)} Pcs</strong><span>{label}</span></div>)}</div></Card>
    <Card title="Dispatch Status — Logistics" icon={Truck}><Metrics items={[{label:'Ready for Dispatch',value:n(dispatch.readyForDispatch)},{label:'Scheduled Today',value:n(dispatch.scheduledToday)},{label:'Dispatched Today',value:n(dispatch.dispatchedToday)},{label:'Partial Dispatch',value:n(dispatch.partialDispatch)},{label:'Pending Dispatch',value:n(dispatch.pendingDispatch)},{label:'Delayed Dispatch',value:n(dispatch.delayedDispatch)},{label:'Active Vehicles',value:n(dispatch.vehiclesRunning)}]}/></Card>
    <Card title="Store Status — Raw Material" icon={Package}><Metrics items={[{label:'Total Inventory Value',value:`₹${(safeInventoryValue/100000).toFixed(1)} Lakhs`},{label:'Low Stock Items',value:`${n(store.lowStockItems)} Items`},{label:'Out of Stock',value:n(store.outOfStock)},{label:'Requested Today',value:n(store.materialRequestedToday)},{label:'Material Approved',value:n(store.materialApproved)},{label:'Material Issued',value:n(store.materialIssued)},{label:'Purchase Pending',value:n(store.purchasePending)}]}/></Card>
    <Card title="Category Wise Production Drilldown"><Table rows={categories} empty="No category production records available." columns={[{key:'category',label:'Category Name'},{key:'orders',label:'Orders Count',render:r=>n(r.orders)},{key:'qty',label:'Produced Qty',render:r=>`${n(r.qty)} Pcs`},{key:'weight',label:'Est. Tonnage',render:r=>`${n(r.weight)} Ton`},{key:'cost',label:'Production Cost',render:r=>`₹${n(r.cost).toLocaleString('en-IN')}`},{key:'rejected',label:'Rejected Qty',render:r=>`${n(r.rejected)} Pcs`},{key:'dispatched',label:'Dispatched Qty',render:r=>`${n(r.dispatched)} Pcs`},{key:'pending',label:'Pending Qty',render:r=>`${n(r.pending)} Pcs`}]}/></Card>
    <div className="ph-production-charts">
      <Card title="Category Wise Production" subtitle="Produced quantity by product category"><div className="ph-product-pie">{categoryWiseProduction.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryWiseProduction} dataKey="quantity" nameKey="category" cx="50%" cy="46%" innerRadius={58} outerRadius={92} paddingAngle={3}>{categoryWiseProduction.map((row,index)=><Cell key={`${row.category}-${index}`} fill={pieColors[index % pieColors.length]}/>)}</Pie><Tooltip formatter={(value,name)=>[`${n(value)} Pcs`,name]}/><Legend verticalAlign="bottom" wrapperStyle={{fontSize:'11px'}}/></PieChart></ResponsiveContainer> : <div className="ph-no-data"><strong>No category production data</strong><span>Produced category quantities will appear here.</span></div>}</div></Card>
      <Card title="Product Wise Production" subtitle="Completed production quantity by product"><div className="ph-product-pie">{productWiseProduction.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={productWiseProduction} dataKey="quantity" nameKey="product" cx="50%" cy="46%" innerRadius={58} outerRadius={92} paddingAngle={3}>{productWiseProduction.map((row,index)=><Cell key={`${row.product}-${index}`} fill={pieColors[index % pieColors.length]}/>)}</Pie><Tooltip formatter={(value,name)=>[`${n(value)} Pcs`,name]}/><Legend verticalAlign="bottom" wrapperStyle={{fontSize:'11px'}}/></PieChart></ResponsiveContainer> : <div className="ph-no-data"><strong>No product production data</strong><span>Completed product output will appear here.</span></div>}</div></Card>
    </div>
    <Card title="Recent Approval History" icon={History} action={<Button onClick={() => navigate.push('/plant-head/material-approvals')}>View Full Approval History</Button>}><Table rows={approvalSources} empty="No recent Plant Head approval decisions." columns={[{key:'id',label:'Request ID'},{key:'type',label:'Request Type'},{key:'requestedBy',label:'Requested By',render:r=>text(r.requestedBy||r.requester)},{key:'createdAt',label:'Request Date',render:r=>dateText(r.createdAt||r.requestDate)},{key:'decision',label:'Decision',render:r=>statusOf(r.decision||r.status)},{key:'updatedAt',label:'Decision Date',render:r=>dateText(r.updatedAt||r.approvedAt)},{key:'remarks',label:'Remarks',render:r=>text(r.remarks||r.notes)},{key:'status',label:'Status',render:r=><span className="ph-status">{statusOf(r.status)}</span>}]}/></Card>
  </div>;
}
