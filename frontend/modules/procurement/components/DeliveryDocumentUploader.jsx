import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export function DeliveryDocumentUploader({ entityId, entityType, onUploadComplete, isInvalid = false, errorMessage = '' }) {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  const handleFileUpload = (e) => {
    const rawFiles = Array.from(e.target.files);
    if (rawFiles.length === 0) return;

    const validFiles = [];
    for (const f of rawFiles) {
      const ext = ('.' + f.name.split('.').pop()).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        Swal.fire({
          icon: 'warning',
          title: 'Unsupported File Format',
          text: `"${f.name}" is not supported. Please upload PDF, JPG, or PNG files only.`,
          confirmButtonColor: '#2563eb'
        });
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        Swal.fire({
          icon: 'warning',
          title: 'File Exceeds 10MB Limit',
          text: `"${f.name}" is ${(f.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 10 MB.`,
          confirmButtonColor: '#2563eb'
        });
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    
    const readers = validFiles.map(f => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: f.name,
            size: (f.size / 1024).toFixed(2) + ' KB',
            type: f.type || 'application/octet-stream',
            uploadedAt: new Date().toISOString(),
            previewUrl: (f.type && f.type.startsWith('image/')) ? reader.result : null
          });
        };
        reader.readAsDataURL(f);
      });
    });

    Promise.all(readers).then(newDocs => {
      setDocuments(prev => [...prev, ...newDocs]);
      setIsUploading(false);
      e.target.value = '';
    }).catch(() => {
      setIsUploading(false);
      e.target.value = '';
    });
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  React.useEffect(() => {
    if (onUploadComplete) {
      onUploadComplete(documents);
    }
  }, [documents, onUploadComplete]);

  return (
    <div style={{
      marginTop: '16px',
      border: isInvalid ? '1.5px solid #EF4444' : '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      background: isInvalid ? '#FFF5F5' : '#f8fafc',
      transition: 'border-color 0.2s, background 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: isInvalid ? '#DC2626' : '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Supporting Documents <span style={{ color: '#EF4444' }}>*</span>
        </h4>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: documents.length > 0 ? '#059669' : (isInvalid ? '#DC2626' : '#64748b'),
          background: documents.length > 0 ? '#ECFDF5' : (isInvalid ? '#FEE2E2' : '#F1F5F9'),
          padding: '2px 8px',
          borderRadius: '12px',
          border: documents.length > 0 ? '1px solid #A7F3D0' : (isInvalid ? '1px solid #FECACA' : '1px solid #E2E8F0')
        }}>
          {documents.length > 0 ? `✓ ${documents.length} File(s) Attached` : 'Required: Min 1 Document'}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '12px' }}>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '115px',
          border: isInvalid ? '2px dashed #F87171' : '2px dashed #cbd5e1',
          borderRadius: '12px',
          cursor: 'pointer',
          background: '#ffffff',
          transition: 'all 0.2s'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Upload size={26} color={isInvalid ? '#EF4444' : '#94a3b8'} style={{ marginBottom: '6px' }} />
            <p style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: '#2563eb' }}>Click to upload</span> or drag and drop
            </p>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>PDF, JPG, PNG (Max 10MB per file)</p>
          </div>
          <input
            type="file"
            style={{ display: 'none' }}
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {isInvalid && errorMessage && (
        <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
          <AlertCircle size={14} />
          {errorMessage}
        </div>
      )}

      {isUploading && (
        <div style={{ fontSize: '14px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          Uploading...
        </div>
      )}

      {documents.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map(doc => (
            <li key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                {doc.previewUrl ? (
                  <img src={doc.previewUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '6px' }}>
                    <FileText color="#3b82f6" size={20} />
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{doc.size}</p>
                </div>
              </div>
              <button 
                onClick={() => removeDocument(doc.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                type="button"
              >
                <X size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
