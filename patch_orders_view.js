const fs = require('fs');
const filePath = 'd:/prototype-next/components/OrdersView.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state variable
if (!content.includes('const [requestModal, setRequestModal]')) {
  content = content.replace(
    'const [selectedDeliveryModal, setSelectedDeliveryModal] = useState(null);',
    `const [selectedDeliveryModal, setSelectedDeliveryModal] = useState(null);\n  const [requestModal, setRequestModal] = useState(null); // { type: 'REPLACEMENT' | 'RETURN', order: object }`
  );
}

// 2. Add Modal UI at the bottom
const modalUI = `
      {/* Return/Replacement Request Modal */}
      {requestModal && (
        <div className="sheet-backdrop" onClick={() => setRequestModal(null)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {requestModal.type === 'REPLACEMENT' ? 'Ask for Replacement' : 'Ask for Return'}
              </h3>
              <button onClick={() => setRequestModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div><strong>Order ID:</strong> {requestModal.order.orderNo || requestModal.order.id}</div>
                <div><strong>Customer:</strong> {requestModal.order.customerName || requestModal.order.customer?.name || 'N/A'}</div>
                <div><strong>Product:</strong> {requestModal.order.products || requestModal.order.product || 'Standard Items'}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Quantity (Max {requestModal.order.quantity || 1})</label>
                <input id="req-qty" type="number" defaultValue={1} max={requestModal.order.quantity || 1} min={1} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Photo Upload (Optional)</label>
                <input type="file" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Remarks / Reason</label>
                <textarea id="req-remarks" rows="3" placeholder="Explain the issue..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => {
                    const qty = document.getElementById('req-qty').value;
                    const remarks = document.getElementById('req-remarks').value;
                    
                    const storageKey = requestModal.type === 'REPLACEMENT' ? 'erp_replacement_requests' : 'erp_return_requests';
                    const requests = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    
                    requests.push({
                      id: \`REQ-\${Date.now()}\`,
                      orderId: requestModal.order.orderNo || requestModal.order.id,
                      customerName: requestModal.order.customerName || requestModal.order.customer?.name || 'N/A',
                      product: requestModal.order.products || requestModal.order.product || 'Standard Items',
                      quantity: qty,
                      remarks: remarks || 'No remarks provided',
                      date: new Date().toISOString(),
                      status: 'PENDING_APPROVAL'
                    });
                    
                    localStorage.setItem(storageKey, JSON.stringify(requests));
                    
                    import('sweetalert2').then(Swal => {
                       Swal.default.fire({
                         icon: 'success',
                         title: 'Request Sent',
                         text: \`\${requestModal.type === 'REPLACEMENT' ? 'Replacement' : 'Return'} request sent to Plant Head successfully!\`,
                         timer: 2000,
                         showConfirmButton: false
                       });
                    });
                    
                    setRequestModal(null);
                  }}
                  style={{ 
                    flex: 1, padding: '10px', 
                    background: requestModal.type === 'REPLACEMENT' ? '#f59e0b' : '#ef4444', 
                    color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' 
                  }}
                >
                  Submit Request
                </button>
                <button onClick={() => setRequestModal(null)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

if (!content.includes('Return/Replacement Request Modal')) {
  // Find the last closing div of the component
  content = content.replace(/<\/div>\s*<style jsx>\s*{\`/, modalUI + '\n      <style jsx>{`');
  if (!content.includes('Return/Replacement Request Modal')) {
    // If <style jsx> wasn't matched, just replace the final `</div>\n  );\n}`
    const lastDivMatch = content.lastIndexOf('</div>\n  );\n}');
    if (lastDivMatch !== -1) {
      content = content.substring(0, lastDivMatch) + modalUI;
    }
  }
}

// 3. Replace the existing Action column buttons inside Delivered filter
const oldButtonsStr1 = `{onAskReplacement && canAskReplacement(o) && (
                              <button
                                type="button"
                                onClick={() => onAskReplacement(o)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center',
                                  padding: '4px 12px', height: '30px',
                                  background: '#fef3c7',
                                  border: '1px solid #f59e0b',
                                  borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: '800',
                                  color: '#92400e',
                                }}
                              >
                                Ask Replacement
                              </button>
                            )}`;

const newButtonsStr = `
                            {isDeliveredOrder(o) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setRequestModal({ type: 'REPLACEMENT', order: o })}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '4px 12px', height: '30px',
                                    background: '#fef3c7',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: '800',
                                    color: '#92400e', whiteSpace: 'nowrap'
                                  }}
                                >
                                  Ask Replacement
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRequestModal({ type: 'RETURN', order: o })}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '4px 12px', height: '30px',
                                    background: '#fee2e2',
                                    border: '1px solid #ef4444',
                                    borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: '800',
                                    color: '#991b1b', whiteSpace: 'nowrap'
                                  }}
                                >
                                  Ask Return
                                </button>
                              </>
                            )}
`;

content = content.replace(oldButtonsStr1, newButtonsStr);

// There is another instance of oldButtonsStr in the generic action column
const oldButtonsStr2 = `{onAskReplacement && canAskReplacement(o) && (
                            <button
                              type="button"
                              onClick={() => onAskReplacement(o)}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '4px 12px', height: '30px',
                                background: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '800',
                                color: '#92400e', whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              Ask Replacement
                            </button>
                          )}`;
content = content.replace(oldButtonsStr2, newButtonsStr);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('OrdersView.jsx updated with modal and buttons');
