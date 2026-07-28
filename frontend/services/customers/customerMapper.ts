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
  return {
    id: backend.id,
    companyName: backend.name || '',
    name: backend.name || '',
    contactPerson: backend.contactPerson || '',
    email: backend.email || '',
    phone: backend.phone || '',
    gstNumber: backend.gstNumber || '',
    creditLimit: Number(backend.creditLimit || 0),
    status: backend.isActive ? 'Active' : 'Inactive',
  };
}
