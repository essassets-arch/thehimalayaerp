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
    Check
} from 'lucide-react';

function CreatePaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdParam = searchParams?.get('orderId') || 'ORD-006';
    const { state, submitSalesPayment } = useERP();

    const orders = Array.isArray(state?.orders) ? state.orders : [];
    const selectedOrder = orders.find((o: any) => 
        String(o.id || o.orderNo || '').toLowerCase() === String(orderIdParam).toLowerCase()
    ) || {
        id: orderIdParam,
        customerName: 'L&T Construction Projects Ltd',
        customer: { name: 'L&T Construction Projects Ltd' },
        totalAmount: 625000,
        verifiedPaidAmount: 0
    };

    const customerName = selectedOrder.customer?.name || selectedOrder.customerName || (typeof selectedOrder.customer === 'string' ? selectedOrder.customer : '') || 'L&T Construction Projects Ltd';
    const totalVal = selectedOrder.totalAmount || selectedOrder.totalValue || selectedOrder.grandTotal || 625000;
    const paidVal = selectedOrder.verifiedPaidAmount || selectedOrder.payment?.paid || 0;
    const remainingVal = Math.max(0, totalVal - paidVal);

    // Form inputs
    const [paymentMode, setPaymentMode] = useState('NEFT');
    const [amountReceived, setAmountReceived] = useState(remainingVal > 0 ? remainingVal : 625000);
    const [referenceNumber, setReferenceNumber] = useState(`UTR-${Date.now().toString().slice(-8)}`);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [bankName, setBankName] = useState('HDFC Bank Ltd');
    const [remarks, setRemarks] = useState(`Full invoice payment collected from ${customerName} via NEFT transfer.`);
    const [submitting, setSubmitting] = useState(false);

    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const adviceFile = '';
    const receiptFile = '';

    const formatINR = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amountReceived || amountReceived <= 0 || !referenceNumber) {
            Swal.fire({ icon: 'error', title: 'Invalid Input', text: 'Please enter a valid amount and transaction reference number.' });
            return;
        }
        if (!paymentProof) {
            Swal.fire({ icon: 'error', title: 'Payment Proof Required', text: 'Please upload one payment proof document.' });
            return;
        }

        setSubmitting(true);
        try {
            const paymentData = {
                paymentMode,
                amountReceived: Number(amountReceived),
                referenceNumber,
                paymentDate,
                bankName,
                remarks,
                customerName,
                totalOrderValue: totalVal,
                documents: {
                    paymentProof: paymentProof.name,
                    fileName: paymentProof.name,
                    fileType: paymentProof.type,
                    fileSize: paymentProof.size,
                    uploadedAt: new Date().toISOString()
                }
            };

            const ok = submitSalesPayment ? submitSalesPayment(orderIdParam, paymentData) : false;
            if (!ok) {
                console.warn('Fallback store application for submitSalesPayment');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Payment Collection Submitted!',
                html: `
                    <div style="text-align: left; font-size: 13px; color: #334155; line-height: 1.6;">
                        <p>Payment of <b>${formatINR(Number(amountReceived))}</b> for Order <b>${orderIdParam}</b> has been logged.</p>
                        <p>The status is now <b>Awaiting Verification</b> and is waiting in the Finance Executive Verification Queue.</p>
                    </div>
                `,
                confirmButtonText: 'Go to Finance Queue →',
                confirmButtonColor: '#2F4375',
                customClass: {
                    confirmButton: 'text-white font-extrabold border border-[#2F4375]'
                }
            });

            router.push('/finance/payment-verification');
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Submission Error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full pb-12" style={{ fontFamily: "var(--font-main), 'Plus Jakarta Sans', sans-serif" }}>
            <div className="app-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 28px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            type="button"
                            onClick={() => router.push('/sales/payment-followup')}
                            style={{ 
                                width: '36px', 
                                height: '36px', 
                                background: '#f1f3f5', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer' 
                            }}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h2 className="card-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                            Confirm Customer Payment ({orderIdParam})
                        </h2>
                    </div>
                    <button 
                        type="button" 
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }} 
                        onClick={() => router.push('/sales/payment-followup')}
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
                        background: '#F5FAFE', 
                        padding: '16px', 
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer Name</span>
                            <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: '#12161a' }}>{customerName}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Order Reference</span>
                            <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', color: '#12161a' }}>{orderIdParam}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice Value</span>
                            <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: '#12161a' }}>{formatINR(totalVal)}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Outstanding Balance</span>
                            <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: '#ef4444' }}>{formatINR(remainingVal)}</p>
                        </div>
                    </div>

                    {/* 2. Transaction Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div className="form-group" style={{ display: 'none' }}>
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Payment Mode *</label>
                            <select 
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="form-input"
                                style={{ height: '42px', color: '#000', background: '#fff' }}
                            >
                                <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
                                <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                                <option value="UPI">UPI / Instant Online Transfer</option>
                                <option value="Cheque">Cheque / Demand Draft</option>
                                <option value="IMPS">IMPS</option>
                                <option value="Cash">Cash at Office / Site</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Confirmed Amount (₹) *</label>
                            <input 
                                type="number"
                                required
                                min="1"
                                step="any"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(Number(e.target.value))}
                                className="form-input"
                                style={{ height: '42px', color: '#000', background: '#fff', fontWeight: 'bold' }}
                            />
                        </div>

                        <div className="form-group" style={{ display: 'none' }}>
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Transaction Ref / UTR No *</label>
                            <input 
                                type="text"
                                required
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="e.g. UTR-88992233"
                                className="form-input"
                                style={{ height: '42px', color: '#000', background: '#fff', fontFamily: 'monospace' }}
                            />
                        </div>

                        <div className="form-group" style={{ display: 'none' }}>
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Payment Date *</label>
                            <input 
                                type="date"
                                required
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="form-input"
                                style={{ height: '42px', color: '#000', background: '#fff' }}
                            />
                        </div>

                        <div className="form-group" style={{ display: 'none' }}>
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Bank Name / Branch</label>
                            <input 
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="e.g. HDFC Bank Ltd, Industrial Branch"
                                className="form-input"
                                style={{ height: '42px', color: '#000', background: '#fff' }}
                            />
                        </div>

                        {/* 3. Single Payment Proof Upload */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Payment Proof *</label>
                        <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px dashed #D6E2F0', background: '#F5FAFE' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <UploadCloud size={24} className="text-blue-500" />
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Upload one receipt, screenshot, image, or PDF</span>
                            </div>
                            <input
                                type="file"
                                required
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                                className="form-input"
                                style={{ height: '42px', paddingTop: '8px', color: '#000', background: '#fff' }}
                            />
                            {paymentProof && <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', marginTop: '8px' }}>✓ {paymentProof.name}</div>}
                        </div>
                    </div>
                    </div>

                    {/* Legacy mock document cards hidden; the form accepts one real upload above. */}
                    <div style={{ display: 'none', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px dashed #D6E2F0', background: '#F5FAFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <UploadCloud size={24} className="text-blue-500 mb-1" />
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Payment Advice Letter</span>
                            <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>✓ {adviceFile}</span>
                        </div>

                        <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px dashed #D6E2F0', background: '#F5FAFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <UploadCloud size={24} className="text-blue-500 mb-1" />
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Bank Transfer Screenshot</span>
                            <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>✓ {receiptFile}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Remarks / Collection Notes</label>
                        <textarea 
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="form-input"
                            style={{ minHeight: '80px', padding: '10px', color: '#000', background: '#fff' }}
                        />
                    </div>

                    {/* Form actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="form-submit-btn" 
                            style={{ 
                                margin: 0, 
                                padding: '12px 24px', 
                                fontSize: '14px', 
                                fontWeight: '800', 
                                width: '280px',
                                background: 'var(--color-primary)',
                                color: '#12161a',
                                border: '1px solid #cbe252'
                            }}
                        >
                            {submitting ? 'Submitting Logging...' : 'Confirm Customer Payment'}
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
