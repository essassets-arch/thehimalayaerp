const existingLeads = require('./live_leads_dump.json');
const newLeads = require('./consolidated_leads_preview.json');

console.log(`Existing live leads count: ${existingLeads.length}`);
console.log(`New leads from CSV: ${newLeads.length}`);

// Check if any existing leads match by leadNumber, companyName + leadDate, etc.
let matches = 0;
for (const ex of existingLeads) {
  const match = newLeads.find(n => {
    const exName = (ex.companyName || '').trim().toLowerCase();
    const nName = (n.project_name || n.gst_name || '').trim().toLowerCase();
    return exName === nName;
  });
  if (match) {
    console.log(`Potential name overlap: Existing [${ex.leadNumber}] ${ex.companyName} (${ex.leadDate}) <-> New: ${match.project_name} (${match.lead_date})`);
    matches++;
  }
}
console.log(`Total name matches: ${matches}`);
