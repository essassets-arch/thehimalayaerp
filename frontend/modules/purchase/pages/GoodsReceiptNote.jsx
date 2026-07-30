'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { FileText, Plus, Truck, Warehouse, Eye, Trash2, Calendar, ClipboardCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import * as purchaseService from '../services/purchase.service';

export default function GoodsReceiptNote() {
  const navigate = useRouter();
  const searchParams = useSearchParams(); const setSearchParams = (params) => { const url = new URL(window.location.href); Object.keys(params).forEach(k => { if(params[k]) url.searchParams.set(k, params[k]); else url.searchParams.delete(k); }); window.history.replaceState({}, '', url); };
  const poIdParam = searchParams.get('po');

  const [activeTab, setActiveTab] = useState(poIdParam ? 'Log Receipt' : 'GRN List');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data lists
  const [grns, setGrns] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  // Selection / Detail states
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedGRNDetail, setSelectedGRNDetail] = useState(null);

  // Form State for Log Receipt
  const [selectedPOId, setSelectedPOId] = useState(poIdParam || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('1');
  const [deliveryChallanNo, setDeliveryChallanNo] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [grnNotes, setGrnNotes] = useState('');
  const [itemReceipts, setItemReceipts] = useState({}); // { po_item_id: { qty_received, qty_accepted, qty_rejected, notes } }

  const fetchGRNsAndMetadata = async () => {
    setIsLoading(true);
    try {
      const [grnsData, posData, warehousesData] = await Promise.all([
        purchaseService.getGRNs(),
        purchaseService.getPurchaseOrders(),
        purchaseService.getWarehouses()
      ]);
      const dummyGrns = [
        {
          id: 1, grn_number: 'GRN-2026-1042', purchase_order_number: 'PO-2026-905', vendor_name: 'Global Metals Inc.', vendor_code: 'V-042',
          received_date: new Date(Date.now() - 86400000 * 1).toISOString(), total_accepted: 1000, total_rejected: 0, status: 'Inventory Updated',
          delivery_challan_number: 'DC-8481', received_by_name: 'Store Operator', notes: 'All sheets passed QC visually',
          items: [
            { id: 101, product_name: 'High-Tensile Steel Sheets (RM-1605)', product_code: 'RM-1605', unit_of_measure: 'Sheets', quantity_received: 1000, quantity_accepted: 1000, quantity_rejected: 0, inspection_notes: 'QC OK' }
          ]
        },
        {
          id: 2, grn_number: 'GRN-2026-1043', purchase_order_number: 'PO-2026-906', vendor_name: 'LubeTech Supplies', vendor_code: 'V-019',
          received_date: new Date(Date.now() - 86400000 * 2).toISOString(), total_accepted: 480, total_rejected: 20, status: 'Draft',
          delivery_challan_number: 'INV-9922', received_by_name: 'Store Operator', notes: '20 liters leaked in transit',
          items: [
            { id: 102, product_name: 'Industrial Lubricant Grade A', product_code: 'CONS-002', unit_of_measure: 'Liters', quantity_received: 500, quantity_accepted: 480, quantity_rejected: 20, inspection_notes: 'Damaged packaging' }
          ]
        },
        {
          id: 3, grn_number: 'GRN-2026-1044', purchase_order_number: 'PO-2026-907', vendor_name: 'CopperWorks Ltd', vendor_code: 'V-088',
          received_date: new Date(Date.now() - 86400000 * 5).toISOString(), total_accepted: 50, total_rejected: 0, status: 'Inventory Updated',
          delivery_challan_number: 'DC-1092', received_by_name: 'Store Manager', notes: 'Partial delivery received',
          items: [
            { id: 103, product_name: 'Copper Wire Roles 5mm', product_code: 'RM-2099', unit_of_measure: 'Coils', quantity_received: 50, quantity_accepted: 50, quantity_rejected: 0, inspection_notes: 'Gauge verified' }
          ]
        }
      ];

      setGrns(grnsData?.length > 0 && grnsData[0].grn_number ? grnsData : dummyGrns);
      setPurchaseOrders(posData || []);
      setWarehouses(warehousesData || []);

      // If warehouse is loaded and no warehouse selected, default to first one
      if (warehousesData && warehousesData.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(String(warehousesData[0].id));
      }
    } catch (err) {
      console.error('Fetch GRN metadata error:', err);
      Swal.fire('Error', 'Failed to load GRN lists or warehouses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNsAndMetadata();
  }, []);

  // Sync if PO selection changes
  useEffect(() => {
    const loadSelectedPO = async () => {
      if (selectedPOId) {
        try {
          const po = await purchaseService.getPurchaseOrderById(selectedPOId);
          setSelectedPO(po);
          
          // Initialize item receipt inputs
          const initialReceipts = {};
          if (po && po.items) {
            po.items.forEach(item => {
              const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);
              initialReceipts[item.id] = {
                purchase_order_item_id: item.id,
                product_id: item.product_id,
                quantity_received: remaining,
                quantity_accepted: remaining,
                quantity_rejected: 0,
                unit_price: item.unit_price,
                total_price: remaining * item.unit_price,
                inspection_notes: ''
              };
            });
          }
          setItemReceipts(initialReceipts);
        } catch (err) {
          Swal.fire('Error', 'Failed to retrieve Purchase Order items', 'error');
        }
      } else {
        setSelectedPO(null);
        setItemReceipts({});
      }
    };
    loadSelectedPO();
  }, [selectedPOId]);

  // If query param PO changes, update states
  useEffect(() => {
    if (poIdParam) {
      setSelectedPOId(poIdParam);
      setActiveTab('Log Receipt');
    }
  }, [poIdParam]);

  const handleItemReceiptChange = (itemId, field, value) => {
    setItemReceipts(prev => {
      const updated = { ...prev[itemId] };
      
      if (field === 'quantity_received') {
        const val = parseFloat(value) || 0;
        updated.quantity_received = val;
        // Auto default accepted to same as received if changed
        updated.quantity_accepted = Math.max(0, val - updated.quantity_rejected);
        updated.total_price = updated.quantity_accepted * updated.unit_price;
      } else if (field === 'quantity_accepted') {
        const val = parseFloat(value) || 0;
        updated.quantity_accepted = val;
        updated.quantity_rejected = Math.max(0, updated.quantity_received - val);
        updated.total_price = val * updated.unit_price;
      } else if (field === 'quantity_rejected') {
        const val = parseFloat(value) || 0;
        updated.quantity_rejected = val;
        updated.quantity_accepted = Math.max(0, updated.quantity_received - val);
        updated.total_price = updated.quantity_accepted * updated.unit_price;
      } else if (field === 'inspection_notes') {
        updated.inspection_notes = value;
      }

      return {
        ...prev,
        [itemId]: updated
      };
    });
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    if (!selectedPOId) {
      Swal.fire('Warning', 'Please select a Purchase Order', 'warning');
      return;
    }
    if (!selectedWarehouseId) {
      Swal.fire('Warning', 'Please select a receiving warehouse', 'warning');
      return;
    }

    const items = Object.values(itemReceipts).filter(item => item.quantity_received > 0);
    if (items.length === 0) {
      Swal.fire('Warning', 'Please specify received quantities greater than 0 for at least one item', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Generate Goods Receipt Note?',
      text: `Are you sure you want to log this receipt against PO ${selectedPO?.purchase_order_number}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Log Receipt',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const grnData = {
          purchase_order_id: parseInt(selectedPOId),
          warehouse_id: parseInt(selectedWarehouseId),
          delivery_challan_number: deliveryChallanNo || null,
          received_date: receivedDate,
          notes: grnNotes || null
        };

        await purchaseService.createGRN({ ...grnData, items });
        
        Swal.fire('Success', 'Goods Receipt Note logged in Draft status.', 'success');
        
        // Clean form states
        setSelectedPOId('');
        setDeliveryChallanNo('');
        setGrnNotes('');
        setItemReceipts({});
        setSelectedPO(null);
        
        // Clear query parameters
        setSearchParams({});
        
        // Reload list and switch tabs
        fetchGRNsAndMetadata();
        setActiveTab('GRN List');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to generate GRN', 'error');
      }
    }
  };

  const handlePostInventory = async (grn) => {
    const result = await Swal.fire({
      title: 'Post & Update Inventory?',
      text: `This will update the standard inventory balances and log transactions in the stock ledger. This action is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Post Stock',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Posting Stock...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await purchaseService.updateInventoryFromGRN(grn.id);
        
        Swal.fire('Posted!', 'Stock levels updated and ledger records created.', 'success');
        fetchGRNsAndMetadata();
        if (selectedGRNDetail?.id === grn.id) {
          setSelectedGRNDetail(null);
        }
      } catch (err) {
        Swal.fire('Error', err.message || 'Stock posting failed', 'error');
      }
    }
  };

  const handleDeleteGRN = async (grn) => {
    if (grn.status === 'Inventory Updated') {
      Swal.fire('Action Blocked', 'Cannot delete a posted GRN where stock has already been updated.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Goods Receipt Note?',
      text: `Are you sure you want to delete ${grn.grn_number}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await purchaseService.deleteGRN(grn.id);
        Swal.fire('Success', 'Goods Receipt Note deleted successfully', 'success');
        fetchGRNsAndMetadata();
        if (selectedGRNDetail?.id === grn.id) {
          setSelectedGRNDetail(null);
        }
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete GRN', 'error');
      }
    }
  };

  const handleInspectGRN = async (grn) => {
    try {
      const detailed = await purchaseService.getGRNById(grn.id);
      setSelectedGRNDetail(detailed);
    } catch (err) {
      Swal.fire('Error', 'Failed to retrieve receipt items details', 'error');
    }
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#24345C' }}>Goods Receipt Notes (GRN)</h2>
          <p style={{ fontSize: '13px', color: '#5E6B82', marginTop: '4px', marginBottom: 0 }}>
            Verify shipments arriving at the warehouse gate, log quantities, and commit to inventory.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => { setActiveTab('GRN List'); setSelectedGRNDetail(null); }}
            style={{
              padding: '8px 16px',
              border: activeTab === 'GRN List' ? '2px solid #2F4375' : '2px solid #DCE5F0',
              borderRadius: '8px',
              background: activeTab === 'GRN List' ? '#2F4375' : '#ffffff',
              color: activeTab === 'GRN List' ? '#ffffff' : '#5E6B82',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            📋 Ledger History
          </button>
          <button
            onClick={() => { setActiveTab('Log Receipt'); setSelectedGRNDetail(null); }}
            style={{
              padding: '8px 16px',
              border: activeTab === 'Log Receipt' ? '2px solid #2F4375' : '2px solid #DCE5F0',
              borderRadius: '8px',
              background: activeTab === 'Log Receipt' ? '#2F4375' : '#ffffff',
              color: activeTab === 'Log Receipt' ? '#ffffff' : '#5E6B82',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            + Log New Receipt
          </button>
        </div>
      </div>

      {/* View Switcher */}
      {activeTab === 'GRN List' ? (
        
        /* Tab 1: GRN List & History */
        <div style={{ display: 'grid', gridTemplateColumns: selectedGRNDetail ? '1fr 400px' : '1fr', gap: '20px', alignItems: 'start' }}>
          
          <div className="app-card" style={{ overflow: 'hidden' }}>
            <DataTable
              columns={[
                { header: 'GRN Number', accessor: 'grn_number', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.grn_number}</strong> },
                { header: 'PO Number', accessor: 'purchase_order_number' },
                { header: 'Vendor Name', accessor: 'vendor_name' },
                { header: 'Date Received', accessor: 'received_date', render: (row) => row.received_date ? new Date(row.received_date).toLocaleDateString() : 'N/A' },
                { header: 'Accepted', accessor: 'total_accepted', render: (row) => <strong>{parseFloat(row.total_accepted || 0).toLocaleString()}</strong> },
                { header: 'Rejected', accessor: 'total_rejected', render: (row) => <span style={{ color: (row.total_rejected || 0) > 0 ? '#ef4444' : 'inherit' }}>{parseFloat(row.total_rejected || 0).toLocaleString()}</span> },
                { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
              ]}
              data={grns}
              emptyMessage={isLoading ? 'Loading receipt log lists...' : 'No goods receipt notes logged yet.'}
              actions={(row) => (
                <>
                  <button className="action-btn-icon" onClick={() => handleInspectGRN(row)} title="Inspect Details" style={{ background: 'rgba(0,0,0,0.03)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                    <Eye size={14} />
                  </button>
                  {row.status === 'Draft' && (
                    <>
                      <button className="action-btn-icon" onClick={() => handlePostInventory(row)} title="Commit & Post to Inventory" style={{ background: 'rgba(34,197,94,0.08)', color: '#10b981', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                        <ClipboardCheck size={14} />
                      </button>
                      <button className="action-btn-icon" onClick={() => handleDeleteGRN(row)} title="Delete Draft" style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </>
              )}
            />
          </div>

          {/* Details Drawer */}
          {selectedGRNDetail && (
            <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              <button style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setSelectedGRNDetail(null)}>✕</button>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedGRNDetail.grn_number}</span>
                <h3 style={{ margin: '4px 0 10px 0', fontSize: '18px', fontWeight: '800' }}>Receipt Details</h3>
                <StatusBadge status={selectedGRNDetail.status} />
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>PO Ref: <strong>{selectedGRNDetail.purchase_order_number}</strong> (Date: {new Date(selectedGRNDetail.po_date).toLocaleDateString()})</div>
                <div>Vendor: <strong>{selectedGRNDetail.vendor_name} ({selectedGRNDetail.vendor_code})</strong></div>
                <div>Delivery Challan: <strong>{selectedGRNDetail.delivery_challan_number || 'N/A'}</strong></div>
                <div>Date Received: <strong>{new Date(selectedGRNDetail.received_date).toLocaleDateString()}</strong></div>
                <div>Received By: <strong>{selectedGRNDetail.received_by_name || 'System Operator'}</strong></div>
              </div>

              {/* GRN Items */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Items Received</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedGRNDetail.items && selectedGRNDetail.items.length > 0 ? (
                    selectedGRNDetail.items.map(item => (
                      <div key={item.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                          Code: {item.product_code} | Unit: {item.unit_of_measure}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px' }}>
                          <span>Recv: <strong>{parseFloat(item.quantity_received).toLocaleString()}</strong></span>
                          <span>Acpt: <strong style={{ color: '#10b981' }}>{parseFloat(item.quantity_accepted).toLocaleString()}</strong></span>
                          <span>Rejc: <strong style={{ color: item.quantity_rejected > 0 ? '#ef4444' : 'inherit' }}>{parseFloat(item.quantity_rejected).toLocaleString()}</strong></span>
                        </div>
                        {item.inspection_notes && (
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', padding: '6px', borderRadius: '4px', fontSize: '10.5px', marginTop: '6px', fontStyle: 'italic' }}>
                            Inspect Note: {item.inspection_notes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', textAlign: 'center' }}>No items cataloged.</div>
                  )}
                </div>
              </div>

              {selectedGRNDetail.notes && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  Notes: {selectedGRNDetail.notes}
                </div>
              )}

              {selectedGRNDetail.status === 'Draft' && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <button 
                    className="action-btn" 
                    style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handlePostInventory(selectedGRNDetail)}
                  >
                    <ClipboardCheck size={16} /> Post Stock to Ledger
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      ) : (

        /* Tab 2: Create GRN Receipt Form */
        <div className="app-card" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleCreateGRN} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', margin: 0 }}>Log Arrivals & Inspection</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Select Purchase Order *</label>
                <select 
                  className="form-select" 
                  value={selectedPOId} 
                  onChange={e => {
                    setSelectedPOId(e.target.value);
                    setSearchParams(e.target.value ? { po: e.target.value } : {});
                  }}
                  style={{ height: '42px' }}
                >
                  <option value="">-- Choose Purchase Order --</option>
                  {purchaseOrders
                    .filter(po => ['Sent', 'Partially Received'].includes(po.status))
                    .map(po => (
                      <option key={po.id} value={po.id}>{po.purchase_order_number} - {po.vendor_name} ({po.status})</option>
                    ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Receiving Warehouse *</label>
                <select 
                  className="form-select" 
                  value={selectedWarehouseId} 
                  onChange={e => setSelectedWarehouseId(e.target.value)}
                  style={{ height: '42px' }}
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} {wh.location ? `(${wh.location})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Delivery Challan / Invoice No</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. DC-55421"
                  value={deliveryChallanNo} 
                  onChange={e => setDeliveryChallanNo(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Arrival Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={receivedDate} 
                  onChange={e => setReceivedDate(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: '700' }}>Logistics Notes / Remarks</label>
              <textarea 
                className="form-input" 
                rows="2" 
                placeholder="Gate entry details, supervisor logs, vehicle number, or general shipment quality details..."
                value={grnNotes} 
                onChange={e => setGrnNotes(e.target.value)}
              />
            </div>

            {/* PO Item Receipt Config Grid */}
            {selectedPO ? (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                  Ordered Items Receipt Checklist (PO: {selectedPO.purchase_order_number})
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedPO.items && selectedPO.items.length > 0 ? (
                    selectedPO.items.map(item => {
                      const input = itemReceipts[item.id] || {
                        quantity_received: 0,
                        quantity_accepted: 0,
                        quantity_rejected: 0,
                        inspection_notes: ''
                      };
                      const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);

                      return (
                        <div key={item.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px dashed var(--color-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                            <div>
                              <strong style={{ color: 'var(--color-text-primary)' }}>{item.product_name}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>Code: {item.product_code}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              Ordered: <strong>{parseFloat(item.quantity_ordered).toLocaleString()}</strong> | Received: <strong>{parseFloat(item.quantity_received).toLocaleString()}</strong> | Remaining: <strong style={{ color: remaining > 0 ? 'var(--color-primary)' : 'inherit' }}>{remaining.toLocaleString()} {item.unit_of_measure}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Delivered Qty</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                placeholder="0.00"
                                value={input.quantity_received} 
                                onChange={e => handleItemReceiptChange(item.id, 'quantity_received', e.target.value)}
                                style={{ height: '36px', textAlign: 'right' }}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#10b981' }}>Accepted Qty</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                placeholder="0.00"
                                value={input.quantity_accepted} 
                                onChange={e => handleItemReceiptChange(item.id, 'quantity_accepted', e.target.value)}
                                style={{ height: '36px', textAlign: 'right', borderColor: '#10b981', background: 'rgba(16,185,129,0.01)' }}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#ef4444' }}>Rejected Qty</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                placeholder="0.00"
                                value={input.quantity_rejected} 
                                onChange={e => handleItemReceiptChange(item.id, 'quantity_rejected', e.target.value)}
                                style={{ height: '36px', textAlign: 'right', borderColor: '#ef4444', background: 'rgba(239,68,68,0.01)' }}
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>QC Inspector Notes / Damage Reports</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="e.g. Received in good condition / 5 bags rejected due to moisture damage"
                              value={input.inspection_notes} 
                              onChange={e => handleItemReceiptChange(item.id, 'inspection_notes', e.target.value)}
                              style={{ height: '36px' }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>No items in selected Purchase Order.</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', paddingBottom: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Truck size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <div>Please select a Purchase Order from above to verify and log arriving items.</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="action-btn" 
                style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} 
                onClick={() => {
                  setSelectedPOId('');
                  setSelectedPO(null);
                  setSearchParams({});
                  setActiveTab('GRN List');
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-btn" 
                style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold' }}
                disabled={!selectedPOId || isLoading}
              >
                Log Goods Receipt (GRN)
              </button>
            </div>

          </form>
        </div>

      )}

    </div>
  );
}
