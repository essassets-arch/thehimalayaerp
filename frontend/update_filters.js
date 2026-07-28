const fs = require('fs');

let content = fs.readFileSync('components/PaymentFollowupERPView.jsx', 'utf8');

// 1. Add states
const statesRegex = /const \[activeTab, setActiveTab\] = useState\('pending'\); \/\/ pending \| reminders \| completed\n\s*const \[pendingFilter, setPendingFilter\] = useState\('pending'\); \/\/ pending \| confirmed/;
const newStates = `const [activeTab, setActiveTab] = useState('all'); // all | reminders | overdue
  const [pendingFilter, setPendingFilter] = useState('pending'); // pending | confirmed
  const [agingFilter, setAgingFilter] = useState('');
  const [showAgingDropdown, setShowAgingDropdown] = useState(false);`;
content = content.replace(statesRegex, newStates);

// 2. pendingRows logic
const pendingRowsRegex = /const rows = Array\.from\(map\.values\(\)\);\n\s*if \(pendingFilter === 'confirmed'\) \{\n\s*return rows\.filter\(o => String\(o\.payment_status \|\| ''\)\.toUpperCase\(\) === 'AWAITING_FINANCE_VERIFICATION' \|\| String\(o\.payment_status \|\| ''\)\.toLowerCase\(\) === 'submitted_for_verification'\);\n\s*\}\n\s*return rows\.filter\(o => String\(o\.payment_status \|\| ''\)\.toUpperCase\(\) !== 'AWAITING_FINANCE_VERIFICATION' && String\(o\.payment_status \|\| ''\)\.toLowerCase\(\) !== 'submitted_for_verification'\);\n\s*\}, \[pendingCollection, orders, pendingFilter\]\);/;
const newPendingRows = `const rows = Array.from(map.values());
    
    let finalRows = rows;
    if (activeTab === 'overdue' && agingFilter) {
      finalRows = rows.filter(o => {
        if (!o.delivered_at) return false;
        const days = Math.floor((new Date() - new Date(o.delivered_at)) / (1000 * 60 * 60 * 24));
        if (agingFilter === '20-30 Days Overdue') return days >= 20 && days <= 30;
        if (agingFilter === '30-45 Days Overdue') return days > 30 && days <= 45;
        if (agingFilter === '45-60 Days Overdue') return days > 45 && days <= 60;
        if (agingFilter === '60-90 Days Overdue') return days > 60 && days <= 90;
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
content = content.replace(pendingRowsRegex, newPendingRows);

// 3. UI replacement for tab-filters-row
const uiRegex = /<div className="tab-filters-row" style={{ background: '#f1f3f5', width: isCompact \? '100%' : 'auto', overflowX: 'auto' }}>\n\s*\{\[\n\s*\{ id: 'pending', label: 'Pending Collection' \},\n\s*\{ id: 'reminders', label: 'Reminder' \},\n\s*\{ id: 'completed', label: 'Completed' \},\n\s*\]\.map\(t => \(\n\s*<button\n\s*key=\{t\.id\}\n\s*className=\{\`filter-pill \$\{activeTab === t\.id \? 'active' : ''\}\`\}\n\s*onClick=\{[^}]*\}\n\s*style=\{[^}]*\}\n\s*>\n\s*\{t\.label\}\n\s*<\/button>\n\s*\)\)\}\n\s*<\/div>/;
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
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 0', minWidth: 200, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100 }}>
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
          </div>`;
content = content.replace(uiRegex, newUI);

// 4. Update the {activeTab === 'pending' && condition
content = content.replace(/\{activeTab === 'pending' && \(/g, "{(activeTab === 'all' || activeTab === 'overdue') && (");

fs.writeFileSync('components/PaymentFollowupERPView.jsx', content);
console.log('Update successful');
