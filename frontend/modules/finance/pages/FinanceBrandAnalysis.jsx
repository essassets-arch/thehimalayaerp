import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../services/brandAnalysisService';
import { Eye, Search, Clock, CheckCircle2, TrendingUp, FileText, ClipboardList } from 'lucide-react';
import BrandAnalysisDetailModal from '../../../components/erp/BrandAnalysisDetailModal';
import StatusBadge from '../../../shared/components/StatusBadge';
import Swal from 'sweetalert2';

export default function FinanceBrandAnalysis() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Pending'); // Pending vs History

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await brandAnalysisService.getFinanceRequests();
      // Finance only sees requests that have passed Super Admin
      const financeVisible = data.filter(req => 
        req.status === 'SUPER_ADMIN_APPROVED' || 
        req.status === 'FINANCE_ANALYSIS_IN_PROGRESS' || 
        req.status === 'FINANCE_ANALYSIS_COMPLETED' || 
        req.status === 'FINANCE_REJECTED' ||
        req.status === 'COMPLETED'
      );
      setRequests(financeVisible);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load brand analysis requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const isHistoryStatus = (status) => 
    status === 'FINANCE_ANALYSIS_COMPLETED' || 
    status === 'FINANCE_REJECTED' ||
    status === 'COMPLETED';

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'History') {
      if (!isHistoryStatus(req.status)) return false;
    } else {
      if (isHistoryStatus(req.status)) return false;
    }

    if (search) {
      const lower = search.toLowerCase();
      if (!req.productName?.toLowerCase().includes(lower) && 
          !req.brandName?.toLowerCase().includes(lower) &&
          !req.requestNo?.toLowerCase().includes(lower)) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = requests.filter(r => !isHistoryStatus(r.status)).length;
  const historyCount = requests.filter(r => isHistoryStatus(r.status)).length;

  return (
    <div className="brand-analysis-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header with Title and Trend Icon */}
      <div className="brand-analysis-header" style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Brand Analysis Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B', fontWeight: 500 }}>
            Review approved requests and provide commercial analysis
          </p>
        </div>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563EB',
          flexShrink: 0
        }}>
          <TrendingUp size={28} />
        </div>
      </div>

      {/* 2 KPI Cards Grid (Stacked on mobile) */}
      <div className="brand-analysis-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Pending Analysis Card */}
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
          padding: '18px 22px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#B45309', fontWeight: 700 }}>Pending Analysis</div>
            <div style={{ fontSize: '28px', color: '#92400E', fontWeight: 800, marginTop: '2px', lineHeight: 1.1 }}>{pendingCount}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFFBEB', border: '1.5px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock size={20} />
          </div>
        </div>

        {/* Completed Analysis Card */}
        <div style={{
          background: '#D1FAE5',
          border: '1px solid #A7F3D0',
          padding: '18px 22px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#065F46', fontWeight: 700 }}>Completed Analysis</div>
            <div style={{ fontSize: '28px', color: '#047857', fontWeight: 800, marginTop: '2px', lineHeight: 1.1 }}>{historyCount}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0FDF4', border: '1.5px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Table / Requests Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
        <div className="brand-analysis-filter-bar" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Pending', 'History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#24345C' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '700' : '600',
                  fontSize: '13.5px',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab} {tab === 'Pending' ? `(${pendingCount})` : `(${historyCount})`}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px', flex: '1 1 auto', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 38px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '13.5px', background: '#FFFFFF' }}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="brand-analysis-desktop-table" style={{ overflowX: 'auto' }}>
          <table className="m-theme-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Request No</th>
                <th style={{ padding: '12px 16px' }}>Product Name</th>
                <th style={{ padding: '12px 16px' }}>Brand</th>
                <th style={{ padding: '12px 16px' }}>Quantity</th>
                <th style={{ padding: '12px 16px' }}>Date Approved</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', margin: '0 auto 8px' }}>
                        <ClipboardList size={28} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>No requests found.</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>There are no {activeTab.toLowerCase()} analysis requests.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#1E3A8A' }}>{req.requestNo}</td>
                    <td style={{ padding: '12px 16px', color: '#2563EB', fontWeight: '700' }}>{req.productName}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.brandName}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.quantity} {req.quantityUnit}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(req.updatedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        style={{ padding: '7px 14px', border: '1px solid #CBD5E1', background: '#FFFFFF', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1E293B' }}
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List View */}
        <div className="brand-analysis-mobile-cards" style={{ display: 'none', padding: '14px', flexDirection: 'column', gap: '12px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', margin: '0 auto 12px' }}>
                <ClipboardList size={28} />
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>No requests found.</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>There are no {activeTab.toLowerCase()} analysis requests.</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{req.requestNo}</span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{req.productName}</h4>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Brand:</span>
                    <strong style={{ color: '#0F172A' }}>{req.brandName || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Quantity:</span>
                    <strong style={{ color: '#0F172A' }}>{req.quantity} {req.quantityUnit}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    {new Date(req.updatedAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    style={{ padding: '8px 16px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> Review Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedRequest && (
        <BrandAnalysisDetailModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
}

