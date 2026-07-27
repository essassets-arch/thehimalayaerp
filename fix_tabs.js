const fs = require('fs');

let content = fs.readFileSync('components/PaymentFollowupERPView.jsx', 'utf8');

// The block we want to replace starts with: <div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>
// And ends exactly at: </div>\n      </div>\n\n      {(activeTab === 'all' || activeTab === 'overdue') && (

const startAnchor = `<div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>`;
const endAnchor = `      </div>\n\n      {(activeTab === 'all' || activeTab === 'overdue') && (`;

const startIdx = content.indexOf(startAnchor);
const endIdx = content.indexOf(endAnchor);

if (startIdx !== -1 && endIdx !== -1) {
  const newUI = `<div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>
          <div className="tab-filters-row" style={{ background: '#ffffff', border: '1px solid var(--color-border)', width: isCompact ? '100%' : 'auto', overflowX: 'visible', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', borderRadius: '30px' }}>
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
`;
  
  content = content.substring(0, startIdx) + newUI + content.substring(endIdx);
  fs.writeFileSync('components/PaymentFollowupERPView.jsx', content);
  console.log("UI Successfully Patched!");
} else {
  console.log("Could not find start/end anchors.");
}
