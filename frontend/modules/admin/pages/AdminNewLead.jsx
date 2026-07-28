'use client';

import { useRouter, usePathname } from 'next/navigation';
import CreateLead from '../../../components/CreateLead';
import Swal from 'sweetalert2';

const TOKEN = () => localStorage.getItem('token') || localStorage.getItem('himalaya_token');
const AUTH_HEADERS = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN()}`,
});

/**
 * AdminNewLead — wraps the shared CreateLead component and saves to
 * /api/admin-ops/leads instead of the Sales endpoint.
 */
export default function AdminNewLead() {
  const navigate = useRouter();

  const handleAddLead = async (payload) => {
    // Map CreateLead payload shape → admin_leads table columns
    const body = {
      customer_name:  payload.companyName || '',
      contact_person: payload.siteInchargeName || payload.contactPerson || '',
      phone:          payload.siteInchargeMobile || payload.phone || '',
      email:          payload.email || '',
      project_name:   payload.projectName || '',
      group_name:     payload.groupName || '',
      city:           payload.address?.city || '',
      state_name:     payload.address?.state || '',
      source:         'Walk-In',
      remarks: [
        payload.notes || '',
        payload.detailedItems?.length
          ? `Products: ${payload.detailedItems.map(i => `${i.productName} (x${i.quantity})`).join(', ')}`
          : '',
        payload.address?.line1 ? `Address: ${payload.address.line1}, ${payload.address.city}, ${payload.address.state} ${payload.address.pincode}` : ''
      ].filter(Boolean).join('\n'),
    };

    try {
      const res = await fetch('/api/admin-ops/leads', {
        method: 'POST',
        headers: AUTH_HEADERS(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();

        // If "Generate Quotation" was clicked, also create a quotation
        if (payload.autoGenerateQuotation && payload.quotationData) {
          const grandTotal = payload.quotationData.totalAmount || 0;
          await fetch('/api/admin-ops/quotations', {
            method: 'POST',
            headers: AUTH_HEADERS(),
            body: JSON.stringify({
              customer_id: 0,
              amount: grandTotal,
              quotation_date: new Date().toISOString().split('T')[0],
            }),
          });
          await Swal.fire({
            icon: 'success',
            title: 'Lead + Quotation Created!',
            text: `Lead ${data.lead_no} and a quotation for ₹${grandTotal.toLocaleString('en-IN')} have been saved.`,
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Lead Created!',
            text: `Lead ${data.lead_no} has been saved successfully.`,
            timer: 2000,
            showConfirmButton: false,
          });
        }

        // Navigate back to admin leads list
        navigate.push('/admin/admin-leads');
      } else {
        const err = await res.json();
        Swal.fire('Error', err.error || 'Failed to save lead.', 'error');
      }
    } catch (e) {
      console.error('AdminNewLead save error', e);
      Swal.fire('Error', 'Network error — could not save lead.', 'error');
    }
  };

  return (
    <CreateLead
      onAddLead={handleAddLead}
      onCancel={() => navigate.push('/admin/admin-leads')}
    />
  );
}
