const fs = require('fs');

const content = fs.readFileSync('d:/prototype-next-main/JP_data(sales1) (1).csv', 'utf8');

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
        if (nextChar === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell.trim()); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell.trim()); result.push(row); }
  return result;
}

const rows = parseCSV(content);
console.log('Total rows parsed:', rows.length);
console.log('Header:', rows[0]);
console.log('First data row:', rows[1]);

// Let's inspect column indices
// 0: lead_date
// 1: project_name
// 2: group name
// 3: gst name
// 4: gst no
// 5: Site_incharge
// 6: site_incharge_mobile
// 7: office_contact
// 8: email
// 9: logged_in_sales_representive
// 10: login_date&time
// 11: ADDRESS
// 12: state
// 13: city
// 14: pincode
// 15: product
// 16: size (column 16)
// 17: capacity / grade (column 17)
// 18: QTY
// 19: COLOR
// 20: unit_pricew
// 21: sub_total
// 22: gst
// 23: gst_amount
// 24: discount
// 25: grand_total

const dataRows = rows.slice(1);
console.log('Data rows count:', dataRows.length);

const grouped = {};
for (const r of dataRows) {
  if (!r[1]) continue;
  const key = `${r[0]}_${r[1]}_${r[4]}_${r[6]}`;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(r);
}

console.log('Unique grouped orders:', Object.keys(grouped).length);

const productsMap = {};
for (const r of dataRows) {
  const prodKey = `${r[15]} | ${r[16]} | ${r[17]}`;
  productsMap[prodKey] = (productsMap[prodKey] || 0) + 1;
}

console.log('Unique Product combinations:', Object.keys(productsMap).length);
console.log(productsMap);
