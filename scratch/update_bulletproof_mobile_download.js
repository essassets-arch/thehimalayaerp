const fs = require('fs');
const path = 'frontend/services/export.service.js';
let content = fs.readFileSync(path, 'utf8');

const safeSaveFileCode = `export const safeSaveFile = async (data, filename, mimeType = 'application/octet-stream') => {
  let blob;
  let rawData = '';
  if (typeof data === 'string') {
    rawData = data;
    if (data.startsWith('data:')) {
      try {
        const parts = data.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || mimeType;
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } catch {
        blob = new Blob([data], { type: mimeType });
      }
    } else {
      blob = new Blob([data], { type: mimeType });
    }
  } else if (data instanceof Blob) {
    blob = data;
  } else if (data && typeof data.output === 'function') {
    blob = data.output('blob');
  } else {
    blob = new Blob([data], { type: mimeType });
  }

  const resolvedMimeType = blob?.type || mimeType;
  const safeFilename = String(filename || 'download')
    .replace(/[\\\\/:*?"<>|]/g, '_')
    .replace(/\\s+/g, ' ')
    .trim();

  let base64Payload = rawData;
  if (!base64Payload && blob) {
    try {
      base64Payload = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {}
  }

  let absoluteDownloadUrl = '';

  // 1. Prepare server-side download token URL (Enables native Android / iOS Download Manager & Flutter Dio download)
  try {
    if (base64Payload) {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token')) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = \`Bearer \${token}\`;

      const response = await fetch('/api/backend/files/export-download', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename: safeFilename,
          mimeType: resolvedMimeType,
          data: base64Payload,
        }),
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson && resJson.downloadUrl) {
          absoluteDownloadUrl = resJson.downloadUrl.startsWith('http')
            ? resJson.downloadUrl
            : \`\${window.location.origin}\${resJson.downloadUrl}\`;
        }
      }
    }
  } catch (apiErr) {
    console.warn('Backend export-download notice:', apiErr);
  }

  // 2. Flutter InAppWebView Native JavaScript Channel handler (Mobile APK)
  if (typeof window !== 'undefined' && window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
    try {
      await window.flutter_inappwebview.callHandler('downloadFile', {
        sourceType: absoluteDownloadUrl ? 'url' : 'base64-data-uri',
        url: absoluteDownloadUrl,
        filename: safeFilename,
        mimeType: resolvedMimeType,
        data: base64Payload,
        destination: resolvedMimeType.startsWith('image/') ? 'gallery' : 'downloads',
      });
    } catch (e) {}

    try {
      await window.flutter_inappwebview.callHandler('saveToGallery', {
        url: absoluteDownloadUrl,
        data: base64Payload,
        filename: safeFilename,
        mimeType: resolvedMimeType
      });
    } catch (e2) {}

    try {
      await window.flutter_inappwebview.callHandler('saveImage', {
        url: absoluteDownloadUrl,
        data: base64Payload,
        filename: safeFilename,
        mimeType: resolvedMimeType
      });
    } catch (e3) {}
  }

  // 3. Direct Browser Trigger (Android DownloadManager, iOS Safari, Desktop)
  try {
    const downloadTarget = absoluteDownloadUrl || (blob ? URL.createObjectURL(blob) : base64Payload);
    const link = document.createElement('a');
    link.href = downloadTarget;
    link.download = safeFilename;
    link.setAttribute('download', safeFilename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 1500);
  } catch (anchorErr) {
    console.warn('Anchor download fallback notice:', anchorErr);
  }

  // 4. File-Saver saveAs Fallback
  try {
    if (blob) {
      saveAs(blob, safeFilename);
    }
  } catch (saveAsErr) {}

  return true;
};`;

const oldSafeSaveIndex = content.indexOf('export const safeSaveFile = async');
const nextFunctionIndex = content.indexOf('export const exportToCSV =');

if (oldSafeSaveIndex !== -1 && nextFunctionIndex !== -1) {
  content = content.substring(0, oldSafeSaveIndex) + safeSaveFileCode + '\n\n' + content.substring(nextFunctionIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated safeSaveFile for bulletproof mobile APK and gallery saving!');
} else {
  console.log('Indices not found for safeSaveFile');
}
