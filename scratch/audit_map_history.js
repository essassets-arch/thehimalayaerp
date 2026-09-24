const fs = require('fs');
const content = fs.readFileSync('frontend/modules/super-admin/pages/SuperAdminLiveMapPage.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('history') || line.includes('History') || line.includes('/location/') || line.includes('fetchHistory')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
