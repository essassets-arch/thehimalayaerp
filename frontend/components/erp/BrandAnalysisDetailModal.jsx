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
                <h3 className="text-emerald-400">Analysis Results</h3>
              </div>
              <div className="bg-[#162136] rounded-lg p-4 border border-[#2d3c53]">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-500 mb-1">Recommended Brand</p>
                    <p className="text-white font-medium">{request.recommendedBrand}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Recommendation</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.recommendation === 'RECOMMENDED' ? 'bg-emerald-500/10 text-emerald-400' :
                      request.recommendation === 'NOT_RECOMMENDED' ? 'bg-red-500/10 text-red-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {request.recommendation?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Unit Cost</p>
                    <p className="text-white font-medium">₹{Number(request.estimatedUnitCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Total Cost</p>
                    <p className="text-white font-medium">₹{Number(request.estimatedTotalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#2d3c53]">
                  <p className="text-slate-500 text-xs mb-1">Analysis Details</p>
                  <p className="text-white text-sm">{request.analysisResult}</p>
                </div>
              </div>
            </section>
          )}

          {/* Super Admin Actions */}
          {(request.status === 'PENDING_SUPER_ADMIN_APPROVAL' || request.status === 'PENDING') && (
            <section className="brand-request-section">
              <div className="brand-request-section-heading">
                <h3>Super Admin Decision & Review</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Approval Remarks (Optional)</label>
                    <textarea 
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      className="w-full bg-[#162136] border border-[#2d3c53] rounded-lg p-3 text-white h-24 focus:outline-none focus:border-blue-500"
                      placeholder="Add any notes for Finance or Store..."
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleAction(() => brandAnalysisService.approveRequest(request.id, request.version, remarks), 'Approved successfully')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Approving...' : '✓ Approve Request'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea 
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="w-full bg-[#162136] border border-red-900/50 focus:border-red-500 rounded-lg p-3 text-white h-24 focus:outline-none"
                      placeholder="Why is this being rejected?"
                    />
                  </div>
                  <button 
                    disabled={isSubmitting || !rejectionReason.trim()}
                    onClick={() => handleAction(() => brandAnalysisService.rejectRequest(request.id, request.version, rejectionReason), 'Rejected successfully')}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Rejecting...' : '✕ Reject Request'}
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
                <p className="text-slate-400 text-sm">Click the button to mark this request as currently under analysis.</p>
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleAction(() => brandAnalysisService.startAnalysis(request.id, request.version, remarks), 'Analysis started')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Detailed Analysis Result <span className="text-emerald-500">*</span></label>
                  <textarea 
                    value={analysisResult}
                    onChange={e => setAnalysisResult(e.target.value)}
                    className="w-full bg-[#162136] border border-[#2d3c53] focus:border-blue-500 focus:outline-none rounded-lg p-3 text-white h-32"
                    placeholder="Provide full details of the cost-benefit analysis..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Recommended Brand <span className="text-emerald-500">*</span></label>
                  <input 
                    type="text"
                    value={recommendedBrand}
                    onChange={e => setRecommendedBrand(e.target.value)}
                    className="w-full bg-[#162136] border border-[#2d3c53] focus:border-blue-500 focus:outline-none rounded-lg p-3 text-white"
                    placeholder="e.g. Brand X"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Supplier Name</label>
                  <input 
                    type="text"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full bg-[#162136] border border-[#2d3c53] focus:border-blue-500 focus:outline-none rounded-lg p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Estimated Unit Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-500">₹</span>
                    <input 
                      type="number"
                      value={estimatedUnitCost}
                      onChange={e => setEstimatedUnitCost(e.target.value)}
                      className="w-full bg-[#162136] border border-[#2d3c53] focus:border-blue-500 focus:outline-none rounded-lg p-3 pl-8 text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Estimated Total Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-500">₹</span>
                    <input 
                      type="number"
                      value={estimatedTotalCost}
                      onChange={e => setEstimatedTotalCost(e.target.value)}
                      className="w-full bg-[#162136] border border-[#2d3c53] focus:border-blue-500 focus:outline-none rounded-lg p-3 pl-8 text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Final Recommendation <span className="text-emerald-500">*</span></label>
                  <select 
                    value={recommendation}
                    onChange={e => setRecommendation(e.target.value)}
                    className="w-full bg-[#162136] border border-[#2d3c53] focus:border-blue-500 focus:outline-none rounded-lg p-3 text-white"
                  >
                    <option value="RECOMMENDED">Recommended</option>
                    <option value="NOT_RECOMMENDED">Not Recommended</option>
                    <option value="FURTHER_REVIEW_REQUIRED">Further Review Required</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#2d3c53]">
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
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
