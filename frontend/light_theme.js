const fs = require('fs');
const path = 'd:/prototype-next/app/(dashboard)/finance/purchase-orders/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Container Background
content = content.replace(
  "background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'",
  "background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'"
);

// Main text color
content = content.replace("color: '#f1f5f9',", "color: '#0f172a',");

// Icon box background
content = content.replace(
  "background: '#64748b20', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #334155'",
  "background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'"
);
content = content.replace('color="#94a3b8"', 'color="#64748b"');

// Header Text
content = content.replace("color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em'", "color: '#0f172a', margin: 0, letterSpacing: '-0.02em'");

// Search input
content = content.replace(
  "background: '#0f172a', border: '1px solid #334155'",
  "background: '#ffffff', border: '1px solid #cbd5e1'"
);
content = content.replace("color: '#f1f5f9', fontSize: '13px', width: '260px', outline: 'none'", "color: '#0f172a', fontSize: '13px', width: '260px', outline: 'none'");

// Stats cards
content = content.replaceAll(
  "background: '#0f172a', border: '1px solid #1e293b'",
  "background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'"
);
content = content.replaceAll("color: '#f1f5f9'", "color: '#0f172a'");

// Table Headers and containers
content = content.replaceAll("background: '#0f172a'", "background: '#f8fafc'");
content = content.replaceAll("border: '1px solid #1e293b'", "border: '1px solid #e2e8f0'");
content = content.replaceAll("borderBottom: '1px solid #1e293b'", "borderBottom: '1px solid #e2e8f0'");

// Table rows hover
content = content.replaceAll("background = '#1e293b55'", "background = '#f1f5f9'");

// Row text color
content = content.replaceAll("color: '#94a3b8'", "color: '#475569'");

fs.writeFileSync(path, content);
console.log('Light theme applied.');
