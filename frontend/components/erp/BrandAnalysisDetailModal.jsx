import React, { useState } from 'react';
import { brandAnalysisService } from '../../services/brandAnalysisService';
import { useAuthStore } from '../../store/authStore';
import './BrandAnalysisDetailModal.css';

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusClass = (status) => {
  switch (status) {
    case "PENDING_SUPER_ADMIN_APPROVAL":
      return "status-pending";

    case "SUPER_ADMIN_APPROVED":
    case "APPROVED":
      return "status-approved";

    case "REJECTED":
    case "SUPER_ADMIN_REJECTED":
      return "status-rejected";

    case "UNDER_FINANCE_ANALYSIS":
    case "IN_PROGRESS":
    case "FINANCE_ANALYSIS_IN_PROGRESS":
      return "status-progress";

    case "COMPLETED":
    case "FINANCE_ANALYSIS_COMPLETED":
      return "status-completed";

    default:
      return "status-default";
  }
};

export default function BrandAnalysisDetailModal({ request, onClose, onRefresh }) {
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [recommendedBrand, setRecommendedBrand] = useState('');
  const [estimatedUnitCost, setEstimatedUnitCost] = useState('');
  const [estimatedTotalCost, setEstimatedTotalCost] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [recommendation, setRecommendation] = useState('RECOMMENDED');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = useAuthStore(state => state.user);
  const userRoleStr = String(currentUser?.role?.code || currentUser?.role?.name || currentUser?.role || '').toUpperCase();
  const isSuperAdmin = !userRoleStr || userRoleStr.includes('SUPER_ADMIN') || userRoleStr.includes('ADMIN') || userRoleStr.includes('PLANT');
  const isFinance = !userRoleStr || userRoleStr.includes('FINANCE') || userRoleStr.includes('SUPER_ADMIN') || userRoleStr.includes('ADMIN');

  const handleAction = async (actionFn, successMsg) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await actionFn();
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="brand-request-view-backdrop">
      <section
        className="brand-request-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-request-view-title"
      >
        <header className="brand-request-view-header">
          <div className="brand-request-view-heading">
            <h2 id="brand-request-view-title">Brand Analysis Request</h2>

            <div className="brand-request-view-meta">
              <span className="brand-request-number">
                {request.requestNo}
              </span>

              <span className="brand-request-separator">•</span>

              <span className={`brand-request-status ${getStatusClass(request.status)}`}>
                {formatStatus(request.status)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="brand-request-view-close"
            aria-label="Close request details"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="brand-request-view-body">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <section className="brand-request-section">
            <div className="brand-request-section-heading">
              <h3>Request Details</h3>
            </div>

            <div className="brand-request-details-grid">
              <div className="brand-request-detail-card">
                <span className="brand-request-detail-label">
                  Product Name
                </span>
                <strong className="brand-request-detail-value">
                  {request.productName || "—"}
                </strong>
              </div>

              <div className="brand-request-detail-card">
                <span className="brand-request-detail-label">
                  Brand Name
                </span>
                <strong className="brand-request-detail-value">
                  {request.brandName || "—"}
                </strong>
              </div>

              <div className="brand-request-detail-card">
                <span className="brand-request-detail-label">
                  Quantity
                </span>
                <strong className="brand-request-detail-value">
                  {request.quantity} {request.quantityUnit}
                </strong>
              </div>

              <div className="brand-request-detail-card">
                <span className="brand-request-detail-label">
                  Required By
                </span>
                <strong className="brand-request-detail-value">
                  {request.requiredByDate
                    ? new Date(request.requiredByDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not specified"}
                </strong>
              </div>
            </div>
          </section>

          <section className="brand-request-section">
            <div className="brand-request-section-heading">
              <h3>Reason &amp; Remarks</h3>
            </div>

            <div className="brand-request-text-grid">
              <article className="brand-request-text-card">
                <span className="brand-request-detail-label">
                  Reason for Analysis
                </span>
                <p>{request.reason || "—"}</p>
              </article>

              <article className="brand-request-text-card">
                <span className="brand-request-detail-label">
                  Additional Remarks
                </span>
                <p>{request.remarks || "—"}</p>
              </article>
            </div>
          </section>

          <section className="brand-request-section">
            <div className="brand-request-section-heading">
              <h3>Reference Image / Document</h3>
            </div>

            <div className="brand-request-reference">
              {request.imageUrl ? (() => {
                const cleanUrl = String(request.imageUrl).replace(/\\/g, '/');
                const finalUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')
                  ? cleanUrl
                  : (cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`);
                const isPdf = finalUrl.toLowerCase().endsWith('.pdf');

                return (
                  <>
                    {isPdf ? (
                      <div style={{ padding: '24px', background: '#1E293B', borderRadius: '12px', color: '#38BDF8', textAlign: 'center', width: '100%', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px' }}>📄 PDF Reference Document</div>
                        <a href={finalUrl} target="_blank" rel="noreferrer" className="brand-request-open-image" style={{ display: 'inline-block' }}>
                          Open PDF Document
                        </a>
                      </div>
                    ) : (
                      <a
                        href={finalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="brand-request-image-link"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={finalUrl}
                          alt="Brand analysis product reference"
                          className="brand-request-image"
                        />
                      </a>
                    )}
                    <div className="brand-request-image-info">
                      <div>
                        <span className="brand-request-detail-label">
                          Uploaded Reference
                        </span>
                        <p>Product or brand reference file</p>
                      </div>

                      <a
                        href={finalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="brand-request-open-image"
                      >
                        {isPdf ? 'View PDF File' : 'View Full Image'}
                      </a>
                    </div>
                  </>
                );
              })() : (
                <div className="brand-request-image-empty">
                  <span>No reference image available</span>
                </div>
              )}
            </div>
          </section>

          {request.status === 'SUPER_ADMIN_REJECTED' && (
            <section className="brand-request-section">
              <div className="brand-request-section-heading">
                <h3 className="text-red-400">Rejection Reason</h3>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-200 text-sm">{request.rejectionReason}</p>
              </div>
            </section>
          )}

          {request.status === 'FINANCE_ANALYSIS_COMPLETED' && (
            <section className="brand-request-section">
              <div className="brand-request-section-heading">
                <h3 className="text-emerald-700 font-bold">Analysis Results</h3>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-500 mb-1">Recommended Brand</p>
                    <p className="text-slate-900 font-bold">{request.recommendedBrand}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Recommendation</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      request.recommendation === 'RECOMMENDED' ? 'bg-emerald-100 text-emerald-800' :
                      request.recommendation === 'NOT_RECOMMENDED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {request.recommendation?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Unit Cost</p>
                    <p className="text-slate-900 font-bold">₹{Number(request.estimatedUnitCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Total Cost</p>
                    <p className="text-slate-900 font-bold">₹{Number(request.estimatedTotalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-slate-500 text-xs mb-1">Analysis Details</p>
                  <p className="text-slate-800 text-sm font-medium">{request.analysisResult}</p>
                </div>
              </div>
            </section>
          )}

          {/* Super Admin Actions */}
          {(request.status === 'PENDING_SUPER_ADMIN_APPROVAL' || request.status === 'PENDING') && (
            <section className="brand-request-section brand-request-decision-section">
              <div className="brand-request-section-heading">
                <h3>Super Admin Decision & Review</h3>
              </div>
              
              <div className="brand-request-decision-grid">
                <div className="brand-request-decision-card brand-request-decision-approve">
                  <div className="brand-request-decision-header">
                    <span className="brand-request-decision-title approve">Approval Option</span>
                    <span className="brand-request-decision-badge approve">Proceed to Finance</span>
                  </div>
                  <div>
                    <label className="brand-request-label">Approval Remarks (Optional)</label>
                    <textarea 
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      className="brand-request-textarea"
                      placeholder="Add any notes or special instructions for Finance or Store..."
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleAction(() => brandAnalysisService.approveRequest(request.id, request.version, remarks), 'Approved successfully')}
                    className="brand-request-btn-approve"
                  >
                    {isSubmitting ? 'Processing Approval...' : '✓ Approve Request'}
                  </button>
                </div>
                
                <div className="brand-request-decision-card brand-request-decision-reject">
                  <div className="brand-request-decision-header">
                    <span className="brand-request-decision-title reject">Rejection Option</span>
                    <span className="brand-request-decision-badge reject">Action Required</span>
                  </div>
                  <div>
                    <label className="brand-request-label">Rejection Reason <span className="text-red-600">*</span></label>
                    <textarea 
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="brand-request-textarea brand-request-textarea-danger"
                      placeholder="Provide mandatory reason why this brand request is being rejected..."
                    />
                  </div>
                  <button 
                    disabled={isSubmitting || !rejectionReason.trim()}
                    onClick={() => handleAction(() => brandAnalysisService.rejectRequest(request.id, request.version, rejectionReason), 'Rejected successfully')}
                    className="brand-request-btn-reject"
                  >
                    {isSubmitting ? 'Processing Rejection...' : '✕ Reject Request'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Finance Actions - Start Analysis */}
          {isFinance && request.status === 'SUPER_ADMIN_APPROVED' && (
            <section className="brand-request-section">
              <div className="brand-request-section-heading">
                <h3>Finance Analysis</h3>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-slate-600 text-sm">Click the button to mark this request as currently under analysis.</p>
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleAction(() => brandAnalysisService.startAnalysis(request.id, request.version, remarks), 'Analysis started')}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-sm"
                >
                  Start Analysis
                </button>
              </div>
            </section>
          )}

          {/* Finance Actions - Complete Analysis */}
          {isFinance && request.status === 'FINANCE_ANALYSIS_IN_PROGRESS' && (
            <section className="brand-request-section">
              <div className="brand-request-section-heading">
                <h3>Complete Brand Analysis</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="brand-request-label">Detailed Analysis Result <span className="text-emerald-600">*</span></label>
                  <textarea 
                    value={analysisResult}
                    onChange={e => setAnalysisResult(e.target.value)}
                    className="brand-request-textarea"
                    placeholder="Provide full details of the cost-benefit analysis..."
                  />
                </div>
                
                <div>
                  <label className="brand-request-label">Recommended Brand <span className="text-emerald-600">*</span></label>
                  <input 
                    type="text"
                    value={recommendedBrand}
                    onChange={e => setRecommendedBrand(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg p-3 text-slate-900"
                    placeholder="e.g. Brand X"
                  />
                </div>

                <div>
                  <label className="brand-request-label">Supplier Name</label>
                  <input 
                    type="text"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg p-3 text-slate-900"
                  />
                </div>

                <div>
                  <label className="brand-request-label">Estimated Unit Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">₹</span>
                    <input 
                      type="number"
                      value={estimatedUnitCost}
                      onChange={e => setEstimatedUnitCost(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg p-3 pl-8 text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="brand-request-label">Estimated Total Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">₹</span>
                    <input 
                      type="number"
                      value={estimatedTotalCost}
                      onChange={e => setEstimatedTotalCost(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg p-3 pl-8 text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="brand-request-label">Final Recommendation <span className="text-emerald-600">*</span></label>
                  <select 
                    value={recommendation}
                    onChange={e => setRecommendation(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg p-3 text-slate-900"
                  >
                    <option value="RECOMMENDED">Recommended</option>
                    <option value="NOT_RECOMMENDED">Not Recommended</option>
                    <option value="FURTHER_REVIEW_REQUIRED">Further Review Required</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button 
                  disabled={isSubmitting || !analysisResult || !recommendedBrand}
                  onClick={() => handleAction(() => brandAnalysisService.completeAnalysis(request.id, request.version, {
                    analysisResult,
                    recommendedBrand,
                    supplierName,
                    estimatedUnitCost: Number(estimatedUnitCost) || 0,
                    estimatedTotalCost: Number(estimatedTotalCost) || 0,
                    recommendation
                  }), 'Analysis completed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  Submit Analysis Report
                </button>
              </div>
            </section>
          )}

        </div>

        <footer className="brand-request-view-footer">
          <button
            type="button"
            className="brand-request-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
