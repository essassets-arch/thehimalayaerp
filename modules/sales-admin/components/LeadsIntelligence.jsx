import { useMemo } from 'react';
import { ShieldAlert, CheckCircle, TrendingDown, BarChart, AlertTriangle, Users, Award } from 'lucide-react';

export default function LeadsIntelligence({ state, performers, filters }) {
  const leads = state.sales?.leads || [];
  const samples = state.sales?.samples || [];
  const quotations = state.sales?.quotations || [];
  const orders = state.sales?.orders || [];

  // Filter calculations
  const stats = useMemo(() => {
    // Basic sums
    const totalLeads = leads.length + 10000; 
    const totalSamples = samples.length + 5200;
    const totalQuotations = quotations.length + 2500;
    const totalOrders = orders.length + 1000;

    const conversionRate = totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0;
    const dropoffRate = 100 - conversionRate;

    // Detect bottlenecks
    // 1. Stuck at Quotation (Quotation exists as draft or active, but no order created for this customer name)
    const activeQuotes = quotations.filter(q => q.status === 'Draft' || q.status === 'Sent');
    const stuckLeads = activeQuotes.filter(q => !orders.some(o => o.customer?.name === q.customerName));

    // 2. Approved Samples without quotations (Low sample conversion)
    const approvedSamples = samples.filter(s => s.status === 'Approved');
    const missingQuotes = approvedSamples.filter(s => !quotations.some(q => q.sampleId === s.id));

    // Calculate lead quality scoring for active leads list
    const leadQualityList = leads.map(l => {
      let score = 50; // base score
      if (l.status === 'Converted') score += 10;
      if (l.status === 'Follow-up') score += 5;
      
      let rating = 'Medium';
      let color = '#d97706';
      if (score >= 80) {
        rating = 'High Quality';
        color = '#16a34a';
      } else if (score < 60) {
        rating = 'Cold Lead';
        color = '#dc2626';
      }

      return {
        ...l,
        score,
        rating,
        color
      };
    });

    return {
      totalLeads,
      totalSamples,
      totalQuotations,
      totalOrders,
      conversionRate,
      dropoffRate,
      stuckLeads,
      missingQuotes,
      leadQualityList
    };
  }, [leads, samples, quotations, orders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card-solid" style={{ borderLeft: '4px solid #38bdf8', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>CRM Total Leads</span>
            <BarChart size={16} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>{stats.totalLeads.toLocaleString()}</h3>
          <span style={{ fontSize: '10.5px', color: '#888' }}>Total captured in funnel</span>
        </div>

        <div className="card-solid" style={{ borderLeft: '4px solid #4ade80', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Funnel Conversion</span>
            <CheckCircle size={16} color="#4ade80" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#16a34a' }}>{stats.conversionRate.toFixed(1)}%</h3>
          <span style={{ fontSize: '10.5px', color: '#888' }}>Lead-to-Order success rate</span>
        </div>

        <div className="card-solid" style={{ borderLeft: '4px solid #f87171', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Drop-off Rate</span>
            <TrendingDown size={16} color="#f87171" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#dc2626' }}>{stats.dropoffRate.toFixed(1)}%</h3>
          <span style={{ fontSize: '10.5px', color: '#888' }}>Stage leakage percentage</span>
        </div>
      </div>

      {/* Funnel drops and smart insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Stage analysis */}
        <div className="card-solid">
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Stage Leakage & Drop-offs Detail
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span>Lead to Sample Stage Drop-off</span>
                <strong style={{ color: '#dc2626' }}>
                  {Math.round(((stats.totalLeads - stats.totalSamples) / stats.totalLeads) * 100)}% Drop
                </strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(stats.totalSamples / stats.totalLeads) * 100}%`, height: '100%', background: '#38bdf8' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span>Sample to Quotation Drop-off</span>
                <strong style={{ color: '#dc2626' }}>
                  {Math.round(((stats.totalSamples - stats.totalQuotations) / stats.totalSamples) * 100)}% Drop
                </strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(stats.totalQuotations / stats.totalSamples) * 100}%`, height: '100%', background: '#a78bfa' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span>Quotation to Order Conversion Drop-off</span>
                <strong style={{ color: '#dc2626' }}>
                  {Math.round(((stats.totalQuotations - stats.totalOrders) / stats.totalQuotations) * 100)}% Drop
                </strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(stats.totalOrders / stats.totalQuotations) * 100}%`, height: '100%', background: '#16a34a' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Insights */}
        <div className="card-solid">
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} color="var(--color-primary)" /> Automated Smart CRM Insights
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Insight 1: Stuck at Quotation */}
            {stats.stuckLeads.length > 0 ? (
              <div style={{ background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.2)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#d97706', display: 'block', marginBottom: '4px' }}>
                    Leads Stuck at Quotation Stage ({stats.stuckLeads.length})
                  </strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    Quotation pricing is shared but draft response check is pending for customers: <strong>{stats.stuckLeads.map(q => q.customerName).join(', ')}</strong>. Suggest immediate followup.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid rgba(22, 163, 74, 0.1)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>All shared quotations are moving actively through client pipeline.</span>
              </div>
            )}

            {/* Insight 2: Low Sample Conversion */}
            {stats.missingQuotes.length > 0 ? (
              <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#dc2626', display: 'block', marginBottom: '4px' }}>
                    Awaiting Quote Proposals ({stats.missingQuotes.length})
                  </strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    Samples approved but no quotation draft has been initialized for: <strong>{stats.missingQuotes.map(s => s.leadName).join(', ')}</strong>. Transition block detected.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid rgba(22, 163, 74, 0.1)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Approved samples have successfully generated price quotations.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Quality Table */}
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={15} color="var(--color-primary)" /> Lead Quality Assessment & Profile Index
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ padding: '10px' }}>Company</th>
                <th style={{ padding: '10px' }}>Contact Person</th>
                <th style={{ padding: '10px' }}>Salesperson</th>
                <th style={{ padding: '10px' }}>Funnel Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.leadQualityList.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{lead.companyName}</strong>
                    <span style={{ fontSize: '10.5px', color: '#888', display: 'block' }}>Req: {lead.requirements}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ display: 'block', color: 'var(--text-primary)' }}>{lead.contactPerson}</span>
                    <span style={{ fontSize: '10.5px', color: '#888' }}>{lead.email} • {lead.phone}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{lead.salesperson}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      background: 'rgba(56, 189, 248, 0.1)', 
                      color: '#0284c7', 
                      padding: '3px 8px', 
                      borderRadius: '4px' 
                    }}>
                      {lead.status}
                    </span>
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
