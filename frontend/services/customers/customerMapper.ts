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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendCustomerToFrontend(backend: any): FrontendCustomer {
  const companyName = backend.companyName || backend.name || backend.contactPerson || 'Customer';
  return {
    id: backend.id,
    companyName: companyName,
    name: companyName,
    contactPerson: backend.contactPerson || '',
    email: backend.email || '',
    phone: backend.phone || '',
    gstNumber: backend.gstin || backend.gstNumber || '',
    creditLimit: Number(backend.creditLimit || 0),
    status: backend.status === 'ACTIVE' || backend.isActive ? 'Active' : 'Inactive',
  };
}
