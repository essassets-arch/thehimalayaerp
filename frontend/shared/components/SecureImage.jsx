'use client';

import React, { useState } from 'react';
import { getBackendAssetUrl } from '@/lib/assetUrl';
import { Image as ImageIcon, AlertCircle, Eye, Download, X } from 'lucide-react';

export default function SecureImage({
  src,
  alt = 'Image attachment',
  className = '',
  style = {},
  allowZoom = true,
  fallbackText = 'Image not available',
  onClick,
  ...props
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const resolvedUrl = getBackendAssetUrl(src);

  if (!resolvedUrl || error) {
    return (
      <div
        className={`secure-image-fallback ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          color: '#94a3b8',
          borderRadius: style.borderRadius || '8px',
          width: style.width || '100%',
          height: style.height || '120px',
          padding: '8px',
          textAlign: 'center',
          border: '1px dashed #cbd5e1',
          ...style,
        }}
      >
        <ImageIcon size={20} style={{ marginBottom: '4px', opacity: 0.7 }} />
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>
          {fallbackText}
        </span>
      </div>
    );
  }

  const handleImageClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (allowZoom) {
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          width: style.width,
          height: style.height,
          overflow: 'hidden',
          borderRadius: style.borderRadius || '8px',
          cursor: allowZoom || onClick ? 'pointer' : 'default',
        }}
        onClick={handleImageClick}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              zIndex: 1,
            }}
          />
        )}
        <img
          src={resolvedUrl}
          alt={alt}
          className={className}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: style.objectFit || 'cover',
            borderRadius: style.borderRadius || '8px',
            transition: 'opacity 0.2s ease-in-out, transform 0.2s',
            opacity: loading ? 0 : 1,
            ...style,
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          {...props}
        />
      </div>

      {/* Lightbox Zoom Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                color: '#ffffff',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{alt}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={resolvedUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <img
              src={resolvedUrl}
              alt={alt}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
