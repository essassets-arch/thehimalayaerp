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

const getStatusStyle = (status) => {
  switch (status) {
    case "PENDING_SUPER_ADMIN_APPROVAL":
    case "PENDING":
      return { color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a' };

    case "SUPER_ADMIN_APPROVED":
    case "APPROVED":
    case "COMPLETED":
    case "FINANCE_ANALYSIS_COMPLETED":
      return { color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0' };

    case "REJECTED":
    case "SUPER_ADMIN_REJECTED":
      return { color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca' };

    case "UNDER_FINANCE_ANALYSIS":
    case "IN_PROGRESS":
    case "FINANCE_ANALYSIS_IN_PROGRESS":
      return { color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe' };

    default:
      return { color: '#334155', background: '#f1f5f9', border: '1px solid #cbd5e1' };
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

  const cardStyle = {
    padding: '16px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  };

  const valueStyle = {
    display: 'block',
    color: '#0f172a',
    fontSize: '15px',
    fontWeight: 700,
    lineHeight: 1.45,
    wordBreak: 'break-word'
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

  return (
    <div 
      className="brand-request-view-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justify-content: 'center',
        padding: '20px',
        overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <section
        className="brand-request-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-request-view-title"
        style={{
          width: 'min(860px, 100%)',
          maxHeight: 'calc(100vh - 40px)',
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
        <header 
          className="brand-request-view-header"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justify-content: 'space-between',
            gap: '20px',
            padding: '22px 26px 18px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div className="brand-request-view-heading">
            <h2 id="brand-request-view-title" style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
              Brand Analysis Request
            </h2>

            <div className="brand-request-view-meta" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span className="brand-request-number" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                {request.requestNo}
              </span>

              <span className="brand-request-separator" style={{ color: '#94a3b8' }}>•</span>

              <span 
                className="brand-request-status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  ...getStatusStyle(request.status)
                }}
              >
                {formatStatus(request.status)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="brand-request-view-close"
            aria-label="Close request details"
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              color: '#64748b',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </header>

        <div className="brand-request-view-body" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#ffffff' }}>
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Section: Request Details */}
          <section className="brand-request-section" style={{ marginBottom: '24px' }}>
            <div className="brand-request-section-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderLeft: '4px solid #0284c7', paddingLeft: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>Request Details</h3>
            </div>

            <div className="brand-request-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="brand-request-detail-card" style={cardStyle}>
                <span className="brand-request-detail-label" style={labelStyle}>Product Name</span>
                <strong className="brand-request-detail-value" style={valueStyle}>{request.productName || "—"}</strong>
              </div>

              <div className="brand-request-detail-card" style={cardStyle}>
                <span className="brand-request-detail-label" style={labelStyle}>Brand Name</span>
                <strong className="brand-request-detail-value" style={valueStyle}>{request.brandName || "—"}</strong>
              </div>

              <div className="brand-request-detail-card" style={cardStyle}>
                <span className="brand-request-detail-label" style={labelStyle}>Quantity</span>
                <strong className="brand-request-detail-value" style={valueStyle}>{request.quantity} {request.quantityUnit}</strong>
              </div>

              <div className="brand-request-detail-card" style={cardStyle}>
                <span className="brand-request-detail-label" style={labelStyle}>Required By</span>
                <strong className="brand-request-detail-value" style={valueStyle}>
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

          {/* Section: Reason & Remarks */}
          <section className="brand-request-section" style={{ marginBottom: '24px' }}>
            <div className="brand-request-section-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderLeft: '4px solid #0284c7', paddingLeft: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>Reason &amp; Remarks</h3>
            </div>

            <div className="brand-request-text-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <article className="brand-request-text-card" style={cardStyle}>
                <span className="brand-request-detail-label" style={labelStyle}>Reason for Analysis</span>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{request.reason || "—"}</p>
              </article>

              <article className="brand-request-text-card" style={cardStyle}>
                <span className="brand-request-detail-label" style={labelStyle}>Additional Remarks</span>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{request.remarks || "—"}</p>
              </article>
            </div>
          </section>

          {/* Section: Reference Image / Document */}
          <section className="brand-request-section" style={{ marginBottom: '24px' }}>
            <div className="brand-request-section-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderLeft: '4px solid #0284c7', paddingLeft: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>Reference Image / Document</h3>
            </div>

            <div className="brand-request-reference" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
              {request.imageUrl ? (() => {
                const cleanUrl = String(request.imageUrl).replace(/\\/g, '/');
                let finalUrl = cleanUrl;
                if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:')) {
                  const pathWithoutSlash = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
                  finalUrl = pathWithoutSlash.startsWith('/uploads') ? `/api/backend${pathWithoutSlash}` : pathWithoutSlash;
                }
                const isPdf = finalUrl.toLowerCase().endsWith('.pdf');

                return (
                  <>
                    {isPdf ? (
                      <div style={{ padding: '24px', background: '#f1f5f9', borderRadius: '12px', color: '#0284c7', textAlign: 'center', width: '100%', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>📄 PDF Reference Document</div>
                        <a href={finalUrl} target="_blank" rel="noreferrer" className="brand-request-open-image" style={{ display: 'inline-block', padding: '10px 20px', background: '#0284c7', color: '#ffffff', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
                          Open PDF Document
                        </a>
                      </div>
                    ) : (
                      <a
                        href={finalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="brand-request-image-link"
                        style={{ display: 'block', width: '100%', padding: '16px', background: '#f1f5f9', textAlign: 'center' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={finalUrl}
                          alt="Brand analysis product reference"
                          className="brand-request-image"
                          style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'inline-block' }}
                          onError={(e) => {
                            // Fallback to non-proxied static URL if proxied route fails
                            if (finalUrl.startsWith('/api/backend')) {
                              e.currentTarget.src = finalUrl.replace('/api/backend', '');
                            }
                          }}
                        />
                      </a>
                    )}
                    <div className="brand-request-image-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 18px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
                      <div>
                        <span className="brand-request-detail-label" style={labelStyle}>Uploaded Reference</span>
                        <p style={{ margin: 0, color: '#475569', fontSize: '13px', fontWeight: 600 }}>Product or brand reference file</p>
                      </div>

                      <a
                        href={finalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="brand-request-open-image"
                        style={{ padding: '8px 18px', color: '#ffffff', background: '#0284c7', borderRadius: '8px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}
                      >
                        {isPdf ? 'View PDF File' : 'View Full Image'}
                      </a>
                    </div>
                  </>
                );
              })() : (
                <div className="brand-request-image-empty" style={{ minHeight: '160px', display: 'grid', placeItems: 'center', padding: '24px', color: '#64748b', background: '#f8fafc', fontWeight: 600 }}>
                  <span>No reference image available</span>
                </div>
              )}
            </div>
          </section>

          {request.status === 'SUPER_ADMIN_REJECTED' && (
            <section className="brand-request-section" style={{ marginBottom: '24px' }}>
              <div className="brand-request-section-heading" style={{ borderLeft: '4px solid #dc2626', paddingLeft: '10px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.05rem', fontWeight: 800 }}>Rejection Reason</h3>
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
                <p style={{ margin: 0, color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>{request.rejectionReason}</p>
              </div>
            </section>
          )}

          {request.status === 'FINANCE_ANALYSIS_COMPLETED' && (
            <section className="brand-request-section" style={{ marginBottom: '24px' }}>
              <div className="brand-request-section-heading" style={{ borderLeft: '4px solid #16a34a', paddingLeft: '10px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#166534', fontSize: '1.05rem', fontWeight: 800 }}>Analysis Results</h3>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <p style={labelStyle}>Recommended Brand</p>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>{request.recommendedBrand}</p>
                  </div>
                  <div>
                    <p style={labelStyle}>Recommendation</p>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: request.recommendation === 'RECOMMENDED' ? '#dcfce7' : '#fee2e2', color: request.recommendation === 'RECOMMENDED' ? '#166534' : '#991b1b', border: '1px solid #bbf7d0' }}>
                      {request.recommendation?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p style={labelStyle}>Unit Cost</p>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>₹{Number(request.estimatedUnitCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={labelStyle}>Total Cost</p>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>₹{Number(request.estimatedTotalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div style={{ paddingTop: '14px', borderTop: '1px solid #bbf7d0' }}>
                  <p style={labelStyle}>Analysis Details</p>
                  <p style={{ margin: 0, color: '#166534', fontSize: '14px', fontWeight: 600 }}>{request.analysisResult}</p>
                </div>
              </div>
            </section>
          )}

          {/* Super Admin Actions */}
          {(request.status === 'PENDING_SUPER_ADMIN_APPROVAL' || request.status === 'PENDING') && (
            <section className="brand-request-section brand-request-decision-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div className="brand-request-section-heading" style={{ borderLeft: '4px solid #0284c7', paddingLeft: '10px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>Super Admin Decision & Review</h3>
              </div>
              
              <div className="brand-request-decision-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="brand-request-decision-card brand-request-decision-approve" style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="brand-request-decision-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="brand-request-decision-title approve" style={{ color: '#166534', fontWeight: 800, fontSize: '15px' }}>Approval Option</span>
                    <span className="brand-request-decision-badge approve" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Proceed to Finance</span>
                  </div>
                  <div>
                    <label className="brand-request-label" style={labelStyle}>Approval Remarks (Optional)</label>
                    <textarea 
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      className="brand-request-textarea"
                      placeholder="Add any notes or special instructions for Finance or Store..."
                      style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleAction(() => brandAnalysisService.approveRequest(request.id, request.version, remarks), 'Approved successfully')}
                    className="brand-request-btn-approve"
                    style={{ width: '100%', minHeight: '44px', padding: '10px 18px', color: '#ffffff', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}
                  >
                    {isSubmitting ? 'Processing Approval...' : '✓ Approve Request'}
                  </button>
                </div>
                
                <div className="brand-request-decision-card brand-request-decision-reject" style={{ background: '#ffffff', border: '1.5px solid #fecaca', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="brand-request-decision-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="brand-request-decision-title reject" style={{ color: '#991b1b', fontWeight: 800, fontSize: '15px' }}>Rejection Option</span>
                    <span className="brand-request-decision-badge reject" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Action Required</span>
                  </div>
                  <div>
                    <label className="brand-request-label" style={labelStyle}>Rejection Reason <span style={{ color: '#dc2626' }}>*</span></label>
                    <textarea 
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="brand-request-textarea brand-request-textarea-danger"
                      placeholder="Provide mandatory reason why this brand request is being rejected..."
                      style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', borderColor: '#fca5a5' }}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting || !rejectionReason.trim()}
                    onClick={() => handleAction(() => brandAnalysisService.rejectRequest(request.id, request.version, rejectionReason), 'Rejected successfully')}
                    className="brand-request-btn-reject"
                    style={{ width: '100%', minHeight: '44px', padding: '10px 18px', color: '#ffffff', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: (isSubmitting || !rejectionReason.trim()) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !rejectionReason.trim()) ? 0.5 : 1, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}
                  >
                    {isSubmitting ? 'Processing Rejection...' : '✕ Reject Request'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Finance Actions - Start Analysis */}
          {isFinance && request.status === 'SUPER_ADMIN_APPROVED' && (
            <section className="brand-request-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div className="brand-request-section-heading" style={{ borderLeft: '4px solid #0284c7', paddingLeft: '10px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>Finance Analysis</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: 600 }}>Click the button to mark this request as currently under analysis.</p>
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleAction(() => brandAnalysisService.startAnalysis(request.id, request.version, remarks), 'Analysis started')}
                  style={{ padding: '10px 24px', color: '#ffffff', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
                >
                  Start Analysis
                </button>
              </div>
            </section>
          )}

          {/* Finance Actions - Complete Analysis */}
          {isFinance && request.status === 'FINANCE_ANALYSIS_IN_PROGRESS' && (
            <section className="brand-request-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div className="brand-request-section-heading" style={{ borderLeft: '4px solid #16a34a', paddingLeft: '10px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>Complete Brand Analysis</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="brand-request-label" style={labelStyle}>Detailed Analysis Result <span style={{ color: '#16a34a' }}>*</span></label>
                  <textarea 
                    value={analysisResult}
                    onChange={e => setAnalysisResult(e.target.value)}
                    className="brand-request-textarea"
                    placeholder="Provide full details of the cost-benefit analysis..."
                    style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }}
                  />
                </div>
                
                <div>
                  <label className="brand-request-label" style={labelStyle}>Recommended Brand <span style={{ color: '#16a34a' }}>*</span></label>
                  <input 
                    type="text"
                    value={recommendedBrand}
                    onChange={e => setRecommendedBrand(e.target.value)}
                    style={inputStyle}
                    placeholder="e.g. Brand X"
                  />
                </div>

                <div>
                  <label className="brand-request-label" style={labelStyle}>Supplier Name</label>
                  <input 
                    type="text"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="brand-request-label" style={labelStyle}>Estimated Unit Cost</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                    <input 
                      type="number"
                      value={estimatedUnitCost}
                      onChange={e => setEstimatedUnitCost(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '32px' }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="brand-request-label" style={labelStyle}>Estimated Total Cost</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                    <input 
                      type="number"
                      value={estimatedTotalCost}
                      onChange={e => setEstimatedTotalCost(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '32px' }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="brand-request-label" style={labelStyle}>Final Recommendation <span style={{ color: '#16a34a' }}>*</span></label>
                  <select 
                    value={recommendation}
                    onChange={e => setRecommendation(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="RECOMMENDED">Recommended</option>
                    <option value="NOT_RECOMMENDED">Not Recommended</option>
                    <option value="FURTHER_REVIEW_REQUIRED">Further Review Required</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
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
                  style={{ padding: '11px 28px', color: '#ffffff', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: (isSubmitting || !analysisResult || !recommendedBrand) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !analysisResult || !recommendedBrand) ? 0.5 : 1, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                >
                  Submit Analysis Report
                </button>
              </div>
            </section>
          )}
        </div>

        <footer 
          className="brand-request-view-footer"
          style={{
            flexShrink: 0,
            display: 'flex',
            justify: 'flex-end',
            padding: '16px 26px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            className="brand-request-close-button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              color: '#475569',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
