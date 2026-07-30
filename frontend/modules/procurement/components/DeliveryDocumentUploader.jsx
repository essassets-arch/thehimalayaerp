import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

export function DeliveryDocumentUploader({ entityId, entityType, onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    const readers = files.map(f => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: f.name,
            size: (f.size / 1024).toFixed(2) + ' KB',
            type: f.type || 'application/octet-stream',
            uploadedAt: new Date().toISOString(),
            previewUrl: f.type.startsWith('image/') ? reader.result : null
          });
        };
        reader.readAsDataURL(f);
      });
    });

    Promise.all(readers).then(newDocs => {
      setDocuments(prev => {
        const updated = [...prev, ...newDocs];
        if (onUploadComplete) onUploadComplete(updated);
        return updated;
      });
      setIsUploading(false);
    });
  };

  const removeDocument = (id) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id);
      if (onUploadComplete) onUploadComplete(updated);
      return updated;
    });
  };

  return (
    <div style={{ marginTop: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Supporting Documents</h4>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '16px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', background: '#ffffff', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <Upload size={28} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#64748b' }}><span style={{ fontWeight: 600, color: '#3b82f6' }}>Click to upload</span> or drag and drop</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>PDF, JPG, PNG (Max 10MB)</p>
          </div>
          <input type="file" style={{ display: 'none' }} multiple onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

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
