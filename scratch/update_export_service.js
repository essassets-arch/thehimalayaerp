const fs = require('fs');
const path = 'frontend/services/export.service.js';
let content = fs.readFileSync(path, 'utf8');

const target1 = `      if (base64Payload) {
        const response = await fetch('/api/backend/files/export-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            mimeType,
            data: base64Payload,
          }),
        });`;

const replacement1 = `      if (base64Payload) {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token')) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = \`Bearer \${token}\`;

        const response = await fetch('/api/backend/files/export-download', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            filename,
            mimeType,
            data: base64Payload,
          }),
        });`;

const target2 = `    try {
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
    } catch (primaryErr) {
      console.warn('html2canvas capture failed, trying htmlToImage:', primaryErr);
      try {
        dataUrl = await htmlToImage.toPng(clone, {
          pixelRatio: 2,
          width: 794,
          height: clone.scrollHeight || 1123,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
        const response = await fetch(dataUrl);
        blob = await response.blob();
      } catch (fallbackErr) {
        console.error('All image export engines failed:', fallbackErr);
        throw fallbackErr;
      }
    }`;

const replacement2 = `    try {
      // Primary: htmlToImage supports modern CSS functions (oklch, color-mix, lab, etc.)
      dataUrl = await htmlToImage.toPng(clone, {
        pixelRatio: 2,
        width: 794,
        height: clone.scrollHeight || 1123,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      const response = await fetch(dataUrl);
      blob = await response.blob();
    } catch (primaryErr) {
      console.warn('htmlToImage primary capture failed, trying html2canvas fallback:', primaryErr);
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
    }`;

let updated = content.replace(/\r\n/g, '\n');

if (updated.includes(target1.replace(/\r\n/g, '\n'))) {
  updated = updated.replace(target1.replace(/\r\n/g, '\n'), replacement1);
  console.log('Replaced target 1 in export.service.js');
} else {
  console.log('Target 1 NOT found in export.service.js');
}

if (updated.includes(target2.replace(/\r\n/g, '\n'))) {
  updated = updated.replace(target2.replace(/\r\n/g, '\n'), replacement2);
  console.log('Replaced target 2 in export.service.js');
} else {
  console.log('Target 2 NOT found in export.service.js');
}

fs.writeFileSync(path, updated, 'utf8');
console.log('export.service.js updated successfully!');
