import React, { useState } from 'react';
import { brandAnalysisService } from '../../services/brandAnalysisService';

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
      const imageUrl = uploadRes.url || uploadRes.fileUrl; // Fallback just in case

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
              <div style={{ marginBottom: 20, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 8, color: '#f87171', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <div className="brand-analysis-grid">
              <div className="brand-analysis-field">
                <label htmlFor="productName">
                  Product Name <span>*</span>
                </label>
                <input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. Premium Cement"
                  required
                />
              </div>

              <div className="brand-analysis-field">
                <label htmlFor="brandName">
                  Brand Name <span>*</span>
                </label>
                <input
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. UltraTech"
                  required
                />
              </div>

              <div className="brand-analysis-field">
                <label htmlFor="quantity">
                  Quantity <span>*</span>
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
                  />

                  <select name="quantityUnit" value={formData.quantityUnit} onChange={handleChange} aria-label="Quantity unit">
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Ton">Ton</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>

              <div className="brand-analysis-field">
                <label htmlFor="requiredByDate">Required By Date</label>
                <input
                  id="requiredByDate"
                  name="requiredByDate"
                  value={formData.requiredByDate}
                  onChange={handleChange}
                  type="date"
                />
              </div>

              <div className="brand-analysis-field brand-analysis-full">
                <label htmlFor="productImage">
                  Product Image / Reference <span>*</span>
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
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />

                <small>
                  Please upload a clear image of the product or brand reference.
                </small>
              </div>

              <div className="brand-analysis-field brand-analysis-full">
                <label htmlFor="reason">
                  Reason for Analysis <span>*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Why do you need this brand analyzed?"
                  required
                />
              </div>

              <div className="brand-analysis-field brand-analysis-full">
                <label htmlFor="orderDetails">Order Details (Optional)</label>
                <input
                  id="orderDetails"
                  name="orderDetails"
                  value={formData.orderDetails}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. Required for Project X"
                />
              </div>

              <div className="brand-analysis-field brand-analysis-full">
                <label htmlFor="remarks">Additional Remarks (Optional)</label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any other details..."
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
