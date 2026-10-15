export interface FrontendCustomer {
  id: string;
  companyName: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  creditLimit: number;
  status: 'Active' | 'Inactive';
  customerCode?: string;
  city?: string;
  state?: string;
  pan?: string;
  gstin?: string;
  alternatePhone?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendCustomerToFrontend(backend: any): FrontendCustomer {
  if (!backend) return backend;
  const companyName = backend.companyName || backend.name || backend.contactPerson || 'Customer';
  const billingAddr = backend.billingAddress && typeof backend.billingAddress === 'object' ? backend.billingAddress : {};
  const shippingAddr = backend.shippingAddress && typeof backend.shippingAddress === 'object' ? backend.shippingAddress : {};
  const city = backend.city || billingAddr.city || shippingAddr.city || '';
  const state = backend.state || billingAddr.state || shippingAddr.state || '';

  return {
    ...backend,
    id: String(backend.id || ''),
    companyName: companyName,
    name: companyName,
    contactPerson: backend.contactPerson || '',
    email: backend.email || '',
    phone: backend.phone || backend.alternatePhone || '',
    alternatePhone: backend.alternatePhone || '',
    gstin: backend.gstin || backend.gstNumber || '',
    gstNumber: backend.gstin || backend.gstNumber || '',
    pan: backend.pan || '',
    customerCode: backend.customerCode || backend.customer_code || backend.code || '',
    city: city,
    state: state,
    creditLimit: Number(backend.creditLimit || 0),
    status: backend.status === 'ACTIVE' || backend.isActive ? 'Active' : 'Inactive',
  };
}

