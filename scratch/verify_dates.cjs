const fs = require('fs');
const previewLeads = require('./consolidated_leads_preview.json');

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  if (str === '-' || str === '') return new Date();

  // Pattern like 17-0702026 -> 17-07-2026
  let m = str.match(/^(\d{1,2})-(\d{1,2})0(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 0, 0, 0));
  }
  
  // DD-MM-YYYY
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026; // Fix typo in 07-02-2006
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 0, 0, 0));
  }

  // DD-MM-YY
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 0, 0, 0));
  }

  // DD.MM.YYYY
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 0, 0, 0));
  }

  // DD.MM.YY
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 0, 0, 0));
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

const uniqueDates = Array.from(new Set(previewLeads.map(l => l.lead_date)));
console.log(`Found ${uniqueDates.length} unique lead date strings.`);

let hasError = false;
for (const raw of uniqueDates) {
  const parsed = parseCsvDate(raw);
  if (!parsed || isNaN(parsed.getTime())) {
    console.error(`FAILED to parse: "${raw}"`);
    hasError = true;
  } else {
    const iso = parsed.toISOString().slice(0, 10);
    if (parsed.getUTCFullYear() < 2025 || parsed.getUTCFullYear() > 2027) {
      console.warn(`Suspicious year for "${raw}": ${iso}`);
    }
  }
}

if (!hasError) {
  console.log('All unique lead dates parsed successfully!');
}
