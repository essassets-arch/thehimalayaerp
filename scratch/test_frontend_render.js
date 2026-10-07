const http = require('http');

http.get('http://localhost:3002/plant-head/production-analytics', (res) => {
  console.log('HTTP Status:', res.statusCode);
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('Page HTML length:', html.length);
    console.log('Contains Filter Bar:', html.includes('report-filter-bar'));
    console.log('Contains Monthly Production Report:', html.includes('MONTHLY PRODUCTION REPORT'));
  });
}).on('error', (err) => {
  console.error('Frontend error:', err.message);
});
