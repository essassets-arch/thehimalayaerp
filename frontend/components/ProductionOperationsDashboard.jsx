'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ClipboardPlus, Factory, RefreshCw, Trash2, X } from 'lucide-react';
import { backendFetch } from '../lib/backendFetch';
const number = (value) => Number(value) || 0;
const workOrderRef = (wo) => wo.workOrderNo || wo.workOrderId || wo.id || wo.orderNo || '—';
const productName = (wo) => wo.productName || wo.product || wo.itemName || wo.order?.product || '—';
const statusText = (wo) => String(wo.status || wo.workflowStatus || '').toUpperCase().replaceAll(' ', '_');

function Modal({ title, onClose, children }) {
  return <div className="pod-overlay" role="presentation" onMouseDown={onClose}>
    <section className="pod-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span>Production entry</span><h3>{title}</h3></div><button className="pod-icon-btn" onClick={onClose} aria-label="Close"><X size={19} /></button></header>
      {children}
    </section>
  </div>;
}

const Field = ({ label, children }) => <label className="pod-field"><span>{label}</span>{children}</label>;

export default function ProductionOperationsDashboard({ workOrders = [], initialShiftEntries = [], initialScrapEntries = [], onCompleteRework, productionTargetAchievement, loadingTarget }) {
  const [shiftEntries, setShiftEntries] = useState(initialShiftEntries);
  const [scrapEntries, setScrapEntries] = useState(initialScrapEntries);
  const [completedRework, setCompletedRework] = useState([]);
  const [modal, setModal] = useState(null);
  const [shiftForm, setShiftForm] = useState({ workOrderId: '', shift: 'Morning', supervisor: '', targetQty: '', producedQty: '', rejectedQty: '', reworkQty: '', date: new Date().toISOString().slice(0, 10) });
  const [scrapForm, setScrapForm] = useState({ workOrderId: '', shift: 'Morning', scrapQty: '', wastageQty: '', category: 'Process Scrap', supervisor: '', date: new Date().toISOString().slice(0, 10), remarks: '' });

  useEffect(() => {
    if (initialShiftEntries.length > 0) setShiftEntries(initialShiftEntries);
  }, [initialShiftEntries]);

  useEffect(() => {
    if (initialScrapEntries.length > 0) setScrapEntries(initialScrapEntries);
  }, [initialScrapEntries]);
  const selectedShiftWO = workOrders.find((wo) => String(wo.id || wo.workOrderId || wo.workOrderNo) === shiftForm.workOrderId);
  const selectedScrapWO = workOrders.find((wo) => String(wo.id || wo.workOrderId || wo.workOrderNo) === scrapForm.workOrderId);
  const reworkJobs = workOrders.filter((wo) => ['REWORK', 'REWORK_REQUIRED', 'REWORK_IN_PROGRESS', 'QC_FAILED', 'FAILED'].includes(statusText(wo)) || number(wo.reworkCount) > 0).filter((wo) => !completedRework.includes(String(wo.id || workOrderRef(wo))));

  const metrics = useMemo(() => {
    const entryTarget = shiftEntries.reduce((sum, item) => sum + number(item.targetQty), 0);
    const planned = entryTarget || workOrders.reduce((sum, wo) => sum + number(wo.targetQty || wo.plannedQty || wo.quantity), 0);
    const produced = shiftEntries.reduce((sum, item) => sum + number(item.producedQty), 0);
    const rejected = shiftEntries.reduce((sum, item) => sum + number(item.rejectedQty), 0);
    const rework = shiftEntries.reduce((sum, item) => sum + number(item.reworkQty), 0) || reworkJobs.reduce((sum, wo) => sum + number(wo.reworkQty || wo.failedQty), 0);
    const scrap = scrapEntries.reduce((sum, item) => sum + number(item.scrapQty) + number(item.wastageQty), 0);
    const good = Math.max(0, produced - rejected - scrap);
    return { planned, produced, rejected, rework, scrap, good, efficiency: planned ? good / planned * 100 : null, reworkRate: produced ? rework / produced * 100 : 0, wasteRate: produced ? scrap / produced * 100 : 0 };
  }, [shiftEntries, scrapEntries, workOrders, reworkJobs]);

  const shiftChart = ['Morning', 'Night'].map((shift) => {
    const rows = shiftEntries.filter((item) => item.shift === shift);
    const target = rows.reduce((sum, item) => sum + number(item.targetQty), 0);
    const actual = rows.reduce((sum, item) => sum + number(item.producedQty), 0);
    const rejected = rows.reduce((sum, item) => sum + number(item.rejectedQty), 0);
    return { shift, Target: target, Produced: actual, Good: Math.max(0, actual - rejected), efficiency: target ? ((actual - rejected) / target * 100).toFixed(1) : '—' };
  });
  const targetActual = shiftEntries.slice(-8).map((item, index) => ({ name: `${item.date.slice(5)} ${item.shift[0]}`, Target: number(item.targetQty), Actual: Math.max(0, number(item.producedQty) - number(item.rejectedQty)), key: `${item.id}-${index}` }));

  const submitShift = async (event) => {
    event.preventDefault();
    try {
      const entryPayload = { ...shiftForm, targetQty: number(shiftForm.targetQty), producedQty: number(shiftForm.producedQty), rejectedQty: number(shiftForm.rejectedQty), reworkQty: number(shiftForm.reworkQty) };
      const res = await backendFetch('/api/backend/production/shift-entries', { method: 'POST', body: JSON.stringify(entryPayload) });
      if (res?.success) {
        setShiftEntries([...shiftEntries, { ...res.data, workOrder: workOrderRef(selectedShiftWO || {}), product: productName(selectedShiftWO || {}), efficiency: number(shiftForm.targetQty) ? Math.max(0, number(shiftForm.producedQty) - number(shiftForm.rejectedQty)) / number(shiftForm.targetQty) * 100 : 0 }]);
        setModal(null);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save shift entry');
    }
  };

  const submitScrap = async (event) => {
    event.preventDefault();
    try {
      const entryPayload = { ...scrapForm, scrapQty: number(scrapForm.scrapQty), wastageQty: number(scrapForm.wastageQty) };
      const res = await backendFetch('/api/backend/production/scrap-entries', { method: 'POST', body: JSON.stringify(entryPayload) });
      if (res?.success) {
        setScrapEntries([...scrapEntries, { ...res.data, workOrder: workOrderRef(selectedScrapWO || {}), product: productName(selectedScrapWO || {}) }]);
        setModal(null);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save scrap entry');
    }
  };

  const completeRework = async (wo) => {
    try {
      await backendFetch(`/api/backend/production/${wo.id || wo.workOrderId}/complete-rework`, { method: 'POST' });
      await onCompleteRework?.(wo);
      setCompletedRework([...completedRework, String(wo.id || workOrderRef(wo))]);
    } catch (e) {
      console.error(e);
      alert('Failed to complete rework');
    }
  };

  const kpis = [
    ['Total Planned', metrics.planned, 'Target production quantity', '#2563eb'],
    ['Produced', metrics.produced, 'Recorded across all shifts', '#10b981'],
    ['QC Pending', workOrders.filter((wo) => statusText(wo) === 'QC_PENDING').length, 'Work orders awaiting QC', '#8b5cf6'],
    ['Rework', metrics.rework, `${metrics.reworkRate.toFixed(1)}% rework rate`, '#f97316'],
    ['Scrap / Wastage', metrics.scrap, `${metrics.wasteRate.toFixed(1)}% wastage rate`, '#ef4444'],
    ['Production Efficiency', metrics.efficiency == null ? 'No data' : `${metrics.efficiency.toFixed(1)}%`, 'Actual good ÷ target × 100', '#06b6d4']
  ];

  return <section className="pod-shell">
    <div className="pod-heading"><div><span>Production control</span><h2>Production Performance & Quality Flow</h2><p>Shift output, rework, wastage and production efficiency in one live view.</p></div><div className="pod-actions"><button onClick={() => setModal('shift')}><ClipboardPlus size={17} /> Shift Production Entry</button><button className="secondary" onClick={() => setModal('scrap')}><Trash2 size={17} /> Scrap / Wastage Entry</button></div></div>
    <div className="pod-kpis">
      <article style={{ '--accent': '#10b981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span>🎯 Target Achievement</span>
        {loadingTarget ? (
          <strong>Loading...</strong>
        ) : !productionTargetAchievement || !productionTargetAchievement.hasTarget ? (
          <>
            <strong>No Target</strong>
            <small>No active target assigned</small>
          </>
        ) : (
          <>
            <strong style={{ fontSize: '22px' }}>{productionTargetAchievement.achievement}%</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', color: '#64748b', marginTop: '4px', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Target:</span>
                <b>{Number(productionTargetAchievement.target).toLocaleString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Achieved:</span>
                <b style={{ color: '#10b981' }}>{Number(productionTargetAchievement.achieved).toLocaleString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Remaining:</span>
                <b style={{ color: productionTargetAchievement.remaining > 0 ? '#ef4444' : '#10b981' }}>
                  {Number(productionTargetAchievement.remaining).toLocaleString()}
                </b>
              </div>
            </div>
          </>
        )}
      </article>
      {kpis.map(([label, value, note, color]) => <article key={label} style={{ '--accent': color }}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}
    </div>
    <div className="pod-chart-grid">
      <article className="pod-panel"><div className="pod-panel-title"><div><h3>Shift-wise Production Performance</h3><p>Morning vs Night shift output and good production</p></div></div><div className="pod-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={shiftChart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="shift" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="Target" fill="#D6E2F0" radius={[5,5,0,0]} /><Bar dataKey="Produced" fill="#3b82f6" radius={[5,5,0,0]} /><Bar dataKey="Good" fill="#10b981" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div><div className="pod-shift-summary">{shiftChart.map(row => <div key={row.shift}><b>{row.shift}</b><span>{row.efficiency === '—' ? 'No production data' : `${row.efficiency}% efficiency`}</span></div>)}</div></article>
      <article className="pod-panel"><div className="pod-panel-title"><div><h3>Target vs Actual Production</h3><p>Latest recorded production shifts</p></div></div>{targetActual.length ? <div className="pod-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={targetActual}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="Target" fill="#8893A7" radius={[5,5,0,0]} /><Bar dataKey="Actual" fill="#6366f1" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div> : <div className="pod-empty"><Factory size={34} /><b>No shift production recorded</b><span>Add the first shift entry to populate this chart.</span></div>}</article>
    </div>
    <div className="pod-table-grid">
      <article className="pod-panel"><div className="pod-panel-title"><div><h3>Recent Shift Entries</h3><p>Target, output, rejection and shift efficiency</p></div><button onClick={() => setModal('shift')}>+ Add Entry</button></div><div className="pod-table-wrap"><table><thead><tr><th>Shift / Date</th><th>Work Order</th><th>Product</th><th>Supervisor</th><th>Target</th><th>Produced</th><th>Rejected</th><th>Rework</th><th>Efficiency</th></tr></thead><tbody>{shiftEntries.length ? shiftEntries.slice().reverse().slice(0, 8).map(row => <tr key={row.id}><td><b>{row.shift}</b><small>{row.date}</small></td><td>{row.workOrder}</td><td>{row.product}</td><td>{row.supervisor}</td><td>{row.targetQty}</td><td>{row.producedQty}</td><td>{row.rejectedQty}</td><td>{row.reworkQty}</td><td><span className="pod-badge good">{row.efficiency.toFixed(1)}%</span></td></tr>) : <tr><td colSpan="9"><div className="pod-table-empty">No shift entries yet.</div></td></tr>}</tbody></table></div></article>
      <article className="pod-panel"><div className="pod-panel-title"><div><h3>Rework Management</h3><p>QC-failed jobs return to QC after rework completion</p></div><RefreshCw size={20} /></div><div className="pod-table-wrap"><table><thead><tr><th>Work Order</th><th>Product</th><th>Failed Qty</th><th>Reason</th><th>Shift / Supervisor</th><th>Rework</th><th>Pending</th><th>Status</th><th>Action</th></tr></thead><tbody>{reworkJobs.length ? reworkJobs.map((wo, index) => { const failed = number(wo.failedQty || wo.rejectedQty || wo.reworkQty); const done = number(wo.completedReworkQty); return <tr key={`${workOrderRef(wo)}-${index}`}><td>{workOrderRef(wo)}</td><td>{productName(wo)}</td><td>{failed}</td><td>{wo.failureReason || wo.reworkReason || wo.qcRemarks || 'QC failure'}</td><td>{wo.assignedShift || 'Not assigned'}<small>{wo.supervisor || 'No supervisor'}</small></td><td>{done}</td><td>{Math.max(0, failed - done)}</td><td><span className="pod-badge warning">{String(wo.status || 'Rework')}</span></td><td><button className="pod-compact" onClick={() => completeRework(wo)}>Send to QC</button></td></tr> }) : <tr><td colSpan="9"><div className="pod-table-empty">No QC-failed or rework jobs.</div></td></tr>}</tbody></table></div></article>
    </div>
    {modal === 'shift' && <Modal title="Shift-wise Production Entry" onClose={() => setModal(null)}><form onSubmit={submitShift}><div className="pod-form-grid"><Field label="Shift"><select value={shiftForm.shift} onChange={e => setShiftForm({...shiftForm, shift:e.target.value})}><option>Morning</option><option>Night</option></select></Field><Field label="Work Order"><select required value={shiftForm.workOrderId} onChange={e => setShiftForm({...shiftForm, workOrderId:e.target.value})}><option value="">Select work order</option>{workOrders.map((wo,index) => <option key={`${workOrderRef(wo)}-${index}`} value={String(wo.id || wo.workOrderId || wo.workOrderNo)}>{workOrderRef(wo)} — {productName(wo)}</option>)}</select></Field><Field label="Product"><input value={productName(selectedShiftWO || {})} disabled /></Field><Field label="Supervisor"><input required value={shiftForm.supervisor} onChange={e => setShiftForm({...shiftForm, supervisor:e.target.value})} /></Field><Field label="Target Qty"><input required min="0" type="number" value={shiftForm.targetQty} onChange={e => setShiftForm({...shiftForm, targetQty:e.target.value})} /></Field><Field label="Produced Qty"><input required min="0" type="number" value={shiftForm.producedQty} onChange={e => setShiftForm({...shiftForm, producedQty:e.target.value})} /></Field><Field label="Rejected Qty"><input min="0" type="number" value={shiftForm.rejectedQty} onChange={e => setShiftForm({...shiftForm, rejectedQty:e.target.value})} /></Field><Field label="Rework Qty"><input min="0" type="number" value={shiftForm.reworkQty} onChange={e => setShiftForm({...shiftForm, reworkQty:e.target.value})} /></Field><Field label="Production Date"><input required type="date" value={shiftForm.date} onChange={e => setShiftForm({...shiftForm, date:e.target.value})} /></Field></div><footer><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit">Save Production Entry</button></footer></form></Modal>}
    {modal === 'scrap' && <Modal title="Scrap / Wastage Entry" onClose={() => setModal(null)}><form onSubmit={submitScrap}><div className="pod-form-grid"><Field label="Work Order"><select required value={scrapForm.workOrderId} onChange={e => setScrapForm({...scrapForm, workOrderId:e.target.value})}><option value="">Select work order</option>{workOrders.map((wo,index) => <option key={`${workOrderRef(wo)}-${index}`} value={String(wo.id || wo.workOrderId || wo.workOrderNo)}>{workOrderRef(wo)} — {productName(wo)}</option>)}</select></Field><Field label="Product / Material"><input value={productName(selectedScrapWO || {})} disabled /></Field><Field label="Shift"><select value={scrapForm.shift} onChange={e => setScrapForm({...scrapForm, shift:e.target.value})}><option>Morning</option><option>Night</option></select></Field><Field label="Scrap Qty"><input required min="0" type="number" value={scrapForm.scrapQty} onChange={e => setScrapForm({...scrapForm, scrapQty:e.target.value})} /></Field><Field label="Wastage Qty"><input required min="0" type="number" value={scrapForm.wastageQty} onChange={e => setScrapForm({...scrapForm, wastageQty:e.target.value})} /></Field><Field label="Reason / Category"><select value={scrapForm.category} onChange={e => setScrapForm({...scrapForm, category:e.target.value})}><option>Process Scrap</option><option>Material Defect</option><option>Machine Loss</option><option>Handling Damage</option><option>Other</option></select></Field><Field label="Supervisor"><input required value={scrapForm.supervisor} onChange={e => setScrapForm({...scrapForm, supervisor:e.target.value})} /></Field><Field label="Date"><input required type="date" value={scrapForm.date} onChange={e => setScrapForm({...scrapForm, date:e.target.value})} /></Field><Field label="Remarks"><textarea value={scrapForm.remarks} onChange={e => setScrapForm({...scrapForm, remarks:e.target.value})} /></Field></div><footer><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit">Save Wastage Entry</button></footer></form></Modal>}
  </section>;
}
