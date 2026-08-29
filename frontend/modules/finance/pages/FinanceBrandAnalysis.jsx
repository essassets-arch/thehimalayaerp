import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../services/brandAnalysisService';
import { Eye, Search, Clock, CheckCircle2, TrendingUp, ClipboardList, RefreshCw } from 'lucide-react';
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
      const list = Array.isArray(data) ? data : [];
      // Finance only sees requests that have passed Super Admin
      const financeVisible = list.filter(req => 
        req.status === 'SUPER_ADMIN_APPROVED' || 
        req.status === 'FINANCE_ANALYSIS_IN_PROGRESS' || 
        req.status === 'FINANCE_ANALYSIS_COMPLETED' || 
        req.status === 'FINANCE_REJECTED' ||
        req.status === 'COMPLETED'
      );
      setRequests(financeVisible);
    } catch (err) {
      console.warn('Failed to load brand analysis requests:', err);
      setRequests([]);
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
    <div className="brand-analysis-container">
      <style>{`
        .brand-analysis-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .brand-analysis-header {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: clamp(16px, 2.5vw, 24px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          gap: 14px;
          flex-wrap: wrap;
        }

        .brand-analysis-kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          width: 100%;
        }

        @media (max-width: 500px) {
          .brand-analysis-kpi-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }

        .brand-analysis-kpi-card {
          padding: 16px 18px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .brand-analysis-filter-bar {
          padding: 14px 16px;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          background: #F8FAFC;
        }

        @media (max-width: 640px) {
          .brand-analysis-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .brand-analysis-desktop-table {
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .brand-analysis-mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .brand-analysis-desktop-table {
            display: none !important;
          }
          .brand-analysis-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 10px;
            padding: 12px;
          }
        }

        .brand-req-mobile-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .brand-req-mobile-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }
      `}</style>

      {/* Header with Title and Trend Icon */}
      <div className="brand-analysis-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: '#002E5D', letterSpacing: '-0.02em' }}>
            Brand Analysis Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
            Review approved requests and provide commercial analysis
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchRequests}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#002E5D',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7',
            flexShrink: 0
          }}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* 2 KPI Cards Grid (Stacked on mobile) */}
      <div className="brand-analysis-kpi-grid">
        {/* Pending Analysis Card */}
        <div className="brand-analysis-kpi-card" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Pending Analysis</div>
            <div style={{ fontSize: '26px', color: '#92400E', fontWeight: 900, marginTop: '2px', lineHeight: 1.1 }}>{pendingCount}</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FFFBEB', border: '1.5px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock size={18} />
          </div>
        </div>

        {/* Completed Analysis Card */}
        <div className="brand-analysis-kpi-card" style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#065F46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Completed Analysis</div>
            <div style={{ fontSize: '26px', color: '#047857', fontWeight: 900, marginTop: '2px', lineHeight: 1.1 }}>{historyCount}</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F0FDF4', border: '1.5px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Main Table / Requests Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
        <div className="brand-analysis-filter-bar">
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {['Pending', 'History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#002E5D' : '#F1F5F9',
                  color: activeTab === tab ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '700' : '600',
                  fontSize: '12.5px',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab} {tab === 'Pending' ? `(${pendingCount})` : `(${historyCount})`}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '300px', minWidth: '180px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', boxBox: 'border-box', padding: '8px 12px 8px 36px', border: '1.5px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="brand-analysis-desktop-table">
          <table className="m-theme-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#002E5D', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#FFFFFF', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px', fontSize: '11.5px' }}>Request No</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px' }}>Product Name</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px' }}>Brand</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px' }}>Quantity</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px' }}>Date Approved</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', margin: '0 auto 8px' }}>
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
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#002E5D' }}>{req.requestNo}</td>
                    <td style={{ padding: '12px 16px', color: '#0284C7', fontWeight: '700' }}>{req.productName}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.brandName}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.quantity} {req.quantityUnit}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(req.updatedAt || req.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        style={{ padding: '7px 14px', border: '1px solid #CBD5E1', background: '#FFFFFF', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#002E5D' }}
                      >
                        <Eye size={14} color="#0284C7" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List View */}
        <div className="brand-analysis-mobile-cards">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', margin: '0 auto 12px' }}>
                <ClipboardList size={28} />
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>No requests found.</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>There are no {activeTab.toLowerCase()} analysis requests.</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="brand-req-mobile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#002E5D', fontWeight: 800, textTransform: 'uppercase', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                      {req.requestNo}
                    </span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>{req.productName}</h4>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Brand:</span>
                    <strong style={{ color: '#0F172A' }}>{req.brandName || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Quantity:</span>
                    <strong style={{ color: '#0F172A' }}>{req.quantity} {req.quantityUnit}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    📅 {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    style={{ padding: '7px 14px', background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Eye size={13} /> Review Request
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

