'use client';

import React, { useState, useMemo } from 'react';
import { Search, ClipboardList, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';

export default function CustomersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const {
    data: customerResponse,
    isLoading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
    isFetching: customersFetching,
  } = useQuery({
    queryKey: ['finance-all-customers'],
    queryFn: () => backendFetch('/api/backend/sales/customers?page=1&pageSize=1000'),
  });
  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['finance-customer-delivered-orders'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments/delivered-orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const { data: payments = [], refetch: refetchPayments } = useQuery({
    queryKey: ['finance-customer-payments'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const customers = Array.isArray(customerResponse)
    ? customerResponse
    : (Array.isArray(customerResponse?.items) ? customerResponse.items : []);

  // Load dynamically calculated summaries
  const customerSummaries = useMemo(() => {
    return customers.map((c) => {
      const custOrders = orders.filter((order) => String(order.customerId || order.customer?.id) === String(c.id));
      const custPayments = payments.filter((payment) =>
        String(payment.customerId || payment.customer?.id) === String(c.id) &&
        ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase())
      );
      const totalBilled = custOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.grandTotal ?? 0), 0);
      const totalPaid = custPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
      const outstanding = totalBilled - totalPaid;

      return {
        customerId: c.id,
        customerCode: c.customerCode || c.publicId || c.id,
        customerName: c.companyName || c.name || 'Unknown',
        phoneEmail: [c.phone, c.email].filter(Boolean).join(' / ') || '—',
        totalBusiness: totalBilled,
        totalPaid,
        outstandingAmount: Math.max(0, outstanding),
        paymentRisk: outstanding <= 0 ? 'LOW' : outstanding > 100000 ? 'HIGH' : outstanding > 50000 ? 'MEDIUM' : 'LOW',
      };
    });
  }, [customers, orders, payments]);

  const filteredList = useMemo(() => {
    if (!searchQuery) return customerSummaries;
    const q = searchQuery.toLowerCase();
    return customerSummaries.filter((c) =>
      c.customerName?.toLowerCase().includes(q) ||
      c.customerId?.toLowerCase().includes(q) ||
      c.customerCode?.toLowerCase().includes(q) ||
      c.phoneEmail?.toLowerCase().includes(q)
    );
  }, [customerSummaries, searchQuery]);

  // Derive ledger statements dynamically
  const ledgerData = useMemo(() => {
    if (!selectedCustomer) return [];

    const custId = selectedCustomer.customerId;
    const customerOrders = orders.filter((order) => String(order.customerId || order.customer?.id) === String(custId));
    const customerPayments = payments.filter((payment) =>
      String(payment.customerId || payment.customer?.id) === String(custId) &&
      ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase())
    );

    const entries = [];

    // Add orders as Debits
    customerOrders.forEach((o) => {
      entries.push({
        id: `DEB-${o.id}`,
        created_at: o.deliveredAt || o.createdAt || new Date().toISOString(),
        entry_type: 'Invoice',
        reference: o.invoiceNo || `INV-${o.orderNo || o.orderId || o.id}`,
        debit: Number(o.grandTotal ?? o.totalAmount ?? 0),
        credit: 0
      });
    });

    // Add payments as Credits
    customerPayments.forEach((p) => {
      entries.push({
        id: `CRE-${p.id}`,
        created_at: p.verifiedAt || p.receivedAt || p.createdAt || new Date().toISOString(),
        entry_type: 'Payment',
        reference: p.paymentNo || p.referenceNo || `Receipt ${p.id}`,
        debit: 0,
        credit: Number(p.amount || 0)
      });
    });

    // Sort chronologically
    entries.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Compute running balance
    let running = 0;
    return entries.map((e) => {
      running += e.debit - e.credit;
      return {
        ...e,
        balance: running
      };
    });
  }, [selectedCustomer, orders, payments]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleViewLedger = (cust) => {
    setSelectedCustomer(cust);
    setShowLedgerModal(true);
  };

  return (
    <div className="customer-directory-container">
      <style>{`
        .customer-directory-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }

        .customer-directory-header {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: clamp(14px, 2.5vw, 20px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          gap: 12px;
          flex-wrap: wrap;
        }

        .customer-directory-card {
          background: #FFFFFF;
          padding: clamp(14px, 2vw, 20px);
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }

        .customer-search-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .customer-search-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .customer-search-box {
            width: 100% !important;
            max-width: 100% !important;
          }
          .customer-search-actions {
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
          }
        }

        .cust-desktop-table {
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
        }

        .cust-mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .cust-desktop-table {
            display: none !important;
          }
          .cust-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 10px;
          }
        }

        .cust-card-item {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
      `}</style>
      
      {/* Header */}
      <div className="customer-directory-header">
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: '800', color: '#002E5D', margin: 0, letterSpacing: '-0.02em' }}>
            Customer Directory
          </h1>
          <p style={{ color: '#64748B', fontSize: '12.5px', marginTop: '2px', margin: 0, fontWeight: 500 }}>
            Review customer payment metrics, ledger cards, and total outstanding exposure.
          </p>
        </div>
      </div>

      <div className="customer-directory-card">
        
        {customersError && (
          <div style={{ padding: '12px 14px', borderRadius: 8, background: '#FEF2F2', color: '#B91C1C', fontSize: '13px' }}>
            {customersError.message || 'Unable to load customers.'}
          </div>
        )}

        {/* Search Toolbar */}
        <div className="customer-search-toolbar">
          <div className="customer-search-actions">
            <strong style={{ color: '#002E5D', fontSize: '13.5px', fontWeight: 800 }}>
              {customerSummaries.length} Customers
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <div className="customer-search-box" style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Search by name, ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#FFFFFF' }}
              />
            </div>
            <button
              onClick={() => { refetchCustomers(); refetchOrders(); refetchPayments(); }}
              disabled={customersFetching}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#002E5D',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={customersFetching ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="cust-desktop-table">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#002E5D', borderBottom: '1px solid #E2E8F0', color: '#FFFFFF', fontWeight: 800 }}>
                <th style={{ padding: '12px 14px', fontSize: '11.5px' }}>Customer ID</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px' }}>Customer Name</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px' }}>Contact Info</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', textAlign: 'right' }}>Total Business</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', textAlign: 'right' }}>Total Paid</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', textAlign: 'right' }}>Outstanding</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', textAlign: 'center' }}>Risk Level</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {customersLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    Loading all customers...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredList.map((cust) => (
                  <tr key={cust.customerId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#002E5D' }}>{cust.customerCode}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F172A' }}>{cust.customerName}</td>
                    <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>{cust.phoneEmail}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right', color: '#334155' }}>{formatCurrency(cust.totalBusiness)}</td>
                    <td style={{ padding: '12px 14px', color: '#16A34A', fontWeight: '700', textAlign: 'right' }}>{formatCurrency(cust.totalPaid)}</td>
                    <td style={{ padding: '12px 14px', color: cust.outstandingAmount > 0 ? '#DC2626' : '#16A34A', fontWeight: '900', textAlign: 'right' }}>{formatCurrency(cust.outstandingAmount)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '800',
                        background: cust.paymentRisk === 'CRITICAL' || cust.paymentRisk === 'HIGH' ? '#FEE2E2' : (cust.paymentRisk === 'MEDIUM' ? '#FFEDD5' : '#D1FAE5'),
                        color: cust.paymentRisk === 'CRITICAL' || cust.paymentRisk === 'HIGH' ? '#991B1B' : (cust.paymentRisk === 'MEDIUM' ? '#C2410C' : '#065F46')
                      }}>
                        {cust.paymentRisk}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewLedger(cust)}
                        style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', color: '#002E5D' }}
                      >
                        Ledger
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="cust-mobile-cards">
          {customersLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Loading customers...</div>
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94A3B8', fontSize: '13px' }}>
              No customers found.
            </div>
          ) : (
            filteredList.map((cust) => (
              <div key={cust.customerId} className="cust-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#002E5D', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {cust.customerCode}
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                      {cust.customerName}
                    </h3>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    background: cust.paymentRisk === 'CRITICAL' || cust.paymentRisk === 'HIGH' ? '#FEE2E2' : (cust.paymentRisk === 'MEDIUM' ? '#FFEDD5' : '#D1FAE5'),
                    color: cust.paymentRisk === 'CRITICAL' || cust.paymentRisk === 'HIGH' ? '#991B1B' : (cust.paymentRisk === 'MEDIUM' ? '#C2410C' : '#065F46')
                  }}>
                    {cust.paymentRisk}
                  </span>
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  📞 {cust.phoneEmail}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Business</span>
                    <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>{formatCurrency(cust.totalBusiness)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Paid</span>
                    <strong style={{ fontSize: '12.5px', color: '#16A34A' }}>{formatCurrency(cust.totalPaid)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                    <strong style={{ fontSize: '12.5px', color: cust.outstandingAmount > 0 ? '#DC2626' : '#16A34A' }}>{formatCurrency(cust.outstandingAmount)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <button
                    onClick={() => handleViewLedger(cust)}
                    style={{ padding: '7px 14px', background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                  >
                    View Statement Ledger
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Ledger Modal */}
      {showLedgerModal && selectedCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{ background: 'white', maxWidth: '720px', width: '100%', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>Double Entry Statement Ledger</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>{selectedCustomer.customerName} ({selectedCustomer.customerId})</p>
              </div>
              <button 
                onClick={() => setShowLedgerModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '50vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #CBD5E1', color: '#475569', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px 8px' }}>Date</th>
                    <th style={{ padding: '10px 8px' }}>Type</th>
                    <th style={{ padding: '10px 8px' }}>Reference</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Debit (+)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Credit (-)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>
                        No transactions registered yet.
                      </td>
                    </tr>
                  ) : (
                    ledgerData.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 8px' }}>{e.created_at.split('T')[0]}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: e.entry_type === 'Invoice' ? '#DBEAFE' : '#D1FAE5',
                            color: e.entry_type === 'Invoice' ? '#1E40AF' : '#065F46'
                          }}>
                            {e.entry_type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{e.reference}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#EF4444', fontWeight: '600' }}>
                          {e.debit > 0 ? formatCurrency(e.debit) : '-'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#10B981', fontWeight: '600' }}>
                          {e.credit > 0 ? formatCurrency(e.credit) : '-'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700' }}>
                          {formatCurrency(e.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFC' }}>
              <button
                onClick={() => setShowLedgerModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#64748B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
