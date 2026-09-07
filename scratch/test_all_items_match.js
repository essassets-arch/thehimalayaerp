const { PrismaClient } = require('@prisma/client');
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
        if (nextChar === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); result.push(row); }
  return result;
}

const content = fs.readFileSync('backend/scripts/hussain-fresh.csv', 'utf8');
const rows = parseCSV(content);
const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
const dataRows = rows.slice(1);

let lastLeadForCarry = null;
const rawConsolidatedLeads = [];

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  rawHeaders.forEach((h, idx) => {
    const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    obj[cleanKey] = r[idx] ? r[idx].trim() : '';
  });

  const leadDate = obj.lead_date || '';
  const projectName = obj.project_name || obj.group_name || obj.gst_name || '';
  const groupName = obj.group_name || projectName;
  const gstName = obj.gst_name || projectName;
  const gstNo = obj.gst_no || '';
  const siteIncharge = obj.site_incharge || 'Site Incharge';
  const siteInchargeMobile = obj.site_incharge_mobile || obj.office_contact || '';
  const officeContact = obj.office_contact || '';
  const email = obj.email || 'info@thehimalaya.co.in';
  const address = obj.address || '';
  const state = obj.state || 'Gujarat';
  const city = obj.city || '';
  const pincode = obj.pincode || '';

  const product = obj.product || '';
  const size = obj.size || '';
  const capacity = obj.capcity || obj.capacity || '';
  const qty = parseFloat(obj.qty) || 1;
  const color = obj.specification || obj.color || 'GREY';
  const unitPrice = parseFloat(obj.unit_pricew || obj.unit_price || 0) || 0;
  const subTotal = parseFloat(obj.sub_total || 0) || 0;
  const gst = obj.gst || '18%';
  const gstAmount = parseFloat(obj.gst_amount || 0) || 0;
  const discount = parseFloat(obj.discount || 0) || 0;
  const grandTotal = parseFloat(obj.grand_total || 0) || 0;

  const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
  const hasProductInfo = Boolean(product || size || capacity);

  if (!hasLeadInfo && !hasProductInfo) continue;

  const itemObj = {
    product,
    size,
    capacity,
    qty,
    color,
    unit_price: unitPrice,
    sub_total: subTotal,
    gst,
    gst_amount: gstAmount,
    discount,
    grand_total: grandTotal,
    row_index: i + 2
  };

  const isSameAsLast = lastLeadForCarry &&
    (leadDate === lastLeadForCarry.lead_date || !leadDate) &&
    (projectName === lastLeadForCarry.project_name || (!projectName && gstName === lastLeadForCarry.gst_name)) &&
    (gstNo === lastLeadForCarry.gst_no || !gstNo) &&
    (siteInchargeMobile === lastLeadForCarry.site_incharge_mobile || !siteInchargeMobile);

  if (isSameAsLast && hasProductInfo) {
    lastLeadForCarry.items.push(itemObj);
    continue;
  }

  if (hasLeadInfo) {
    lastLeadForCarry = {
      lead_date: leadDate,
      project_name: projectName || 'Unnamed Project',
      group_name: groupName || projectName || 'Unnamed Project',
      gst_name: gstName || projectName || 'Unnamed Project',
      gst_no: gstNo,
      site_incharge: siteIncharge,
      site_incharge_mobile: siteInchargeMobile,
      office_contact: officeContact,
      email: email,
      address: address,
      state: state,
      city: city,
      pincode: pincode,
      items: []
    };
    if (hasProductInfo) {
      lastLeadForCarry.items.push(itemObj);
    }
    rawConsolidatedLeads.push(lastLeadForCarry);
  } else if (hasProductInfo && lastLeadForCarry) {
    lastLeadForCarry.items.push(itemObj);
  }
}

const consolidatedLeads = rawConsolidatedLeads.filter(l => l.items && l.items.length > 0);

function findProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  let baseS = s;
  if (s.match(/^\d+X\d+X\d+$/)) {
    baseS = s.substring(0, s.lastIndexOf('X'));
  }

  let c = (capacity || '').trim().toUpperCase();

  // 1. Exact match on sku or name containing type, size, and capacity
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    const prodSize = (p.size || '').toUpperCase().replace(/\s+/g, '');
    const prodCap = (p.capacity || '').toUpperCase();

    const typeMatch = sku.includes(t) || name.includes(t);
    const sizeMatch = prodSize === s || prodSize === baseS || sku.includes(s) || sku.includes(baseS) || name.includes(s) || name.includes(baseS);
    const capMatch = prodCap === c || sku.includes(c) || name.includes(c);
    return typeMatch && sizeMatch && capMatch;
  });
  if (match) return match;

  return null;
}

(async () => {
  const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
  
  // Test with simulation of the 4 missing products added
  const dbProducts = await p.product.findMany();
  const mockCreatedProducts = [
    { id: 'm-1', sku: 'HIMALAYAFRPMHC600X450LD', name: 'HIMALAYA FRP MHC 600X450 LD', size: '600X450', capacity: 'LD' },
    { id: 'm-2', sku: 'HIMALAYAFRPMHC600X450D400', name: 'HIMALAYA FRP MHC 600X450 D400', size: '600X450', capacity: 'D400' },
    { id: 'm-3', sku: 'HIMALAYAFRPRCS600X6003T', name: 'HIMALAYA FRP RCS 600X600 3T', size: '600X600', capacity: '3T' },
    { id: 'm-4', sku: 'HIMALAYAFRPMHC15X153T', name: 'HIMALAYA FRP MHC 15X15 3T', size: '15X15', capacity: '3T' }
  ];
  const allProds = [...dbProducts, ...mockCreatedProducts];

  let totalItems = 0;
  let matchedItems = 0;
  const unmatched = [];

  for (const lead of consolidatedLeads) {
    for (const it of lead.items) {
      totalItems++;
      const match = findProduct(it.product, it.size, it.capacity, allProds);
      if (match) {
        matchedItems++;
      } else {
        unmatched.push({ row: it.row_index, product: it.product, size: it.size, cap: it.capacity });
      }
    }
  }

  console.log(`Matching Result: ${matchedItems} / ${totalItems} items matched.`);
  if (unmatched.length > 0) {
    console.log('Unmatched items:', unmatched);
  }

  await p.$disconnect();
})();
