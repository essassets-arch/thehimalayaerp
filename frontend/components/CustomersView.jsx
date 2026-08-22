'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Phone, Mail, FileText, ClipboardList, ChevronLeft, ChevronRight, Users, X } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function CustomersView({ 
  customers = [],
  orders = [],
  searchQuery,
  setSearchQuery,
  flat = false
}) {
  const isCompact = useMediaQuery('(max-width: 1024px)');
  const [localSearch, setLocalSearch] = useState('');
  const search = searchQuery !== undefined ? searchQuery : localSearch;
  const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
  const [selectedCust, setSelectedCust] = useState(null);
  const [filter, setFilter] = useState('All');

  // Enrich customers with live metrics from orders
  const enrichedCustomers = (customers || []).map(c => {
    const custName = c.companyName || c.name || c.company_name || c.customerName || c.customer_name || c.contactPerson || c.contact_person || c.leadName || 'Customer';
    
    const custOrders = (orders || []).filter(o => 
      String(o.customerId) === String(c.id) || 
      (o.customer?.id && String(o.customer.id) === String(c.id)) ||
      (o.customerName && custName !== 'Unknown Customer' && o.customerName.toLowerCase() === custName.toLowerCase())
    );

    const totalOrders = custOrders.length;
    const totalRevenue = custOrders.reduce((sum, o) => {
      return sum + Number(o.grand_total || o.total_amount || o.totalAmount || o.totalValue || o.payment?.totalAmount || 0);
    }, 0);
    const outstanding = custOrders.reduce((sum, o) => {
      const pending = o.pendingAmount !== undefined ? o.pendingAmount : (o.payment?.pendingAmount || 0);
      return sum + Number(pending || 0);
    }, 0);

    const ordersHistory = custOrders.map(o => ({
      product: o.products || o.productsSummary || `Order ${o.orderNo || ''}`,
      val: Number(o.grand_total || o.total_amount || o.totalAmount || o.totalValue || o.payment?.totalAmount || 0)
    }));

    const communicationLogs = c.communicationLogs || c.followups || c.logs || [];

    return {
      ...c,
      displayName: custName,
      displayPhone: c.phone || c.mobile || c.contactNumber || 'N/A',
      displayEmail: c.email || c.emailAddress || 'N/A',
      totalOrders,
      totalRevenue,
      outstanding,
      ordersHistory,
      communicationLogs
    };
  });

  const formatINR = (value) => {
    const num = Number(value || 0);
    if (isNaN(num)) return '₹0';
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredCust = enrichedCustomers.filter(c => {
    const matchesSearch = (c.displayName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (c.displayEmail || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.displayPhone || '').toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = false;
    if (filter === 'All') {
      matchesFilter = true;
    } else if (filter === 'Active Orders') {
      matchesFilter = c.totalOrders > 0;
    } else if (filter === 'Outstanding') {
      matchesFilter = c.outstanding > 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  const ITEMS_PER_PAGE = 25;
  const totalPages = Math.ceil(filteredCust.length / ITEMS_PER_PAGE) || 1;
  const displayedCust = flat ? filteredCust : filteredCust.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="app-card customers-view-container" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
          <Users size={22} />
        </div>
        <div>
          <h2 className="module-title" style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
            Customer Portfolio Directory
          </h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {/* Status filters pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All' },
            { id: 'Active Orders', label: 'Active Orders' },
            { id: 'Outstanding', label: 'Outstanding Balance' }
          ].map(st => (
            <button 
              key={st.id}
              onClick={() => setFilter(st.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                border: filter === st.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: filter === st.id ? '#2563eb' : '#ffffff',
                color: filter === st.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                boxShadow: filter === st.id ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '13.5px',
              outline: 'none',
              background: '#ffffff',
              boxSizing: 'border-box',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Cards list on Mobile / Compact vs Table on Desktop */}
      {isCompact ? (
        <div className="customer-mobile-cards-list">
          {displayedCust.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <Users size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>No customer records found</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Try adjusting your search query or filter selection.</div>
            </div>
          ) : (
            displayedCust.map((c, index) => (
              <div key={c.id || index} className="customer-mobile-card">
                {/* Header info */}
                <div className="customer-card-header">
                  <div className="customer-card-title">{c.displayName}</div>
                  {c.contactPerson && (
                    <div className="customer-card-contact">{c.contactPerson}</div>
                  )}
                  <div className="customer-card-details">
                    <div className="customer-card-detail-item">
                      <Phone size={13} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span>{c.displayPhone}</span>
                    </div>
                    <div className="customer-card-detail-item">
                      <Mail size={13} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span>{c.displayEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="customer-card-divider" />

                {/* Metrics 3-column row */}
                <div className="customer-card-metrics">
                  <div className="customer-metric-item">
                    <span className="customer-metric-label">TOTAL ORDERS</span>
                    <span className="customer-metric-val">{c.totalOrders} orders</span>
                  </div>
                  <div className="customer-metric-item">
                    <span className="customer-metric-label">CUMULATIVE REVENUE</span>
                    <span className="customer-metric-val" style={{ color: '#16a34a' }}>{formatINR(c.totalRevenue)}</span>
                  </div>
                  <div className="customer-metric-item">
                    <span className="customer-metric-label">OUTSTANDING BALANCE</span>
                    <span className="customer-metric-val" style={{ color: c.outstanding > 0 ? '#d97706' : '#0f172a' }}>{formatINR(c.outstanding)}</span>
                  </div>
                </div>

                {/* View Details action */}
                <button 
                  className="customer-card-view-btn"
                  onClick={() => setSelectedCust(c)}
                >
                  <Eye size={14} /> View Details
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop CRM Table */
        <div className="crm-table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto' }}>
          <table className="crm-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', textTransform: 'uppercase', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Customer Name</th>
                <th style={{ padding: '12px 14px' }}>Contact Details</th>
                <th style={{ padding: '12px 14px' }}>Total Orders</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Cumulative Revenue</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Outstanding Balance</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedCust.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No customer records logged.
                  </td>
                </tr>
              ) : (
                displayedCust.map((c, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                    <td data-label="Customer Name" style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>
                      <div>{c.displayName}</div>
                      {c.contactPerson && <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>{c.contactPerson}</div>}
                    </td>
                    <td data-label="Contact Details" style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                          <Phone size={12} style={{ color: '#64748b' }} /> {c.displayPhone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                          <Mail size={12} style={{ color: '#94a3b8' }} /> {c.displayEmail}
                        </span>
                      </div>
                    </td>
                    <td data-label="Total Orders" style={{ padding: '12px 14px', fontWeight: '600', color: '#334155' }}>{c.totalOrders} orders</td>
                    <td data-label="Cumulative Revenue" style={{ padding: '12px 14px', fontWeight: '700', color: '#16a34a', textAlign: 'right' }}>
                      {formatINR(c.totalRevenue)}
                    </td>
                    <td data-label="Outstanding Balance" style={{ padding: '12px 14px', fontWeight: '700', color: c.outstanding > 0 ? '#d97706' : '#334155', textAlign: 'right' }}>
                      {formatINR(c.outstanding)}
                    </td>
                    <td data-label="Actions" style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button 
                        className="btn-small btn-outline-small"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '12px' }}
                        onClick={() => setSelectedCust(c)}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {!flat && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredCust.length}</strong> total customers)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="btn-small btn-outline-small"
              style={{ margin: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="btn-small btn-outline-small"
              style={{ margin: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Overlay */}
      {selectedCust && (
        <div className="modal-overlay active" onClick={() => setSelectedCust(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '560px', maxWidth: '92vw' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Client Account Summary</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCust(null)}>✕</button>
            </div>

            <div className="details-grid">
              <div className="details-row">
                <span className="details-label">Client Name</span>
                <span className="details-value">{selectedCust.displayName || selectedCust.name}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Total Revenue generated</span>
                <span className="details-value" style={{ color: '#16a34a', fontWeight: '800' }}>
                  {formatINR(selectedCust.totalRevenue)}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Phone</span>
                <span className="details-value">{selectedCust.displayPhone}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Email</span>
                <span className="details-value">{selectedCust.displayEmail}</span>
              </div>
              <div className="details-row details-full">
                <span className="details-label">Address</span>
                <span className="details-value">{selectedCust.address || 'Address not listed'}</span>
              </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#eaeaea' }} />

            {/* History tabs */}
            <div className="history-layout">
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <FileText size={12} /> Orders history
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedCust.ordersHistory && selectedCust.ordersHistory.length > 0 ? selectedCust.ordersHistory.map((o, idx) => (
                    <div key={idx} style={{ background: '#f8f9fa', padding: '8px', borderRadius: '6px', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>{o.product}</span>
                      <span style={{ color: '#0284c7', fontWeight: '700' }}>{formatINR(o.val)}</span>
                    </div>
                  )) : (
                    <div style={{ padding: '8px', color: '#888', fontSize: '11px', fontStyle: 'italic' }}>No order history found.</div>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <ClipboardList size={12} /> Contact logs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedCust.communicationLogs && selectedCust.communicationLogs.length > 0 ? selectedCust.communicationLogs.map((log, idx) => (
                    <div key={idx} style={{ background: '#f8f9fa', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: '700', marginBottom: '2px' }}>
                        <span>{log.date || log.created_at || 'Recently'}</span>
                        <span>{log.type || log.contactMode || 'Note'}</span>
                      </div>
                      <span style={{ fontStyle: 'italic' }}>"{log.summary || log.remarks || log.note || ''}"</span>
                    </div>
                  )) : (
                    <div style={{ padding: '8px', color: '#888', fontSize: '11px', fontStyle: 'italic' }}>No communication logs.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
