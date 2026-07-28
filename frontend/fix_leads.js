const fs = require('fs');

let lv = fs.readFileSync('components/LeadsView.jsx', 'utf8');
const startIdx = lv.indexOf('const handleConvertToSampleClick = (lead) => {');
const endIdx = lv.indexOf('const handleMarkLostClick = (lead) => {');

if (startIdx !== -1 && endIdx !== -1) {
  const newHandler = "  const handleConvertToSampleClick = (lead) => {\\n    onConvertToSample(lead);\\n  };\\n\\n  ";
  lv = lv.substring(0, startIdx) + newHandler + lv.substring(endIdx);
  fs.writeFileSync('components/LeadsView.jsx', lv);
  console.log('Fixed LeadsView');
}
