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
import { useRouter, usePathname, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import MyProfileView from '../../../shared/components/MyProfileView';
import { useERP, useERPStore, useSalesBackend } from '../../../shared/context/ERPContext.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { apiClient } from '../../../lib/apiClient.js';
import { backendFetch } from '../../../lib/backendFetch';

// Feature hooks (new FSD layer)
import { useLeads }      from '../hooks/useLeads.js';
import { useSamples }    from '../hooks/useSamples.js';
import { useQuotations } from '../hooks/useQuotations.js';
import { useReminders }  from '../hooks/useReminders.js';
import { useOrders }     from '../hooks/useOrders.js';

// UI view components (unchanged — still consumed from /components for now)
import DashboardView              from '../../../components/DashboardView.jsx';
import EditSample                 from '../../../components/EditSample.jsx';
import CreateSample               from '../../../components/CreateSample.jsx';
import LeadsView                  from '../../../components/LeadsView.jsx';
import CreateLead                 from '../../../components/CreateLead.jsx';
import SamplesView                from '../../../components/SamplesView.jsx';
import QuotationsView             from '../../../components/QuotationsView.jsx';
import CreateQuotation            from '../../../components/CreateQuotation.jsx';
import OrdersView                 from '../../../components/OrdersView.jsx';
import PaymentsView               from '../../../components/PaymentsView.jsx';
import PaymentFollowupERPView     from '../../../components/PaymentFollowupERPView.jsx';
import CreatePayment              from '../../../components/CreatePayment.jsx';
import CustomersView              from '../../../components/CustomersView.jsx';
import ReportsView                from '../../../components/ReportsView.jsx';
import SalesProductionStatusView  from '../../../components/SalesProductionStatusView.jsx';
import DailyTaskView              from '../../../components/DailyTaskView.jsx';
import CustomerComplaintManagement from '../../../components/CustomerComplaintManagement.jsx';
import CreateOrder                from '../../../components/CreateOrder.jsx';
import O2PWorkflowBanner          from '../../../shared/components/O2PWorkflowBanner';
import { useO2PWorkflow }         from '../../../shared/hooks/useO2PWorkflow';

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

export default function SalesPortal() {
  const pathname = usePathname();
  const params = useParams();
  const pathSlug = pathname ? pathname.split('/').filter(Boolean) : [];
  let view = params?.slug?.[0] || (pathSlug.length > 1 ? pathSlug[pathSlug.length - 1] : 'dashboard') || 'dashboard';
  if (view === 'sales') view = 'dashboard';
  const leadId = params?.slug?.[1]; const sampleId = params?.slug?.[1];
  const location = { pathname: pathname || '', search: "" };
  const navigate = useRouter();

  const currentView =
    (location.pathname.includes('/sales/edit-lead/')
      ? 'edit-lead'
      : location.pathname.includes('/sales/edit-sample/')
      ? 'edit-sample'
      : view);

  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const setGlobalSearch = useSearchStore(s => s.setGlobalSearch);

  // ── UI-only state ──────────────────────────────────────────────────────────
  const [prefillQuotationData, setPrefillQuotationData] = useState(null);

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

  const { quotations, createQuotation, updateQuotation, confirmOrder } = useQuotations(
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

  const { refreshSamples, loadLeads, loadCustomers, createSample } = useSalesBackend();

  useEffect(() => {
    // Load orders on orders view or dashboard
    if ((currentView === 'orders' || currentView === 'dashboard') && loadOrders) {
      void loadOrders();
    }
    // Load other modules on dashboard view for dynamic metrics
    if (currentView === 'dashboard') {
      if (loadLeads) void loadLeads();
      if (refreshSamples) void refreshSamples();
      if (loadCustomers) void loadCustomers();
    }
  }, [currentView, loadOrders, loadLeads, refreshSamples, loadCustomers]);

  // ── O2P Workflow ────────────────────────────────────────────────────────────
  const o2p = useO2PWorkflow();

  const handleAddLead = async (data) => {
    const result = await addLead(data);
    if (result?.id || result?.leadId) {
      const newId = String(result.id || result.leadId);
      o2p.advanceLead({ orderId: newId, actor: user?.name || 'Sales' });
    }
    return result;
  };


  const handleConfirmOrder = async (quotationId, data) => {
    const result = await confirmOrder(quotationId, data);
    if (result?.orderId || result?.id) {
      const ordId = String(result.orderId || result.id);
      o2p.setActiveOrder(ordId, 4);
      o2p.confirmSalesOrder({ orderId: ordId, actor: user?.name || 'Sales' });
    }
    return result;
  };


  const { customers } = useSalesBackend();

  const payments  = state.payments  || [];

  // ── Quick navigation helpers ───────────────────────────────────────────────
  const handleActionClick = (_actionName, message) => showToast(message);

  // ── Quotation-specific handlers ────────────────────────────────────────────

  /** Move to quotation view, pre-seeding the draft from a sample. */
  const onMoveToQuotation = (sample) => {
    const customer = sample.leadName || sample.customer || sample.company || '';
    let items = [];

    if (sample.products && Array.isArray(sample.products)) {
      items = sample.products.map((p, idx) => ({
        productId: p.id || p.productId || `PRD-${idx + 1}`,
        name: p.name || p.productName || '',
        description: p.description || p.productDetails || p.specs || '',
        qty: p.sampleQty || p.qty || p.quantity || 1,
        unit: p.unit || 'Units',
        rate: p.estimatedPrice || p.rate || p.price || p.unitPrice || 0,
        amount:
          (p.sampleQty || p.qty || p.quantity || 1) *
          (p.estimatedPrice || p.rate || p.price || p.unitPrice || 0),
      }));
    } else {
      items = [{
        productId: sample.productId || 'PRD-1',
        name: sample.product || sample.productName || '',
        description: sample.description || sample.productDetails || sample.specs || '',
        qty: sample.quantity || sample.qty || 1,
        unit: sample.unit || 'Units',
        rate: sample.value || sample.rate || sample.price || sample.unitPrice || 0,
        amount:
          (sample.quantity || sample.qty || 1) *
          (sample.value || sample.rate || sample.price || sample.unitPrice || 0),
      }];
    }

    useERPStore.getState().setQuotationDraft({
      customer,
      company: sample.company || sample.leadName || '',
      contactPerson: sample.contactPerson || '',
      items,
      source: 'SAMPLE',
      sourceId: sample.id,
      gstNumber: sample.gstNumber || '',
    });
    setPrefillQuotationData(sample);
    navigate.push('/sales/create-quotation');
  };

  /** Create quotation; if a matching lead exists, advance its status to 'Quotation'. */
  const onAddQuotation = async (qData) => {
    const res = await createQuotation(qData);
    if (res?.success) {
      const matchedLead = leads.find(
        (l) =>
          l.companyName?.toLowerCase() === qData.customerName?.trim().toLowerCase() ||
          l.projectName?.toLowerCase()  === qData.customerName?.trim().toLowerCase()
      );
      if (matchedLead) {
        // Fire-and-forget: advance the linked lead's status
        updateLead(matchedLead.id, { status: 'Quotation' }).catch(() => {});
      }
      setPrefillQuotationData(null);
      navigate.push('/sales/quotations');
    }
  };

  /** Convert quotation → order, then navigate to orders view. */
  const onConvertToOrder = async (qtn) => {
    showToast('Sales: Converting quotation to order.');
    const res = await confirmOrder(qtn);
    if (res?.success) {
      showToast('🎉 Order created from quotation!');
      navigate.push('/sales/orders');
    }
  };

  /** Create a direct order, then navigate to orders view. */
  const onCreateOrder = async (orderData) => {
    const res = await createOrder(orderData);
    if (res?.success) {
      showToast('🎉 Order created successfully!');
      navigate.push('/sales/orders');
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
        navigate.push('/sales/payment-followup');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Payment Recording Failed', text: err.message });
    }
  };

  const handleSalesConfirmPayment = async (order) => {
    const total = Number(order.totalAmount ?? order.total_amount ?? order.grandTotal ?? order.grand_total ?? 0);
    const verified = Number(order.verifiedPaidAmount ?? order.verified_paid_amount ?? order.verifiedAmount ?? order.verified_amount ?? 0);
    const remaining = order.balanceAmount !== undefined 
      ? Number(order.balanceAmount) 
      : (order.balance_amount !== undefined 
        ? Number(order.balance_amount) 
        : (total - verified));

    if (remaining <= 0) {
      Swal.fire({ icon: 'info', title: 'Order Fully Paid', text: 'This order has no outstanding balance.' });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Record Client Payment Collection',
      html: `
        <div style="text-align: left; font-family: sans-serif; font-size: 13px; color: var(--color-text-primary);">
          <div style="margin-bottom: 10px; display: grid; grid-template-columns: 120px 1fr; gap: 8px;">
            <span><strong>Customer:</strong></span> <span>${order.customerName || order.customer_name || order.customer?.companyName || 'N/A'}</span>
            <span><strong>Order Ref:</strong></span> <span>${order.orderNo || order.orderNumber || order.order_number || `ORD-${order.id}`}</span>
            <span><strong>Total Order:</strong></span> <span>INR ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span><strong>Verified Paid:</strong></span> <span>INR ${verified.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span><strong>Remaining Bal:</strong></span> <span style="color: var(--color-accent-teal); font-weight: 700;">INR ${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 12px 0;" />
          
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: bold; margin-bottom: 6px;">Amount Received (INR) *</label>
            <input id="swal-pay-amount" type="number" class="swal2-input" value="${remaining}" style="margin: 0; width: 100%; border: 1px solid var(--color-border); border-radius: 6px; padding: 8px; background: var(--color-sidebar-bg); color: var(--color-text-primary);" />
          </div>
          
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: bold; margin-bottom: 6px;">Remarks</label>
            <textarea id="swal-remarks" placeholder="Add payment notes..." style="width: 100%; height: 50px; border: 1px solid var(--color-border); border-radius: 6px; padding: 8px; background: var(--color-sidebar-bg); color: var(--color-text-primary); resize: none;"></textarea>
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
      preConfirm: () => {
        const mode = 'NEFT';
        const ref = `AUTO-${Date.now()}`;
        const amountInput = document.getElementById('swal-pay-amount').value.trim();
        const remarks = document.getElementById('swal-remarks').value.trim();
        const proof = '';

        if (!amountInput) {
          Swal.showValidationMessage('Please fill all required fields (*)');
          return false;
        }

        const paymentAmount = Number(amountInput);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
          Swal.showValidationMessage('Amount received must be a positive number.');
          return false;
        }

        if (paymentAmount > remaining) {
          Swal.showValidationMessage(`Amount cannot exceed the remaining balance of INR ${remaining.toLocaleString('en-IN')}`);
          return false;
        }

        return { paymentAmount, paymentMode: mode, transactionReference: ref, remarks, proofDocument: proof };
      }
    });

    if (formValues) {
      showToast('Submitting payment request to Finance…');
      try {
        const payload = {
          salesOrderId: order.id,
          customerId: order.customerId || order.customer?.id || 'unknown',
          amount: formValues.paymentAmount,
          proofUrl: formValues.proofDocument || 'missing-proof.jpg'
        };
        await backendFetch('/api/backend/finance/payments/sales-record', {
          method: 'POST',
          body: payload
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Request Submitted',
          text: `Payment request for INR ${formValues.paymentAmount.toLocaleString('en-IN')} is pending Finance verification.`,
          timer: 3000,
          showConfirmButton: false
        });
        await syncData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Submission Failed', text: err.message || 'Error occurred' });
      }
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
      return <MyProfileView />;

    case 'daily-task':
      return <DailyTaskView state={{ ...state, leads, samples, quotations, orders, customers, reminders }} dispatch={dispatch} navigate={navigate} showToast={showToast} completeReminder={completeReminder} updateReminder={updateReminder} />;

    case 'dashboard':
      return (
        <div data-testid="sales-dashboard-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DashboardView state={state} dispatch={dispatch} navigate={navigate} onQuickAction={handleActionClick} leads={leads} samples={samples} quotations={quotations} orders={orders} payments={payments} customers={customers} />
        </div>
      );

    case 'leads':
      return (
        <div data-testid="sales-leads-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <O2PWorkflowBanner accentColor="#3b82f6" />
          <LeadsView
            leads={leads}
            reminders={reminders}
            samples={samples}
            quotations={quotations}
            orders={orders}
            onAddLeadClick={() => navigate.push('/sales/create-lead')}
            onEditLeadClick={(id) => navigate.push(`/sales/edit-lead/${id}`)}
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

    case 'create-lead':
    case 'edit-lead': {
      // Prisma lead IDs are UUID strings. Converting them with Number(...)
      // produces NaN and makes every existing lead look missing.
      const leadToEdit = leadId
        ? leads.find((lead) => String(lead.id ?? lead.leadId) === String(leadId))
        : null;
      return (
        <div data-testid="sales-create-lead-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CreateLead
          key={leadToEdit ? `edit-${leadToEdit.id}` : 'new'}
          leads={leads}
          onAddLead={
            leadToEdit
              ? (updatedData) => updateLead(leadToEdit.id, updatedData)
              : addLead
          }
          onGenerateQuotation={!leadToEdit ? generateQuotationFromLead : undefined}
          onDeleteLead={deleteLead}
          onCancel={() => navigate.push('/sales/leads')}
          editingLead={leadToEdit}
        />
        </div>
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
               navigate.push('/sales/samples');
               return { success: true };
           }}
           onCancel={() => navigate.push('/sales/leads')}
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
            navigate.push('/sales/samples');
          }}
          onCancel={() => navigate.push('/sales/samples')}
        />
      );
    }

    case 'samples':
      return (
        <div data-testid="sales-samples-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SamplesView
            samples={samples}
            onUpdateSampleStatus={updateSampleStatus}
            onUpdateSample={updateSample}
            onMoveToQuotation={onMoveToQuotation}
            onCreateReplacementSample={createReplacementSample}
          />
        </div>
      );

    case 'quotations':
      return (
        <div data-testid="sales-quotations-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <O2PWorkflowBanner accentColor="#8b5cf6" />
          <QuotationsView
            quotations={quotations}
            leads={leads}
            customers={customers}
            reminders={reminders}
            onCreateQuoteClick={() => {
              useERPStore.getState().clearQuotationDraft();
              navigate.push('/sales/create-quotation');
            }}
            onCreateLead={() => navigate.push('/sales/create-lead')}
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
        <div data-testid="sales-create-quotation-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CreateQuotation
            key={prefillQuotationData?.id || 'new'}
            leads={leads}
            customers={customers}
            prefilledCustomer={prefillQuotationData?.leadName || ''}
            prefilledProduct={prefillQuotationData?.product || prefillQuotationData?.productName || ''}
            prefilledQuantity={prefillQuotationData?.quantity || 1}
            onAddQuotation={onAddQuotation}
            onCreateLead={() => navigate.push('/sales/create-lead')}
            onCancel={() => {
              setPrefillQuotationData(null);
              navigate.push('/sales/quotations');
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
        const matchedOrder = orders.find((o) => o.orderNo === orderId || o.id === orderId);
        const orderDbId = matchedOrder ? matchedOrder.id || matchedOrder.dbId : orderId;

        if (status === 'SEND_TO_PLANT_HEAD_DIRECT') {
          try {
            const serverOrder = await backendFetch(`/api/backend/sales/orders/${orderDbId}`);
            const currentStatus = String(
              serverOrder?.workflowStateCode ||
              serverOrder?.status ||
              matchedOrder?.workflowStateCode ||
              matchedOrder?.status ||
              matchedOrder?.orderStatus ||
              ''
            ).toUpperCase();

            if (!['DRAFT', 'PENDING_APPROVAL', 'CONFIRMED'].includes(currentStatus)) {
              throw new Error(
                currentStatus === 'SENT_TO_PLANT' || currentStatus === 'SENT_TO_PLANT_HEAD'
                  ? 'This order has already been sent to the Plant Head.'
                  : `This order is already at ${currentStatus.replaceAll('_', ' ')} and cannot be submitted again.`
              );
            }

            if (currentStatus === 'DRAFT') {
              await backendFetch(`/api/backend/sales/orders/${orderDbId}/action`, {
                method: 'POST',
                body: { action: 'SUBMIT' },
              });
            }
            if (currentStatus === 'DRAFT' || currentStatus === 'PENDING_APPROVAL') {
              await backendFetch(`/api/backend/sales/orders/${orderDbId}/action`, {
                method: 'POST',
                body: { action: 'CONFIRM' },
              });
            }
            await backendFetch(`/api/backend/sales/orders/${orderDbId}/action`, {
              method: 'POST',
              body: { action: 'SEND_TO_PLANT' },
            });
            showToast('Order sent to Plant Head.');
            await loadOrders();
            return true;
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Unable to Send Order',
              text: err?.message || 'Unable to send order to Plant Head.',
            });
            return false;
          }
        }

        if (['SUBMIT', 'CONFIRM', 'SEND_TO_PLANT'].includes(status)) {
          try {
            await backendFetch(`/api/backend/sales/orders/${orderDbId}/action`, {
              method: 'POST',
              body: { action: status },
            });
            showToast(
              status === 'SUBMIT'
                ? 'Order submitted for approval.'
                : status === 'CONFIRM'
                  ? 'Order confirmed.'
                  : 'Order sent to Plant Head.'
            );
            await loadOrders();
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

        if (status === 'ORDER_CONFIRMED') {
          showToast('Confirming order…');
          try {
            const res = await apiClient.patch(`/sales/orders/${orderDbId}/confirm`, { actor: user?.name || 'Sales' });
            if (res.success) {
              showToast('✅ Order confirmed!');
              await syncData();
            } else {
              Swal.fire({ icon: 'error', title: 'Confirmation Failed', text: res.message || 'Failed to confirm order' });
            }
          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
          }
          return;
        }

        if (status === 'PLANT_PENDING') {
          showToast('Confirming and sending order to Plant Head…');
          try {
            await apiClient.patch(`/sales/orders/${orderDbId}/confirm`, { actor: user?.name || 'Sales' });
            const res = await apiClient.patch(`/sales/orders/${orderDbId}/send-to-plant`, { actor: user?.name || 'Sales' });
            if (res.success) {
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
              // O2P: mark order confirmed in workflow
              o2p.setActiveOrder(orderDbId, 4);
              o2p.confirmSalesOrder({ orderId: orderDbId, actor: user?.name || 'Sales' });
              showToast('✅ Order confirmed and sent to Plant Head!');
              await syncData();
            } else {
              Swal.fire({ icon: 'error', title: 'Failed', text: res.message || 'Failed to send to Plant Head' });
            }
          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Unexpected error' });
          }
          return;
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
        <div data-testid="sales-orders-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
        <>
          <O2PWorkflowBanner accentColor="#0ea5e9" />
          <PaymentFollowupERPView 
            orders={orders}
            reminders={reminders}
            onSaveReminder={createReminder}
            onUpdateReminder={updateReminder}
            onCompleteReminder={completeReminder}
          />
        </>
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
      return <CustomersView customers={customers} orders={orders} searchQuery={globalSearch} />;

    case 'customer-complaints':
      return <CustomerComplaintManagement mode="sales" orders={orders} currentUser={user} />;

    case 'reports':
      return <ReportsView leads={leads} orders={orders} payments={payments} customers={customers} user={user} />;

    default:
      return <DashboardView state={state} dispatch={dispatch} navigate={navigate} onQuickAction={handleActionClick} leads={leads} samples={samples} quotations={quotations} orders={orders} payments={payments} customers={customers} />;
  }
}
