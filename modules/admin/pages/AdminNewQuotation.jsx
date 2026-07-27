'use client';

import { useRouter, usePathname } from 'next/navigation';
import CreateQuotation from '../../../components/CreateQuotation';
import Swal from 'sweetalert2';

const TOKEN = () => localStorage.getItem('token') || localStorage.getItem('himalaya_token');
const AUTH_HEADERS = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN()}`,
});

/**
 * AdminNewQuotation — wraps the shared CreateQuotation form and saves to
 * /api/admin-ops/quotations instead of the Sales endpoint.
 */
export default function AdminNewQuotation() {
  const navigate = useRouter();

  const handleAddQuotation = async (payload) => {
    // Map CreateQuotation payload → admin_manual_quotations columns
    const body = {
      customer_id:     0,                                  // admin doesn't require a customer FK
      customer_name:   payload.customerName || '',
      group_name:      payload.groupName || '',
      gst_number:      payload.gstNumber || '',
      amount:          payload.totalAmount || 0,
      discount:        payload.discount || 0,
      tax:             payload.tax || 18,
      transport_charge:payload.transportCharge || 0,
      quotation_date:  payload.date || new Date().toISOString().split('T')[0],
      valid_until:     payload.validTill || null,
      payment_terms:   payload.paymentTerms || '15 Days',
      notes:           payload.notes || '',
      items_json:      JSON.stringify(payload.detailedItems || []),
    };

    try {
      const res = await fetch('/api/admin-ops/quotations', {
        method: 'POST',
        headers: AUTH_HEADERS(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        await Swal.fire({
          icon: 'success',
          title: 'Quotation Published!',
          text: `Quotation ${data.quotation_no || ''} for ₹${(payload.totalAmount || 0).toLocaleString('en-IN')} has been saved.`,
          timer: 2200,
          showConfirmButton: false,
        });
        navigate.push('/admin/admin-quotations');
      } else {
        const err = await res.json();
        Swal.fire('Error', err.error || 'Failed to save quotation.', 'error');
      }
    } catch (e) {
      console.error('AdminNewQuotation save error', e);
      Swal.fire('Error', 'Network error — could not save quotation.', 'error');
    }
  };

  return (
    <CreateQuotation
      onAddQuotation={handleAddQuotation}
      onCancel={() => navigate.push('/admin/admin-quotations')}
    />
  );
}
