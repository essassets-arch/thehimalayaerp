const fs = require('fs');
const path = 'frontend/components/QuotationsView.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add downloadingImage and sharingImage states
const targetStates = `  const [previewZoomMode, setPreviewZoomMode] = useState('fit'); // 'fit' | 'full'
  const [previewScale, setPreviewScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1150);
  const quotationSheetRef = useRef(null);`;

const replacementStates = `  const [previewZoomMode, setPreviewZoomMode] = useState('fit'); // 'fit' | 'full'
  const [previewScale, setPreviewScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1150);
  const quotationSheetRef = useRef(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);`;

// 2. Replace the buttons
const targetButtons = `                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      Swal.fire({
                        title: 'Generating Image...',
                        text: 'Rendering high-resolution quotation image...',
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      const qNo = resolveQuotationNumber(selectedQuotation);
                      const safeFilename = \`Quotation_\${String(qNo).replace(/[\\/\\\\]/g, '_') || 'Draft'}.png\`;
                      await exportQuotationImage('quotation-printable-area', safeFilename);
                      Swal.close();
                      Swal.fire({
                        icon: 'success',
                        title: 'Quotation Downloaded!',
                        text: 'Image has been saved to your device.',
                        timer: 2000,
                        showConfirmButton: false
                      });
                    } catch (err) {
                      console.error('Error generating image:', err);
                      Swal.close();
                      Swal.fire('Error', 'Failed to generate quotation image. Please try again.', 'error');
                    }
                  }}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <ImageIcon size={14} /> Download Image
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      Swal.fire({
                        title: 'Preparing Image...',
                        text: 'Rendering quotation image for sharing...',
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      
                      const qNo = resolveQuotationNumber(selectedQuotation);
                      const res = await shareQuotationImage('quotation-printable-area', qNo, selectedQuotation.customerName);
                      Swal.close();
                      
                      if (!res.success) {
                        const whatsappText = encodeURIComponent(\`Hello, please find the quotation details:\\n*Quotation:* \${qNo}\\n*Customer:* \${selectedQuotation.customerName || 'Valued Customer'}\`);
                        const whatsappUrl = \`https://api.whatsapp.com/send?text=\${whatsappText}\`;
                        
                        Swal.fire({
                          title: 'Share Quotation',
                          html: \`
                            <div style="display:flex; flex-direction:column; gap:12px; margin-top: 10px; align-items: center; text-align: center;">
                              <p style="font-size: 12.5px; color: #475569; margin: 0;">Choose how you want to share or download the quotation:</p>
                              <img src="\${res.dataUrl}" style="max-width: 100%; max-height: 220px; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08);" />
                              <div style="display: flex; gap: 8px; width: 100%; justify-content: center; flex-wrap: wrap; margin-top: 6px;">
                                <a href="\${res.dataUrl}" download="Quotation_\${String(qNo).replace(/[\\/\\\\]/g, '_') || 'Draft'}.png" style="background:#0284c7; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:700; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;">📥 Save Image</a>
                                <a href="\${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="background:#22c55e; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:700; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;">💬 WhatsApp</a>
                              </div>
                              <span style="font-size: 11px; color: #94a3b8;">Tip: On mobile devices, you can touch & hold the image above to save directly to your gallery.</span>
                            </div>
                          \`,
                          showConfirmButton: false,
                          showCloseButton: true,
                          customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title' }
                        });
                      }
                    } catch (err) {
                      console.error('Error sharing image:', err);
                      Swal.close();
                      Swal.fire('Error', 'Failed to share quotation image.', 'error');
                    }
                  }}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Share2 size={14} /> Share Image
                </button>`;

const replacementButtons = `                <button
                  type="button"
                  disabled={downloadingImage}
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    if (downloadingImage) return;
                    try {
                      setDownloadingImage(true);
                      const qNo = resolveQuotationNumber(selectedQuotation);
                      const safeFilename = \`Quotation_\${String(qNo).replace(/[\\/\\\\]/g, '_') || 'Draft'}.png\`;
                      await exportQuotationImage('quotation-printable-area', safeFilename);
                    } catch (err) {
                      console.error('Error generating image:', err);
                    } finally {
                      setDownloadingImage(false);
                    }
                  }}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: downloadingImage ? 'not-allowed' : 'pointer' }}
                >
                  {downloadingImage ? (
                    <>
                      <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} />
                      <span>Download Image</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={sharingImage}
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    if (sharingImage) return;
                    try {
                      setSharingImage(true);
                      const qNo = resolveQuotationNumber(selectedQuotation);
                      await shareQuotationImage('quotation-printable-area', qNo, selectedQuotation.customerName);
                    } catch (err) {
                      console.error('Error sharing image:', err);
                    } finally {
                      setSharingImage(false);
                    }
                  }}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: sharingImage ? 'not-allowed' : 'pointer' }}
                >
                  {sharingImage ? (
                    <>
                      <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Image</span>
                    </>
                  )}
                </button>`;

let updated = content.replace(/\r\n/g, '\n');

if (updated.includes(targetStates.replace(/\r\n/g, '\n'))) {
  updated = updated.replace(targetStates.replace(/\r\n/g, '\n'), replacementStates);
  console.log('Added states to QuotationsView');
} else {
  console.log('Target states not found in QuotationsView');
}

if (updated.includes(targetButtons.replace(/\r\n/g, '\n'))) {
  updated = updated.replace(targetButtons.replace(/\r\n/g, '\n'), replacementButtons);
  console.log('Replaced download/share buttons in QuotationsView');
} else {
  console.log('Target buttons not found in QuotationsView');
}

fs.writeFileSync(path, updated, 'utf8');
console.log('QuotationsView updated successfully!');
