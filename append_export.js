const fs = require('fs');
const content = `

/**
 * Export Quotation to PDF
 */
export const exportQuotationPDF = (quotation) => {
  if (!quotation) {
    throw new Error('Quotation not provided');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Company header
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42); 
  doc.text('QUOTATION', pageWidth - 14, y, { align: 'right' });
  doc.setFontSize(10);
  doc.text('HIMALAYA PRODUCTS', 14, y);
  doc.setTextColor(100, 116, 139);
  doc.text('Concrete & Aggregate Supply', 14, y + 5);
  doc.setTextColor(0, 0, 0);

  // Details
  y += 20;
  doc.setFontSize(10);
  doc.text(\`Ref No: \${quotation.quotationNo || 'N/A'}\`, pageWidth - 14, y, { align: 'right' });
  doc.text(\`Date: \${quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}\`, pageWidth - 14, y + 6, { align: 'right' });
  y += 15;

  // Customer info
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('QUOTED TO:', 14, y);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(quotation.customerName || 'N/A', 14, y + 6);
  y += 20;

  // Items table
  let subtotal = 0;
  let taxTotal = 0;

  const items = quotation.items || quotation.detailedItems || [];
  const tableData = items.map(item => {
    const qty = item.quantity || 1;
    const price = item.unitPrice || 0;
    const itemSub = qty * price;
    const taxValue = itemSub * (item.tax !== undefined ? item.tax : 18) / 100;
    const itemTotal = itemSub + taxValue;
    
    subtotal += itemSub;
    taxTotal += taxValue;

    return [
      item.productName || 'N/A',
      qty,
      \`INR \${parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`,
      \`\${item.tax !== undefined ? item.tax : 18}%\`,
      \`INR \${parseFloat(itemTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`
    ];
  });

  doc.autoTable({
    head: [['Product Details', 'Qty', 'Rate', 'Tax (GST)', 'Total']],
    body: tableData,
    startY: y,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 15;

  const transport = quotation.transportCharge || 0;
  const grandTotal = subtotal + taxTotal + transport;

  // Totals
  doc.setFontSize(10);
  const labelX = 140;
  doc.text(\`Items Subtotal:\`, labelX, y);
  doc.text(\`INR \${parseFloat(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, pageWidth - 14, y, { align: 'right' });
  y += 6;

  doc.text(\`GST Amount:\`, labelX, y);
  doc.text(\`INR \${parseFloat(taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, pageWidth - 14, y, { align: 'right' });
  y += 6;

  if (transport > 0) {
    doc.text(\`Transport (Approx.):\`, labelX, y);
    doc.text(\`INR \${parseFloat(transport).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, pageWidth - 14, y, { align: 'right' });
    y += 6;
  }

  y += 4;
  doc.setFontSize(12);
  doc.text(\`Grand Total:\`, labelX, y);
  doc.text(\`INR \${parseFloat(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, pageWidth - 14, y, { align: 'right' });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(\`Page \${i} of \${totalPages}\`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(\`Quotation_\${quotation.quotationNo || 'Draft'}.pdf\`);
  return true;
};
`;
fs.appendFileSync('services/export.service.js', content);
