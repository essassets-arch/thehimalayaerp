'use client';

/**
 * SalesPortal — Thin route orchestrator for the Sales module.
 *
 * Responsibilities:
 *  ✅ Route → view mapping via useParams
 *  ✅ Wire domain hooks (useLeads, useSamples, useQuotations, useOrders)
 *  ✅ Pass handlers down to view components
 *
 * NOT responsible for:
 *  ❌ HTTP calls (delegated to services via hooks)
 *  ❌ Business logic (delegated to feature services)
 *  ❌ Local state beyond UI-only concerns (prefillQuotationData, deliveredOrders)
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import MyProfileView from '../../../shared/components/MyProfileView';
import { useERP, useERPStore, useSalesBackend } from '../../../shared/context/ERPContext.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { apiClient } from '../../../lib/apiClient.js';
import { backendFetch } from '../../../lib/backendFetch';

// Feature hooks (new FSD layer)
import { useLeads } from '../hooks/useLeads.js';
import { useSamples } from '../hooks/useSamples.js';
import { useQuotations } from '../hooks/useQuotations.js';
import { useReminders } from '../hooks/useReminders.js';
import { useOrders } from '../hooks/useOrders.js';

// UI view components (unchanged — still consumed from /components for now)
import DashboardView from '../../../components/DashboardView.jsx';
import EditSample from '../../../components/EditSample.jsx';
import CreateSample from '../../../components/CreateSample.jsx';
import LeadsView from '../../../components/LeadsView.jsx';
import CreateLead from '../../../components/CreateLead.jsx';
import SamplesView from '../../../components/SamplesView.jsx';
import QuotationsView from '../../../components/QuotationsView.jsx';
import CreateQuotation from '../../../components/CreateQuotation.jsx';
import OrdersView from '../../../components/OrdersView.jsx';
import PaymentsView from '../../../components/PaymentsView.jsx';
import PaymentFollowupERPView from '../../../components/PaymentFollowupERPView.jsx';
import PaymentHistoryView from '../../../components/PaymentHistoryView.jsx';
import CreatePayment from '../../../components/CreatePayment.jsx';
import CustomersView from '../../../components/CustomersView.jsx';
import ReportsView from '../../../components/ReportsView.jsx';
import SalesProductionStatusView from '../../../components/SalesProductionStatusView.jsx';
import DailyTaskView from '../../../components/DailyTaskView.jsx';
import CustomerComplaintManagement from '../../../components/CustomerComplaintManagement.jsx';
import CreateOrder from '../../../components/CreateOrder.jsx';
import O2PWorkflowBanner from '../../../shared/components/O2PWorkflowBanner';
import { useO2PWorkflow } from '../../../shared/hooks/useO2PWorkflow';

async function uploadAfterSalesEvidence(files = []) {
  const urls = [];
  for (const file of files) {
    const form = new FormData();
    form.append('file', file);
    form.append('category', 'attachments');
    const response = await fetch('/api/upload', { method: 'POST', body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Could not upload ${file.name}`);
    urls.push({ name: file.name, url: result.url, mime: result.mime, size: result.size });
  }
  return urls;
}

function EditLeadContainer({
  leadId,
  leads,
  updateLead,
  deleteLead,
  onCancel,
  basePath,
  navigate,
}) {
  const [fetchedLead, setFetchedLead] = useState(null);
  const [loading, setLoading] = useState(Boolean(leadId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!leadId) {
      setLoading(false);
      return;
    }

    async function fetchFullLead() {
      setLoading(true);
      setError(null);
      try {
        const { LeadRepositoryFactory } = await import('../../../services/leads/leadRepositoryFactory');
        const repo = LeadRepositoryFactory.getReadRepository();
        const res = await repo.getLead(leadId);
        const detail = res?.data || res;
        if (!cancelled) {
          if (detail && (detail.id || detail.leadNumber)) {
            setFetchedLead(detail);
          } else {
            throw new Error('Lead record not found');
          }
        }
      } catch (err) {
        console.error('Failed to fetch full lead details by UUID:', err);
        if (!cancelled) {
          setError(err?.message || 'Unable to load lead details from PostgreSQL database');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFullLead();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const fallbackFromList = leadId ? leads.find((l) => String(l.id ?? l.leadId) === String(leadId)) : null;
  const leadToEdit = fetchedLead || fallbackFromList;

  const handleUpdate = async (updatedData) => {
    const targetId = leadId || leadToEdit?.id;
    const res = await updateLead(targetId, updatedData);
    // Refetch updated lead directly from PostgreSQL post-save to ensure verified persistence
    if (targetId) {
      try {
        const { LeadRepositoryFactory } = await import('../../../services/leads/leadRepositoryFactory');
        const repo = LeadRepositoryFactory.getReadRepository();
        const refetched = await repo.getLead(targetId);
        if (refetched) {
          setFetchedLead(refetched?.data || refetched);
        }
      } catch (e) {
        console.warn('Post-save refetch failed:', e);
      }
    }
    if (navigate && navigate.push) {
      navigate.push(`${basePath || '/sales'}/leads`);
    }
    return res;
  };

  const handleDelete = async (id, reason) => {
    const res = await deleteLead(id, undefined, reason);
    if (navigate && navigate.push) {
      navigate.push(`${basePath || '/sales'}/leads`);
    }
    return res;
  };

  if (loading && !leadToEdit) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary, #64748b)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Loading lead details from database...</p>
      </div>
    );
  }

  if (error && !leadToEdit) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Unable to load lead</h3>
        <p style={{ marginBottom: '16px' }}>{error}</p>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            background: '#0ea5e9',
            color: '#ffffff',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Back to Leads List
        </button>
      </div>
    );
  }

  return (
    <div data-testid="sales-create-lead-page" className="sales-portal-view">
      <CreateLead
        key={leadToEdit ? `edit-${leadToEdit.id}` : 'new'}
        leads={leads}
        onAddLead={handleUpdate}
        onDeleteLead={handleDelete}
        onCancel={onCancel}
        editingLead={leadToEdit}
      />
    </div>
  );
}

export default function SalesPortal({ overrideView, overrideBasePath, mode }) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const pathSlug = pathname ? pathname.split('/').filter(Boolean) : [];

  let rawView = overrideView;
  if (!rawView) {
    if (params?.slug?.[0] === 'sales' || params?.slug?.[0] === 'supersales') {
      rawView = params?.slug?.[1] || tabParam || 'dashboard';
    } else {
      rawView = params?.slug?.[0] || tabParam || (pathSlug.length > 1 ? pathSlug[pathSlug.length - 1] : 'dashboard') || 'dashboard';
    }
  }
  if (rawView === 'sales' || rawView === 'supersales' || rawView === 'analytics') rawView = 'dashboard';
  let view = rawView;

  // Resilient leadId and sampleId resolution across all dynamic route formats
  let leadId = params?.slug?.[1] || searchParams?.get('leadId') || searchParams?.get('id');
  if (pathSlug.includes('edit-lead')) {
    const idx = pathSlug.indexOf('edit-lead');
    if (pathSlug[idx + 1]) leadId = pathSlug[idx + 1];
  } else if (params?.slug) {
    const slugArr = Array.isArray(params.slug) ? params.slug : [params.slug];
    const idx = slugArr.indexOf('edit-lead');
    if (idx !== -1 && slugArr[idx + 1]) leadId = slugArr[idx + 1];
  }

  let sampleId = params?.slug?.[1] || searchParams?.get('sampleId');
  if (pathSlug.includes('edit-sample')) {
    const idx = pathSlug.indexOf('edit-sample');
    if (pathSlug[idx + 1]) sampleId = pathSlug[idx + 1];
  }

  const location = { pathname: pathname || '', search: "" };
  const navigate = useRouter();

  const isSuperSalesPortal = overrideBasePath === '/supersales' || pathname?.startsWith('/supersales') || mode === 'SUPER_SALES';
  const isFinancePortal = pathname?.startsWith('/finance/sales');
  const basePath = overrideBasePath || (isSuperSalesPortal ? '/supersales' : (isFinancePortal ? '/finance/sales' : '/sales'));

  const currentView =
    (location.pathname.includes(`${basePath}/edit-lead/`) || location.pathname.includes('/sales/edit-lead/') || location.pathname.includes('/supersales/edit-lead/')
      ? 'edit-lead'
      : location.pathname.includes(`${basePath}/edit-sample/`) || location.pathname.includes('/sales/edit-sample/') || location.pathname.includes('/supersales/edit-sample/')
        ? 'edit-sample'
        : view);

  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const setGlobalSearch = useSearchStore(s => s.setGlobalSearch);

  // ── UI-only state ──────────────────────────────────────────────────────────
  const [prefillQuotationData, setPrefillQuotationData] = useState(null);

  useEffect(() => {
    if (isSuperSalesPortal && (currentView === 'profile' || pathname?.includes('/supersales/profile'))) {
      navigate.replace('/supersales/dashboard');
    }
  }, [isSuperSalesPortal, currentView, pathname, navigate]);

  // ── Domain hooks ───────────────────────────────────────────────────────────
  const {
    leads,
    addLead,
    generateQuotationFromLead,
    updateLeadStatus,
    addFollowup,
    convertToSample,
    editLead: updateLead,
    deleteLead,
  } = useLeads(showToast);

  const { samples, updateSampleStatus, updateSample, createReplacementSample } = useSamples(showToast);

  const { quotations, createQuotation, updateQuotation, confirmOrder, loadQuotations } = useQuotations(
    showToast,
    currentView === 'quotations' || currentView === 'create-quotation' || currentView === 'dashboard'
  );

  const { reminders, createReminder, updateReminder, completeReminder } = useReminders(showToast);

  const {
    orders: backendOrders,
    deliveredOrders,
    createOrder,
    updateFollowup,
    loadOrders,
    requestReturn,
    requestReplacement,
    raiseCustomerComplaint,
  } = useOrders(showToast, currentView);

  const orders = backendOrders;

  const { refreshSalesOrders, refreshSamples, loadLeads, loadCustomers, createSample } = useSalesBackend();

  useEffect(() => {
    if (currentView === 'samples' && refreshSamples) {
      void refreshSamples();
    }
    if (currentView === 'leads' && loadLeads) {
      void loadLeads();
    }
    if (currentView === 'customers' && loadCustomers) {
      void loadCustomers();
    }
    if ((currentView === 'quotations' || currentView === 'dashboard') && loadQuotations) {
      void loadQuotations();
    }
    // Load orders on orders view, dashboard, or daily-task
    if ((currentView === 'orders' || currentView === 'dashboard' || currentView === 'daily-task') && loadOrders) {
      void loadOrders();
    }
    // Load other modules on dashboard or daily-task view for dynamic metrics & tasks
    if (currentView === 'dashboard' || currentView === 'daily-task') {
      if (loadLeads) void loadLeads();
      if (refreshSamples) void refreshSamples();
      if (loadCustomers) void loadCustomers();
      if (loadQuotations) void loadQuotations();
    }
  }, [currentView, loadOrders, loadLeads, refreshSamples, loadCustomers, loadQuotations]);

  // ── O2P Workflow ────────────────────────────────────────────────────────────
  const o2p = useO2PWorkflow();

  const handleAddLead = async (data) => {
    const result = await addLead(data);
    if (result?.id || result?.leadId) {
      const newId = String(result.id || result.leadId);
      o2p?.advanceLead?.({ orderId: newId, actor: user?.name || 'Sales' });
    }
    return result;
  };

  const handleAddQuotation = async (data) => {
    const result = await createQuotation(data);
    if (result?.success) {
      if (result?.id || result?.data?.id) {
        o2p?.advanceLead?.({ orderId: String(result.id || result.data.id), actor: user?.name || 'Sales' });
      }
      setPrefillQuotationData(null);
      if (loadQuotations) await loadQuotations();
      navigate.push(`${basePath}/quotations`);
    }
    return result;
  };

  const handleConfirmOrder = async (quotationId, data) => {
    const result = await confirmOrder(quotationId, data);
    if (result?.orderId || result?.id) {
      const ordId = String(result.orderId || result.id);
      o2p?.setActiveOrder?.(ordId, 4);
      o2p?.confirmSalesOrder?.({ orderId: ordId, actor: user?.name || 'Sales' });
    }
    return result;
  };


  const { customers } = useSalesBackend();

  const payments = state.payments || [];

  // ── Quick navigation helpers ───────────────────────────────────────────────
  const handleActionClick = (_actionName, message) => showToast(message);

  // ── Quotation-specific handlers ────────────────────────────────────────────

  /** Move to quotation view, pre-seeding the draft from a sample. */
  const onMoveToQuotation = (sample) => {
    const matchedLead =
      (leads || []).find(
        (l) =>
          String(l.id) === String(sample.leadId) ||
          String(l.leadId) === String(sample.leadId) ||
          String(l.leadNumber) === String(sample.leadId) ||
          (l.companyName && sample.leadName && l.companyName.toLowerCase() === sample.leadName.toLowerCase()) ||
          (l.companyName && sample.customer && l.companyName.toLowerCase() === sample.customer.toLowerCase())
      ) ||
      sample.lead ||
      {};

    const customer =
      matchedLead.companyName ||
      matchedLead.customerName ||
      matchedLead.customer ||
      sample.leadName ||
      sample.customer ||
      sample.company ||
      '';

    let items = [];
    if (sample.products && Array.isArray(sample.products) && sample.products.length > 0) {
      items = sample.products.map((p, idx) => ({
        productId: p.id || p.productId || `PRD-${idx + 1}`,
        name: p.name || p.productName || p.product || '',
        description: p.description || p.productDetails || p.specs || '',
        qty: p.sampleQty || p.qty || p.quantity || 1,
        unit: p.unit || 'Units',
        rate: p.estimatedPrice || p.rate || p.price || p.unitPrice || 0,
        amount:
          (p.sampleQty || p.qty || p.quantity || 1) *
          (p.estimatedPrice || p.rate || p.price || p.unitPrice || 0),
      }));
    } else if (matchedLead.products && Array.isArray(matchedLead.products) && matchedLead.products.length > 0) {
      items = matchedLead.products.map((p, idx) => ({
        productId: p.id || p.productId || `PRD-${idx + 1}`,
        name: p.name || p.productName || p.product || '',
        description: p.description || p.productDetails || p.specs || '',
        qty: p.qty || p.quantity || 1,
        unit: p.unit || 'Units',
        rate: p.estimatedPrice || p.rate || p.price || p.unitPrice || 0,
        amount: (p.qty || p.quantity || 1) * (p.estimatedPrice || p.rate || p.price || p.unitPrice || 0),
      }));
    } else {
      items = [{
        productId: sample.productId || 'PRD-1',
        name: sample.product || sample.productName || 'Commercial Product',
        description: sample.description || sample.productDetails || sample.specs || '',
        qty: sample.quantity || sample.qty || 1,
        unit: sample.unit || 'Units',
        rate: sample.value || sample.rate || sample.price || sample.unitPrice || 0,
        amount:
          (sample.quantity || sample.qty || 1) *
          (sample.value || sample.rate || sample.price || sample.unitPrice || 0),
      }];
    }

    const draft = {
      customer,
      customerName: customer,
      leadId: matchedLead.id || sample.leadId || undefined,
      company: matchedLead.companyName || sample.company || sample.leadName || '',
      groupName: matchedLead.groupName || '',
      contactPerson: matchedLead.contactPerson || sample.contactPerson || '',
      phone: matchedLead.phone || matchedLead.mobile || sample.phone || '',
      email: matchedLead.email || sample.email || '',
      address: matchedLead.address || sample.address || '',
      gstNumber: matchedLead.gstNumber || matchedLead.gst || sample.gstNumber || '',
      gstName: matchedLead.gstName || customer,
      paymentTerms: matchedLead.paymentTerms || sample.paymentTerms || '15 Days',
      transportCharge: Number(sample.transportCost || matchedLead.transportCharge || 0),
      notes: matchedLead.remarks || matchedLead.notes || sample.customerFeedback || '',
      items,
      detailedItems: items,
      source: 'SAMPLE',
      sourceId: sample.id,
    };

    useERPStore.getState().setQuotationDraft(draft);
    setPrefillQuotationData({
      ...sample,
      ...matchedLead,
      customerName: customer,
      leadName: customer,
    });

    if (matchedLead.id) {
      navigate.push(`${basePath}/create-quotation?leadId=${matchedLead.id}`);
    } else {
      navigate.push(`${basePath}/create-quotation`);
    }
  };

  const onAddSampleClick = (sample) => {
    dispatch({
      type: 'ADD_QUOTATION_DRAFT',
      customerName: sample.leadName || '',
      product: sample.product || '',
      quantity: sample.quantity || 1,
      source: 'SAMPLE',
      sourceId: sample.id,
      gstNumber: sample.gstNumber || '',
    });
    setPrefillQuotationData(sample);
    navigate.push(`${basePath}/create-quotation`);
  };

  /** Create quotation; if a matching lead exists, advance its status to 'Quotation'. */
  const onAddQuotation = async (qData) => {
    const res = await createQuotation(qData);
    if (res?.success) {
      const matchedLead = leads.find(
        (l) =>
          (qData.leadId && (l.id === qData.leadId || l.leadId === qData.leadId)) ||
          (qData.sourceId && l.id === qData.sourceId) ||
          l.companyName?.toLowerCase() === qData.customerName?.trim().toLowerCase() ||
          l.projectName?.toLowerCase() === qData.customerName?.trim().toLowerCase()
      );
      if (matchedLead) {
        await updateLead(matchedLead.id, { status: 'Quotation' }).catch(() => { });
      }
      if (loadLeads) {
        await loadLeads().catch(() => { });
      }
      setPrefillQuotationData(null);
      navigate.push(`${basePath}/quotations`);
    }
  };

  /** Convert quotation → order, then navigate to orders view. */
  const onConvertToOrder = async (qtn) => {
    showToast('Sales: Converting quotation to order.');
    const res = await confirmOrder(qtn);
    if (res?.success) {
      showToast('🎉 Order created from quotation!');
      if (refreshSalesOrders) {
        await refreshSalesOrders().catch(() => { });
      }
      navigate.push(`${basePath}/orders`);
    }
  };

  /** Create a direct order, then navigate to orders view. */
  const onCreateOrder = async (orderData) => {
    const res = await createOrder(orderData);
    if (res?.success) {
      showToast('🎉 Order created successfully!');
      navigate.push(`${basePath}/orders`);
    }
  };

  // ── Payment helpers (inline — payment module not yet extracted) ─────────────

  const onReceivePayment = async (invoiceId, amount, date, mode, ref, notes) => {
    const inv = payments.find((p) => p.id === invoiceId);
    if (!inv) return;

    const matchedOrder = orders.find((o) => o.orderNo === inv.orderNo);
    const orderId = matchedOrder ? matchedOrder.dbId || matchedOrder.id : null;

    if (!orderId) {
      Swal.fire({ icon: 'error', title: 'Order ID Not Found', text: 'Could not resolve the order reference for this payment.' });
      return;
    }

    showToast('Sales: Recording payment and routing to Finance review…');
    try {
      const res = await apiClient.post('/workflow/transition', {
        entity: 'sales_order',
        entityId: orderId,
        transitionName: 'RECORD_PAYMENT',
        payload: {
          amount: Number(amount),
          utr_number: ref || `UTR-${Date.now()}`,
          bank_name: mode || 'Direct Transfer',
          payment_date: date || new Date().toISOString().split('T')[0],
        },
        notes: notes || 'Payment receipt logged by Sales.',
      });
      if (res.success) {
        await syncData();
        showToast('Payment recorded successfully and queued for Finance verification.');
        navigate.push(`${basePath}/payment-followup`);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Payment Recording Failed', text: err.message });
    }
  };

  const handleSalesConfirmPayment = async (order) => {
    const targetId = order?.id || order?.orderNo || order?.orderNumber;
    if (targetId) {
      navigate.push(`/sales/payment-followup?orderId=${targetId}`);
    } else {
      navigate.push('/sales/payment-followup');
    }
  };

  const uploadReplacementFiles = async (files) => {
    const token = localStorage.getItem('token') || localStorage.getItem('himalaya_token');
    const companyId = localStorage.getItem('companyId') || user?.company_id;
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/uploads/replacements', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(companyId ? { 'X-Company-Id': String(companyId) } : {})
        },
        body: formData
      });

      const body = await res.json();
      if (!res.ok || body.success === false) {
        throw new Error(body.error || body.message || `Failed to upload ${file.name}`);
      }
      uploaded.push(body.data);
    }

    return uploaded;
  };

  const handleAskReplacement = async (order) => {
    const escapeHtml = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const items = Array.isArray(order.items) && order.items.length
      ? order.items
      : Array.isArray(order.detailedItems)
        ? order.detailedItems
        : [];
    const realItems = items.filter(item => item.id || item.order_item_id || item.orderItemId);

    if (!order.id || realItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Replacement Unavailable',
        text: 'This order does not have item-level details loaded yet. Please refresh and try again.'
      });
      return;
    }

    const itemOptions = realItems.map((item, index) => {
      const itemId = item.id || item.order_item_id || item.orderItemId;
      const productName = item.product_name || item.productName || order.products || `Item ${index + 1}`;
      const deliveredQty = Number(item.deliveredQuantity ?? item.quantity_dispatched ?? item.delivered_qty ?? item.quantity ?? item.orderedQuantity ?? item.quantity_ordered ?? 0) || 0;
      const alreadyApproved = Number(item.already_replaced_qty ?? item.alreadyReplacedQty ?? 0) || 0;
      const availableQty = item.replacement_available_qty !== undefined || item.replacementAvailableQty !== undefined
        ? Number(item.replacement_available_qty ?? item.replacementAvailableQty ?? 0) || 0
        : Math.max(0, deliveredQty - alreadyApproved);
      return `<option value="${itemId}" data-delivered="${deliveredQty}" data-approved="${alreadyApproved}" data-available="${availableQty}" data-product="${escapeHtml(productName)}">${escapeHtml(productName)} - Available ${availableQty}</option>`;
    }).join('');

    const { value } = await Swal.fire({
      title: 'Replacement Request',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:12px; font-size:13px;">
          <div style="display:grid; grid-template-columns:110px 1fr; gap:8px;">
            <strong>Order</strong><span>${order.orderNo || order.order_number}</span>
            <strong>Customer</strong><span>${order.customerName || order.customer?.name || 'N/A'}</span>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px;">Product *</label>
            <select id="replacement-item" style="width:100%; height:38px; border:1px solid var(--color-border); border-radius:8px; padding:0 10px;">
              ${itemOptions}
            </select>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
            <div style="background:#F5FAFE; border:1px solid #DCE5F0; border-radius:8px; padding:10px;">
              <div style="font-size:11px; font-weight:800; color:#5E6B82; text-transform:uppercase;">Delivered Qty</div>
              <div id="replacement-delivered" style="font-size:18px; font-weight:900; color:#24345C;">0</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px;">
              <div style="font-size:11px; font-weight:800; color:#1e40af; text-transform:uppercase;">Already Approved</div>
              <div id="replacement-approved" style="font-size:18px; font-weight:900; color:#1e3a8a;">0</div>
            </div>
            <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:10px;">
              <div style="font-size:11px; font-weight:800; color:#9a3412; text-transform:uppercase;">Available</div>
              <div id="replacement-available" style="font-size:18px; font-weight:900; color:#9a3412;">0</div>
            </div>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px;">Replacement Qty *</label>
            <input id="replacement-qty" type="number" min="0.01" step="0.01" class="swal2-input" style="margin:0; width:100%;" />
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px;">Reason *</label>
            <textarea id="replacement-reason" placeholder="Broken during unloading" style="width:100%; min-height:82px; border:1px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical;"></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px;">Description *</label>
            <textarea id="replacement-description" placeholder="Describe the issue and expected replacement" style="width:100%; min-height:72px; border:1px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical;"></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px;">Remarks</label>
            <textarea id="replacement-remarks" placeholder="Additional remarks for Plant Head" style="width:100%; min-height:62px; border:1px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical;"></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px;">Upload Images</label>
            <label for="replacement-files" style="display:flex;align-items:center;gap:12px;padding:14px;border:1.5px dashed #93c5fd;border-radius:10px;background:#f8fbff;cursor:pointer;">
              <span style="display:grid;place-items:center;width:38px;height:38px;border-radius:9px;background:#e0efff;color:#2563eb;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>
              </span>
              <span><strong style="display:block;color:#1e3a5f;">Choose delivery evidence</strong><small id="replacement-file-name" style="color:#64748b;">JPG, PNG or WebP · maximum 5 MB each</small></span>
            </label>
            <input id="replacement-files" type="file" multiple accept="image/jpeg,image/png,image/webp" style="display:none;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn',
      },
      buttonsStyling: false,
      focusConfirm: false,
      didOpen: () => {
        const select = document.getElementById('replacement-item');
        const qtyInput = document.getElementById('replacement-qty');
        const syncSelectedItem = () => {
          const selected = select.options[select.selectedIndex];
          const deliveredQty = Number(selected?.dataset.delivered || 0);
          const alreadyApproved = Number(selected?.dataset.approved || 0);
          const availableQty = Number(selected?.dataset.available || 0);
          document.getElementById('replacement-delivered').textContent = deliveredQty;
          document.getElementById('replacement-approved').textContent = alreadyApproved;
          document.getElementById('replacement-available').textContent = availableQty;
          qtyInput.max = String(availableQty);
          qtyInput.value = availableQty > 0 ? Math.min(1, availableQty) : '';
          qtyInput.placeholder = availableQty > 0 ? `Max ${availableQty}` : 'No quantity available';
        };
        select.addEventListener('change', syncSelectedItem);
        document.getElementById('replacement-files')?.addEventListener('change', (event) => {
          const names = Array.from(event.target.files || []).map((file) => file.name);
          document.getElementById('replacement-file-name').textContent = names.length ? names.join(', ') : 'JPG, PNG or WebP · maximum 5 MB each';
        });
        syncSelectedItem();
      },
      preConfirm: () => {
        const select = document.getElementById('replacement-item');
        const selected = select.options[select.selectedIndex];
        const qty = Number(document.getElementById('replacement-qty').value);
        const reason = document.getElementById('replacement-reason').value.trim();
        const description = document.getElementById('replacement-description').value.trim();
        const remarks = document.getElementById('replacement-remarks').value.trim();
        const availableQty = Number(selected.dataset.available || 0);
        const files = Array.from(document.getElementById('replacement-files').files || []);

        if (!select.value || !qty || qty <= 0 || !reason || !description) {
          Swal.showValidationMessage('Product, quantity, reason, and description are required.');
          return false;
        }
        if (availableQty <= 0) {
          Swal.showValidationMessage('This product has no replacement quantity available.');
          return false;
        }
        if (qty > availableQty) {
          Swal.showValidationMessage(`Replacement quantity cannot exceed available quantity (${availableQty}).`);
          return false;
        }

        return {
          orderItemId: String(select.value),
          requestedQty: qty,
          reason,
          description,
          remarks,
          files
        };
      }
    });

    if (!value) return;

    try {
      showToast('Submitting replacement request...');
      const evidence = await uploadAfterSalesEvidence(value.files);
      const res = await requestReplacement(order.id || order.orderNo, {
        reasonCode: 'DAMAGE_IN_TRANSIT',
        customerRemarks: value.description,
        internalRemarks: value.remarks || value.reason,
        evidence: { files: evidence },
        items: [{
          salesOrderItemId: String(value.orderItemId),
          requestedQuantity: value.requestedQty,
          reason: value.reason
        }]
      });
      if (!res?.success) throw new Error(res?.error || 'The replacement request was not saved.');

      Swal.fire({
        icon: 'success',
        title: 'Replacement Requested',
        text: 'The request was submitted successfully and is now visible to Plant Head for approval.',
        confirmButtonText: 'OK'
      });
      if (typeof loadOrders === 'function') await loadOrders();
      else await syncData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Replacement Request Failed', text: err.message });
    }
  };

  const handleAskReturn = async (order) => {
    const escapeHtml = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const items = Array.isArray(order.items) && order.items.length
      ? order.items
      : Array.isArray(order.detailedItems)
        ? order.detailedItems
        : [];
    const realItems = items.filter(item => item.id || item.order_item_id || item.orderItemId || item.product_name || item.productName);

    const itemOptions = realItems.length > 0 ? realItems.map((item, index) => {
      const itemId = item.id || item.order_item_id || item.orderItemId || index + 1;
      const productName = item.product_name || item.productName || order.products || `Item ${index + 1}`;
      const deliveredQty = Number(item.deliveredQuantity ?? item.quantity_dispatched ?? item.delivered_qty ?? item.quantity ?? item.orderedQuantity ?? item.quantity_ordered ?? 0) || 0;
      const availableQty = item.availableForReturn !== undefined ? Number(item.availableForReturn) : deliveredQty;
      return `<option value="${itemId}" data-available="${availableQty}" data-product="${escapeHtml(productName)}">${escapeHtml(productName)} (Available: ${availableQty})</option>`;
    }).join('') : `<option value="all" data-available="${order.quantity || order.totalQty || 10}" data-product="${escapeHtml(order.products || 'Overall Order')}">${escapeHtml(order.products || 'Overall Order')}</option>`;

    const { value } = await Swal.fire({
      title: 'Request Order Return / Take Back',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:12px; font-size:13px;">
          <div style="display:grid; grid-template-columns:110px 1fr; gap:8px;">
            <strong>Order No:</strong><span>${order.orderNo || order.order_number || order.id}</span>
            <strong>Customer:</strong><span>${order.customerName || order.customer?.name || 'N/A'}</span>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Select Item to Return *</label>
            <select id="return-item" style="width:100%; height:38px; border:1.5px solid var(--color-border); border-radius:8px; padding:0 10px; font-size:13px;">
              ${itemOptions}
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Return Quantity *</label>
              <input id="return-qty" type="number" min="0.01" step="0.01" placeholder="Enter Qty" class="swal2-input" style="margin:0; width:100%; height:38px; font-size:13px;" />
            </div>
            <div>
              <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Item Condition *</label>
              <select id="return-condition" style="width:100%; height:38px; border:1.5px solid var(--color-border); border-radius:8px; padding:0 10px; font-size:13px;">
                <option value="Damaged in Transit">Damaged in Transit</option>
                <option value="Defective Material">Defective Material</option>
                <option value="Excess / Unused">Excess / Unused</option>
                <option value="Incorrect Specification">Incorrect Specification</option>
              </select>
            </div>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Reason for Return *</label>
            <textarea id="return-reason" placeholder="Explain details regarding reverse pickup requirement..." style="width:100%; min-height:75px; border:1.5px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical; font-size:13px; font-family:inherit;"></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Description *</label>
            <textarea id="return-description" placeholder="Describe the product condition and return requirement" style="width:100%; min-height:70px; border:1.5px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical; font-size:13px; font-family:inherit;"></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Remarks</label>
            <textarea id="return-remarks" placeholder="Additional remarks for Plant Head" style="width:100%; min-height:62px; border:1.5px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical; font-size:13px; font-family:inherit;"></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Upload Images</label>
            <label for="return-files" style="display:flex;align-items:center;gap:12px;padding:14px;border:1.5px dashed #93c5fd;border-radius:10px;background:#f8fbff;cursor:pointer;">
              <span style="display:grid;place-items:center;width:38px;height:38px;border-radius:9px;background:#e0efff;color:#2563eb;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>
              </span>
              <span><strong style="display:block;color:#1e3a5f;">Choose return evidence</strong><small id="return-file-name" style="color:#64748b;">JPG, PNG or WebP · maximum 5 MB each</small></span>
            </label>
            <input id="return-files" type="file" multiple accept="image/jpeg,image/png,image/webp" style="display:none;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit Return Request',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn',
      },
      buttonsStyling: false,
      focusConfirm: false,
      didOpen: () => {
        const select = document.getElementById('return-item');
        const qtyInput = document.getElementById('return-qty');
        const syncSelectedItem = () => {
          const selected = select.options[select.selectedIndex];
          const availableQty = Number(selected?.dataset.available || 0);
          if (availableQty > 0) {
            qtyInput.max = String(availableQty);
            qtyInput.value = Math.min(1, availableQty);
            qtyInput.placeholder = `Max ${availableQty}`;
            qtyInput.disabled = false;
          } else {
            qtyInput.value = '0';
            qtyInput.max = '0';
            qtyInput.placeholder = 'None available';
            qtyInput.disabled = true;
          }
        };
        select.addEventListener('change', syncSelectedItem);
        document.getElementById('return-files')?.addEventListener('change', (event) => {
          const names = Array.from(event.target.files || []).map((file) => file.name);
          document.getElementById('return-file-name').textContent = names.length ? names.join(', ') : 'JPG, PNG or WebP · maximum 5 MB each';
        });
        syncSelectedItem();
      },
      preConfirm: () => {
        const select = document.getElementById('return-item');
        const qty = Number(document.getElementById('return-qty').value);
        const condition = document.getElementById('return-condition').value;
        const reason = document.getElementById('return-reason').value.trim();
        const description = document.getElementById('return-description').value.trim();
        const remarks = document.getElementById('return-remarks').value.trim();
        const files = Array.from(document.getElementById('return-files').files || []);

        if (!qty || qty <= 0 || !reason || !description) {
          Swal.showValidationMessage('Return quantity, reason, and description are required.');
          return false;
        }

        const selected = select.options[select.selectedIndex];
        const maxReturnable = Number(selected?.dataset.available || 0);
        if (qty > maxReturnable) {
          Swal.showValidationMessage(`Maximum returnable quantity is ${maxReturnable}.`);
          return false;
        }

        return {
          orderItemId: select.value,
          requestedQty: qty,
          condition,
          reason,
          description,
          remarks,
          files
        };
      }
    });

    if (!value) return;

    try {
      showToast('Submitting return request...');
      const evidence = await uploadAfterSalesEvidence(value.files);
      const itemsToReturn = value.orderItemId === 'all'
        ? realItems.map(item => ({
          salesOrderItemId: String(item.id || item.order_item_id || item.orderItemId),
          requestedQuantity: value.requestedQty,
          reason: value.reason,
          conditionReported: value.condition,
          evidence: { files: evidence }
        }))
        : [{
          salesOrderItemId: String(value.orderItemId),
          requestedQuantity: value.requestedQty,
          reason: value.reason,
          conditionReported: value.condition,
          evidence: { files: evidence }
        }];

      const res = await requestReturn(order.id || order.orderNo, {
        reasonCode: 'DAMAGE_IN_TRANSIT',
        customerRemarks: value.description,
        internalRemarks: value.remarks || value.reason,
        resolutionType: 'CREDIT_NOTE',
        items: itemsToReturn
      });
      if (!res?.success) throw new Error(res?.error || 'The return request was not saved.');

      Swal.fire({
        icon: 'success',
        title: 'Return Requested',
        text: 'The request was submitted successfully and is now visible to Plant Head for approval.',
        confirmButtonText: 'OK'
      });
      if (typeof loadOrders === 'function') await loadOrders();
      else await syncData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Return Request Failed', text: err.message });
    }
  };

  const parseOrderFollowup = (notesJson) => {
    if (!notesJson) return { text: '', nextDate: null };
    try {
      const parsed = JSON.parse(notesJson);
      if (parsed && (parsed.text !== undefined || parsed.nextDate !== undefined)) {
        return { text: parsed.text || '', nextDate: parsed.nextDate || null };
      }
    } catch { /* treat as plain text */ }
    return { text: notesJson, nextDate: null };
  };

  const handleUpdateFollowup = async (order) => {
    const followup = parseOrderFollowup(order.notes);
    const { value: formValues } = await Swal.fire({
      title: 'Payment Follow-up & Reminder',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 14px;">
          <div style="margin-bottom: 12px;">
            <label for="swal-followup-text" style="display:block; font-weight:700; margin-bottom:6px; font-size:13px; color:#475569;">Follow-up Conversation Note:</label>
            <textarea id="swal-followup-text" style="width: 100%; box-sizing: border-box; margin: 0; min-height: 80px; padding: 10px; border: 1.5px solid var(--color-border); border-radius: 8px; font-size: 13.5px; font-family: inherit;" placeholder="e.g. Spoke to accountant, payment scheduled for Tuesday...">${followup.text || ''}</textarea>
          </div>
          <div style="margin-bottom: 4px;">
            <label for="swal-reminder-date" style="display:block; font-weight:700; margin-bottom:6px; font-size:13px; color:#475569;">Next Reminder Date (Optional):</label>
            <input type="date" id="swal-reminder-date" style="width: 100%; box-sizing: border-box; margin: 0; height: 40px; padding: 0 10px; border: 1.5px solid var(--color-border); border-radius: 8px; font-size: 13.5px; font-family: inherit;" value="${followup.nextDate || ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => ({
        text: document.getElementById('swal-followup-text').value,
        nextDate: document.getElementById('swal-reminder-date').value || null,
      }),
      showCancelButton: true,
      confirmButtonText: 'Save Details',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn',
      },
      buttonsStyling: false,
    });

    if (formValues) {
      showToast('Saving follow-up details…');
      const res = await updateFollowup(order.id, formValues.text, formValues.nextDate);
      if (!res?.success) {
        // Error already shown by hook
      }
    }
  };

  const onSendReminder = (invoiceId) => {
    const inv = payments.find((p) => p.id === invoiceId);
    if (inv) {
      const outstandingVal = inv.totalAmount - inv.paidAmount;
      const fmt = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(2)} L` : `₹${Math.round(v).toLocaleString('en-IN')}`);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now() + Math.random(),
          title: 'Payment Reminder Sent',
          message: `Reminder: Balance of ${fmt(outstandingVal)} outstanding for ${inv.customerName} (Invoice #${inv.invoiceNo}).`,
          department: 'Sales',
          priority: 'High',
          date: new Date().toISOString().split('T')[0],
          read: false,
          referenceId: inv.orderNo,
        },
      });
    }
    showToast(`Receivable reminder email sent for Invoice ID ${invoiceId}`);
  };

  const onSendPDF = (qId) => showToast(`PDF invoice sent for Quotation #${qId}`);

  // ── Route → View mapping ───────────────────────────────────────────────────

  switch (currentView) {
    case 'profile':
      if (isSuperSalesPortal) {
        return null;
      }
      return (
        <div data-testid="sales-profile-page" className="sales-portal-view">
          <MyProfileView />
        </div>
      );

    case 'daily-task':
      return (
        <DailyTaskView
          basePath={basePath}
          isSuperSalesPortal={isSuperSalesPortal}
          state={{ ...state, leads, samples, quotations, orders, customers, reminders }}
          dispatch={dispatch}
          navigate={navigate}
          showToast={showToast}
          createReminder={createReminder}
          completeReminder={completeReminder}
          updateReminder={updateReminder}
          module={isSuperSalesPortal ? 'SuperSales' : 'Sales'}
        />
      );

    case 'dashboard':
      return (
        <div data-testid="sales-dashboard-page" className="sales-portal-view">
          <DashboardView state={{ ...state, reminders }} dispatch={dispatch} navigate={navigate} onQuickAction={handleActionClick} leads={leads} samples={samples} quotations={quotations} orders={orders} payments={payments} customers={customers} reminders={reminders} basePath={basePath} />
        </div>
      );

    case 'leads':
      return (
        <div data-testid="sales-leads-page" className="sales-portal-view">
          <O2PWorkflowBanner accentColor="#3b82f6" />
          <LeadsView
            leads={leads}
            reminders={reminders}
            samples={samples}
            quotations={quotations}
            orders={orders}
            onAddLeadClick={() => navigate.push(`${basePath}/create-lead`)}
            onEditLeadClick={(idOrLead) => {
              const targetId = typeof idOrLead === 'object' ? (idOrLead?.id || idOrLead?.leadId) : idOrLead;
              navigate.push(`${basePath}/edit-lead/${targetId}`);
            }}
            onConvertToSample={convertToSample}
            onGenerateQuotation={generateQuotationFromLead}
            onUpdateStatus={updateLeadStatus}
            onUpdateLead={updateLead}
            onAddFollowup={addFollowup}
            onDeleteLead={deleteLead}
            onSaveReminder={createReminder}
            onUpdateReminder={updateReminder}
            onCompleteReminder={completeReminder}
            searchQuery={globalSearch}
          />
        </div>
      );

    case 'create-lead': {
      return (
        <div data-testid="sales-create-lead-page" className="sales-portal-view">
          <CreateLead
            key="new"
            leads={leads}
            onAddLead={addLead}
            onGenerateQuotation={generateQuotationFromLead}
            onDeleteLead={deleteLead}
            onCancel={() => navigate.push(`${basePath}/leads`)}
          />
        </div>
      );
    }

    case 'edit-lead': {
      return (
        <EditLeadContainer
          leadId={leadId}
          leads={leads}
          updateLead={updateLead}
          deleteLead={deleteLead}
          onCancel={() => navigate.push(`${basePath}/leads`)}
          basePath={basePath}
          navigate={navigate}
        />
      );
    }

    case 'create-sample': {
      let leadIdFromUrl = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        leadIdFromUrl = urlParams.get('leadId');
      }
      return (
        <CreateSample
          leads={leads}
          defaultLeadId={leadIdFromUrl}
          onAddSample={async (data) => {
            const res = await createSample(data);
            await refreshSamples();
            navigate.push(`${basePath}/samples`);
            return { success: true };
          }}
          onCancel={() => navigate.push(`${basePath}/leads`)}
        />
      );
    }

    case 'edit-sample': {
      const sampleToEdit = sampleId ? samples.find((s) => s.id === Number(sampleId)) : null;
      return (
        <EditSample
          key={sampleToEdit ? `edit-${sampleToEdit.id}` : 'new'}
          sample={sampleToEdit}
          onSave={(updatedData) => {
            updateSample(sampleToEdit.id, updatedData);
            navigate.push(`${basePath}/samples`);
          }}
          onCancel={() => navigate.push(`${basePath}/samples`)}
        />
      );
    }

    case 'samples':
      return (
        <div data-testid="sales-samples-page" className="sales-portal-view">
          <SamplesView
            samples={samples}
            onUpdateSampleStatus={updateSampleStatus}
            onUpdateSample={updateSample}
            onMoveToQuotation={onMoveToQuotation}
            onCreateReplacementSample={createReplacementSample}
            reminders={reminders}
            onSaveReminder={createReminder}
            onUpdateReminder={updateReminder}
            onCompleteReminder={completeReminder}
          />
        </div>
      );

    case 'quotations':
      return (
        <div data-testid="sales-quotations-page" className="sales-portal-view">
          <O2PWorkflowBanner accentColor="#8b5cf6" />
          <QuotationsView
            quotations={quotations}
            leads={leads}
            customers={customers}
            reminders={reminders}
            isSuperSales={isSuperSalesPortal}
            basePath={basePath}
            onCreateQuoteClick={() => {
              useERPStore.getState().clearQuotationDraft();
              navigate.push(`${basePath}/create-quotation`);
            }}
            onCreateLead={() => navigate.push(`${basePath}/create-lead`)}
            onUpdateQuotationStatus={(qId, status) => updateQuotation(qId, { status })}
            onUpdateQuotation={(qId, data) => updateQuotation(qId, data)}
            onConvertToOrder={onConvertToOrder}
            onSendPDF={onSendPDF}
            onSaveReminder={createReminder}
            onUpdateReminder={updateReminder}
            onCompleteReminder={completeReminder}
            prefillData={prefillQuotationData}
            clearPrefill={() => setPrefillQuotationData(null)}
            searchQuery={globalSearch}
          />
        </div>
      );

    case 'create-quotation':
      return (
        <div data-testid="sales-create-quotation-page" className="sales-portal-view">
          <CreateQuotation
            key={prefillQuotationData?.id || 'new'}
            leads={leads}
            customers={customers}
            prefilledCustomer={prefillQuotationData?.leadName || ''}
            prefilledProduct={prefillQuotationData?.product || prefillQuotationData?.productName || ''}
            prefilledQuantity={prefillQuotationData?.quantity || 1}
            isSuperSales={isSuperSalesPortal}
            basePath={basePath}
            mode={isSuperSalesPortal ? 'SUPER_SALES' : mode}
            maxPaymentTermDays={isSuperSalesPortal || user?.role === 'SUPER_SALES' || (user?.role && String(user.role).startsWith('SuperSales')) ? 90 : 20}
            onAddQuotation={handleAddQuotation}
            onCreateLead={() => navigate.push(`${basePath}/create-lead`)}
            onCancel={() => {
              setPrefillQuotationData(null);
              navigate.push(`${basePath}/quotations`);
            }}
          />
        </div>
      );

    case 'create-order':
      return (
        <CreateOrder
          customers={customers}
          leads={leads}
          onCreateOrder={onCreateOrder}
          onCancel={() => navigate.push('/sales/orders')}
        />
      );

    case 'orders': {
      const onUpdateOrderStatus = async (orderId, status) => {
        // Resolve the real order ID
        const matchedOrder = orders.find((o) => o.orderNo === orderId || o.id === orderId || o.orderNumber === orderId);
        const orderDbId = matchedOrder ? matchedOrder.id || matchedOrder.dbId : orderId;
        const encodedId = encodeURIComponent(String(orderDbId || ''));

        if (status === 'SEND_TO_PLANT_HEAD_DIRECT' || status === 'SEND_TO_PLANT' || status === 'PLANT_PENDING') {
          showToast('Sending order to Plant Head…');
          try {
            // Confirm first if required
            await backendFetch(`/api/backend/sales/orders/${encodedId}/confirm`, {
              method: 'POST',
              body: { action: 'CONFIRM', orderId: orderDbId, id: orderDbId, actor: user?.name || 'Sales' },
            }).catch(() => null);

            await backendFetch(`/api/backend/sales/orders/${encodedId}/send-to-plant-head`, {
              method: 'POST',
              body: { action: 'SEND_TO_PLANT', orderId: orderDbId, id: orderDbId, actor: user?.name || 'Sales' },
            });

            dispatch({
              type: 'UPDATE_ORDER_STATUS',
              payload: {
                orderNo: orderId,
                id: orderDbId,
                status: 'PLANT_PENDING',
                workflowStatus: 'PLANT_PENDING',
                salesStatus: 'Confirmed',
                currentDepartment: 'Plant Head',
                overallStage: 'Planning'
              }
            });
            showToast('✅ Order sent to Plant Head!');
            await loadOrders();
            await syncData();
            return true;
          } catch (directErr) {
            try {
              await backendFetch(`/api/backend/sales/orders/${encodedId}/action`, {
                method: 'POST',
                body: { action: 'SEND_TO_PLANT', orderId: orderDbId, id: orderDbId, actor: user?.name || 'Sales' },
              });
              showToast('✅ Order sent to Plant Head!');
              await loadOrders();
              await syncData();
              return true;
            } catch (err) {
              Swal.fire({
                icon: 'error',
                title: 'Unable to Send Order',
                text: err?.message || directErr?.message || 'Unable to send order to Plant Head.',
              });
              return false;
            }
          }
        }

        if (['SUBMIT', 'CONFIRM', 'ORDER_CONFIRMED'].includes(status)) {
          try {
            await backendFetch(`/api/backend/sales/orders/${encodedId}/confirm`, {
              method: 'POST',
              body: { action: 'CONFIRM', orderId: orderDbId, id: orderDbId, actor: user?.name || 'Sales' },
            }).catch(async () => {
              await backendFetch(`/api/backend/sales/orders/${encodedId}/action`, {
                method: 'POST',
                body: { action: 'CONFIRM', orderId: orderDbId, id: orderDbId, actor: user?.name || 'Sales' },
              });
            });
            showToast('Order confirmed.');
            await loadOrders();
            await syncData();
            return true;
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Order Action Failed',
              text: err?.message || 'Unable to update the order.',
            });
            return false;
          }
        }

        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: {
            id: orderDbId,
            orderNo: matchedOrder?.orderNo || orderId,
            status
          }
        });
        showToast(`Order status updated to ${status}`);
      };

      return (
        <div data-testid="sales-orders-page" className="sales-portal-view">
          <O2PWorkflowBanner accentColor="#a855f7" />
          <OrdersView
            orders={orders}
            leads={leads}
            customers={customers}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onUpdateOrder={(id, updatedData) => {
              dispatch({ type: 'UPDATE_ORDER', payload: { orderNo: id, ...updatedData } });
              showToast('Order details updated successfully.');
            }}
            onUpdateDispatchStatus={(id, status) => {
              dispatch({ type: 'UPDATE_ORDER', payload: { orderNo: id, dispatchStatus: status } });
              showToast(`Logistics status set to ${status}`);
            }}
            onAskReplacement={handleAskReplacement}
            onAskReturn={handleAskReturn}
            onConfirmPayment={handleSalesConfirmPayment}
            searchQuery={globalSearch}
            setSearchQuery={setGlobalSearch}
            reminders={reminders}
            onSaveReminder={createReminder}
            onUpdateReminder={updateReminder}
            onCompleteReminder={completeReminder}
          />
        </div>
      );
    }

    case 'production-status':
      return <SalesProductionStatusView orders={orders} searchQuery={globalSearch} />;

    case 'payment-followup': {
      return (
        <div data-testid="sales-payment-followup-page" className="sales-portal-view">
          <O2PWorkflowBanner accentColor="#0ea5e9" />
          <PaymentFollowupERPView
            orders={orders}
            reminders={reminders}
            onSaveReminder={createReminder}
            onUpdateReminder={updateReminder}
            onCompleteReminder={completeReminder}
          />
        </div>
      );
    }

    case 'payment-history': {
      return (
        <div data-testid="sales-payment-history-page" className="sales-portal-view">
          <O2PWorkflowBanner accentColor="#10b981" />
          <PaymentHistoryView
            orders={orders}
            payments={payments}
            searchQuery={globalSearch}
            setSearchQuery={setGlobalSearch}
          />
        </div>
      );
    }

    case 'create-payment':
      return (
        <CreatePayment
          payments={payments}
          onReceivePayment={onReceivePayment}
          onCancel={() => navigate.push('/sales/payment-followup')}
        />
      );

    case 'customers':
      return (
        <div data-testid="sales-customers-page" className="sales-portal-view">
          <CustomersView customers={customers} orders={orders} searchQuery={globalSearch} />
        </div>
      );

    case 'customer-complaints':
      return (
        <div data-testid="sales-customer-complaints-page" className="sales-portal-view">
          <CustomerComplaintManagement mode="sales" orders={orders} currentUser={user} />
        </div>
      );

    case 'reports':
      if (mode === 'SUPER_SALES' || overrideBasePath === '/supersales') {
        return <DashboardView state={{ ...state, reminders }} dispatch={dispatch} navigate={navigate} onQuickAction={handleActionClick} leads={leads} samples={samples} quotations={quotations} orders={orders} payments={payments} customers={customers} reminders={reminders} basePath={basePath} />;
      }
      return <ReportsView leads={leads} orders={orders} payments={payments} customers={customers} user={user} />;

    default:
      return <DashboardView state={{ ...state, reminders }} dispatch={dispatch} navigate={navigate} onQuickAction={handleActionClick} leads={leads} samples={samples} quotations={quotations} orders={orders} payments={payments} customers={customers} reminders={reminders} basePath={basePath} />;
  }
}
