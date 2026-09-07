const fs = require('fs');

// 1. Update export.service.js
let expContent = fs.readFileSync('frontend/services/export.service.js', 'utf8');

const exportQuotationImageCode = `/**
 * Export a DOM element to a high-quality PNG image (⭐ GUARANTEED CANONICAL 794px A4 LAYOUT ON ANY DEVICE)
 */
export const exportQuotationImage = async (elementId, filename = 'quotation.png', { save = true } = {}) => {
  const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
  if (!element) {
    throw new Error(\`Element with id "\${elementId}" not found\`);
  }

  // Create isolated off-screen wrapper at (0, 0), top-level visible in DOM for canvas rendering
  const wrapper = document.createElement('div');
  wrapper.id = \`\${typeof elementId === 'string' ? elementId : 'quotation'}-export-wrapper\`;
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '794px';
  wrapper.style.zIndex = '99999';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.opacity = '0.01';
  wrapper.style.visibility = 'visible';
  wrapper.style.overflow = 'visible';
  wrapper.style.background = '#ffffff';

  const clone = element.cloneNode(true);
  clone.id = \`\${typeof elementId === 'string' ? elementId : 'quotation'}-export-clone\`;
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minHeight = '1123px';
  clone.style.transform = 'none';
  clone.style.borderRadius = '0';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.background = '#ffffff';
  clone.style.display = 'block';

  // Enforce desktop row layouts on all clone sections
  const mobileFlexRows = clone.querySelectorAll('.quotation-sheet-mobile-flex, .quotation-sheet-title-flex, .quotation-footer-flex');
  mobileFlexRows.forEach(el => {
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('flex-direction', 'row', 'important');
    el.style.setProperty('justify-content', 'space-between', 'important');
    el.style.setProperty('align-items', 'flex-start', 'important');
  });

  const rightMeta = clone.querySelector('.quotation-sheet-right-meta');
  if (rightMeta) {
    rightMeta.style.setProperty('align-self', 'flex-end', 'important');
    rightMeta.style.setProperty('align-items', 'flex-end', 'important');
    rightMeta.style.setProperty('width', 'auto', 'important');
  }

  const footerContact = clone.querySelector('.quotation-footer-contact');
  if (footerContact) {
    footerContact.style.setProperty('display', 'flex', 'important');
    footerContact.style.setProperty('flex-direction', 'row', 'important');
    footerContact.style.setProperty('justify-content', 'space-between', 'important');
    footerContact.style.setProperty('align-items', 'center', 'important');
    footerContact.style.setProperty('height', '100%', 'important');
    footerContact.style.setProperty('padding', '30px 34px 10px', 'important');
  }

  const footerWave = clone.querySelector('.quotation-footer-wave-wrapper');
  if (footerWave) {
    footerWave.style.setProperty('height', '76px', 'important');
    footerWave.style.setProperty('min-height', '76px', 'important');
  }

  // Enforce pristine tabular formatting on all tables in the clone
  clone.querySelectorAll('table').forEach(t => {
    t.style.setProperty('display', 'table', 'important');
    t.style.setProperty('width', '100%', 'important');
    t.style.setProperty('table-layout', 'fixed', 'important');
    t.style.setProperty('border-collapse', 'collapse', 'important');
  });
  clone.querySelectorAll('thead').forEach(th => th.style.setProperty('display', 'table-header-group', 'important'));
  clone.querySelectorAll('tbody').forEach(tb => tb.style.setProperty('display', 'table-row-group', 'important'));
  clone.querySelectorAll('tr').forEach(tr => {
    tr.style.setProperty('display', 'table-row', 'important');
    tr.style.setProperty('background', 'transparent', 'important');
    tr.style.setProperty('border', 'none', 'important');
  });
  clone.querySelectorAll('td, th').forEach(td => {
    td.style.setProperty('display', 'table-cell', 'important');
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    let blob;
    let dataUrl;

    try {
      // Primary ultra-fast capture: htmlToImage
      dataUrl = await htmlToImage.toPng(clone, {
        pixelRatio: 2,
        width: 794,
        height: clone.scrollHeight || 1123,
        backgroundColor: '#ffffff',
        cacheBust: false,
      });
      const response = await fetch(dataUrl);
      blob = await response.blob();
    } catch (primaryErr) {
      console.warn('htmlToImage primary capture failed, trying fallback:', primaryErr);
      try {
        const canvas = await html2canvas(clone, {
          scale: 2,
          width: 794,
          height: clone.scrollHeight || 1123,
          windowWidth: 794,
          windowHeight: clone.scrollHeight || 1123,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        dataUrl = canvas.toDataURL('image/png');
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      } catch (fallbackErr) {
        console.error('All image export engines failed:', fallbackErr);
        throw fallbackErr;
      }
    }

    if (save) {
      await safeSaveFile(blob || dataUrl, filename, 'image/png');
    }
    return { dataUrl, blob };
  } finally {
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

/**
 * Share a DOM element as a PNG image via Web Share API or fallback (⭐ GUARANTEED CANONICAL 794px A4 LAYOUT ON ANY DEVICE)
 */
export const shareQuotationImage = async (elementId, quotationNo = 'Draft', customerName = 'Customer') => {
  const filename = \`Quotation_\${String(quotationNo).replace(/[\\/\\\\]/g, '_') || 'Draft'}.png\`;
  const exportRes = await exportQuotationImage(elementId, filename, { save: false });
  const { blob, dataUrl } = exportRes;

  const quotationShareUrl = 'https://thehimalaya.cloud/supersales/quotations';
  const shareText = \`Quotation #\${quotationNo} for \${customerName || 'Valued Customer'}\\n\${quotationShareUrl}\`;

  // 1. Flutter in-app webview share handler (Mobile APK)
  if (typeof window !== 'undefined' && window.flutter_inappwebview?.callHandler) {
    try {
      await window.flutter_inappwebview.callHandler('shareFile', {
        sourceType: 'base64-data-uri',
        filename,
        mimeType: 'image/png',
        data: dataUrl,
        text: shareText,
        url: quotationShareUrl
      });
      return { success: true, blob, dataUrl, filename };
    } catch (e) {
      try {
        await window.flutter_inappwebview.callHandler('share', {
          title: \`Quotation \${quotationNo}\`,
          text: shareText,
          url: quotationShareUrl
        });
        return { success: true, blob, dataUrl, filename };
      } catch (e2) {}
    }
  }

  // 2. Web Share API with files (Android Chrome, iOS Safari, Modern Mobile Web)
  if (typeof navigator !== 'undefined' && navigator.canShare && blob) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: \`Quotation \${quotationNo}\`,
          text: shareText,
          files: [file]
        });
        return { success: true, blob, dataUrl, filename };
      }
    } catch (shareErr) {
      if (shareErr && (shareErr.name === 'AbortError' || shareErr.message?.includes('abort'))) {
        return { success: true, blob, dataUrl, filename };
      }
    }
  }

  // 3. Web Share API text fallback
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: \`Quotation \${quotationNo}\`,
        text: shareText,
        url: quotationShareUrl
      });
      return { success: true, blob, dataUrl, filename };
    } catch (e) {
      if (e && (e.name === 'AbortError' || e.message?.includes('abort'))) {
        return { success: true, blob, dataUrl, filename };
      }
    }
  }

  // 4. Direct WhatsApp Share fallback
  if (typeof window !== 'undefined') {
    const whatsappUrl = \`https://api.whatsapp.com/send?text=\${encodeURIComponent(shareText)}\`;
    window.open(whatsappUrl, '_blank');
    return { success: true, blob, dataUrl, filename };
  }

  return { success: false, blob, dataUrl, filename };
};`;

const oldExportImgIndex = expContent.indexOf('export const exportQuotationImage = async');
if (oldExportImgIndex !== -1) {
  expContent = expContent.substring(0, oldExportImgIndex) + exportQuotationImageCode + '\n';
  fs.writeFileSync('frontend/services/export.service.js', expContent, 'utf8');
  console.log('Updated export.service.js with fast capture and direct mobile APK share!');
} else {
  console.log('Could not find exportQuotationImage in export.service.js');
}
