const fs = require('fs');

let content = fs.readFileSync('components/PaymentFollowupERPView.jsx', 'utf8');

// 1. Add states
const statesRegex = /const \[activeTab, setActiveTab\] = useState\('pending'\);[^]+?const \[pendingFilter, setPendingFilter\] = useState\('pending'\);[^]+?const \[pendingCollection, setPendingCollection\] = useState\(\[\]\);/;
if (content.match(statesRegex)) {
  const newStates = `const [activeTab, setActiveTab] = useState('all'); // all | reminders | overdue | completed
  const [pendingFilter, setPendingFilter] = useState('pending'); // pending | confirmed
  const [agingFilter, setAgingFilter] = useState('');
  const [showAgingDropdown, setShowAgingDropdown] = useState(false);
  const [pendingCollection, setPendingCollection] = useState([]);`;
  content = content.replace(statesRegex, newStates);
}

// 2. pendingRows logic
const startPendingRowsStr = "const rows = Array.from(map.values());";
const endPendingRowsStr = "}, [pendingCollection, orders, pendingFilter]);";

const startIdx = content.indexOf(startPendingRowsStr);
const endIdx = content.indexOf(endPendingRowsStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newPendingRows = `const rows = Array.from(map.values());
    
    let finalRows = rows;
    if (activeTab === 'overdue' && agingFilter) {
      finalRows = rows.filter(o => {
        if (!o.delivered_at) return false;
        const days = Math.floor((new Date() - new Date(o.delivered_at)) / (1000 * 60 * 60 * 24));
        if (agingFilter === '20–30 Days Overdue' || agingFilter === '20-30 Days Overdue') return days >= 20 && days <= 30;
        if (agingFilter === '30–45 Days Overdue' || agingFilter === '30-45 Days Overdue') return days > 30 && days <= 45;
        if (agingFilter === '45–60 Days Overdue' || agingFilter === '45-60 Days Overdue') return days > 45 && days <= 60;
        if (agingFilter === '60–90 Days Overdue' || agingFilter === '60-90 Days Overdue') return days > 60 && days <= 90;
        if (agingFilter === '90+ Days Overdue') return days > 90;
        return false;
      });
    } else if (activeTab === 'all' && pendingFilter === 'confirmed') {
      finalRows = rows.filter(o => String(o.payment_status || '').toUpperCase() === 'AWAITING_FINANCE_VERIFICATION' || String(o.payment_status || '').toLowerCase() === 'submitted_for_verification');
    } else {
      finalRows = rows.filter(o => String(o.payment_status || '').toUpperCase() !== 'AWAITING_FINANCE_VERIFICATION' && String(o.payment_status || '').toLowerCase() !== 'submitted_for_verification');
    }
    return finalRows;
  }, [pendingCollection, orders, pendingFilter, activeTab, agingFilter]);`;
  content = content.substring(0, startIdx) + newPendingRows + content.substring(endIdx + endPendingRowsStr.length);
}

// 3. UI replacement for tab-filters-row
const startUIStr = `<div className="tab-filters-row" style={{ background: '#f1f3f5', width: isCompact ? '100%' : 'auto', overflowX: 'auto' }}>`;
const endUIStr = `          </div>\n        </div>\n      </div>`;

const startUIIdx = content.indexOf(startUIStr);
const endUIIdx = content.indexOf(endUIStr, startUIIdx);

if (startUIIdx !== -1 && endUIIdx !== -1) {
  const newUI = `<div className="tab-filters-row" style={{ background: '#f1f3f5', width: isCompact ? '100%' : 'auto', overflowX: 'visible', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', borderRadius: '30px' }}>
            <button
              className={\`filter-pill \${activeTab === 'all' ? 'active' : ''}\`}
              onClick={() => { setActiveTab('all'); setAgingFilter(''); }}
              style={{ color: activeTab === 'all' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              All
            </button>
            <button
              className={\`filter-pill \${activeTab === 'reminders' ? 'active' : ''}\`}
              onClick={() => { setActiveTab('reminders'); setAgingFilter(''); }}
              style={{ color: activeTab === 'reminders' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              Reminders
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={\`filter-pill \${activeTab === 'overdue' ? 'active' : ''}\`}
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
                         style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', background: agingFilter === opt ? '#f8fafc' : 'transparent', color: agingFilter === opt ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
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
      </div>`;
  content = content.substring(0, startUIIdx) + newUI + content.substring(endUIIdx + endUIStr.length);
}

// 4. Also rename completed if needed, but activeTab === 'completed' is still in the component lower down, so let's make sure it doesn't break.
// Wait, the new UI doesn't have a button for 'completed'. Let's add it just to be safe, or leave it off since it's not in the screenshot.
// The screenshot doesn't have it. We will leave it off. 

fs.writeFileSync('components/PaymentFollowupERPView.jsx', content);
console.log('Final precise update successful');
