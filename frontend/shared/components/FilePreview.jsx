'use client';

import React, { useState } from 'react';
import { getBackendAssetUrl, getFileDownloadUrl } from '@/lib/assetUrl';
import SecureImage from './SecureImage';
import { FileText, Download, ExternalLink, Eye, File, CheckCircle2 } from 'lucide-react';

export default function FilePreview({
  fileUrl,
  fileName = 'Document',
  fileType,
  fileSize,
  className = '',
  style = {},
  showDownload = true,
}) {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const resolvedUrl = getBackendAssetUrl(fileUrl);
  const downloadUrl = getFileDownloadUrl(fileUrl, fileName);

  if (!resolvedUrl) {
    return (
      <div
        className={`file-preview-empty ${className}`}
        style={{
          padding: '12px 16px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          ...style,
        }}
      >
        <File size={16} /> No file attachment available
      </div>
    );
  }

  const isImage =
    fileType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(resolvedUrl || '') ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName || '');

  const isPdf =
    fileType === 'application/pdf' ||
    /\.pdf$/i.test(resolvedUrl || '') ||
    /\.pdf$/i.test(fileName || '');

  if (isImage) {
    return (
      <div className={`file-preview-image ${className}`} style={{ ...style }}>
        <SecureImage
          src={resolvedUrl}
          alt={fileName}
          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '6px',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
            {fileName}
          </span>
          {showDownload && (
            <a
              href={downloadUrl}
              download={fileName}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 600 }}
            >
              <Download size={12} /> Download
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`file-preview-card ${className}`}
      style={{
        padding: '12px 16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: '8px',
            background: isPdf ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            color: isPdf ? '#ef4444' : '#6366f1',
          }}
        >
          <FileText size={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </span>
          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
            {isPdf ? 'PDF Document' : 'Attachment'} {fileSize ? `• ${Math.round(fileSize / 1024)} KB` : ''}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            background: '#f1f5f9',
            color: '#334155',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Eye size={12} /> View
        </a>
        {showDownload && (
          <a
            href={downloadUrl}
            download={fileName}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#e0f2fe',
              color: '#0284c7',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Download size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
