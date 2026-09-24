const fs = require('fs');
const content = fs.readFileSync('frontend/modules/super-admin/pages/SuperAdminLiveMapPage.jsx', 'utf8');

// Find all fetch/backendFetch URLs
const matches = [];
const reg = /backendFetch\s*\(\s*['"`]([^'"`?]+)/g;
let m;
while ((m = reg.exec(content)) !== null) {
  matches.push(m[1]);
}
console.log('Unique API endpoints called:', [...new Set(matches)]);

// Check tabs/modes
const modeMatches = content.match(/activeTab|viewMode|filter|mode/gi) || [];
console.log('Mode occurrences:', modeMatches.length);
