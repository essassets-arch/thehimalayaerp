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
        if (row.some(c => c && c.trim().length > 0)) result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (row.some(c => c && c.trim().length > 0)) result.push(row);
  return result;
}

function parseCsvDate(str) {
  if (!str) return new Date().toISOString();
  str = str.trim();
  if (str === '-' || str === '') return new Date().toISOString();
  
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0)).toISOString();
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0)).toISOString();
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0)).toISOString();
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ').replace(/\s+/g, ' ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/MAHESANA|MEHSANA/i.test(line1)) city = 'Mehsana';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/MAHARASHTRA|MUMBAI/i.test(line1)) state = 'Maharashtra';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001'
  };
}

function cleanPhone(str) {
  if (!str) return 'N/A';
  return str.replace(/^MO\s*:\s*/i, '')
            .replace(/^MOB\s*[\.:]\s*/i, '')
            .replace(/^MO-\s*/i, '')
            .replace(/^mo:\s*/i, '')
            .replace(/^Mo:\s*/i, '')
            .trim();
}

function loadAllSuperSales2Leads() {
  const content = fs.readFileSync('taher_sir(super_sales2) (1) (2).csv', 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1);

  const groupedLeads = [];
  let lastLead = null;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    
    const leadDate = (r[0] || '').trim();
    const projectName = (r[1] || '').trim();
    const groupName = (r[2] || projectName).trim();
    const gstName = (r[3] || projectName).trim();
    const gstNo = (r[4] || '').trim();
    let siteIncharge = (r[5] || 'Site Incharge').trim();
    let siteInchargeMobile = cleanPhone(r[6] || r[7] || '');
    let officeContact = cleanPhone(r[7] || '');
    const email = (r[8] || 'info@thehimalaya.co.in').trim();
    const address = (r[11] || '').trim();
    const state = (r[12] || 'Gujarat').trim();
    const city = (r[13] || '').trim();
    const pincode = (r[14] || '').trim();

    // Check if siteIncharge contains a colon with name and phone
    if (siteInchargeMobile.includes(':')) {
      const parts = siteInchargeMobile.split(':');
      siteIncharge = parts[0].trim();
      siteInchargeMobile = parts[1].trim();
    }

    const product = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();
    const qty = parseFloat(r[18]) || 1;
    const color = (r[19] || 'GREY').trim().toUpperCase();
    const unitPrice = parseFloat(r[20]) || 0;
    const subTotal = parseFloat(r[21]) || (unitPrice * qty);
    const gst = (r[22] || '18%').trim();
    const gstAmount = parseFloat(r[23]) || Math.round(subTotal * 0.18 * 100) / 100;
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount - discount);

    const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
    const hasProductInfo = Boolean(product || size || capacity);
    if (!hasLeadInfo && !hasProductInfo) continue;

    const itemObj = {
      product,
      size,
      capacity,
      quantity: qty,
      color,
      unitPrice,
      subTotal,
      tax: 18,
      gstRate: 18,
      gstAmount,
      discount,
      grandTotal,
      specification: `Product: ${product} | Size: ${size} | Capacity: ${capacity} | Color: ${color} | Qty: ${qty} | Rate: ₹${unitPrice}`
    };

    const isSameAsLast = lastLead &&
      (leadDate === lastLead.rawDate || !leadDate) &&
      (projectName === lastLead.companyName || (!projectName && gstName === lastLead.gstName)) &&
      (gstNo === lastLead.gstNumber || !gstNo) &&
      (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      const parsedAddr = parseAddressObj(address, state, city, pincode);
      lastLead = {
        rawDate: leadDate,
        leadDate: parseCsvDate(leadDate),
        companyName: projectName || groupName || gstName || 'Client',
        groupName: groupName || projectName,
        projectName: projectName || groupName,
        gstName: gstName || projectName,
        gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
        contactPerson: siteIncharge || 'Site Incharge',
        phone: siteInchargeMobile || officeContact || '9998184929',
        email: email || 'info@thehimalaya.co.in',
        address: parsedAddr,
        remarks: 'Imported from SuperSales 2 CSV',
        source: 'OTHER',
        items: hasProductInfo ? [itemObj] : []
      };
      groupedLeads.push(lastLead);
    } else if (hasProductInfo && lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  // Post process productInterest & totalQty
  for (const lead of groupedLeads) {
    const totalQty = lead.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
    lead.estimatedQuantity = totalQty;
    lead.unit = 'SET';
    
    if (lead.items.length === 1) {
      const it = lead.items[0];
      lead.productInterest = `${it.product} ${it.size} ${it.capacity} (${it.quantity} Qty, ${it.color})`;
    } else {
      const summaryList = lead.items.map(it => `${it.product} ${it.size} ${it.capacity}`).slice(0, 3).join(', ');
      lead.productInterest = `${lead.items.length} Products: ${summaryList}${lead.items.length > 3 ? '...' : ''}`;
    }
    lead.detailedItems = lead.items;
  }

  return groupedLeads;
}

module.exports = { loadAllSuperSales2Leads };
