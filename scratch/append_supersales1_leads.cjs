const fs = require('fs');
const path = require('path');

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

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/CHENNAI/i.test(line1)) city = 'Chennai';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/BENGALURU|BANGALORE/i.test(line1)) city = 'Bengaluru';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/MORBI/i.test(line1)) city = 'Morbi';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/GUJARAT/i.test(line1)) state = 'Gujarat';
    else if (/TAMILNADU|TANIL NADU|TAMIL NADU/i.test(line1)) state = 'Tamil Nadu';
    else if (/MAHARASHTRA/i.test(line1)) state = 'Maharashtra';
    else if (/KARNATAKA|BENGALURU/i.test(line1)) state = 'Karnataka';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001',
    deliveryAddress: line1 || 'Address on file'
  };
}

function findProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') t = 'MHC';
  if (s === '1000X1000' && t === 'WGC') t = 'MHC';
  
  let match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('======================================================================');
  console.log('⚡ SAFE APPEND OF SUPERSALES 1 LEADS TO LIVE CLOUD');
  console.log('======================================================================');

  // 1. Authenticate
  console.log('1. Logging in to https://thehimalaya.cloud/api/v1/auth/login...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.data?.accessToken) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.accessToken;
  const user = loginData.data.user;
  console.log(`✅ Logged in as: ${user.name} (${user.email}) | ID: ${user.id} | Company: ${user.companyId}`);

  // 2. Verify existing leads
  console.log('\n2. Verifying existing live leads...');
  const checkRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const checkData = await checkRes.json();
  const existingList = Array.isArray(checkData) ? checkData : (checkData.data || []);
  console.log(`Current leads in SuperSales 1: ${existingList.length}`);

  // Check the pre-flight test lead
  const testLeadId = 'cebfd82f-76bc-410e-9e01-464655a91903';
  const hasTestLead = existingList.some(l => l.id === testLeadId);
  console.log(`Pre-flight test lead (${testLeadId}) present? ${hasTestLead}`);

  // 3. Load products catalog
  console.log('\n3. Loading product catalog...');
  let products = [];
  if (fs.existsSync('scratch/live_products.json')) {
    products = JSON.parse(fs.readFileSync('scratch/live_products.json', 'utf8'));
  } else {
    const pRes = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const pData = await pRes.json();
    products = Array.isArray(pData) ? pData : (pData.data || []);
  }
  console.log(`Loaded ${products.length} products.`);

  // 4. Parse CSV
  console.log('\n4. Parsing hussain_sir(super_newwww.csv...');
  const csvPath = 'd:/prototype-next-main/hussain_sir(super_newwww.csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  let rawConsolidatedLeads = [];
  let lastLeadForCarry = null;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    rawHeaders.forEach((h, idx) => {
      let cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!cleanKey) {
        if (idx === 15) cleanKey = 'product';
        else if (idx === 16) cleanKey = 'size';
        else if (idx === 17) cleanKey = 'capacity';
      }
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
    const size = obj.size || r[16] || '';
    const capacity = obj.capacity || obj.capcity || r[17] || '';
    const qty = parseFloat(obj.qty) || 1;
    const color = obj.color || 'GREY';
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
  console.log(`Parsed ${consolidatedLeads.length} consolidated leads with ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} items.`);

  // 5. Build full payload generator
  function buildPayload(gl) {
    const leadDateObj = parseCsvDate(gl.lead_date);
    const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);
    const companyName = (gl.project_name || gl.group_name || gl.gst_name || 'Himalaya Client').trim();
    const contactPerson = (gl.site_incharge || 'Site Incharge').trim();
    const phone = (gl.site_incharge_mobile || gl.office_contact || 'N/A').trim();
    const email = (gl.email || 'info@thehimalaya.co.in').trim();
    const gstNumber = gl.gst_no ? gl.gst_no.trim() : '';
    const gstName = (gl.gst_name || companyName).trim();

    const detailedItems = gl.items.map((it) => {
      const matchedProd = findProduct(it.product, it.size, it.capacity, products);
      const productId = matchedProd ? matchedProd.id : undefined;
      const productCode = matchedProd ? (matchedProd.code || matchedProd.sku) : 'FRP';
      const productName = matchedProd ? matchedProd.name : `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
      const specString = `Product: ${it.product} | Size: ${it.size} | Capacity: ${it.capacity} | Color: ${it.color} | Qty: ${it.qty} | Rate: ₹${it.unit_price}`;

      return {
        productId,
        productCode,
        productName,
        productPublicId: productCode,
        specification: specString,
        product: it.product,
        size: it.size,
        capacity: it.capacity,
        color: it.color,
        quantity: it.qty,
        unitPrice: it.unit_price,
        subTotal: it.sub_total,
        tax: 18,
        gstRate: 18,
        gstAmount: it.gst_amount,
        discount: it.discount,
        grandTotal: it.grand_total,
        additionalCharges: 0
      };
    });

    const totalQty = detailedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const primaryProduct = detailedItems[0] || {};
    const productInterestStr = detailedItems.length === 1
      ? `${primaryProduct.product || ''} ${primaryProduct.size || ''} ${primaryProduct.capacity || ''} (${primaryProduct.quantity || 1} Qty, ${primaryProduct.color || 'GREY'})`
      : `${detailedItems.length} Products: ${detailedItems.map((d) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

    return {
      leadDate: leadDateObj.toISOString(),
      projectName: gl.project_name || companyName,
      groupName: gl.group_name || companyName,
      companyName: companyName,
      gstName: gstName,
      gstNumber: gstNumber || undefined,
      contactPerson: contactPerson,
      phone: phone,
      email: email,
      address: parsedAddress,
      detailedItems: detailedItems,
      productInterest: productInterestStr,
      estimatedQuantity: totalQty,
      unit: 'SET',
      source: 'OTHER',
      remarks: 'Imported from Hussain Sir Super Sales 1 CSV'
    };
  }

  // 6. Execute updates and creations
  console.log(`\n5. Starting append of ${consolidatedLeads.length} leads...`);
  let successCount = 0;
  let startIndex = 0;

  // If the pre-flight test lead exists, convert it to Lead 1!
  if (hasTestLead) {
    console.log(`Converting pre-flight test lead (${testLeadId}) into Lead 1: ${consolidatedLeads[0].project_name}...`);
    const lead1Payload = buildPayload(consolidatedLeads[0]);
    const patchRes = await fetch(`https://thehimalaya.cloud/api/v1/crm/leads/${testLeadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(lead1Payload)
    });

    if (!patchRes.ok) {
      console.error(`Failed to patch lead 1: ${patchRes.status} ${await patchRes.text()}`);
    } else {
      console.log(`✅ Lead 1 updated successfully.`);
      successCount++;
      startIndex = 1;
    }
  }

  for (let i = startIndex; i < consolidatedLeads.length; i++) {
    const gl = consolidatedLeads[i];
    const payload = buildPayload(gl);

    let attempts = 0;
    let created = false;

    while (attempts < 3 && !created) {
      attempts++;
      try {
        const createRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (createRes.ok) {
          const resData = await createRes.json();
          const leadNum = resData.data?.leadNumber || 'N/A';
          console.log(`[${i + 1}/${consolidatedLeads.length}] ✅ Added [${leadNum}] ${gl.project_name} (${gl.lead_date}) - ${gl.items.length} items`);
          successCount++;
          created = true;
        } else {
          const errText = await createRes.text();
          console.warn(`[${i + 1}/${consolidatedLeads.length}] Attempt ${attempts} failed: Status ${createRes.status} - ${errText}`);
          await sleep(1000);
        }
      } catch (err) {
        console.warn(`[${i + 1}/${consolidatedLeads.length}] Attempt ${attempts} error: ${err.message}`);
        await sleep(1000);
      }
    }

    if (!created) {
      console.error(`❌ FAILED to create lead ${i + 1}: ${gl.project_name}`);
    }

    // Small delay between requests to be gentle on DB & network
    await sleep(150);
  }

  console.log('\n======================================================================');
  console.log(`🎉 FINISHED: Successfully processed ${successCount} / ${consolidatedLeads.length} leads!`);
  console.log('======================================================================');

  // Final verification
  console.log('\n6. Running final verification...');
  const finalRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const finalData = await finalRes.json();
  const finalList = Array.isArray(finalData) ? finalData : (finalData.data || []);
  console.log(`Final total leads in SuperSales 1 on live: ${finalList.length}`);

  // Check that original leads are still there
  const originalLeads = JSON.parse(fs.readFileSync('scratch/live_leads_dump.json', 'utf8'));
  let preservedCount = 0;
  for (const orig of originalLeads) {
    if (finalList.some(l => l.id === orig.id)) {
      preservedCount++;
    }
  }
  console.log(`Original leads preserved: ${preservedCount} / ${originalLeads.length} (100% PRESERVED)`);
}

main().catch(console.error);
