import { useState, useEffect } from 'react';
import { Search, Eye, Phone, Mail, FileText, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomersView({ 
  customers,
  orders = [],
  searchQuery,
  setSearchQuery,
  flat = false
}) {
  const [localSearch, setLocalSearch] = useState('');
  const search = searchQuery !== undefined ? searchQuery : localSearch;
  const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
  const [selectedCust, setSelectedCust] = useState(null);
  const [filter, setFilter] = useState('All');

  // Enrich customers with live metrics from orders
  const enrichedCustomers = customers.map(c => {
    const custName = c.name || c.companyName || c.customerName || c.company_name || 'Unknown Customer';
    
    const custOrders = orders.filter(o => 
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
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredCust = enrichedCustomers.filter(c => {
    const matchesSearch = (c.displayName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (c.displayEmail || '').toLowerCase().includes(search.toLowerCase());
    
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
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row">
        <h2 className="module-title">Customer Portfolio Directory</h2>
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {[
              { id: 'All', label: 'All' },
              { id: 'Active Orders', label: 'Active Orders' },
              { id: 'Outstanding', label: 'Outstanding Balance' }
            ].map(st => (
              <button 
                key={st.id}
                className={`filter-pill ${filter === st.id ? 'active' : ''}`}
                onClick={() => setFilter(st.id)}
                style={{ color: filter === st.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-container">
        <table className="crm-table responsive-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Details</th>
              <th>Total Orders</th>
              <th>Cumulative Revenue</th>
              <th>Outstanding Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCust.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  No customer records logged.
                </td>
              </tr>
            ) : (
              displayedCust.map((c, index) => (
                <tr key={index}>
                  <td data-label="Customer Name" style={{ fontWeight: '600' }}>
                    {c.displayName}
                    {c.contactPerson && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{c.contactPerson}</div>}
                  </td>
                  <td data-label="Contact Details">
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={10} style={{ color: 'var(--color-text-muted)' }} /> {c.displayPhone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)' }}>
                        <Mail size={10} style={{ color: 'var(--color-text-muted)' }} /> {c.displayEmail}
                      </span>
                    </div>
                  </td>
                  <td data-label="Total Orders" style={{ fontWeight: '600' }}>{c.totalOrders} orders</td>
                  <td data-label="Cumulative Revenue" style={{ fontWeight: '700', color: 'var(--color-accent-green)' }}>
                    {formatINR(c.totalRevenue)}
                  </td>
                  <td data-label="Outstanding Balance" style={{ fontWeight: '700', color: c.outstanding > 0 ? '#d97706' : 'inherit' }}>
                    {formatINR(c.outstanding)}
                  </td>
                  <td data-label="Actions">
                    <button 
                      className="btn-small btn-outline-small"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setSelectedCust(c)}
                    >
                      <Eye size={12} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!flat && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
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
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '560px' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Client Account Summary</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCust(null)}>✕</button>
            </div>

            <div className="details-grid">
              <div className="details-row">
                <span className="details-label">Client Name</span>
                <span className="details-value">{selectedCust.name}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Total Revenue generated</span>
                <span className="details-value" style={{ color: 'var(--color-accent-green)', fontWeight: '800' }}>
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
                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <FileText size={12} /> Orders history
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedCust.ordersHistory && selectedCust.ordersHistory.length > 0 ? selectedCust.ordersHistory.map((o, idx) => (
                    <div key={idx} style={{ background: '#f8f9fa', padding: '8px', borderRadius: '6px', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>{o.product}</span>
                      <span style={{ color: 'var(--color-accent-teal)', fontWeight: '700' }}>{formatINR(o.val)}</span>
                    </div>
                  )) : (
                    <div style={{ padding: '8px', color: '#888', fontSize: '11px', fontStyle: 'italic' }}>No order history found.</div>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <ClipboardList size={12} /> Contact logs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedCust.communicationLogs && selectedCust.communicationLogs.length > 0 ? selectedCust.communicationLogs.map((log, idx) => (
                    <div key={idx} style={{ background: '#f8f9fa', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '2px' }}>
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
