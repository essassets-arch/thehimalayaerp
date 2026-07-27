const fs = require('fs');
let code = fs.readFileSync('components/PaymentFollowupERPView.jsx', 'utf8');

// 1. Update State
code = code.replace(
  "const [activeTab, setActiveTab] = useState('pending'); // pending | reminders | completed",
  \`const [activeTab, setActiveTab] = useState('all'); // all | reminders | overdue | completed
  const [agingFilter, setAgingFilter] = useState('');
  const [showAgingDropdown, setShowAgingDropdown] = useState(false);\`
);

// 2. Update pendingRows logic
const pendingRowsOld = \`    const rows = Array.from(map.values());
    if (pendingFilter === 'confirmed') {
      return rows.filter(o => String(o.payment_status || '').toUpperCase() === 'AWAITING_FINANCE_VERIFICATION' || String(o.payment_status || '').toLowerCase() === 'submitted_for_verification');
    }
    return rows.filter(o => String(o.payment_status || '').toUpperCase() !== 'AWAITING_FINANCE_VERIFICATION' && String(o.payment_status || '').toLowerCase() !== 'submitted_for_verification');
  }, [pendingCollection, orders, pendingFilter]);\`;

const pendingRowsNew = \`    const rows = Array.from(map.values());
    
    let finalRows = rows;
    if (activeTab === 'overdue' && agingFilter) {
      finalRows = rows.filter(o => {
        if (!o.delivered_at && !o.deliveredAt) return false;
        const d = o.delivered_at || o.deliveredAt;
        const days = Math.floor((new Date() - new Date(d)) / (1000 * 60 * 60 * 24));
        if (agingFilter.includes('20-30') || agingFilter.includes('20–30')) return days >= 20 && days <= 30;
        if (agingFilter.includes('30-45') || agingFilter.includes('30–45')) return days > 30 && days <= 45;
        if (agingFilter.includes('45-60') || agingFilter.includes('45–60')) return days > 45 && days <= 60;
        if (agingFilter.includes('60-90') || agingFilter.includes('60–90')) return days > 60 && days <= 90;
        if (agingFilter.includes('90+')) return days > 90;
        return false;
      });
    } else if (activeTab === 'all' && pendingFilter === 'confirmed') {
      finalRows = rows.filter(o => String(o.payment_status || '').toUpperCase() === 'AWAITING_FINANCE_VERIFICATION' || String(o.payment_status || '').toLowerCase() === 'submitted_for_verification');
    } else {
      finalRows = rows.filter(o => String(o.payment_status || '').toUpperCase() !== 'AWAITING_FINANCE_VERIFICATION' && String(o.payment_status || '').toLowerCase() !== 'submitted_for_verification');
    }
    return finalRows;
  }, [pendingCollection, orders, pendingFilter, activeTab, agingFilter]);\`;
code = code.replace(pendingRowsOld, pendingRowsNew);

// 3. Update main tabs UI and activeTab conditions
const uiOld = \`<div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>
          <div className="tab-filters-row" style={{ background: '#f1f3f5', width: isCompact ? '100%' : 'auto', overflowX: 'auto' }}>
            {[
              { id: 'pending', label: 'Pending Collection' },
              { id: 'reminders', label: 'Reminder' },
              { id: 'completed', label: 'Completed' },
            ].map(t => (
              <button
                key={t.id}
                className={\\\`filter-pill \${activeTab === t.id ? 'active' : ''}\\\`}
                onClick={() => setActiveTab(t.id)}
                style={{ color: activeTab === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'pending' && (\`;

const uiNew = \`<div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>
          <div className="tab-filters-row" style={{ background: '#ffffff', border: '1px solid var(--color-border)', width: isCompact ? '100%' : 'auto', overflowX: 'visible', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', borderRadius: '30px' }}>
            <button
              className={\\\`filter-pill \${activeTab === 'all' ? 'active' : ''}\\\`}
              onClick={() => { setActiveTab('all'); setAgingFilter(''); }}
              style={{ color: activeTab === 'all' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              All
            </button>
            <button
              className={\\\`filter-pill \${activeTab === 'reminders' ? 'active' : ''}\\\`}
              onClick={() => { setActiveTab('reminders'); setAgingFilter(''); }}
              style={{ color: activeTab === 'reminders' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              Reminders
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={\\\`filter-pill \${activeTab === 'overdue' ? 'active' : ''}\\\`}
                onClick={() => setShowAgingDropdown(!showAgingDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeTab === 'overdue' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {agingFilter ? agingFilter : 'Overdue Aging'} 
                <span style={{ fontSize: 10 }}>▼</span>
              </button>
              
              {showAgingDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 0', minWidth: 200, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100 }}>
                  {['20-30 Days Overdue', '30-45 Days Overdue', '45-60 Days Overdue', '60-90 Days Overdue', '90+ Days Overdue'].map(opt => (
                    <div key={opt}
                         style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', background: agingFilter === opt ? '#f8fafc' : 'transparent', color: agingFilter === opt ? 'var(--color-primary)' : 'var(--color-text-primary)', whiteSpace: 'nowrap' }}
                         onClick={() => {
                           setAgingFilter(opt);
                           setActiveTab('overdue');
                           setShowAgingDropdown(false);
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                         onMouseLeave={(e) => e.currentTarget.style.background = agingFilter === opt ? '#f8fafc' : 'transparent'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(activeTab === 'all' || activeTab === 'overdue') && (\`;

code = code.replace(uiOld, uiNew);

fs.writeFileSync('components/PaymentFollowupERPView.jsx', code);
console.log('Successfully applied all changes cleanly.');
