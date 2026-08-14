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
    boxSizing: 'border-box'
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
    <div className="brand-analysis-backdrop">
      <div
        className="brand-analysis-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-analysis-title"
      >
        <div className="brand-analysis-header">
          <div>
            <h2 id="brand-analysis-title">Create Brand Analysis Request</h2>
            <p>Submit a new request for finance review</p>
          </div>

          <button
            type="button"
            className="brand-analysis-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="brand-analysis-form" onSubmit={handleSubmit}>
          <div className="brand-analysis-body">
            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <div className="brand-analysis-grid">
              <div className="brand-analysis-field">
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

              <div className="brand-analysis-field">
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

              <div className="brand-analysis-field">
                <label htmlFor="quantity" style={labelStyle}>
                  Quantity <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <div className="brand-analysis-quantity">
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

              <div className="brand-analysis-field">
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

              <div className="brand-analysis-field brand-analysis-full">
                <label htmlFor="productImage" style={labelStyle}>
                  Product Image / Reference <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <label
                  htmlFor="productImage"
                  className="brand-analysis-file-upload"
                >
                  <span className="brand-analysis-file-button">Choose File</span>
                  <span className="brand-analysis-file-name">
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
                />

                <small style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                  Please upload a clear image or PDF document of the product or brand reference.
                </small>
              </div>

              <div className="brand-analysis-field brand-analysis-full">
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

              <div className="brand-analysis-field brand-analysis-full">
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

              <div className="brand-analysis-field brand-analysis-full">
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

          <div className="brand-analysis-footer">
            <button
              type="button"
              className="brand-analysis-btn brand-analysis-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="brand-analysis-btn brand-analysis-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
