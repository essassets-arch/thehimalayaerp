const fs = require('fs');

function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = [];
        cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        cell += char;
      }
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  return result;
}

const fileContent = fs.readFileSync('d:/prototype-next-main/hussain_sir(super_newwww.csv', 'utf8');
const fileRows = parseCSV(fileContent);
console.log('File total rows:', fileRows.length);
console.log('Header:', fileRows[0]);
console.log('Row 1:', fileRows[1]);
console.log('Last row:', fileRows[fileRows.length - 1]);
