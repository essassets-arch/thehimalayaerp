import React, { useState } from 'react';
import { brandAnalysisService } from '../../services/brandAnalysisService';
import './BrandAnalysisCreateModal.css';

export default function BrandAnalysisCreateModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    quantity: '',
    quantityUnit: 'Kg',
    reason: '',
    orderDetails: '',
    requiredByDate: '',
    remarks: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.brandName || !formData.quantity || !formData.quantityUnit || !formData.reason || !imageFile) {
      setError('Please fill in all required fields and upload an image.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Upload image
      const uploadRes = await brandAnalysisService.uploadImage(imageFile);
      const imageUrl = uploadRes.url || uploadRes.fileUrl;

      // 2. Create request
      await brandAnalysisService.createRequest({
        ...formData,
        quantity: Number(formData.quantity),
        imageUrl: imageUrl,
        imageOriginalName: uploadRes.originalName || imageFile.name
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 800,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    marginBottom: '6px'
  };

  return (
    <div 
      className="brand-analysis-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justify-content: 'center',
        padding: '24px',
        overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div
        className="brand-analysis-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-analysis-title"
        style={{
          width: 'min(720px, 100%)',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0f172a',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          fontFamily: 'inherit'
        }}
      >
        <div 
          className="brand-analysis-header"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justify-content: 'space-between',
            gap: '16px',
            padding: '20px 26px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div>
            <h2 id="brand-analysis-title" style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem', fontWeight: 800 }}>
              Create Brand Analysis Request
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              Submit a new request for finance review
            </p>
          </div>

          <button
            type="button"
            className="brand-analysis-close"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              color: '#64748b',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>

        <form className="brand-analysis-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="brand-analysis-body" style={{ flex: 1, overflowY: 'auto', padding: '26px', background: '#ffffff' }}>
            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <div className="brand-analysis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' }}>
              <div className="brand-analysis-field" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="productName" style={labelStyle}>
                  Product Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. Premium Cement"
                  required
                  style={inputStyle}
                />
              </div>

              <div className="brand-analysis-field" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="brandName" style={labelStyle}>
                  Brand Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. UltraTech"
                  required
                  style={inputStyle}
                />
              </div>

              <div className="brand-analysis-field" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="quantity" style={labelStyle}>
                  Quantity <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <div className="brand-analysis-quantity" style={{ display: 'flex', gap: '10px' }}>
                  <input
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter quantity"
                    required
                    style={{ ...inputStyle, flex: 1 }}
                  />

                  <select 
                    name="quantityUnit" 
                    value={formData.quantityUnit} 
                    onChange={handleChange} 
                    aria-label="Quantity unit"
                    style={{ ...inputStyle, width: '100px' }}
                  >
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Ton">Ton</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>

              <div className="brand-analysis-field" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="requiredByDate" style={labelStyle}>Required By Date</label>
                <input
                  id="requiredByDate"
                  name="requiredByDate"
                  value={formData.requiredByDate}
                  onChange={handleChange}
                  type="date"
                  style={inputStyle}
                />
              </div>

              <div className="brand-analysis-field brand-analysis-full" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="productImage" style={labelStyle}>
                  Product Image / Reference <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <label
                  htmlFor="productImage"
                  className="brand-analysis-file-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <span className="brand-analysis-file-button" style={{ padding: '8px 16px', color: '#ffffff', background: '#0284c7', borderRadius: '8px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>
                    Choose File
                  </span>
                  <span className="brand-analysis-file-name" style={{ color: '#334155', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {imageFile?.name || "No file chosen"}
                  </span>
                </label>

                <input
                  id="productImage"
                  name="productImage"
                  className="brand-analysis-hidden-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  style={{ display: 'none' }}
                />

                <small style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                  Please upload a clear image or PDF document of the product or brand reference.
                </small>
              </div>

              <div className="brand-analysis-field brand-analysis-full" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="reason" style={labelStyle}>
                  Reason for Analysis <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Why do you need this brand analyzed?"
                  required
                  style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                />
              </div>

              <div className="brand-analysis-field brand-analysis-full" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="orderDetails" style={labelStyle}>Order Details (Optional)</label>
                <input
                  id="orderDetails"
                  name="orderDetails"
                  value={formData.orderDetails}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. Required for Project X"
                  style={inputStyle}
                />
              </div>

              <div className="brand-analysis-field brand-analysis-full" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="remarks" style={labelStyle}>Additional Remarks (Optional)</label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any other details..."
                  style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <div 
            className="brand-analysis-footer"
            style={{
              flexShrink: 0,
              display: 'flex',
              justify: 'flex-end',
              gap: '12px',
              padding: '16px 26px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              className="brand-analysis-btn brand-analysis-btn-secondary"
              onClick={onClose}
              style={{
                padding: '10px 22px',
                color: '#475569',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="brand-analysis-btn brand-analysis-btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
