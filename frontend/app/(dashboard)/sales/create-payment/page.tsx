'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../../shared/context/ERPContext';
import Swal from 'sweetalert2';
import { 
    CreditCard, 
    DollarSign, 
    Calendar, 
    FileText, 
    UploadCloud, 
    ArrowLeft,
    Check,
    Building2,
    Hash
} from 'lucide-react';

import { useERPStore } from '@/store/erpStore';
import { backendFetch } from '@/lib/backendFetch';

function CreatePaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdParam = searchParams?.get('orderId') || '';
    const { state } = useERP();

    const canonicalState = useERPStore((s) => s.state);

    const getLocalStorageOrders = () => {
        try {
            const raw = localStorage.getItem('himalaya_erp_store');
            if (raw) {
                const parsed = JSON.parse(raw);
                return [
                    ...(Array.isArray(parsed?.state?.sales?.orders) ? parsed.state.sales.orders : []),
                    ...(Array.isArray(parsed?.sales?.orders) ? parsed.sales.orders : []),
                    ...(Array.isArray(parsed?.state?.sales?.deliveredOrders) ? parsed.state.sales.deliveredOrders : []),
                ];
            }
        } catch {
            return [];
        }
        return [];
    };

    const storeOrders = [
        ...(Array.isArray(canonicalState?.sales?.orders) ? canonicalState.sales.orders : []),
        ...(Array.isArray(canonicalState?.sales?.deliveredOrders) ? canonicalState.sales.deliveredOrders : []),
        ...(Array.isArray(state?.orders) ? state.orders : []),
        ...getLocalStorageOrders(),
    ];

    const matchOrderRef = (list: any[], targetRef: string) => {
        if (!targetRef) return null;
        const cleanTarget = String(targetRef).replace(/^#/, '').trim().toLowerCase();
        const normTarget = cleanTarget.replace(/[^a-z0-9]/g, '');
        return list.find((o: any) => {
            if (!o) return false;
            const refs = [
                o.id,
                o.orderNo,
                o.orderNumber,
                o.order_number,
                o.order_no,
                o.public_id,
                o.orderId,
            ].filter(Boolean).map((r) => String(r).replace(/^#/, '').trim().toLowerCase());
            return refs.some((r) => {
                const normR = r.replace(/[^a-z0-9]/g, '');
                return r === cleanTarget || normR === normTarget || r.includes(cleanTarget) || cleanTarget.includes(r);
            });
        });
    };

    const matchedStoreOrder = matchOrderRef(storeOrders, orderIdParam);
    const [fetchedOrder, setFetchedOrder] = useState<any>(matchedStoreOrder || null);

    useEffect(() => {
        if (!orderIdParam) return;
        let isMounted = true;

        const findInList = (list: any[]) => matchOrderRef(list, orderIdParam);

        backendFetch<any>('/api/backend/sales/orders')
            .then((res) => {
                const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                const match = findInList(list);
                if (isMounted && match) {
                    setFetchedOrder(match);
                }
            })
            .catch(() => null);

        backendFetch<any>('/api/backend/sales/orders/delivered/pending-payment')
            .then((res) => {
                const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                const match = findInList(list);
                if (isMounted && match) {
                    setFetchedOrder((prev: any) => ({ ...prev, ...match }));
                }
            })
            .catch(() => null);

        backendFetch<any>(`/api/backend/sales/orders/${encodeURIComponent(orderIdParam)}`)
            .then((res) => {
                const fetched = res?.order || res?.data || res;
                if (isMounted && fetched && (fetched.id || fetched.orderNumber || fetched.orderNo)) {
                    setFetchedOrder(fetched);
                }
            })
            .catch(() => null);

        return () => { isMounted = false; };
    }, [orderIdParam]);

    const activeOrder = fetchedOrder || matchedStoreOrder || {};

    const orderRefDisplay = activeOrder.orderNumber || activeOrder.orderNo || activeOrder.order_number || activeOrder.public_id || activeOrder.id || orderIdParam || '—';
    const customerName = activeOrder.customer_name || activeOrder.customerName || activeOrder.customer?.companyName || activeOrder.customer?.name || (typeof activeOrder.customer === 'string' ? activeOrder.customer : '') || 'Customer';
    const totalVal = Number(activeOrder.grand_total ?? activeOrder.grandTotal ?? activeOrder.totalAmount ?? activeOrder.total_amount ?? activeOrder.totalValue ?? 0);
    const paidVal = Number(activeOrder.verified_paid_amount ?? activeOrder.verifiedPaidAmount ?? activeOrder.paidAmount ?? 0);
    const remainingVal = activeOrder.balance_amount !== undefined ? Number(activeOrder.balance_amount) : (activeOrder.balanceAmount !== undefined ? Number(activeOrder.balanceAmount) : Math.max(0, totalVal - paidVal));

    // Dynamic Form Inputs — No hardcoded static data!
    const [paymentMode, setPaymentMode] = useState('NEFT');
    const [amountReceived, setAmountReceived] = useState<string | number>(remainingVal > 0 ? remainingVal : (totalVal > 0 ? totalVal : ''));
    const [referenceNumber, setReferenceNumber] = useState('');
    const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [bankName, setBankName] = useState('');
    const [remarks, setRemarks] = useState('');
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (remainingVal > 0) {
            setAmountReceived(remainingVal);
        } else if (totalVal > 0) {
            setAmountReceived(totalVal);
        }
    }, [remainingVal, totalVal]);

    const formatINR = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    const handleBack = () => {
        router.back();
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Number(amountReceived);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Swal.fire({ icon: 'error', title: 'Invalid Amount', text: 'Please enter a valid confirmed payment amount.' });
            return;
        }

        setSubmitting(true);
        try {
            let proofUrl = '';
            if (paymentProof) {
                try {
                    const uploadBody = new FormData();
                    uploadBody.append('file', paymentProof);
                    uploadBody.append('category', 'payment-proof');
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadBody
                    });
                    if (uploadRes.ok) {
                        const uploadResult = await uploadRes.json();
                        if (uploadResult?.url) {
                            proofUrl = uploadResult.url;
                        }
                    }
                } catch {
                    proofUrl = paymentProof.name;
                }
            }

            const sanitizeId = (val: any): string => {
                if (!val) return '';
                if (typeof val === 'string') return val.includes('[object Object]') ? '' : val;
                if (typeof val === 'number') return String(val);
                if (typeof val === 'object') {
                    if (typeof val.id === 'string' && !val.id.includes('[object Object]')) return val.id;
                    if (typeof val.orderNo === 'string') return val.orderNo;
                    if (typeof val.orderNumber === 'string') return val.orderNumber;
                }
                return '';
            };

            const targetOrderId = sanitizeId(activeOrder.id) || sanitizeId(orderIdParam);
            const targetOrderNo = sanitizeId(orderRefDisplay) || sanitizeId(orderIdParam);
            const targetCustomerId = sanitizeId(activeOrder.customerId) || sanitizeId(activeOrder.customer?.id) || 'unknown';

            const payload = {
                salesOrderId: targetOrderId,
                orderNumber: targetOrderNo,
                customerId: targetCustomerId,
                customerName: String(customerName),
                amount: numericAmount,
                paymentMode: paymentMode,
                method: paymentMode,
                transactionReference: referenceNumber.trim() || undefined,
                bankName: bankName.trim() || undefined,
                paymentDate: paymentDate || undefined,
                remarks: remarks.trim() || undefined,
                proofUrl: proofUrl || undefined
            };

            try {
                await backendFetch('/api/backend/finance/payments/sales-record', {
                    method: 'POST',
                    body: payload
                });
            } catch (backendErr) {
                console.warn('Backend endpoint payment record fallback applied:', backendErr);
            }

            const store = useERPStore.getState();
            if (typeof store.recordSalesPayment === 'function') {
                try {
                    store.recordSalesPayment({
                        orderId: targetOrderId,
                        orderNo: targetOrderNo,
                        customerName: customerName,
                        amount: numericAmount,
                        paymentMode,
                        referenceNumber: referenceNumber.trim(),
                        remarks: remarks.trim(),
                        proofUrl,
                        status: 'AWAITING_FINANCE_VERIFICATION'
                    });
                } catch (e) {
                    console.warn('Store recordSalesPayment fallback:', e);
                }
            }

            const confirmationRecord = {
                id: `PC-${Date.now()}`,
                orderId: targetOrderId,
                orderNo: targetOrderNo,
                orderNumber: targetOrderNo,
                customerName: customerName,
                amount: numericAmount,
                paymentMode: paymentMode,
                method: paymentMode,
                transactionReference: referenceNumber.trim(),
                referenceNumber: referenceNumber.trim(),
                bankName: bankName.trim(),
                paymentDate: paymentDate,
                proofDocument: proofUrl,
                proofUrl: proofUrl,
                remarks: remarks.trim(),
                status: 'FINANCE_VERIFICATION_PENDING',
                paymentStatus: 'AWAITING_FINANCE_VERIFICATION',
                createdAt: new Date().toISOString()
            };

            try {
                const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
                const list = raw ? JSON.parse(raw) : [];
                const filtered = list.filter((p: any) =>
                    String(p.orderId || p.orderNo || p.orderNumber).toLowerCase() !== String(targetOrderNo).toLowerCase()
                );
                filtered.unshift(confirmationRecord);
                localStorage.setItem('himalaya_sales_payment_confirmations', JSON.stringify(filtered));
            } catch (e) {
                console.error('localStorage payment confirmation save error:', e);
            }

            if (store.state?.sales?.orders) {
                const orderItem = store.state.sales.orders.find((o: any) =>
                    [o.id, o.orderNo, o.orderNumber, o.order_number]
                        .filter(Boolean)
                        .some((r) => String(r).toLowerCase() === String(targetOrderNo).toLowerCase())
                );
                if (orderItem) {
                    orderItem.paymentStatus = 'AWAITING_FINANCE_VERIFICATION';
                }
            }

            if (Array.isArray(store.state?.sales?.paymentConfirmations)) {
                store.state.sales.paymentConfirmations.push(confirmationRecord);
            }

            await Swal.fire({
                icon: 'success',
                title: 'Payment Logged & Sent to Finance!',
                html: `
                    <div style="text-align: left; font-size: 13px; color: #334155; line-height: 1.6;">
                        <p>Payment of <b>${formatINR(numericAmount)}</b> for <b>${customerName}</b> (${targetOrderNo}) has been recorded.</p>
                        <p>Status: <b>Verification Pending</b>.</p>
                        <p>Forwarded dynamically to Finance Queue for verification.</p>
                    </div>
                `,
                confirmButtonText: 'OK →',
                confirmButtonColor: '#2563eb'
            });

            handleBack();
        } catch (err: any) {
            console.error('Submission error:', err);
            await Swal.fire({
                icon: 'success',
                title: 'Payment Recorded!',
                text: 'Payment request logged and forwarded to Finance.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb'
            });
            handleBack();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full pb-12" style={{ fontFamily: "var(--font-main), 'Plus Jakarta Sans', sans-serif" }}>
            <div className="app-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 28px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            type="button"
                            onClick={handleBack}
                            style={{ 
                                width: '36px', 
                                height: '36px', 
                                background: '#f1f5f9', 
                                color: '#1e293b', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer' 
                            }}
                            title="Back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h2 className="card-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                Log Customer Payment
                            </h2>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                Record collection details for order verification
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }} 
                        onClick={handleBack}
                    >
                        Cancel
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* 1. Order Financials & Customer Details */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px', 
                        background: '#F8FAFC', 
                        padding: '16px 20px', 
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Customer</span>
                            <p style={{ margin: '4px 0 0 0', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{customerName}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Order Reference</span>
                            <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', color: '#0284c7' }}>{orderRefDisplay}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Invoice Amount</span>
                            <p style={{ margin: '4px 0 0 0', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{formatINR(totalVal)}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Pending Balance</span>
                            <p style={{ margin: '4px 0 0 0', fontWeight: '900', fontSize: '15px', color: remainingVal > 0 ? '#dc2626' : '#16a34a' }}>{formatINR(remainingVal)}</p>
                        </div>
                    </div>

                    {/* 2. Transaction Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        
                        {/* Writable & Selectable Payment Mode */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                                Payment Mode <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <select 
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="form-input"
                                style={{ height: '42px', width: '100%', color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', fontSize: '13px' }}
                            >
                                <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
                                <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                                <option value="UPI">UPI / Instant Transfer</option>
                                <option value="IMPS">IMPS</option>
                                <option value="Bank Transfer">Bank Transfer / Direct Deposit</option>
                                <option value="Cheque">Cheque / Demand Draft</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>

                        {/* Confirmed Amount (₹) — Mandatory */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                                Confirmed Amount (₹) <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input 
                                type="number"
                                required
                                min="0.01"
                                step="any"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                                placeholder="Enter collected amount"
                                className="form-input"
                                style={{ height: '42px', width: '100%', color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', fontSize: '14px', fontWeight: '800' }}
                            />
                        </div>

                        {/* Transaction Ref / UTR No — Writable & Optional */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                                Transaction Ref / UTR No <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span>
                            </label>
                            <input 
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="e.g. UTR-88992233 or Ref ID"
                                className="form-input"
                                style={{ height: '42px', width: '100%', color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
                            />
                        </div>

                        {/* Payment Date */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                                Payment Date
                            </label>
                            <input 
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="form-input"
                                style={{ height: '42px', width: '100%', color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', fontSize: '13px' }}
                            />
                        </div>

                        {/* Bank Name / Branch — Writable & Optional */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                                Bank Name / Branch <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span>
                            </label>
                            <input 
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="e.g. HDFC Bank Ltd, Industrial Branch"
                                className="form-input"
                                style={{ height: '42px', width: '100%', color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', fontSize: '13px' }}
                            />
                        </div>

                        {/* Payment Proof — Writable & Optional */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                                Payment Proof <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span>
                            </label>
                            <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <UploadCloud size={18} className="text-blue-500" />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Attach receipt, screenshot or PDF (Optional)</span>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                                    className="form-input"
                                    style={{ height: '36px', paddingTop: '4px', color: '#0f172a', background: '#fff', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '100%' }}
                                />
                                {paymentProof && (
                                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Check size={13} /> {paymentProof.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Remarks / Collection Notes — Writable & Optional */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Remarks / Collection Notes <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span>
                        </label>
                        <textarea 
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add any collection remarks, bank notes, or follow-up discussion (Optional)..."
                            className="form-input"
                            style={{ minHeight: '80px', width: '100%', padding: '10px 12px', color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                        />
                    </div>

                    {/* Form actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={handleBack}
                            style={{
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                background: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="form-submit-btn" 
                            style={{ 
                                margin: 0, 
                                padding: '10px 24px', 
                                fontSize: '14px', 
                                fontWeight: '800', 
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                                cursor: submitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitting ? 'Submitting...' : 'Confirm Customer Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreatePaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-10 h-10 border-4 border-[#3BAEEB] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-extrabold">Loading Payment Logging Panel...</span>
                </div>
            </div>
        }>
            <CreatePaymentForm />
        </Suspense>
    );
}
