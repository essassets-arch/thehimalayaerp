import { useState } from 'react';
import { ArrowLeft, Send, AlertCircle, Check } from 'lucide-react';

export default function CreatePayment({ payments, onReceivePayment, onCancel }) {
  // Filter only outstanding invoices
  const outstandingInvoices = payments.filter(p => p.status !== 'Paid');

  // Form states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(outstandingInvoices[0]?.id || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(() => {
    const defaultInvoice = outstandingInvoices[0];
    return defaultInvoice ? defaultInvoice.totalAmount - defaultInvoice.paidAmount : 0;
  });
  const [notes, setNotes] = useState('');

  const selectedInvoice = outstandingInvoices.find(p => String(p.id) === String(selectedInvoiceId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;
    if (!isConfirmed) {
      alert("Please confirm the payment by clicking 'Confirm Payment' first.");
      return;
    }
    if (!confirmedAmount || Number(confirmedAmount) <= 0) {
      alert("Please enter a valid confirmed amount.");
      return;
    }

    // Send to Finance
    onReceivePayment(
      Number(selectedInvoiceId),
      Number(confirmedAmount),
      new Date().toISOString().split('T')[0], // date
      'Sales Confirmation', // paymentMode (dummy/internal)
      'CUSTOMER-CONFIRMED', // referenceNo indicating sales customer confirmation
      notes || 'Customer confirmed payment.'
    );
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="card-top-icon-btn" onClick={onCancel} style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}>
            <ArrowLeft size={16} />
          </button>
          <h2 className="module-title">Confirm Customer Payment</h2>
        </div>
      </div>

      {outstandingInvoices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '14px', color: '#166534' }}>
          <AlertCircle size={32} />
          <span style={{ fontWeight: '700' }}>All Invoices Fully Paid!</span>
          <span style={{ fontSize: '13px', textAlign: 'center' }}>There are currently no outstanding invoices requiring payment confirmation.</span>
          <button type="button" className="btn-small btn-primary-small" style={{ marginTop: '10px' }} onClick={onCancel}>Go Back</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Invoice Selector */}
          <div className="form-group">
            <label className="form-label">Select Invoice *</label>
            <select 
              className="form-select" 
              value={selectedInvoiceId} 
              onChange={e => {
                const invId = e.target.value;
                setSelectedInvoiceId(invId);
                const inv = outstandingInvoices.find(p => String(p.id) === String(invId));
                if (inv) {
                  setConfirmedAmount(inv.totalAmount - inv.paidAmount);
                  setIsConfirmed(false);
                }
              }}
              required
            >
              {outstandingInvoices.map(p => {
                const balance = p.totalAmount - p.paidAmount;
                return (
                  <option key={p.id} value={p.id}>
                    Invoice #{p.invoiceNo} - {p.customerName} (Outstanding: {formatINR(balance)})
                  </option>
                );
              })}
            </select>
          </div>

          {selectedInvoice && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              background: 'var(--color-bg-primary)', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid var(--color-border)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer Name</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px' }}>{selectedInvoice.customerName}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice No.</span>
                <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>#{selectedInvoice.invoiceNo}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice Amount</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px' }}>{formatINR(selectedInvoice.totalAmount)}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Outstanding Amount</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: '#ef4444' }}>{formatINR(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}</p>
              </div>
            </div>
          )}

          {/* Confirm Payment Toggle */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Confirm Payment? *</label>
            <button
              type="button"
              onClick={() => setIsConfirmed(!isConfirmed)}
              style={{
                padding: '8px 24px',
                borderRadius: '24px',
                border: 'none',
                background: isConfirmed ? '#10b981' : 'var(--color-border)',
                color: isConfirmed ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {isConfirmed ? <Check size={14} /> : null}
              {isConfirmed ? 'Yes' : 'Click to Confirm'}
            </button>
          </div>

          {/* Confirmed Amount */}
          <div className="form-group">
            <label className="form-label">Confirmed Amount (₹) *</label>
            <input 
              type="number" 
              className="form-input" 
              min="1" 
              max={selectedInvoice ? selectedInvoice.totalAmount - selectedInvoice.paidAmount : undefined}
              step="1"
              value={confirmedAmount} 
              onChange={e => setConfirmedAmount(Number(e.target.value))} 
              required 
              disabled={!isConfirmed}
              placeholder="Enter the amount customer confirmed they paid"
            />
            <small style={{ color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              Maximum allowable: {selectedInvoice ? formatINR(selectedInvoice.totalAmount - selectedInvoice.paidAmount) : '0'}
            </small>
          </div>

          {/* Remarks */}
          <div className="form-group">
            <label className="form-label">Remarks (Optional)</label>
            <textarea 
              className="form-textarea" 
              style={{ minHeight: '90px' }} 
              placeholder="e.g. Customer stated payment was done via IMPS/NEFT..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              disabled={!isConfirmed}
            ></textarea>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="form-submit-btn" 
              disabled={!isConfirmed}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                opacity: isConfirmed ? 1 : 0.6,
                cursor: isConfirmed ? 'pointer' : 'not-allowed',
                background: isConfirmed ? 'var(--color-accent-teal)' : 'var(--color-border)'
              }}
            >
              <Send size={15} /> Send to Finance
            </button>
            <button type="button" className="btn-small btn-outline-small" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
