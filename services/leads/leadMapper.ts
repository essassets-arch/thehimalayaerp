export interface FrontendLead {
  id: string;
  customerName: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  phone: string;
  email: string;
  billingAddress: string;
  deliveryAddress: string;
  gstNumber: string;
  status: string;
  requiredProducts: string;
  expectedQuantities: string;
  notes: string;
  createdAt: string;
  salesperson: string;
}

const BACKEND_STATUS_TO_LEGACY: Record<string, string> = {
  NEW: 'LEAD_CREATED',
  QUALIFIED: 'QUALIFIED',
  SAMPLE_PENDING: 'SAMPLE_REQUESTED',
  QUOTATION_CREATED: 'QUOTATION_CREATED',
  LOST: 'LOST',
  CONVERTED: 'CONVERTED',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendLeadToFrontend(backend: any): FrontendLead {
  // Try to resolve customerName from customer association if exists
  const customerName = backend.customer?.name || backend.companyName || '';

  return {
    id: backend.id,
    customerName,
    companyName: backend.companyName || '',
    contactPerson: backend.contactPerson || '',
    mobile: backend.phone || '',
    phone: backend.phone || '',
    email: backend.email || '',
    billingAddress: typeof backend.billingAddress === 'string' ? backend.billingAddress : (backend.billingAddress?.line1 || ''),
    deliveryAddress: typeof backend.deliveryAddress === 'string' ? backend.deliveryAddress : (backend.deliveryAddress?.line1 || ''),
    gstNumber: backend.gstNumber || '',
    status: BACKEND_STATUS_TO_LEGACY[backend.status] || 'LEAD_CREATED',
    requiredProducts: backend.productInterest || '',
    expectedQuantities: backend.requiredQty ? String(backend.requiredQty) : '',
    notes: backend.remarks || '',
    createdAt: backend.createdAt || new Date().toISOString(),
    salesperson: backend.salesperson || 'Sales User',
  };
}
