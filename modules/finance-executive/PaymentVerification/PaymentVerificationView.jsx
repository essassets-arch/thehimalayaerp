'use client';

import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { 
  BadgeCheck, 
  XCircle, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  User, 
  Info,
  CreditCard,
  Search,
  PlusCircle,
  FileText,
  History,
  Check
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';
import { can } from '../../../shared/context/AbilityContext';

export default function PaymentVerificationView() {
  const state = useERPStore((s) => s.state);
  const financeActions = useERPStore((s) => (s).finance);
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState('verification'); // 'verification' or 'remaining'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'FINANCE_EXECUTIVE_RECORDED', 'FINANCE_VERIFICATION_PENDING', 'FINANCE_VERIFIED', 'FINANCE_REJECTED'
  const [searchQuery, setSearchQuery] = useState('');

  const customerPayments = state.finance?.customerPayments || [];
  const orders = state.sales?.orders || [];

  // Filtered Payments for verification tab
  const filteredPayments = useMemo(() => {
    return customerPayments.filter((p) => {
      // Apply status filter
      if (statusFilter !== 'All') {
        if (p.verificationStatus !== statusFilter) return false;
      }
      // Apply search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesOrder = p.orderId?.toLowerCase().includes(q);
        const matchesCustomer = p.customerName?.toLowerCase().includes(q);
        const matchesRef = p.transactionReference?.toLowerCase().includes(q) || p.chequeNumber?.toLowerCase().includes(q);
        if (!matchesOrder && !matchesCustomer && !matchesRef) return false;
      }
      return true;
    });
  }, [customerPayments, statusFilter, searchQuery]);

  // Outstanding/Remaining payments orders
  const remainingPayments = useMemo(() => {
    return orders.map((o) => {
      const total = Number(o.grandTotal ?? o.totalAmount ?? 0);
      const verified = customerPayments
        .filter((p) => p.orderId === o.id && p.verificationStatus === 'FINANCE_VERIFIED')
        .reduce((sum, p) => sum + p.paymentAmount, 0);
      const balance = Math.max(total - verified, 0);
      return {
        ...o,
        total,
        verified,
        balance
      };
    }).filter((o) => o.balance > 0);
  }, [orders, customerPayments]);

  const handleRecordPayment = (order) => {
    const today = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: `<span style="color: #24345C; font-weight: 800;">Record Customer Payment</span>`,
      html: `
        <div style="text-align: left; font-family: 'Outfit', sans-serif; font-size: 13.5px; display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
          <div style="background: #F4F7FB; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 6px;">
            <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Order Details</div>
            <div style="font-weight: 800; color: #1E293B; margin-top: 2px;">${order.customerName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 1px;">Order ID: ${order.id} | Remaining Balance: ₹${order.balance.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Payment Amount (₹) *</label>
            <input type="number" id="pay-amount" value="${order.balance}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Payment Date *</label>
            <input type="date" id="pay-date" value="${today}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Payment Mode *</label>
            <select id="pay-mode" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: white;">
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div id="bank-name-container">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Bank Name</label>
            <input type="text" id="pay-bank" placeholder="e.g. HDFC Bank" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div id="ref-container">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Transaction Reference / UTR *</label>
            <input type="text" id="pay-ref" placeholder="e.g. UTR1234567890" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div id="cheque-container" style="display:none;">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Cheque Number *</label>
            <input type="text" id="pay-cheque" placeholder="e.g. 100234" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Remarks / Internal Notes</label>
            <input type="text" id="pay-remarks" placeholder="Optional notes" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Record Payment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0ea5e9',
      didOpen: () => {
        const modeSelect = document.getElementById('pay-mode') ;
        const refContainer = document.getElementById('ref-container') ;
        const chequeContainer = document.getElementById('cheque-container') ;
        
        modeSelect.addEventListener('change', () => {
          if (modeSelect.value === 'Cheque') {
            refContainer.style.display = 'none';
            chequeContainer.style.display = 'block';
          } else if (modeSelect.value === 'Cash') {
            refContainer.style.display = 'block';
            chequeContainer.style.display = 'none';
            // Cash custom placeholder
            const refInput = document.getElementById('pay-ref') ;
            refInput.value = 'CASH-' + Date.now();
          } else {
            refContainer.style.display = 'block';
            chequeContainer.style.display = 'none';
          }
        });
      },
      preConfirm: () => {
        const amount = Number((document.getElementById('pay-amount') ).value);
        const date = (document.getElementById('pay-date') ).value;
        const mode = (document.getElementById('pay-mode') ).value;
        const bank = (document.getElementById('pay-bank') ).value;
        const ref = (document.getElementById('pay-ref') ).value;
        const cheque = (document.getElementById('pay-cheque') ).value;
        const remarks = (document.getElementById('pay-remarks') ).value;

        if (amount <= 0) {
          Swal.showValidationMessage('Amount must be greater than zero.');
          return false;
        }
        if (!date) {
          Swal.showValidationMessage('Payment date is required.');
          return false;
        }
        if (mode !== 'Cheque' && !ref) {
          Swal.showValidationMessage('Transaction reference is required.');
          return false;
        }
        if (mode === 'Cheque' && !cheque) {
          Swal.showValidationMessage('Cheque number is required.');
          return false;
        }

        return { amount, date, mode, bank, ref, cheque, remarks };
      }
    }).then((res) => {
      if (res.isConfirmed) {
        try {
          const payload = {
            orderId: order.id,
            paymentAmount: res.value.amount,
            paymentDate: res.value.date,
            paymentMode: res.value.mode,
            bankName: res.value.bank,
            transactionReference: res.value.mode === 'Cheque' ? undefined : res.value.ref,
            chequeNumber: res.value.mode === 'Cheque' ? res.value.cheque : undefined,
            remarks: res.value.remarks,
            source: user?.role === 'Sales' ? 'SALES' : 'FINANCE_EXECUTIVE'
          };
          
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Executive User',
            role: user?.role || 'Finance Executive'
          };

          const pmtId = financeActions.recordCustomerPayment(payload, actor);
          Swal.fire({
            icon: 'success',
            title: 'Payment Recorded',
            text: `Payment ${pmtId} recorded successfully. Status: ${payload.source === 'SALES' ? 'FINANCE_VERIFICATION_PENDING' : 'FINANCE_EXECUTIVE_RECORDED'}.`
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Record Payment',
            text: err?.message || String(err)
          });
        }
      }
    });
  };

  const handleCorrectPayment = (payment) => {
    Swal.fire({
      title: `<span style="color: #24345C; font-weight: 800;">Correct Rejected Payment</span>`,
      html: `
        <div style="text-align: left; font-family: 'Outfit', sans-serif; font-size: 13.5px; display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
          <div style="background: #FFF5F5; padding: 12px; border-radius: 8px; border: 1px solid #FEB2B2; margin-bottom: 6px;">
            <div style="font-size: 11px; color: #C53030; font-weight: 700; text-transform: uppercase;">Rejection Reason</div>
            <div style="font-weight: 800; color: #9B2C2C; margin-top: 2px;">${payment.rejectionReason || 'No reason specified'}</div>
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Payment Amount (₹) *</label>
            <input type="number" id="correct-amount" value="${payment.paymentAmount}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Payment Date *</label>
            <input type="date" id="correct-date" value="${payment.paymentDate}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Payment Mode *</label>
            <select id="correct-mode" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: white;">
              <option value="Bank Transfer" ${payment.paymentMode === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
              <option value="NEFT" ${payment.paymentMode === 'NEFT' ? 'selected' : ''}>NEFT</option>
              <option value="RTGS" ${payment.paymentMode === 'RTGS' ? 'selected' : ''}>RTGS</option>
              <option value="IMPS" ${payment.paymentMode === 'IMPS' ? 'selected' : ''}>IMPS</option>
              <option value="UPI" ${payment.paymentMode === 'UPI' ? 'selected' : ''}>UPI</option>
              <option value="Cheque" ${payment.paymentMode === 'Cheque' ? 'selected' : ''}>Cheque</option>
              <option value="Cash" ${payment.paymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
              <option value="Other" ${payment.paymentMode === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Bank Name</label>
            <input type="text" id="correct-bank" value="${payment.bankName || ''}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div id="correct-ref-container" style="${payment.paymentMode === 'Cheque' ? 'display:none;' : ''}">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Transaction Reference / UTR *</label>
            <input type="text" id="correct-ref" value="${payment.transactionReference || ''}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div id="correct-cheque-container" style="${payment.paymentMode === 'Cheque' ? '' : 'display:none;'}">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Cheque Number *</label>
            <input type="text" id="correct-cheque" value="${payment.chequeNumber || ''}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Correction Remarks *</label>
            <input type="text" id="correct-remarks" placeholder="Explain what was corrected" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Correction',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0ea5e9',
      didOpen: () => {
        const modeSelect = document.getElementById('correct-mode') ;
        const refContainer = document.getElementById('correct-ref-container') ;
        const chequeContainer = document.getElementById('correct-cheque-container') ;
        
        modeSelect.addEventListener('change', () => {
          if (modeSelect.value === 'Cheque') {
            refContainer.style.display = 'none';
            chequeContainer.style.display = 'block';
          } else {
            refContainer.style.display = 'block';
            chequeContainer.style.display = 'none';
          }
        });
      },
      preConfirm: () => {
        const amount = Number((document.getElementById('correct-amount') ).value);
        const date = (document.getElementById('correct-date') ).value;
        const mode = (document.getElementById('correct-mode') ).value;
        const bank = (document.getElementById('correct-bank') ).value;
        const ref = (document.getElementById('correct-ref') ).value;
        const cheque = (document.getElementById('correct-cheque') ).value;
        const remarks = (document.getElementById('correct-remarks') ).value;

        if (amount <= 0) {
          Swal.showValidationMessage('Amount must be greater than zero.');
          return false;
        }
        if (!date) {
          Swal.showValidationMessage('Payment date is required.');
          return false;
        }
        if (mode !== 'Cheque' && !ref) {
          Swal.showValidationMessage('Transaction reference is required.');
          return false;
        }
        if (mode === 'Cheque' && !cheque) {
          Swal.showValidationMessage('Cheque number is required.');
          return false;
        }
        if (!remarks) {
          Swal.showValidationMessage('Correction remarks are required.');
          return false;
        }

        return { amount, date, mode, bank, ref, cheque, remarks };
      }
    }).then((res) => {
      if (res.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Executive User',
            role: user?.role || 'Finance Executive'
          };

          const updates = {
            paymentAmount: res.value.amount,
            paymentDate: res.value.date,
            paymentMode: res.value.mode,
            bankName: res.value.bank,
            transactionReference: res.value.mode === 'Cheque' ? null : res.value.ref,
            chequeNumber: res.value.mode === 'Cheque' ? res.value.cheque : null,
            remarks: res.value.remarks
          };

          financeActions.correctRejectedPayment(payment.id, updates, actor);
          
          // Submit immediately back for verification
          financeActions.resubmitCustomerPayment(payment.id, actor);

          Swal.fire({
            icon: 'success',
            title: 'Corrected & Resubmitted',
            text: 'Payment has been updated and resubmitted to Finance for verification.'
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Correction Failed',
            text: err?.message || String(err)
          });
        }
      }
    });
  };

  const handleSubmitToFinance = (paymentId) => {
    Swal.fire({
      title: 'Submit to Finance?',
      text: `Are you sure you want to submit payment ${paymentId} for final verification?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6'
    }).then((res) => {
      if (res.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Executive User',
            role: user?.role || 'Finance Executive'
          };
          financeActions.submitCustomerPaymentToFinance(paymentId, actor);
          Swal.fire('Submitted!', 'Payment has been routed to Finance verification queue.', 'success');
        } catch (err) {
          Swal.fire('Failed', err?.message || String(err), 'error');
        }
      }
    });
  };

  const handleVerifyPayment = (paymentId) => {
    Swal.fire({
      title: 'Verify Payment?',
      text: 'Are you sure you want to finally approve and verify this payment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Verify & Generate Receipt',
      confirmButtonColor: '#10b981'
    }).then((res) => {
      if (res.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Team User',
            role: user?.role || 'Finance'
          };
          financeActions.verifyCustomerPayment(paymentId, actor);
          Swal.fire('Verified!', 'Payment marked as verified and receipt created.', 'success');
        } catch (err) {
          Swal.fire('Failed', err?.message || String(err), 'error');
        }
      }
    });
  };

  const handleRejectPayment = (paymentId) => {
    Swal.fire({
      title: 'Reject Payment?',
      input: 'text',
      inputLabel: 'Reason for Rejection',
      inputPlaceholder: 'e.g. UTR credit not found in bank ledger',
      showCancelButton: true,
      confirmButtonText: 'Reject Payment',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) return 'Rejection reason is required!';
      }
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        try {
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Team User',
            role: user?.role || 'Finance'
          };
          financeActions.rejectCustomerPayment(paymentId, res.value, actor);
          Swal.fire('Rejected', 'Payment rejected and sent back for correction.', 'warning');
        } catch (err) {
          Swal.fire('Failed', err?.message || String(err), 'error');
        }
      }
    });
  };

  const handleViewDetails = (payment) => {
    const historyRows = (payment.history || []).map((h, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 12px;">
        <td style="padding: 8px;">${h.createdAt?.split('T')[0]}</td>
        <td style="padding: 8px; font-weight: 700; color: #1E3A8A;">${h.action}</td>
        <td style="padding: 8px;">${h.actorName} (${h.actorRole})</td>
        <td style="padding: 8px; font-style: italic;">${h.remarks || '-'}</td>
      </tr>
    `).join('');

    Swal.fire({
      title: `<span style="font-weight: 800; color: #24345C;">Payment Confirmation Details</span>`,
      width: '640px',
      html: `
        <div style="text-align: left; font-family: 'Outfit', sans-serif; font-size: 13.5px; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #F4F7FB; border: 1px solid #E2E8F0; padding: 12px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Payment ID</span>
              <strong style="font-size: 14px; color: #1E293B; font-family: monospace;">${payment.id}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Order ID</span>
              <strong style="font-size: 14px; color: #1E293B; font-family: monospace;">${payment.orderId}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Customer Name</span>
              <strong style="font-size: 14px; color: #1E293B;">${payment.customerName}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Status</span>
              <strong style="font-size: 14px; color: #0284c7;">${payment.verificationStatus?.replace(/_/g, ' ')}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Amount Recorded</span>
              <strong style="font-size: 16px; color: #0ea5e9;">₹${payment.paymentAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Payment Date</span>
              <strong style="font-size: 14px; color: #1E293B;">${payment.paymentDate}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Mode</span>
              <strong style="font-size: 14px; color: #1E293B;">${payment.paymentMode}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Reference / UTR</span>
              <strong style="font-size: 14px; color: #1E293B; font-family: monospace;">${payment.transactionReference || payment.chequeNumber || 'N/A'}</strong>
            </div>
          </div>

          ${payment.verificationStatus === 'FINANCE_REJECTED' ? `
            <div style="background: #FFF5F5; border: 1px solid #FEB2B2; padding: 12px; border-radius: 8px; color: #C53030;">
              <strong>Rejection Details:</strong> ${payment.rejectionReason}
            </div>
          ` : ''}

          <div>
            <h4 style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Revision & Versioning Logs</h4>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="border-bottom: 2px solid #CBD5E1; color: #475569; font-size: 11px;">
                    <th style="padding: 6px;">Date</th>
                    <th style="padding: 6px;">Action</th>
                    <th style="padding: 6px;">Actor</th>
                    <th style="padding: 6px;">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${historyRows.length > 0 ? historyRows : '<tr><td colspan="4" style="text-align:center; padding:10px; color:#94A3B8;">No history logs found.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#64748B'
    });
  };

  const isActorFinance = can(user, 'canFinalVerifyPayment');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#24345C', letterSpacing: '-0.5px', margin: 0 }}>
            Payment Collection & Verification
          </h1>
          <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
            Record customer collections, submit confirmations, and track verification flows.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '0px' }}>
        <button
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'verification' ? '#0ea5e9' : 'transparent',
            color: activeTab === 'verification' ? 'white' : '#64748B',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Verification Queue ({filteredPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('remaining')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'remaining' ? '#0ea5e9' : 'transparent',
            color: activeTab === 'remaining' ? 'white' : '#64748B',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Outstanding Orders ({remainingPayments.length})
        </button>
      </div>

      {activeTab === 'verification' ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'FINANCE_EXECUTIVE_RECORDED', 'FINANCE_VERIFICATION_PENDING', 'FINANCE_VERIFIED', 'FINANCE_REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: 'none',
                    background: statusFilter === status ? '#2F4375' : '#F1F5F9',
                    color: statusFilter === status ? 'white' : '#475569',
                    fontWeight: '700',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status === 'All' ? 'All Statuses' : status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            
            <div style={{ position: 'relative', width: '260px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search Order, Client, UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Order Ref</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Mode / Ref</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                      No payments found matching filters in the verification queue.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{p.id}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{p.orderId}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{p.customerName}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0ea5e9' }}>₹{p.paymentAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px' }}>{p.paymentDate}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px', color: '#64748B' }}>
                          <span style={{ fontWeight: 'bold' }}>{p.paymentMode}</span>
                          <span style={{ fontFamily: 'monospace' }}>{p.transactionReference || p.chequeNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: p.verificationStatus === 'FINANCE_VERIFIED' ? '#D1FAE5' :
                                      p.verificationStatus === 'FINANCE_VERIFICATION_PENDING' ? '#FEF3C7' :
                                      p.verificationStatus === 'FINANCE_EXECUTIVE_RECORDED' ? '#DBEAFE' : '#FEE2E2',
                          color: p.verificationStatus === 'FINANCE_VERIFIED' ? '#065F46' :
                                 p.verificationStatus === 'FINANCE_VERIFICATION_PENDING' ? '#92400E' :
                                 p.verificationStatus === 'FINANCE_EXECUTIVE_RECORDED' ? '#1E40AF' : '#991B1B'
                        }}>
                          {p.verificationStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleViewDetails(p)}
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="View Revision Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          
                          {p.verificationStatus === 'FINANCE_EXECUTIVE_RECORDED' && !isActorFinance && (
                            <button
                              onClick={() => handleSubmitToFinance(p.id)}
                              style={{
                                padding: '6px 10px',
                                background: '#0ea5e9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                              }}
                            >
                              Submit to Finance
                            </button>
                          )}

                          {p.verificationStatus === 'FINANCE_REJECTED' && (
                            <button
                              onClick={() => handleCorrectPayment(p)}
                              style={{
                                padding: '6px 10px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                              }}
                            >
                              Correct Details
                            </button>
                          )}

                          {p.verificationStatus === 'FINANCE_VERIFICATION_PENDING' && isActorFinance && (
                            <>
                              <button
                                onClick={() => handleVerifyPayment(p.id)}
                                style={{
                                  padding: '6px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#10b981',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Approve"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectPayment(p.id)}
                                style={{
                                  padding: '6px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Outstanding Headers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#24345C', margin: 0 }}>Delivered & Pending Payment Orders</h2>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search outstanding orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Grand Total</th>
                  <th style={{ padding: '12px 16px' }}>Verified Paid</th>
                  <th style={{ padding: '12px 16px' }}>Outstanding Balance</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {remainingPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                      All orders are fully paid! No outstanding payments left.
                    </td>
                  </tr>
                ) : (
                  remainingPayments.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', fontFamily: 'monospace' }}>{o.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{o.customerName}</td>
                      <td style={{ padding: '12px 16px' }}>₹{o.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: '600' }}>₹{o.verified.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', color: '#EF4444', fontWeight: '800' }}>₹{o.balance.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: o.dispatchStatus === 'DELIVERED' ? '#D1FAE5' : '#F1F5F9',
                          color: o.dispatchStatus === 'DELIVERED' ? '#065F46' : '#475569'
                        }}>
                          {o.dispatchStatus || 'OPEN'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleRecordPayment(o)}
                          style={{
                            padding: '6px 10px',
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Record Collection
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
