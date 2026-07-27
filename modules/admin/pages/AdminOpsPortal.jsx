'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import LeadsView from '../../../components/LeadsView';
import SamplesView from '../../../components/SamplesView';
import QuotationsView from '../../../components/QuotationsView';
import OrdersView from '../../../components/OrdersView';
import { useERPStore } from '../../../shared/context/ERPContext';
import { useAuth } from '../../../shared/context/AuthContext';

const TOKEN = () => localStorage.getItem('token') || localStorage.getItem('himalaya_token');
const AUTH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` });

export default function AdminOpsPortal() {
  const location = { pathname: usePathname(), search: "" };
  const pathname = location.pathname.replace(/\/$/, '');
  const view = pathname.split('/').pop(); // e.g. 'admin-leads'
  const globalSearch = useSearchStore(s => s.globalSearch);
  const navigate = useRouter();
  const { user } = useAuth();

  const [leads, setLeads]           = useState([]);
  const [samples, setSamples]       = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(false);

  // ── Fetch all admin ops data ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [lR, sR, qR, oR] = await Promise.all([
        fetch('/api/admin-ops/leads',         { headers: AUTH() }),
        fetch('/api/admin-ops/samples',        { headers: AUTH() }),
        fetch('/api/admin-ops/quotations',     { headers: AUTH() }),
        fetch('/api/admin-ops/direct-orders',  { headers: AUTH() }),
      ]);
      if (lR.ok) { const d = await lR.json(); setLeads(normalizeLeads(d.leads || [])); }
      if (sR.ok) { const d = await sR.json(); setSamples(normalizeSamples(d.samples || [])); }
      if (qR.ok) { const d = await qR.json(); setQuotations(normalizeQuotations(d.quotations || [])); }
      if (oR.ok) { const d = await oR.json(); setOrders(normalizeOrders(d.orders || [])); }
    } catch (e) { console.error('AdminOps fetch error', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Clear any stale quotation draft — QuotationsView auto-opens CreateQuotation
  // when a draft exists, but in the admin context it lacks the required handlers.
  useEffect(() => {
    useERPStore.getState().clearQuotationDraft?.();
  }, []);

  // ── Normalisers — match the shape Sales components expect ─────────────
  const normalizeLeads = (rows) => rows.map(r => ({
    id:            r.id,
    companyName:   r.customer_name || '',
    contactPerson: r.contact_person || r.customer_name || '',
    phone:         r.phone || '',
    email:         r.email || '',
    projectName:   r.project_name || '',
    groupName:     r.group_name || '',
    siteInchargeName:   r.contact_person || '',
    siteInchargeMobile: r.phone || '',
    status:        r.status || 'New',
    source:        r.source || '',
    remarks:       r.remarks || '',
    notes:         r.remarks || '',
    requirements:  r.remarks || '',
    address: {
      city:    r.city || '',
      state:   r.state_name || '',
      line1:   '',
      country: 'India',
      pincode: ''
    },
    createdAt: r.created_at,
  }));

  const normalizeSamples = (rows) => rows.map(r => ({
    id:           r.id,
    public_id:    r.sample_no || `ASM-${r.id}`,
    status:       r.status || 'Requested',
    leadId:       r.lead_id,
    product:      r.remarks || 'Sample',
    quantity:     1,
    createdAt:    r.created_at,
    expiryDate:   r.valid_until || null,
    dispatchDate: r.sample_date || null,
  }));

  const normalizeQuotations = (rows) => rows.map(r => {
    let parsedItems = [];
    try {
      parsedItems = r.items_json ? JSON.parse(r.items_json) : [];
    } catch (e) {
      console.warn("Failed to parse items_json:", e);
    }

    const itemsString = parsedItems.map(item => {
      const name = item.productName || item.name || item.product_name || 'Product';
      const qty = item.quantity || item.qty || 1;
      return `${name} (x${qty})`;
    }).join(', ');

    const detailedItems = parsedItems.map((item, idx) => ({
      id: item.id || idx + 1,
      productName: item.productName || item.name || item.product_name || '',
      productDetails: item.productDetails || item.description || '',
      quantity: item.quantity || item.qty || 1,
      unitPrice: item.unitPrice || item.rate || item.price || 0,
      discount: item.discount !== undefined ? item.discount : 0,
      tax: item.tax !== undefined ? item.tax : 18
    }));

    return {
      id:               r.id,
      public_id:        r.quotation_no || `AMQ-${r.id}`,
      customer_id:      r.customer_id,
      customer_name:    r.customer_name || String(r.customer_id),
      customerName:     r.customer_name || String(r.customer_id),
      gst_number:       r.gst_number || '',
      grand_total:      r.amount || 0,
      totalAmount:      r.amount || 0,
      discount:         r.discount || 0,
      tax:              r.tax || 18,
      transport_charge: r.transport_charge || 0,
      status:           r.status || 'Pending',
      quotation_date:   r.quotation_date,
      valid_until:      r.valid_until || r.quotation_date,
      validTill:        r.valid_until || r.quotation_date,
      payment_terms:    r.payment_terms || '15 Days',
      notes:            r.notes || '',
      items:            itemsString,
      detailedItems:    detailedItems,
      createdAt:        r.created_at,
    };
  });

  const normalizeOrders = (rows) => rows.map(r => {
    const orderNo = r.order_number || r.public_id || r.direct_order_no || `ADO-${r.id}`;
    const productsString = (r.items || []).map(item => item.product_name || 'Product').join(', ') || 'No products';
    const detailedItems = (r.items || []).map((item, idx) => ({
      id: item.id || idx + 1,
      productName: item.product_name || '',
      code: item.product_public_id || '',
      quantity: item.quantity || item.quantity_ordered || 0,
      unitPrice: item.price || item.unit_price || 0,
      discount: item.discount_percent || 0,
      tax: item.tax_rate || 18,
      replacementAvailableQty: item.replacement_available_qty || 0,
      replacement_available_qty: item.replacement_available_qty || 0
    }));

    return {
      ...r,
      id:               r.id,
      orderNo:          orderNo,
      public_id:        orderNo,
      customer_name:    r.customer_name || '',
      customerName:     r.customer_name || '',
      status:           r.status || 'Pending',
      order_stage:      r.status || 'Pending',
      order_source:     r.order_source || '',
      order_date:       r.order_date,
      createdAt:        r.created_at,
      products:         productsString,
      totalAmount:      r.grand_total || r.total_amount || 0,
      totalValue:       r.grand_total || r.total_amount || 0,
      detailedItems:    detailedItems,
      items:            detailedItems,
      replacements:     r.replacements || [],
      replacementStatus: r.replacement_status || null,
      activeReplacementExists: r.active_replacement_exists || false,
      remainingReplacementQty: r.remaining_replacement_qty || 0,
      canRequestReplacement: r.can_request_replacement || false
    };
  });

  // ── Lead handlers ─────────────────────────────────────────────────────
  const handleAddLeadClick = () => {
    navigate.push('/admin/new-lead');
  };

  const handleEditLeadClick = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    Swal.fire({
      title: 'Edit Lead',
      width: 600,
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;text-align:left">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">Company Name *</label>
              <input id="el-name" class="swal2-input" style="margin:4px 0 0" value="${lead.companyName}">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">Contact Person</label>
              <input id="el-contact" class="swal2-input" style="margin:4px 0 0" value="${lead.contactPerson || ''}">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">Phone</label>
              <input id="el-phone" class="swal2-input" style="margin:4px 0 0" value="${lead.phone || ''}">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">Email</label>
              <input id="el-email" class="swal2-input" style="margin:4px 0 0" value="${lead.email || ''}">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">Project Name</label>
              <input id="el-project" class="swal2-input" style="margin:4px 0 0" value="${lead.projectName || ''}">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">Group Name</label>
              <input id="el-group" class="swal2-input" style="margin:4px 0 0" value="${lead.groupName || ''}">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">City</label>
              <input id="el-city" class="swal2-input" style="margin:4px 0 0" value="${lead.address?.city || ''}">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#555">State</label>
              <input id="el-state" class="swal2-input" style="margin:4px 0 0" value="${lead.address?.state || ''}">
            </div>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#555">Remarks</label>
            <textarea id="el-rem" class="swal2-textarea" style="margin:4px 0 0">${lead.remarks || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      buttonsStyling: false,
      customClass: { confirmButton: 'swal-premium-confirm-btn', cancelButton: 'swal-premium-cancel-btn' },
      preConfirm: () => {
        const name = document.getElementById('el-name').value.trim();
        if (!name) { Swal.showValidationMessage('Company Name required'); return false; }
        return {
          customer_name:  name,
          contact_person: document.getElementById('el-contact').value,
          phone:          document.getElementById('el-phone').value,
          email:          document.getElementById('el-email').value,
          project_name:   document.getElementById('el-project').value,
          group_name:     document.getElementById('el-group').value,
          city:           document.getElementById('el-city').value,
          state_name:     document.getElementById('el-state').value,
          remarks:        document.getElementById('el-rem').value,
        };
      }
    }).then(async r => {
      if (!r.isConfirmed) return;
      const res = await fetch(`/api/admin-ops/leads/${leadId}`, { method: 'PUT', headers: AUTH(), body: JSON.stringify(r.value) });
      if (res.ok) { fetchAll(); }
      else { const e = await res.json(); Swal.fire('Error', e.error || 'Failed', 'error'); }
    });
  };

  const handleUpdateLeadStatus = async (leadId, status, reason) => {
    await fetch(`/api/admin-ops/leads/${leadId}`, {
      method: 'PUT', headers: AUTH(),
      body: JSON.stringify({ status, remarks: reason })
    });
    fetchAll();
  };

  const handleConvertToSample = (lead, sampleData) => {
    const product  = sampleData?.product  || lead.requirements || 'Sample';
    const quantity = sampleData?.quantity || 1;
    fetch('/api/admin-ops/samples', {
      method: 'POST', headers: AUTH(),
      body: JSON.stringify({ remarks: `${product} (qty: ${quantity})`, status: 'Requested', lead_id: lead.id })
    }).then(r => { if (r.ok) { fetchAll(); } });
  };

  const handleGenerateQuotationFromLead = (lead) => {
    const draft = {
      customer:      lead.companyName || '',
      company:       lead.companyName || '',
      contactPerson: lead.contactPerson || '',
      phone:         lead.phone || '',
      email:         lead.email || '',
      gstNumber:     lead.gstNumber || '',
      source:        'LEAD',
      sourceId:      lead.id,
      items:         [],
    };
    useERPStore.getState().setQuotationDraft(draft);
    navigate.push('/admin/new-quotation');
  };

  // ── Sample handlers ───────────────────────────────────────────────────
  const handleUpdateSampleStatus = async (sampleId, newStatus) => {
    await fetch(`/api/admin-ops/samples/${sampleId}`, {
      method: 'PUT', headers: AUTH(), body: JSON.stringify({ status: newStatus })
    });
    fetchAll();
  };

  // ── Quotation handler ─────────────────────────────────────────────────
  const handleCreateQuoteClick = () => {
    navigate.push('/admin/new-quotation');
  };


  const handleUpdateQuotationStatus = async (id, status) => {
    await fetch(`/api/admin-ops/quotations/${id}`, { method: 'PUT', headers: AUTH(), body: JSON.stringify({ status }) });
    fetchAll();
  };

  // ── Order handler ─────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (id, status) => {
    await fetch(`/api/admin-ops/direct-orders/${id}`, { method: 'PUT', headers: AUTH(), body: JSON.stringify({ status }) });
    fetchAll();
  };

  const handleMoveToQuotation = (sample) => {
    const customer = sample.customer_name || sample.company || '';
    let items = [];
    if (sample.products && Array.isArray(sample.products)) {
      items = sample.products.map((p, idx) => ({
        productId: p.id || p.productId || `PRD-${idx + 1}`,
        name: p.name || p.productName || '',
        description: p.description || p.productDetails || p.specs || '',
        qty: p.sampleQty || p.qty || p.quantity || 1,
        unit: p.unit || 'Units',
        rate: p.estimatedPrice || p.rate || p.price || p.unitPrice || 0,
        amount: (p.sampleQty || p.qty || p.quantity || 1) * (p.estimatedPrice || p.rate || p.price || p.unitPrice || 0)
      }));
    } else {
      items = [{
        productId: sample.productId || `PRD-1`,
        name: sample.product_name || sample.product || '',
        description: sample.remarks || '',
        qty: sample.quantity || sample.qty || 1,
        unit: sample.unit || 'Units',
        rate: sample.value || sample.rate || sample.price || sample.unitPrice || 0,
        amount: (sample.quantity || sample.qty || 1) * (sample.value || sample.rate || sample.price || sample.unitPrice || 0)
      }];
    }

    const draft = {
      customer,
      company: sample.company || sample.customer_name || '',
      contactPerson: sample.contact_person || '',
      items,
      source: 'SAMPLE',
      sourceId: sample.id,
      gstNumber: sample.gst_number || ''
    };

    useERPStore.getState().setQuotationDraft(draft);
    navigate.push('/admin/new-quotation');
  };

  const handleConvertToOrder = async (qtn) => {
    Swal.fire({
      title: 'Booking Admin Purchase Order...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
    try {
      const idempotency_key = `QTN-${qtn.id}-${user?.id || 'anon'}-${Date.now()}`;
      
      const body = {
        public_id: `ADO-${Date.now().toString().slice(-8)}`,
        customer_id: qtn.customer_id || null,
        customer_name: qtn.customer_name,
        total_tonnage: qtn.quantity || 1,
        discount_percent: qtn.discount || 0,
        gst_rate: qtn.tax || 18,
        idempotency_key,
        items: (qtn.items || []).map(item => ({
          product_id: item.productId || item.code || null,
          product_name: item.productName || item.name,
          quantity: item.quantity || item.qty || 1,
          price: item.unitPrice || item.rate || 0,
          discount_percent: item.discount || 0,
          gst_rate: item.tax || 18,
        })),
        source_quotation_ref: String(qtn.id),
      };

      const res = await fetch('/api/sales/orders', {
        method: 'POST',
        headers: AUTH(),
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to book order');
      }

      // Mark the quotation as converted on the backend
      await fetch(`/api/admin-ops/quotations/${qtn.id}`, {
        method: 'PUT',
        headers: AUTH(),
        body: JSON.stringify({ status: 'Converted' })
      });

      Swal.fire('Success', 'Successfully converted quotation to Admin Purchase Order.', 'success');
      fetchAll();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
        Loading…
      </div>
    );
  }

  // ── Route to correct view ─────────────────────────────────────────────
  switch (view) {
    case 'admin-leads':
      return (
        <LeadsView
          leads={leads}
          searchQuery={globalSearch}
          setSearchQuery={() => {}}
          onAddLeadClick={handleAddLeadClick}
          onEditLeadClick={handleEditLeadClick}
          onUpdateStatus={handleUpdateLeadStatus}
          onUpdateLead={(id, data) => handleUpdateLeadStatus(id, data.status || 'New', data.notes)}
          onAddFollowup={(id, text) => handleUpdateLeadStatus(id, 'Follow-up', text)}
          onConvertToSample={handleConvertToSample}
          onGenerateQuotation={handleGenerateQuotationFromLead}
        />
      );

    case 'admin-samples':
      return (
        <SamplesView
          samples={samples}
          onUpdateSampleStatus={handleUpdateSampleStatus}
          onUpdateSample={() => {}}
          onMoveToQuotation={handleMoveToQuotation}
          onCreateQuotationClick={handleCreateQuoteClick}
        />
      );

    case 'admin-quotations':
      return (
        <QuotationsView
          quotations={quotations}
          leads={leads}
          customers={[]}
          onCreateQuoteClick={handleCreateQuoteClick}
          onUpdateQuotationStatus={handleUpdateQuotationStatus}
          onUpdateQuotation={() => {}}
          onConvertToOrder={handleConvertToOrder}
          onSendPDF={() => {}}
          searchQuery={globalSearch}
        />
      );

    case 'admin-orders':
      return (
        <OrdersView
          orders={orders}
          leads={leads}
          customers={[]}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateOrder={() => {}}
          searchQuery={globalSearch}
        />
      );

    default:
      return null;
  }
}
