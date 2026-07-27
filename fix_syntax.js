const fs = require('fs');
let code = fs.readFileSync('components/PaymentFollowupERPView.jsx', 'utf8');

const anchor1 = '    return finalRows;\\n';
const anchor2 = '              {\\[';
const regex = /return finalRows;\s*\{\[/;

if (regex.test(code)) {
  const replacement = \`return finalRows;
  }, [pendingCollection, orders, pendingFilter, activeTab, agingFilter]);

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row">
        <h2 className="module-title">Sales Payment Follow-up</h2>
        <div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>
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
      </div>

      {(activeTab === 'all' || activeTab === 'overdue') && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
              {[\`;
  code = code.replace(regex, replacement);
  fs.writeFileSync('components/PaymentFollowupERPView.jsx', code);
  console.log("Successfully fixed JSX syntax.");
} else {
  console.log("Regex not found.");
}
