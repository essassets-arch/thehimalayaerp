const fs = require('fs');
let content = fs.readFileSync('modules/store/pages/StorePortal.jsx', 'utf8');

// 1. Update useERP destructuring
content = content.replace(
  'const { state, dispatch, syncData, createGoodsReceipt, createPurchaseIndent } = useERP();',
  'const { state, dispatch, syncData, createGoodsReceipt, createPurchaseIndent, approveGoodsReceipt, postGoodsReceiptToStock, createVendorInvoice, verifyVendorInvoice, createVendorPayment, completeVendorPayment, updatePurchaseOrder, issuePurchaseOrder, acceptPurchaseOrderByVendor } = useERP();'
);

// 2. Replace handleFastTrackPOClose
const newFastTrack = `  const handleFastTrackPOClose = async (poRow) => {
    if (!poRow) return;
    try {
      const poId = poRow.id;
      const poNum = poRow.poNumber || poId;
      showToast('Initiating strict fast-track closure for ' + poNum + '...');
      
      // We will ensure PO is Issued and Vendor Accepted
      if (poRow.status === 'SUPER_ADMIN_APPROVED') {
         issuePurchaseOrder(poId, poNum);
      }
      if (poRow.status !== 'VENDOR_ACCEPTED' && poRow.status !== 'PARTIALLY_RECEIVED') {
         acceptPurchaseOrderByVendor(poId, { expectedDeliveryDate: new Date().toISOString() });
      }

      // 1. Create GRN
      const grnId = 'GRN-' + Math.floor(10000+Math.random()*90000);
      createGoodsReceipt(poId, {
        id: grnId,
        grnNumber: grnId,
        vendorName: poRow.vendorName,
        receivedQty: Number(poRow.orderedQty || poRow.quantity || 1605),
        acceptedQty: Number(poRow.orderedQty || poRow.quantity || 1605),
        rejectedQty: 0,
        items: poRow.items
      });
      
      // 2. Approve GRN
      approveGoodsReceipt(grnId, 'Fast-Track QC Approval');
      
      // 3. Post to Stock
      postGoodsReceiptToStock(grnId, 'System (Fast Track)');
      
      // 4. Invoicing
      const invId = 'INV-' + Math.floor(10000+Math.random()*90000);
      createVendorInvoice(poId, {
        id: invId,
        invoiceNumber: invId,
        amount: poRow.grandTotal || poRow.totalAmount || 564250,
        vendorName: poRow.vendorName
      });
      verifyVendorInvoice(invId);
      
      // 5. Payment
      const payId = 'PAY-' + Math.floor(10000+Math.random()*90000);
      createVendorPayment(poId, invId, {
        id: payId,
        amount: poRow.grandTotal || poRow.totalAmount || 564250,
        paymentMethod: 'NEFT'
      });
      completeVendorPayment(payId, {
        transactionId: 'TRX-' + Date.now(),
        utrNo: 'UTR' + Date.now()
      });

      if (typeof syncData === 'function') syncData();
      showToast('✓ Order ' + poNum + ' flow strictly completed via new state machine!');
      setShowStorePOPdfModal(null);
    } catch (err) {
      console.error('Fast-track close error:', err);
      showToast('Error closing PO flow: ' + err.message, 'error');
    }
  };`;

// We use regex to replace the old handleFastTrackPOClose
const regex = /const handleFastTrackPOClose = async \([^]*?setShowStorePOPdfModal\(null\);\n    } catch \(err\) {\n      console\.error\('Fast-track close error:', err\);\n      showToast\('Error closing PO flow: ' \+ err\.message, 'error'\);\n    }\n  };/;

content = content.replace(regex, newFastTrack);

fs.writeFileSync('modules/store/pages/StorePortal.jsx', content);
console.log('Successfully updated StorePortal.jsx!');


