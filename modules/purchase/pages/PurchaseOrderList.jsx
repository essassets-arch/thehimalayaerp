'use client';

import { useState, useEffect } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { Plus, Search, Eye, Trash2, Calendar, FileCheck, User, HelpCircle, Truck } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import * as purchaseService from '../services/purchase.service';

export default function PurchaseOrderList() {
  const navigate = useRouter();
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const fetchPOs = async () => {
    setIsLoading(true);
    try {
      const data = await purchaseService.getPurchaseOrders();
      setPurchaseOrders(data || []);
    } catch (err) {
      console.error('Fetch POs error:', err);
      Swal.fire('Error', 'Failed to load purchase orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleInspect = async (po) => {
    try {
      const detailed = await purchaseService.getPurchaseOrderById(po.id);
      setSelectedPO(detailed);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch purchase order items', 'error');
    }
  };

  const handleDelete = async (po) => {
    if (po.status !== 'Draft') {
      Swal.fire('Locked', `Cannot cancel or delete a Purchase Order with status: ${po.status}`, 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Cancel Purchase Order?',
      text: `Are you sure you want to cancel ${po.purchase_order_number}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No'
    });

    if (result.isConfirmed) {
      try {
        await purchaseService.deletePurchaseOrder(po.id);
        Swal.fire('Success', 'Purchase order cancelled successfully', 'success');
        fetchPOs();
        if (selectedPO?.id === po.id) {
          setSelectedPO(null);
        }
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to cancel PO', 'error');
      }
    }
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Purchase Orders (Procurement)</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Draft, dispatch, and track raw materials supply orders issued to vendors.
          </p>
        </div>
        <button className="action-btn" style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate.push('/store/purchase/new-po')}>
          <Plus size={16} /> Create PO
        </button>
      </div>

      {/* Main Grid: list + side inspect */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPO ? '1fr 400px' : '1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* PO Table */}
        <div className="app-card" style={{ overflow: 'hidden' }}>
          <DataTable
            columns={[
              { header: 'PO Number', accessor: 'purchase_order_number', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.purchase_order_number}</strong> },
              { header: 'Date', accessor: 'po_date', render: (row) => row.po_date ? new Date(row.po_date).toLocaleDateString() : 'N/A' },
              { header: 'Vendor Name', accessor: 'vendor_name' },
              { header: 'Items', accessor: 'item_count' },
              { header: 'Order Value', accessor: 'grand_total', render: (row) => formatCurrency(row.grand_total) },
              { header: 'Delivered %', accessor: 'completion_percentage', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', width: '60px', height: '6px', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ background: row.completion_percentage === 100 ? '#10b981' : 'var(--color-primary)', width: `${row.completion_percentage}%`, height: '100%' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{row.completion_percentage}%</span>
                </div>
              )},
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            data={purchaseOrders}
            searchQuery={globalSearch}
            searchField="purchase_order_number"
            emptyMessage={isLoading ? 'Loading procurement order registers...' : 'No purchase orders generated yet.'}
            actions={(row) => (
              <>
                <button className="action-btn-icon" onClick={() => handleInspect(row)} title="Inspect Details" style={{ background: 'rgba(0,0,0,0.03)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                  <Eye size={14} />
                </button>
                {['Draft', 'Sent', 'Partially Received'].includes(row.status) && (
                  <button className="action-btn-icon" onClick={() => navigate.push(`/store/purchase/grn?po=${row.id}`)} title="Log Receipt (GRN)" style={{ background: 'rgba(34,197,94,0.08)', color: '#10b981', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                    <Truck size={14} />
                  </button>
                )}
                {row.status === 'Draft' && (
                  <button className="action-btn-icon" onClick={() => handleDelete(row)} title="Cancel PO" style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          />
        </div>

        {/* Side Inspect Panel */}
        {selectedPO && (
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setSelectedPO(null)}>✕</button>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedPO.purchase_order_number}</span>
              <h3 style={{ margin: '4px 0 10px 0', fontSize: '18px', fontWeight: '800' }}>Supplier Details</h3>
              <StatusBadge status={selectedPO.status} />
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>Vendor: <strong>{selectedPO.vendor_name} ({selectedPO.vendor_code})</strong></div>
              <div>Contact Person: <strong>{selectedPO.contact_person || 'N/A'}</strong></div>
              {selectedPO.email && <div>Email: {selectedPO.email}</div>}
              {selectedPO.phone && <div>Phone: {selectedPO.phone}</div>}
              <div>GSTIN: <strong>{selectedPO.gstin || 'N/A'}</strong></div>
              <div>Payment Terms: <strong>{selectedPO.payment_terms || 'N/A'}</strong></div>
              <div>PO Date: <strong>{selectedPO.po_date ? new Date(selectedPO.po_date).toLocaleDateString() : 'N/A'}</strong></div>
              {selectedPO.delivery_date && <div>Expected Delivery: <strong>{new Date(selectedPO.delivery_date).toLocaleDateString()}</strong></div>}
            </div>

            {/* PO Items */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Order Items Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedPO.items && selectedPO.items.length > 0 ? (
                  selectedPO.items.map(item => (
                    <div key={item.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontSize: '12.5px' }}>
                      <div style={{ fontWeight: '700' }}>{item.product_name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '11.5px', marginTop: '2px' }}>
                        <span>Code: {item.product_code}</span>
                        <span>Unit: {item.unit_of_measure}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span>Ordered: <strong>{parseFloat(item.quantity_ordered).toLocaleString()}</strong></span>
                        <span>Received: <strong style={{ color: item.quantity_received >= item.quantity_ordered ? '#10b981' : '#f59e0b' }}>{parseFloat(item.quantity_received).toLocaleString()}</strong></span>
                        <span>Rate: <strong>{formatCurrency(item.unit_price)}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>No items in PO.</div>
                )}
              </div>
            </div>

            {/* Totals Summary */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <strong>{formatCurrency(selectedPO.total_amount)}</strong>
              </div>
              {selectedPO.discount_total > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span>Discount:</span>
                  <strong>-{formatCurrency(selectedPO.discount_total)}</strong>
                </div>
              )}
              {selectedPO.tax_total > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST Tax:</span>
                  <strong>+{formatCurrency(selectedPO.tax_total)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', borderTop: '1px dashed var(--color-border)', paddingTop: '6px', marginTop: '4px', color: 'var(--color-primary)' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(selectedPO.grand_total)}</span>
              </div>
            </div>

            {selectedPO.notes && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                Notes: {selectedPO.notes}
              </div>
            )}

            {/* Actions for active POs */}
            {selectedPO.status === 'Draft' && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                <button
                  className="action-btn"
                  style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', width: '100%' }}
                  onClick={async () => {
                    try {
                      await purchaseService.updatePurchaseOrder(selectedPO.id, { status: 'Sent' });
                      Swal.fire('Dispatched', 'PO marked as Sent and dispatched to Vendor.', 'success');
                      fetchPOs();
                      setSelectedPO(null);
                    } catch (err) {
                      Swal.fire('Error', 'Failed to update PO status', 'error');
                    }
                  }}
                >
                  <FileCheck size={14} style={{ marginRight: '4px' }} /> Dispatch to Vendor
                </button>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
