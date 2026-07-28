import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';

export function DeliveryDocumentUploader({ entityId, entityType, onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newDocs = files.map(f => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: f.name,
        size: (f.size / 1024).toFixed(2) + ' KB',
        type: f.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString()
      }));
      setDocuments(prev => [...prev, ...newDocs]);
      setIsUploading(false);
      if (onUploadComplete) onUploadComplete(newDocs);
    }, 1000);
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Supporting Documents</h4>
      
      <div className="flex items-center justify-center w-full mb-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
          </div>
          <input type="file" className="hidden" multiple onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      {isUploading && (
        <div className="text-sm text-blue-600 flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Uploading...
        </div>
      )}

      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.size}</p>
                </div>
              </div>
              <button 
                onClick={() => removeDocument(doc.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
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
