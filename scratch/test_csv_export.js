const fs = require('fs');

async function testExport() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;
  const user = loginJson.data.user;

  // 1. Fetch October 2026 reports
  const res = await fetch('https://thehimalaya.cloud/api/v1/production/daily-reports?startDate=2026-10-01&endDate=2026-10-31&limit=100', {
    headers: { 'Authorization': 'Bearer ' + token, 'x-company-id': user.companyId }
  });
  const json = await res.json();
  const reports = json.data.items || [];
  console.log('Fetched October reports count:', reports.length);

  // 2. Summary CSV
  const summaryHeaders = [
    'Report No', 'Date', 'Shift', 'Supervisor', 'Rows',
    'Covers Produced', 'Frames Produced', 'Sets', 'Total Weight (kg)',
    'Total Weight (MT)', 'Created By', 'Status', 'Remarks'
  ];
  let totRows = 0, totCovers = 0, totFrames = 0, totSets = 0, totWeight = 0;
  const summaryRows = reports.map(r => {
    const repNo = r.reportNo || r.id || '';
    const repDate = r.reportDate ? r.reportDate.split('T')[0] : '';
    const repShift = r.shift || '';
    const repSup = r.shiftSupervisorName || r.supervisorName || '';
    const rowCount = r.rowCount || (r.items ? r.items.length : 0);
    const covers = Number(r.totalCovers || 0);
    const frames = Number(r.totalFrames || 0);
    const sets = Number(r.totalSets || 0);
    const w = Number(r.totalWeight || 0);
    const wMT = (w / 1000).toFixed(3);
    const createdBy = r.createdBy?.name || r.creatorName || '';
    const status = r.status || 'DRAFT';
    const remarks = r.remarks || '';

    totRows += rowCount;
    totCovers += covers;
    totFrames += frames;
    totSets += sets;
    totWeight += w;

    return [
      `"${String(repNo).replace(/"/g, '""')}"`,
      `"${String(repDate).replace(/"/g, '""')}"`,
      `"${String(repShift).replace(/"/g, '""')}"`,
      `"${String(repSup).replace(/"/g, '""')}"`,
      rowCount,
      covers,
      frames,
      sets,
      w.toFixed(2),
      wMT,
      `"${String(createdBy).replace(/"/g, '""')}"`,
      `"${String(status).replace(/"/g, '""')}"`,
      `"${String(remarks).replace(/"/g, '""')}"`
    ].join(',');
  });

  const totalRow = [
    '"GRAND TOTAL"', '""', '""', '""',
    totRows, totCovers, totFrames, totSets, totWeight.toFixed(2), (totWeight / 1000).toFixed(3),
    '""', '""', '""'
  ].join(',');

  const csvSummary = [summaryHeaders.join(','), ...summaryRows, totalRow].join('\n');
  fs.writeFileSync('scratch/sample_october_summary.csv', '\uFEFF' + csvSummary);
  console.log('\n--- SAMPLE SUMMARY CSV FIRST 4 LINES ---');
  console.log(csvSummary.split('\n').slice(0, 4).join('\n'));
  console.log('--- GRAND TOTAL LINE ---');
  console.log(totalRow);

  // 3. Detailed Items CSV
  const detailedHeaders = [
    'Report No', 'Date', 'Shift', 'Supervisor', 'Status', 'Created By',
    'Sr', 'Product Name', 'Product SKU', 'Size', 'Type', 'Capacity',
    'Cover Qty', 'Cover Wt (kg)', 'Frame Qty', 'Frame Wt (kg)', 'Total Wt (kg)',
    'Set', 'Extra Cover', 'Extra Frame', 'Remarks'
  ];
  const detailedRows = [];
  let grandCoverQty = 0, grandCoverWt = 0, grandFrameQty = 0, grandFrameWt = 0, grandTotWt = 0, grandSets = 0;

  reports.forEach(r => {
    const repNo = r.reportNo || r.id || '';
    const repDate = r.reportDate ? r.reportDate.split('T')[0] : '';
    const repShift = r.shift || '';
    const repSup = r.shiftSupervisorName || r.supervisorName || '';
    const repStatus = r.status || 'DRAFT';
    const repCreatedBy = r.createdBy?.name || r.creatorName || '';

    if (r.items && r.items.length > 0) {
      r.items.forEach((item, idx) => {
        const srNo = item.srNo || idx + 1;
        const prodName = item.product?.name || item.customProductName || '';
        const prodSku = item.product?.sku || '';
        const size = item.size || item.product?.size || '';
        const type = item.type || item.product?.type || '';
        const capacity = item.capacity || item.product?.capacity || '';
        const coverQty = Number(item.coverQty || 0);
        const coverWt = Number(item.actualCoverWeight || item.coverWeight || 0);
        const frameQty = Number(item.frameQty || 0);
        const frameWt = Number(item.actualFrameWeight || item.frameWeight || 0);
        const totalWt = Number(item.totalWeight || 0);
        const setQty = Number(item.setQty || 0);
        const extraCover = Number(item.extraCoverQty || 0);
        const extraFrame = Number(item.extraFrameQty || 0);
        const remarks = item.remarks || r.remarks || '';

        grandCoverQty += coverQty;
        grandCoverWt += coverWt;
        grandFrameQty += frameQty;
        grandFrameWt += frameWt;
        grandTotWt += totalWt;
        grandSets += setQty;

        detailedRows.push([
          `"${String(repNo).replace(/"/g, '""')}"`,
          `"${String(repDate).replace(/"/g, '""')}"`,
          `"${String(repShift).replace(/"/g, '""')}"`,
          `"${String(repSup).replace(/"/g, '""')}"`,
          `"${String(repStatus).replace(/"/g, '""')}"`,
          `"${String(repCreatedBy).replace(/"/g, '""')}"`,
          srNo,
          `"${String(prodName).replace(/"/g, '""')}"`,
          `"${String(prodSku).replace(/"/g, '""')}"`,
          `"${String(size).replace(/"/g, '""')}"`,
          `"${String(type).replace(/"/g, '""')}"`,
          `"${String(capacity).replace(/"/g, '""')}"`,
          coverQty,
          coverWt.toFixed(2),
          frameQty,
          frameWt.toFixed(2),
          totalWt.toFixed(2),
          setQty,
          extraCover,
          extraFrame,
          `"${String(remarks).replace(/"/g, '""')}"`
        ].join(','));
      });
    }
  });

  const detailedTotalRow = [
    '"GRAND TOTAL"', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""',
    grandCoverQty, grandCoverWt.toFixed(2), grandFrameQty, grandFrameWt.toFixed(2), grandTotWt.toFixed(2), grandSets,
    '""', '""', '""'
  ].join(',');

  const csvDetailed = [detailedHeaders.join(','), ...detailedRows, detailedTotalRow].join('\n');
  fs.writeFileSync('scratch/sample_october_detailed.csv', '\uFEFF' + csvDetailed);
  console.log('\n--- SAMPLE DETAILED CSV LINE ITEMS COUNT:', detailedRows.length);
  console.log('--- DETAILED FIRST 2 ITEMS ---');
  console.log(detailedRows.slice(0, 2).join('\n'));
}

testExport().catch(console.error);
